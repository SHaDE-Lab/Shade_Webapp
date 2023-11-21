import React, { useRef, useEffect } from 'react'
import { useMap } from '../../context/MapContext'
import Search from '@arcgis/core/widgets/Search'
import FeatureLayer from '@arcgis/core/layers/FeatureLayer'
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer'
import esriConfig from '@arcgis/core/config'
import LayerSearchSource from '@arcgis/core/widgets/Search/LayerSearchSource'
import Graphic from '@arcgis/core/Graphic'
import Point from '@arcgis/core/geometry/Point'
import ButtonMenu from '@arcgis/core/widgets/FeatureTable/Grid/support/ButtonMenu'
import ButtonMenuItem from '@arcgis/core/widgets/FeatureTable/Grid/support/ButtonMenuItem'
import TimeSlider from '@arcgis/core/widgets/TimeSlider'
import Track from '@arcgis/core/widgets/Track'
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol'
import TimeInterval from '@arcgis/core/TimeInterval'
import { Polyline } from '@arcgis/core/geometry'

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

      // TODO: dynamically fetch these
     
      const routeMarkerSymbol = {
        type: "simple-marker",
        color: [226, 119, 40],  // Orange
        outline: {
            color: [255, 255, 255], // White
            width: 0.1
        }
     };
      var path: Graphic 
      var routeOn = false
   
      const buttonMenuItem1 = new ButtonMenuItem ({
        label: "Draw Route to Map",
        iconClass: "Icon font name, if applicable",
        clickFunction: function() {
          routeOn = true
          makeRoute()
        }

      })

      const buttonMenuItem2 = new ButtonMenuItem ({
        label: "Delete Route",
        iconClass: "Icon font name, if applicable",
        clickFunction: function () {
          routeOn = false
          deleteRoute()
        }
      })

      function deleteRoute(){
        graphicsLayer.remove(path)
      }

      async function makeRoute() {
        deleteRoute() //clears route first

        //Determines Start and End Points
        var startLat = startPoint.latitude
        var startLong = startPoint.longitude

        var endLat = endPoint.latitude
        var endLong = endPoint.longitude

        //Determines Date and Time
        var thumbPosition = timeSlider.timeExtent.end

        var date = thumbPosition.getFullYear() + '-' + (thumbPosition.getMonth() + 1)  + '-' + thumbPosition.getDate() + '-' + thumbPosition.getHours()
        
        /* --------------- CALL API HERE -------------------- */
        var url = "http://127.0.0.1:5000/api/route?json_data=" + encodeURIComponent(JSON.stringify({
          startPoint: [startLat, startLong],
          endPoint: [endLat, endLong],
          dateTime: date
        }));
        
        var response = await fetch(url, {
          method: 'GET',
          mode: 'cors', // Add CORS header
        });
        
        var responseJson = await response.json();
        
        var routeFeatureCollection = JSON.parse(responseJson.geojson);
                
        let symbol = {
          type: "simple-line",  // autocasts as new SimpleLineSymbol()
          color: "lightblue",
          width: "10px",
          style: "solid"
        };
        var coordinates = routeFeatureCollection.coordinates
        path = new Graphic({
          geometry: new Polyline({
            paths: coordinates // Access coordinates here
          }),
          symbol: symbol
        })
        // Add the route feature to the graphics layer
        graphicsLayer.add(path);
        routeOn = true
        // Assuming "view" is your MapView
        view.map.add(graphicsLayer);        
      }

      const buttonMenu = new ButtonMenu ({
        iconClass: "esri-icon-left",
        items: [buttonMenuItem1, buttonMenuItem2],
        id: 'buttonMenu',
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

        changeLocationPointer(startPointGraphic, startPoint, longitude, latitude)
      });

      searchWidgetEnd.on("search-clear", (event) =>{
        graphicsLayer.remove(endPointGraphic)
        deleteRoute()
      })
      searchWidgetStart.on("search-clear", (event) =>{
        graphicsLayer.remove(startPointGraphic)
        deleteRoute()
      })
      searchWidgetEnd.on("select-result", function(event){
        var longitude = event.result.extent.center.longitude
        var latitude = event.result.extent.center.latitude

        changeLocationPointer(endPointGraphic, endPoint, longitude, latitude)
      });

      function changeLocationPointer(graphic: Graphic, point: Point, longitude: any, latitude: any){
        graphicsLayer.remove(graphic)

        point.longitude = longitude
        point.latitude = latitude

        graphicsLayer.add(graphic)

        if (routeOn) { //Remake route
          deleteRoute()
          makeRoute()
        }

      }

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


      //--------------- Time Slider
      const today = new Date();
      today.setHours(0)
      today.setMinutes(0)
      today.setSeconds(0)

      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 3) // Adds two days
      endDate.setHours(0)
      endDate.setMinutes(0)
      endDate.setSeconds(0)

      const timeSlider = new TimeSlider({
        container: "timeSliderDiv",
        view: view,
        id: "timeSlider",
        mode: "instant",
        fullTimeExtent: {
          start: today,
          end: endDate
        },
        timeVisible: true,
        stops: {
          interval: new TimeInterval({
            value: 1,
            unit: "hours"
          })
        }

      });

      let tracker = new Track({ //Displays user's location
        view: view,
        id: "tracker"
      });
      if(!view.ui.find('tracker')) view.ui.add(tracker, 'top-left')//For some reason leaving this fixes formatting

      // Add the widgets to the top-right corner of the view
      if (!view.ui.find('searchWidgetStart')) view.ui.add(searchWidgetStart, 'top-right')
      if (!view.ui.find('searchWidgetEnd')) view.ui.add(searchWidgetEnd, 'top-right')
      if (!view.ui.find('tracker')) view.ui.add(tracker, 'top-left')
      if (!view.ui.find('buttonMenu')) view.ui.add(buttonMenu, 'top-left')
      if (!view.ui.find('timeSlider')) view.ui.add(timeSlider, 'bottom-right')
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
