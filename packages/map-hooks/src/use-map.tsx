import { useState, useCallback, useRef, useEffect } from 'react';
import type { 
  MapState, 
  MapView,
  Layer,
  MapInitializeOptions 
} from './types/map-types';

interface MapController {
  view: {
    setCenter: (center: [number, number]) => void;
    setZoom: (zoom: number) => void;
    setBasemap: (basemap: string) => void;
    getCenter: () => [number, number];
    getZoom: () => number;
  };
  layer: {
    add: (layer: Partial<Layer>) => Layer | null;
    remove: (layerId: string) => void;
    toggle: (layerId: string) => void;
    getAll: () => Layer[];
  };
  destroy: () => void;
}

interface UseMapOptions extends MapInitializeOptions {
  containerRef: React.RefObject<HTMLDivElement>;
  autoInit?: boolean;  // 자동으로 초기화할지 여부
}

export function useMap(options: UseMapOptions) {
  const [map, setMap] = useState<any | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const controllerRef = useRef<MapController | null>(null);

  const initialize = useCallback(async () => {
    if (!options.containerRef.current || isInitialized) return;

    // ODF 존재 여부 체크
    const checkODF = () => {
      return new Promise<void>((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 30; // 3초 동안 100ms 간격으로 체크
        const interval = setInterval(() => {
          attempts++;
          if ((window as any).odf) {
            clearInterval(interval);
            resolve();
          } else if (attempts >= maxAttempts) {
            clearInterval(interval);
            reject(new Error('ODF가 프로젝트에 추가되지 않았습니다. ODF를 프로젝트에 추가해주세요.'));
          }
        }, 100);
      });
    };

    try {
      await checkODF();
      const mapContainer = options.containerRef.current;
      const coord = new odf.Coordinate(
        options.center?.[0] ?? 199312.9996,
        options.center?.[1] ?? 551784.6924
      );

      const mapOption = {
        center: coord,
        zoom: options.zoom ?? 11,
        projection: options.projection ?? "EPSG:5186",
        baroEMapURL: options.baroEMapURL ?? "https://geon-gateway.geon.kr/map/api/map/baroemap",
        baroEMapAirURL: options.baroEMapAirURL ?? "https://geon-gateway.geon.kr/map/api/map/ngisair",
        basemap: options.basemap ?? {
          baroEMap: ["eMapBasic", "eMapAIR", "eMapColor", "eMapWhite"],
        },
        optimization: options.optimization ?? true,
      };

      const odfMap: any = new odf.Map(mapContainer, mapOption);
      setMap(odfMap);

      const basemapControl = new odf.BasemapControl();
      basemapControl.setMap(odfMap);
      odfMap.basemapControl = basemapControl;

      const controller: MapController = {
        view: {
          setCenter: (center) => {
            odfMap.setCenter(new odf.Coordinate(center[0], center[1]));
          },
          setZoom: (zoom) => {
            odfMap.setZoom(zoom);
          },
          setBasemap: (basemap) => {
            odfMap.setBasemap(basemap);
          },
          getCenter: () => [odfMap.getCenter().x, odfMap.getCenter().y],
          getZoom: () => odfMap.getZoom(),
        },
        layer: {
          add: (layerConfig) => {
            const newLayer: Layer = {
              id: String(Date.now()),
              name: layerConfig.name || 'New Layer',
              visible: true,
              ...layerConfig,
            };
            return newLayer;
          },
          remove: (layerId) => {
            console.log('Removing layer:', layerId);
          },
          toggle: (layerId) => {
            console.log('Toggling layer:', layerId);
          },
          getAll: () => [],
        },
        destroy: () => {
          odfMap.destroy();
          setMap(null);
          setIsInitialized(false);
          controllerRef.current = null;
        },
      };

      controllerRef.current = controller;
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize map:', error);
      throw error;
    }
  }, [isInitialized, options]);

  useEffect(() => {
    if (options.autoInit) {
      initialize();
    }
  }, [initialize, options.autoInit]);

  useEffect(() => {
    if (!map) return;

    if (options.center) {
      map.setCenter(new odf.Coordinate(options.center[0], options.center[1]));
    }
    if (options.zoom !== undefined) {
      map.setZoom(options.zoom);
    }
  }, [options.center, options.zoom]);

  return {
    map,
    isInitialized,
    initialize,
    controller: controllerRef.current,
  };
}
