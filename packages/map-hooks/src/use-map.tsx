import { createContext, useReducer, useRef, useEffect, use, useCallback, useState } from "react";
import type { ReactNode, RefObject } from "react";
import { Map, MapAction, MapContextProps } from "./types";


const initialState: Map = {
  map: null,
  mapInfo: {
    id: "",
    name: "새 지도",
    activeUsers: 0,
    createdAt: "",
    updatedAt: "",
    isPublic: false,
    layers: [],
  },
  view: {
    center: [276179.88560667867, 413632.9594010007],
    zoom: 1,
    basemap: "eMapBasic",
  },
  markers: [],
  highlightLayer: null,
};

const MapContext = createContext<MapContextProps | undefined>(undefined);

// mapReducer를 별도 파일로 분리하는 것이 좋지만, 여기서는 간단히 유지
function mapReducer(state: Map, action: MapAction): Map {
  switch (action.type) {
    case "SET_MAP":
      return { ...state, map: action.payload };

    case "SELECT_MAP": {
      const { view, ...mapInfo } = action.payload;
      return {
        ...state,
        mapInfo,
        view,
      };
    }

    case "SET_MAP_INFO":
      return { ...state, mapInfo: action.payload };

    case "SET_VIEW":
      return {
        ...state,
        view: { ...state.view, ...action.payload },
      };

    case "SET_HIGHLIGHT_LAYER":
      return { ...state, highlightLayer: action.payload };

    case "ADD_MARKER":
      return { ...state, markers: [...state.markers, action.payload] };

    case "ADD_LAYER":
      return {
        ...state,
        mapInfo: {
          ...state.mapInfo,
          layers: [...state.mapInfo.layers, action.payload],
        },
      };

    case "REMOVE_LAYER": {
      const updatedLayers = state.mapInfo.layers.filter(
        (layer) => layer.id !== action.payload
      );
      return {
        ...state,
        mapInfo: {
          ...state.mapInfo,
          layers: updatedLayers,
        },
      };
    }

    case "TOGGLE_LAYER_VISIBILITY": {
      const updatedLayers = state.mapInfo.layers.map((layer) =>
        layer.id === action.payload
          ? { ...layer, visible: !layer.visible }
          : layer
      );
      return {
        ...state,
        mapInfo: {
          ...state.mapInfo,
          layers: updatedLayers,
        },
      };
    }

    case "UPDATE_LAYER": {
      const updatedLayers = state.mapInfo.layers.map((layer) =>
        layer.id === action.payload.id
          ? { ...layer, ...action.payload.updates }
          : layer
      );
      return {
        ...state,
        mapInfo: {
          ...state.mapInfo,
          layers: updatedLayers,
        },
      };
    }

    case "SET_LAYERS": {
      return {
        ...state,
        mapInfo: {
          ...state.mapInfo,
          layers: action.payload,
        },
      };
    }

    case "REORDER_LAYERS": {
      const { id, direction } = action.payload;
      const layers = [...state.mapInfo.layers];
      const currentIndex = layers.findIndex(layer => layer.id === id);
      
      // 레이어를 찾지 못한 경우 현재 상태 반환
      if (currentIndex === -1) return state;
      
      const targetLayer = layers[currentIndex];
      // 타입 안전성을 위한 추가 체크
      if (!targetLayer) return state;

      const newIndex = direction === "up" 
        ? Math.max(0, currentIndex - 1)
        : Math.min(layers.length - 1, currentIndex + 1);
      
      if (currentIndex === newIndex) return state;
      
      layers.splice(currentIndex, 1);
      layers.splice(newIndex, 0, targetLayer);

      return {
        ...state,
        mapInfo: {
          ...state.mapInfo,
          layers,
        },
      };
    }

    case "SET_LAYER_FILTER": {
      const updatedLayers = state.mapInfo.layers.map((layer) =>
        layer.id === action.payload.id
          ? { ...layer, filter: action.payload.filter }
          : layer
      );
      return {
        ...state,
        mapInfo: {
          ...state.mapInfo,
          layers: updatedLayers,
        },
      };
    }

    default:
      return state;
  }
}

export function MapProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(mapReducer, initialState);
  const mapRef = useRef<HTMLDivElement>(null);
  const { initialize, isInitializing, error } = useMapInitializer({
    center: initialState.view.center,
    zoom: initialState.view.zoom,
    basemap: initialState.view.basemap,
  });

  const initializeMap = useCallback(async () => {
    if (!mapRef.current) {
      throw new Error("Map container is not available");
    }

    try {
      const { map, highlightLayer } = await initialize(mapRef.current);
      dispatch({ type: "SET_MAP", payload: map });
      dispatch({ type: "SET_HIGHLIGHT_LAYER", payload: highlightLayer });
    } catch (err) {
      console.error('Failed to initialize map:', err);
    }
  }, [initialize]);

  useEffect(() => {
    if (!state.map) return;

    const view = state.map.getView();
    let timeoutId: NodeJS.Timeout | null = null;

    const handleViewChange = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        const center = state.map.getCenter();
        const zoom = state.map.getZoom();

        dispatch({ type: "SET_VIEW", payload: { center, zoom: Math.round(zoom) } });

        timeoutId = null;
      }, 100);
    };

    odf.event.addListener(view, "change", handleViewChange);

    // cleanup
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      odf.event.removeListener(view, "change", handleViewChange);
    };
  }, [state.map]);

  return (
    <MapContext.Provider
      value={{
        state,
        dispatch,
        mapRef: mapRef as RefObject<HTMLDivElement>,
        initializeMap,
      }}
    >
      {children}
    </MapContext.Provider>
  );
}

export function useMap() {
  const context = use(MapContext);
  if (!context) {
    throw new Error("useMap must be used within a MapProvider");
  }
  return context;
}

interface MapInitializeOptions {
  center?: [number, number];
  zoom?: number;
  projection?: string;
  basemap?: string;
}

interface UseMapInitializerResult {
  initialize: (container: HTMLDivElement) => Promise<void>;
  isInitializing: boolean;
  error: Error | null;
}

export function useMapInitializer(options: MapInitializeOptions = {}) {
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const initialize = useCallback(async (container: HTMLDivElement) => {
    if (!container) {
      throw new Error("Map container is required");
    }

    setIsInitializing(true);
    setError(null);

    try {
      const coord = new odf.Coordinate(
        options.center?.[0] ?? 199312.9996,
        options.center?.[1] ?? 551784.6924
      );

      const mapOption = {
        center: coord,
        zoom: options.zoom ?? 11,
        projection: options.projection ?? "EPSG:5186",
        baroEMapURL: "https://geon-gateway.geon.kr/map/api/map/baroemap",
        baroEMapAirURL: "https://geon-gateway.geon.kr/map/api/map/ngisair",
        basemap: {
          baroEMap: ["eMapBasic", "eMapAIR", "eMapColor", "eMapWhite"],
        },
        optimization: true,
      };

      const odfMap = new odf.Map(container, mapOption);
      
      // 기본 컨트롤 추가
      const basemapControl = new odf.BasemapControl();
      basemapControl.setMap(odfMap);
      odfMap.basemapControl = basemapControl;

      // 하이라이트 레이어 생성
      const highlightLayer = odf.LayerFactory.produce("empty", {});
      highlightLayer.setMap(odfMap);

      return { map: odfMap, highlightLayer };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to initialize map');
      setError(error);
      throw error;
    } finally {
      setIsInitializing(false);
    }
  }, [options]);

  return { initialize, isInitializing, error };
}

export type { Map, MapAction, MapContextProps };


