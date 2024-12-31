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
  autoInit?: boolean;  // 자동으로 초기화할지 여부
}

export function useMap(containerRef: React.RefObject<HTMLDivElement>, options: UseMapOptions = {}) {
  const [map, setMap] = useState<any | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const controllerRef = useRef<MapController | null>(null);

  const initialize = useCallback(async () => {
    if (!containerRef.current || isInitialized) return;

    try {
      // TODO: Implement actual ODF map initialization
      const mapInstance = {} as any; // placeholder
      
      // 컨트롤러 객체 생성
      const controller: MapController = {
        view: {
          setCenter: (center) => {
            // TODO: Implement with ODF
            console.log('Setting center:', center);
          },
          setZoom: (zoom) => {
            // TODO: Implement with ODF
            console.log('Setting zoom:', zoom);
          },
          setBasemap: (basemap) => {
            // TODO: Implement with ODF
            console.log('Setting basemap:', basemap);
          },
          getCenter: () => [0, 0], // TODO: Implement with ODF
          getZoom: () => 1, // TODO: Implement with ODF
        },
        layer: {
          add: (layerConfig) => {
            // TODO: Implement with ODF
            const newLayer: Layer = {
              id: String(Date.now()),
              name: layerConfig.name || 'New Layer',
              visible: true,
              ...layerConfig,
            };
            return newLayer;
          },
          remove: (layerId) => {
            // TODO: Implement with ODF
            console.log('Removing layer:', layerId);
          },
          toggle: (layerId) => {
            // TODO: Implement with ODF
            console.log('Toggling layer:', layerId);
          },
          getAll: () => [], // TODO: Implement with ODF
        },
        destroy: () => {
          // TODO: Implement actual cleanup
          setMap(null);
          setIsInitialized(false);
          controllerRef.current = null;
        },
      };

      controllerRef.current = controller;
      setMap(mapInstance);
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize map:', error);
      throw error;
    }
  }, [containerRef, isInitialized]);

  // autoInit이 true인 경우 자동으로 초기화
  useEffect(() => {
    if (options.autoInit) {
      initialize();
    }
  }, [initialize, options.autoInit]);

  return {
    map,
    isInitialized,
    initialize,
    controller: controllerRef.current,
  };
}
