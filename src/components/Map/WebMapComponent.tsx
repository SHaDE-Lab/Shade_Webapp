import React, { useRef, useEffect } from 'react'
import MapView from '@arcgis/core/views/MapView'
import WebMap from '@arcgis/core/WebMap'
import Search from '@arcgis/core/widgets/Search'
import Directions from '@arcgis/core/widgets/Directions'
import RouteLayer from '@arcgis/core/layers/RouteLayer'
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";

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

      const buildingPopup = {
        "title": "{BLDG_NAME} ({BLDG_CODE})",
        "content": "<b>{BLDG_ADDRESS}</b><br><img src=\"{Image}\" alt=\"{Image of {BLDG_NAME}\"><br>{Description}<br><br><b>Building Number:</b> {BLDG_NUMBER}"
      }

    // OBJECTID ( type: esriFieldTypeOID, alias: OBJECTID )
    // BLDG_NUMBER ( type: esriFieldTypeString, alias: BLDG_NUMBER, length: 5 )
    // BLDG_NAME ( type: esriFieldTypeString, alias: BLDG_NAME, length: 60 )
    // BLDG_CODE ( type: esriFieldTypeString, alias: BLDG_CODE, length: 10 )
    // BLDG_CITY ( type: esriFieldTypeString, alias: BLDG_CITY, length: 30 )
    // BLDG_STATE ( type: esriFieldTypeString, alias: BLDG_STATE, length: 2 )
    // BLDG_ZIP ( type: esriFieldTypeString, alias: BLDG_ZIP, length: 10 )
    // Description ( type: esriFieldTypeString, alias: Description, length: 2100 )
    // Type ( type: esriFieldTypeString, alias: Type, length: 16 )
    // map_name ( type: esriFieldTypeString, alias: map_name, length: 100 )
    // Image ( type: esriFieldTypeString, alias: Image, length: 2048 )
    // BLDG_ADDRESS ( type: esriFieldTypeString, alias: BLDG_ADDRESS, length: 50 )
    // Shape ( type: esriFieldTypeGeometry, alias: SHAPE )
    // Shape.STArea() ( type: esriFieldTypeDouble, alias: Shape.STArea() )
    // Shape.STLength() ( type: esriFieldTypeDouble, alias: Shape.STLength() )
      const buildings = new FeatureLayer({
        url: "https://gis.m.asu.edu/server/rest/services/Campus/CampusBuilding/MapServer",
        outFields: ["OBJECTID","BLDG_NUMBER","BLDG_NAME","BLDG_CODE","BLDG_CITY","BLDG_STATE","BLDG_ZIP","Description"
        ,"Type","map_name","Image","BLDG_ADDRESS","Shape","Shape.STArea()","Shape.STLength()"],
        popupTemplate: buildingPopup
      })
      webmap.add(buildings)

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
