import React, { useRef, useEffect } from 'react'
import MapView from '@arcgis/core/views/MapView'
import WebMap from '@arcgis/core/WebMap'
import Search from '@arcgis/core/widgets/Search'
import Directions from '@arcgis/core/widgets/Directions'
import RouteLayer from '@arcgis/core/layers/RouteLayer'

import './index.css'

// TODO CREATE THIS AS A CONTEXT
export default function WebMapComponent() {
  const mapDiv = useRef(null)

  useEffect(() => {
    if (mapDiv.current) {
      const webmap = new WebMap({
        portalItem: {
          id: 'aa1d3f80270146208328cf66d022e09c',
        },
      })

      const view = new MapView({
        container: mapDiv.current,
        map: webmap,
      })

      const searchWidget = new Search({
        view,
      })

      const routeLayer = new RouteLayer()

      const directions = new Directions({
        layer: routeLayer,
        view,
      })

      // Add the widget to the top-right corner of the view
      view.ui.add(searchWidget, 'top-right')
      view.ui.add(directions, 'top-right')

      // bonus - how many bookmarks in the webmap?
      webmap.when(() => {
        view.goTo({
          center: [-111.9346, 33.419],
        })
      })
    }
  }, [])

  return (
    <div
      style={{ padding: 0, margin: 0, height: '100%', width: '100%' }}
      ref={mapDiv}
    />
  )
}
