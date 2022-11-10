import React, { useRef, useEffect } from 'react'
import MapView from '@arcgis/core/views/MapView'
import WebMap from '@arcgis/core/WebMap'
import Search from '@arcgis/core/widgets/Search'
import Directions from '@arcgis/core/widgets/Directions'
import RouteLayer from '@arcgis/core/layers/RouteLayer'
import FeatureLayer from '@arcgis/core/layers/FeatureLayer'
import LayerSearchSource from '@arcgis/core/widgets/Search/LayerSearchSource'
import MapImageLayer from "@arcgis/core/layers/MapImageLayer";

import './index.css'


// TODO CREATE THIS AS A CONTEXT
export default function WebMapComponent() {
  const mapDiv = useRef(null)

  useEffect(() => {
    if (mapDiv.current) {
      const webmap = new WebMap({
        portalItem: {
          //Default basemap
          //id: 'aa1d3f80270146208328cf66d022e09c',

          //Plain Basemap
          id: '00c8181753cd4673810a1ede1f52a922'
        },
        
      })

      const view = new MapView({
        container: mapDiv.current,
        map: webmap,
      })

      //Adding Buildings Layer

      const buildings = new FeatureLayer({
        url: "https://gis.m.asu.edu/server/rest/services/Campus/CampusBuilding/MapServer/0",
        //List of all Attributes contained in the building features
        outFields: ["OBJECTID","BLDG_NUMBER","BLDG_NAME","BLDG_CODE","BLDG_CITY","BLDG_STATE","BLDG_ZIP","Description"
        ,"Type","map_name","Image","BLDG_ADDRESS","Shape","Shape.STArea()","Shape.STLength()"],
        popupTemplate: {
          "title": "{BLDG_NAME} ({BLDG_CODE})",
          "content": "<b>{BLDG_ADDRESS}</b><br><img src=\"{Image}\" alt=\"{Image of {BLDG_NAME}\"><br>{Description}<br><br><b>Building Number:</b> {BLDG_NUMBER}"
        }
      })
      webmap.add(buildings)

      const searchSource = new LayerSearchSource({
        layer: buildings,
        searchFields: ["BLDG_CODE", "BLDG_NAME", "BLDG_NUMBER"],
        //suggestionTemplate: "{Name}, Party: {Party}",
        suggestionTemplate: "{BLDG_NAME} ({BLDG_CODE})",
        exactMatch: false,
        outFields: ["*"],
        name: "ASU Buildings",
        placeholder: "example: COOR"
      })

      const searchWidget = new Search({
        view: view,
        allPlaceholder: "ASU Buildings",
        includeDefaultSources: false,
        popupEnabled: true,
        suggestionsEnabled: true,
        maxSuggestions: 5,
        minSuggestCharacters: 1,
        sources: [searchSource]
      })

      const routeLayer = new RouteLayer()

      const directions = new Directions({
        layer: routeLayer,
        view,
      })

      

      //Query Buildings (For )
      view.on("click", function(event){
        let query = buildings.createQuery();
        query.geometry = view.toMap(event);  // the point location of the pointer
        query.distance = 10;
        query.units = "meters";
        query.spatialRelationship = "intersects";  // this is the default
        query.returnGeometry = true;
        query.outFields = [ "BLDG_NAME" ];
      
        buildings.queryFeatures(query)
          .then(function(response){
            console.log("Query: ")
            //As of right now, this only returns the number of features in that proximity
            //Need to derive the information from the buildings
            console.log(response.fields.length)
          });
      });

      // Add the widget to the top-right corner of the view
      view.ui.add(searchWidget, 'top-right')
      view.ui.add(directions, 'top-right')
      
      // bonus - how many bookmarks in the webmap?
      webmap.when(() => {
        view.goTo({
          center: [-111.93, 33.419],
          zoom: 15
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
