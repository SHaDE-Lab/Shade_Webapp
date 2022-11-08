import React, { useRef, useEffect } from 'react'
import Search from '@arcgis/core/widgets/Search'
import Directions from '@arcgis/core/widgets/Directions'
import RouteLayer from '@arcgis/core/layers/RouteLayer'
import { useMap } from '../../context/MapContext'

import './index.css'

// TODO CREATE THIS AS A CONTEXT
export default function WebMapComponent() {
  const view = useMap()
  const mapDiv = useRef(null)

  useEffect(() => {
    if (mapDiv.current) {
      view.container = mapDiv.current
      const searchWidget = new Search({
        view,
        id: 'searchWidget',
      })

      const routeLayer = new RouteLayer()

      const directions = new Directions({
        layer: routeLayer,
        view,
        id: 'directions',
      })

      // Add the widget to the top-right corner of the view if it doesnt exist
      if (!view.ui.find('searchWidget')) view.ui.add(searchWidget, 'top-right')
      if (!view.ui.find('directions')) view.ui.add(directions, 'top-right')

      view.goTo({
        center: [-111.93, 33.419],
        zoom: 15,
      })
    }
  }, [view])

  return (
    <div
      style={{ padding: 0, margin: 0, height: '100%', width: '100%' }}
      ref={mapDiv}
    />
  )
}
