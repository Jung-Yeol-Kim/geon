'use client';

import React from 'react';
import { useMap } from '@geon/map-hooks';
import { cn } from 'fumadocs-ui/components/api';

interface MapProps {
  center?: [number, number];
  zoom?: number;
  projection?: string;
  basemap?: {
    baroEMap: string[];
  };
  className?: string;
}

export function Map({
  center,
  zoom,
  projection,
  basemap,
  className,
}: MapProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { map, isInitialized } = useMap({
    containerRef,
    center,
    zoom,
    projection,
    basemap,
    autoInit: true,
  });

  return (
    <div
      id="map"
      ref={containerRef}
      className={cn('relative w-full h-[400px]', className)}
    />
  );
}
