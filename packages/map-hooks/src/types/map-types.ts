export interface MapInfo {
  id: string;
  name: string;
  activeUsers: number;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
}

export interface MapView {
  center: [number, number];
  zoom: number;
  basemap: string;
}

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  // Add other layer properties as needed
}

export interface MapState {
  map: any | null;  // ODF Map instance
  info: MapInfo;
  view: MapView;
  layers: Layer[];
}

export interface MapActions {
  // View actions
  setCenter: (center: [number, number]) => void;
  setZoom: (zoom: number) => void;
  setBasemap: (basemap: string) => void;
  
  // Layer actions
  addLayer: (layer: Partial<Layer>) => Layer | null;
  removeLayer: (layerId: string) => void;
  toggleLayerVisibility: (layerId: string) => void;
}

export interface MapHookResult extends MapState, MapActions {
  initialize: (container: HTMLDivElement) => Promise<void>;
  destroy: () => void;
}

export interface MapInitializeOptions {
  center?: [number, number];
  zoom?: number;
  projection?: string;
  basemap?: string;
}

export interface UseMapOptions {
  center?: [number, number];
  zoom?: number;
  projection?: string;
  baroEMapURL?: string;
  baroEMapAirURL?: string;
  basemap?: {
    baroEMap: string[];
  };
  optimization?: boolean;
}

export interface MapProps extends UseMapOptions {
  className?: string;
  style?: React.CSSProperties;
  onMapLoad?: (map: any) => void;
}
