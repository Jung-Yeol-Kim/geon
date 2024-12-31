import { useRef } from 'react'
import { useMap } from '@repo/map-hooks'
import { cn } from '@/lib/utils'

interface MapProps {
  initialCenter?: [number, number]
  initialZoom?: number
  basemap?: string
  className?: string
}

export function Map({
  initialCenter,
  initialZoom,
  basemap,
  className,
}: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { controller } = useMap({
    containerRef,
    initialCenter,
    initialZoom,
    basemap,
    autoInit: true,
  })

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative w-full aspect-video rounded-lg border",
        className
      )}
    />
  )
}
