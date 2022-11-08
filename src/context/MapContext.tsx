import React, { useMemo } from 'react'
import WebMap from '@arcgis/core/WebMap'
import MapView from '@arcgis/core/views/MapView'

type MapProviderProps = { children: React.ReactNode }

const MapContext = React.createContext<MapView | undefined>(undefined)

function MapProvider({ children }: MapProviderProps) {
  const webmap = useMemo(
    () =>
      new WebMap({
        portalItem: {
          id: '00c8181753cd4673810a1ede1f52a922',
        },
      }),
    []
  )
  const view = useMemo(
    () =>
      new MapView({
        map: webmap,
      }),
    [webmap]
  )

  return <MapContext.Provider value={view}>{children}</MapContext.Provider>
}

function useMap() {
  const webmap = React.useContext(MapContext)
  if (webmap === undefined) {
    throw new Error('useMap must be used within a MapProvider')
  }
  return webmap
}

export { MapProvider, useMap }
