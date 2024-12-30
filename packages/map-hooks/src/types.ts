import { Dispatch } from 'react';

export interface LayerParams {
  method: string;
  server: string;
  layer: string;
  service: string;
  bbox: boolean;
  matrixSet: string | null;
  crtfckey: string;
  projection: string;
  serviceTy: string;
  geometryType: string;
  [key: string]: any;
}

export interface LayerInfo {
  lyrId: string;
  cntntsId: string;
  jobClCode: string;
  lyrNm: string;
  lyrClCode: string;
  lyrTySeCode: string;
  namespace: string;
}

export interface LayerConfig {
  type: string;
  params: LayerParams;
}

export interface Layer {
  id: string;
  name: string;
  type: string;
  visible: boolean;
  odfLayer: any;
  params: LayerParams;
  info: LayerInfo;
  style?: Record<string, any>;
  filter?: string;
}

export interface MapView {
  center: [number, number];
  zoom: number;
  basemap: string;
}

export interface MapInfo {
  id: string;
  name: string;
  activeUsers: number;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  layers: Layer[];
}

export interface Map {
  map: any;
  mapInfo: MapInfo;
  view: MapView;
  markers: any[];
  highlightLayer: any;
}

export type MapAction =
  | { type: "SET_MAP"; payload: any }
  | { type: "SELECT_MAP"; payload: MapInfo & { view: MapView } }
  | { type: "SET_MAP_INFO"; payload: MapInfo }
  | { type: "SET_VIEW"; payload: Partial<MapView> }
  | { type: "SET_HIGHLIGHT_LAYER"; payload: any }
  | { type: "ADD_MARKER"; payload: any }
  | { type: "ADD_LAYER"; payload: Layer }
  | { type: "SET_LAYERS"; payload: Layer[] }
  | { type: "REMOVE_LAYER"; payload: string }
  | { type: "TOGGLE_LAYER_VISIBILITY"; payload: string }
  | { type: "UPDATE_LAYER"; payload: { id: string; updates: Partial<Layer> } }
  | { type: "REORDER_LAYERS"; payload: { id: string; direction: "up" | "down" } }
  | { type: "SET_LAYER_FILTER"; payload: { id: string; filter: string } };

export interface MapContextProps {
  state: Map;
  dispatch: Dispatch<MapAction>;
  mapRef: React.RefObject<HTMLDivElement>;
  initializeMap: () => Promise<void>;
}
