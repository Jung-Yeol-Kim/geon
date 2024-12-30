declare global {
  namespace odf {
    class Coordinate {
      constructor(x: number, y: number);
      x: number;
      y: number;
    }

    class Map {
      constructor(container: HTMLElement, options: MapOptions);
      getView(): View;
      getCenter(): number[];
      getZoom(): number;
      basemapControl: any;
    }

    class View {
      getCenter(): number[];
      getZoom(): number;
    }

    interface MapOptions {
      center: Coordinate;
      zoom: number;
      projection: string;
      baroEMapURL?: string;
      baroEMapAirURL?: string;
      basemap?: {
        baroEMap: string[];
      };
      optimization?: boolean;
    }

    namespace LayerFactory {
      function produce(type: string, options: any): any;
    }

    class BasemapControl {
      constructor();
      setMap(map: Map): void;
    }

    namespace event {
      function addListener(target: any, type: string, listener: Function): void;
      function removeListener(target: any, type: string, listener: Function): void;
    }
  }

  interface Window {
    odf: typeof odf;
  }
}

export {};
