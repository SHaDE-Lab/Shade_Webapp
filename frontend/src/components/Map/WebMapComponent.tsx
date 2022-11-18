import React, { useRef, useEffect } from 'react'
import Search from '@arcgis/core/widgets/Search'
import Directions from '@arcgis/core/widgets/Directions'
import RouteLayer from '@arcgis/core/layers/RouteLayer'
import FeatureLayer from '@arcgis/core/layers/FeatureLayer'
import esriConfig from '@arcgis/core/config'
import LayerSearchSource from '@arcgis/core/widgets/Search/LayerSearchSource'
import Collection from '@arcgis/core/core/Collection'
import { useMap } from '../../context/MapContext'

import './index.css'

export default function WebMapComponent() {
  const mapDiv = useRef(null)
  const view = useMap()

  useEffect(() => {
    esriConfig.apiKey = import.meta.env.VITE_ARC_GIS_API_KEY
    if (mapDiv.current) {
      view.container = mapDiv.current

      const buildings = new FeatureLayer({
        url: 'https://gis.m.asu.edu/server/rest/services/Campus/CampusBuilding/MapServer/0',
        // List of all Attributes contained in the building features
        outFields: [
          'OBJECTID',
          'BLDG_NUMBER',
          'BLDG_NAME',
          'BLDG_CODE',
          'BLDG_CITY',
          'BLDG_STATE',
          'BLDG_ZIP',
          'Description',
          'Type',
          'map_name',
          'Image',
          'BLDG_ADDRESS',
          'Shape',
          'Shape.STArea()',
          'Shape.STLength()',
        ],
        popupTemplate: {
          title: '{BLDG_NAME} ({BLDG_CODE})',
          content:
            '<b>{BLDG_ADDRESS}</b><br><img src="{Image}" alt="{Image of {BLDG_NAME}"><br>{Description}<br><br><b>Building Number:</b> {BLDG_NUMBER}',
        },
        id: 'buildings',
      })

      // map.add(layer);
      if(!view.map.findLayerById("buildings")) view.map.add(buildings)

      const doors = new FeatureLayer({
        url: 'https://gis.m.asu.edu/server/rest/services/Campus/CampusAccessibility/MapServer/0',
        outFields: [ 'buildingname', 'BLDG_NUMBER', 'BLDG_CODE'],
        id: 'doors',
      })

      /* BUILDING SEARCH */
      const searchWidgetSource = new LayerSearchSource({
        layer: buildings,
        searchFields: ['BLDG_CODE', 'BLDG_NAME', 'BLDG_NUMBER'],
        suggestionTemplate: '{BLDG_NAME} ({BLDG_CODE})',
        exactMatch: false,
        outFields: ['*'],
        name: 'ASU Buildings',
        placeholder: 'example: COOR',
      })

      const searchWidget = new Search({
        view,
        allPlaceholder: 'ASU Buildings',
        includeDefaultSources: false,
        popupEnabled: true,
        suggestionsEnabled: true,
        maxSuggestions: 5,
        minSuggestCharacters: 1,
        sources: [searchWidgetSource],
        id: 'searchWidget',
      })

      /* ROUTING */
      const routeLayer = new RouteLayer()

      const directionsSearchSource = new LayerSearchSource({
        layer: doors,
        searchFields: ['buildingname', 'BLDG_NUMBER'],
        suggestionTemplate: '{buildingname}',
        exactMatch: false,
        suggestionsEnabled: true,
        maxSuggestions: 5,
        outFields: ['*'],
        name: 'ASU Building Doors',
        placeholder: 'example: COOR',
      })

      const directions = new Directions({
        layer: routeLayer,
        view,
        visibleElements: {
          layerDetails: false,
          saveAsButton: false,
          saveButton: false,
        },
        searchProperties: {
          sources: new Collection([directionsSearchSource]),
          includeDefaultSources: false,
          suggestionsEnabled: true,
          maxSuggestions: 5,
          minSuggestCharacters: 1,
        },
        id: 'directionsWidget',
      })

      view.map.add(routeLayer)

      // Query Buildings (For )
      view.on('click', (event) => {
        const query = buildings.createQuery()
        query.geometry = view.toMap(event) // the point location of the pointer
        query.distance = 10
        query.units = 'meters'
        query.spatialRelationship = 'intersects' // this is the default
        query.returnGeometry = true
        query.outFields = ['BLDG_NAME']

        buildings.queryFeatures(query).then((response) =>{
          console.log('Query: ')
          // As of right now, this only returns the number of features in that proximity
          // Need to derive the information from the buildings
          console.log(response.fields.length)
        })
      })

      // Add the widgets to the top-right corner of the view
      if (!view.ui.find('searchWidget')) view.ui.add(searchWidget, 'top-right')
      if (!view.ui.find('directionsWidget')) view.ui.add(directions, 'top-right')

      view.when(() => {
        view.goTo({
          center: [-111.93, 33.419],
          zoom: 15,
        })
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
