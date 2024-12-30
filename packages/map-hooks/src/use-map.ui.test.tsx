// import { describe, it, expect, beforeEach } from 'vitest';
// import { render, screen } from '@testing-library/react';
// import { MapProvider, useMap } from './use-map';
// import type { ReactNode } from 'react';

// // Test Component
// function TestMapComponent() {
//   const { state, mapRef } = useMap();
  
//   return (
//     <div>
//       <div data-testid="map-container" ref={mapRef} />
//       <div data-testid="map-status">
//         {state.map ? 'Map Initialized' : 'Map Not Initialized'}
//       </div>
//     </div>
//   );
// }

// describe('MapProvider UI Integration', () => {
//   beforeEach(() => {
//     document.body.innerHTML = '';
//   });

//   it('should render map container', () => {
//     render(
//       <MapProvider>
//         <TestMapComponent />
//       </MapProvider>
//     );

//     const mapContainer = screen.getByTestId('map-container');
//     expect(mapContainer).toBeInTheDocument();
//   });

//   it('should show initial map status', () => {
//     render(
//       <MapProvider>
//         <TestMapComponent />
//       </MapProvider>
//     );

//     const status = screen.getByTestId('map-status');
//     expect(status).toHaveTextContent('Map Not Initialized');
//   });
// });
