import React, { useRef, useEffect } from 'react'
import Search from '@arcgis/core/widgets/Search'
import Directions from '@arcgis/core/widgets/Directions'
import RouteLayer from '@arcgis/core/layers/RouteLayer'
import FeatureLayer from '@arcgis/core/layers/FeatureLayer'
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer'
import esriConfig from '@arcgis/core/config'
import LayerSearchSource from '@arcgis/core/widgets/Search/LayerSearchSource'
import Collection from '@arcgis/core/core/Collection'
import { useMap } from '../../context/MapContext'
import Graphic from '@arcgis/core/Graphic'
import Point from '@arcgis/core/geometry/Point'

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

      const graphicsLayer = new GraphicsLayer();
      view.map.add(graphicsLayer);

      /* BUILDING SEARCH */
      const startSearchWidgetSource = new LayerSearchSource({
        layer: buildings,
        searchFields: ['BLDG_CODE', 'BLDG_NAME', 'BLDG_NUMBER'],
        suggestionTemplate: '{BLDG_NAME} ({BLDG_CODE})',
        exactMatch: false,
        outFields: ['*'],
        name: 'ASU Buildings',
        placeholder: 'Start Building (ex: COOR)'//'example: COOR',
      })

      const searchWidgetStart = new Search({
        view,
        allPlaceholder: 'Start',
        includeDefaultSources: false,
        autoSelect: true,
        goToOverride:  function(view, goToParams) { //No Zoom
          return
        },
        popupEnabled: false,
        suggestionsEnabled: true,
        searchAllEnabled: false,
        maxSuggestions: 5,
        minSuggestCharacters: 1,
        sources: [startSearchWidgetSource],
        id: 'searchWidgetStart',
        // container: "searchBox",
      })

      const endSearchWidgetSource = new LayerSearchSource({
        layer: buildings,
        searchFields: ['BLDG_CODE', 'BLDG_NAME', 'BLDG_NUMBER'],
        suggestionTemplate: '{BLDG_NAME} ({BLDG_CODE})',
        exactMatch: false,
        outFields: ['*'],
        name: 'ASU Buildings',
        placeholder: 'End Building (ex: COOR)'//'example: COOR',
      })

      const searchWidgetEnd = new Search({
        view,
        allPlaceholder: 'Destination',
        includeDefaultSources: false,
        autoSelect: true,
        goToOverride:  function(view, goToParams) { //No Zoom
          return
        },
        popupEnabled: false,
        suggestionsEnabled: true,
        searchAllEnabled: false,
        maxSuggestions: 5,
        minSuggestCharacters: 1,
        sources: [endSearchWidgetSource],
        id: 'searchWidgetEnd',
        // container: "searchBox",
      })

      var startPoint = new Point()
      let startMarkerSymbol = {
        type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()
        color: [26, 219, 80]

      };

      let startPointGraphic = new Graphic({
        geometry: startPoint,
        symbol: startMarkerSymbol,
      });


      var endPoint = new Point()
      let endMarkerSymbol = {
        type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()
        color: [226, 119, 40]
      };

      let endPointGraphic = new Graphic({
        geometry: endPoint,
        symbol: endMarkerSymbol,
      });

      //Save Start and end cooridnates
      searchWidgetStart.on("select-result", function(event){
        var longitude = event.result.extent.center.longitude
        var latitude = event.result.extent.center.latitude
        startPoint.longitude = longitude
        startPoint.latitude = latitude

        graphicsLayer.add(startPointGraphic)
        
        console.log("The selected search result: Start longitude: ", longitude, " latitude: ", latitude);
      });

      searchWidgetEnd.on("select-result", function(event){
        var longitude = event.result.extent.center.longitude
        var latitude = event.result.extent.center.latitude
        endPoint.longitude = longitude
        endPoint.latitude = latitude

        graphicsLayer.add(endPointGraphic)
        console.log("The selected search result: End longitude: ", longitude, " latitude: ", latitude)
      });

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
      if (!view.ui.find('searchWidgetStart')) view.ui.add(searchWidgetStart, 'top-right')
      if (!view.ui.find('searchWidgetEnd')) view.ui.add(searchWidgetEnd, 'top-right')
      //if (!view.ui.find('directionsWidget')) view.ui.add(directions, 'top-right')

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

    // <div id="mapAndButtons">
      
    //   {/* <div id="searchDiv">
    //     <button id="calculateRoute">Calculate Route</button>
    //   </div> */}
    // </div>

  )
}
