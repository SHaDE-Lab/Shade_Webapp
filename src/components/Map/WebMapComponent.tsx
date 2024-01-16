import React, { useRef, useEffect } from 'react'
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
import TimeInterval from '@arcgis/core/TimeInterval'
import { Polyline } from '@arcgis/core/geometry'
import { useMap } from '../../context/MapContext'

import './index.css'

export default function WebMapComponent() {
  const mapDiv = useRef(null)
  const view = useMap()

  useEffect(() => {
    esriConfig.apiKey = import.meta.env.VITE_ARC_GIS_API_KEY
    const backendUrl = import.meta.env.VITE_BACKEND_URL
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
      if (!view.map.findLayerById('buildings')) view.map.add(buildings)

      const graphicsLayer = new GraphicsLayer()
      view.map.add(graphicsLayer)

      /* BUILDING SEARCH */
      const startSearchWidgetSource = new LayerSearchSource({
        layer: buildings,
        searchFields: ['BLDG_CODE', 'BLDG_NAME', 'BLDG_NUMBER'],
        suggestionTemplate: '{BLDG_NAME} ({BLDG_CODE})',
        exactMatch: false,
        outFields: ['*'],
        name: 'ASU Buildings',
        placeholder: 'Start Building (ex: COOR)', // 'example: COOR',
      })

      const searchWidgetStart = new Search({
        view,
        allPlaceholder: 'Start',
        includeDefaultSources: false,
        autoSelect: true,
        goToOverride(view, goToParams) {
          // No Zoom
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
        placeholder: 'End Building (ex: COOR)', // 'example: COOR',
      })

      const searchWidgetEnd = new Search({
        view,
        allPlaceholder: 'Destination',
        includeDefaultSources: false,
        autoSelect: true,
        goToOverride(view, goToParams) {
          // No Zoom
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
        type: 'simple-marker',
        color: [226, 119, 40], // Orange
        outline: {
          color: [255, 255, 255], // White
          width: 0.1,
        },
      }
      let path: Graphic
      let routeOn = false

      const buttonMenuItem1 = new ButtonMenuItem({
        label: 'Draw Route to Map',
        iconClass: 'Icon font name, if applicable',
        clickFunction() {
          routeOn = true
          makeRoute()
        },
      })

      const buttonMenuItem2 = new ButtonMenuItem({
        label: 'Delete Route',
        iconClass: 'Icon font name, if applicable',
        clickFunction() {
          routeOn = false
          deleteRoute()
        },
      })

      function deleteRoute() {
        graphicsLayer.remove(path)
      }

      async function makeRoute() {
        deleteRoute() // clears route first

        // Determines Start and End Points
        const startLat = startPoint.latitude
        const startLong = startPoint.longitude

        const endLat = endPoint.latitude
        const endLong = endPoint.longitude

        // Determines Date and Time
        const thumbPosition = timeSlider.timeExtent.end
        // this is local UTC time AZ is GMT - 7 so utc is 7 hours ahead
        const date = `${thumbPosition.getUTCFullYear()}-${
          thumbPosition.getUTCMonth() + 1
        }-${
          thumbPosition.getUTCDate() < 10
            ? `0${thumbPosition.getUTCDate()}`
            : thumbPosition.getUTCDate()
        }-${
          thumbPosition.getUTCHours() < 10
            ? `0${thumbPosition.getUTCHours()}`
            : thumbPosition.getUTCHours()
        }00`

        /* --------------- CALL API HERE -------------------- */
        const url = `${backendUrl}/api/route?json_data=${encodeURIComponent(
          JSON.stringify({
            startPoint: [startLat, startLong],
            endPoint: [endLat, endLong],
            dateTime: date,
          })
        )}`
  
        const response = await fetch(url, {
          method: 'GET',
          mode: 'cors', // Add CORS header
        })

        const responseJson = await response.json()

        const routeFeatureCollection = JSON.parse(responseJson.geojson)

        const symbol = {
          type: 'simple-line', // autocasts as new SimpleLineSymbol()
          color: 'lightblue',
          width: '10px',
          style: 'solid',
        }
        const { coordinates } = routeFeatureCollection
        path = new Graphic({
          geometry: new Polyline({
            paths: coordinates, // Access coordinates here
          }),
          symbol,
        })
        // Add the route feature to the graphics layer
        graphicsLayer.add(path)
        routeOn = true
        // Assuming "view" is your MapView
        view.map.add(graphicsLayer)
      }

      const buttonMenu = new ButtonMenu({
        iconClass: 'esri-icon-left',
        items: [buttonMenuItem1, buttonMenuItem2],
        id: 'buttonMenu',
      })

      var startPoint = new Point()
      const startMarkerSymbol = {
        type: 'simple-marker', // autocasts as new SimpleMarkerSymbol()
        color: [26, 219, 80],
      }

      const startPointGraphic = new Graphic({
        geometry: startPoint,
        symbol: startMarkerSymbol,
      })

      var endPoint = new Point()
      const endMarkerSymbol = {
        type: 'simple-marker', // autocasts as new SimpleMarkerSymbol()
        color: [226, 119, 40],
      }

      const endPointGraphic = new Graphic({
        geometry: endPoint,
        symbol: endMarkerSymbol,
      })

      // Save Start and end cooridnates
      searchWidgetStart.on('select-result', function (event) {
        const { longitude } = event.result.extent.center
        const { latitude } = event.result.extent.center

        changeLocationPointer(
          startPointGraphic,
          startPoint,
          longitude,
          latitude
        )
      })

      searchWidgetEnd.on('search-clear', (event) => {
        graphicsLayer.remove(endPointGraphic)
        deleteRoute()
      })
      searchWidgetStart.on('search-clear', (event) => {
        graphicsLayer.remove(startPointGraphic)
        deleteRoute()
      })
      searchWidgetEnd.on('select-result', function (event) {
        const { longitude } = event.result.extent.center
        const { latitude } = event.result.extent.center

        changeLocationPointer(endPointGraphic, endPoint, longitude, latitude)
      })

      function changeLocationPointer(
        graphic: Graphic,
        point: Point,
        longitude: any,
        latitude: any
      ) {
        graphicsLayer.remove(graphic)

        point.longitude = longitude
        point.latitude = latitude

        graphicsLayer.add(graphic)

        if (
          routeOn ||
          (startPoint &&
            endPoint &&
            endPoint.latitude != 0 &&
            startPoint.latitude != 0)
        ) {
          // Remake route
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

        buildings.queryFeatures(query).then((response) => {
          console.log('Query: ')
          // As of right now, this only returns the number of features in that proximity
          // Need to derive the information from the buildings

          console.log(response.fields.length)
        })
      })

      // --------------- Time Slider
      const today = new Date()
      today.setHours(0)
      today.setMinutes(0)
      today.setSeconds(0)

      const endDate = new Date()
      endDate.setDate(endDate.getDate() + 3) // Adds two days
      endDate.setHours(0)
      endDate.setMinutes(0)
      endDate.setSeconds(0)

      const timeSlider = new TimeSlider({
        container: 'timeSliderDiv',
        view,
        id: 'timeSlider',
        mode: 'instant',
        fullTimeExtent: {
          start: today,
          end: endDate,
        },
        timeVisible: true,
        stops: {
          interval: new TimeInterval({
            value: 1,
            unit: 'hours',
          }),
        },
      })

      timeSlider.on('trigger-action', (event) => {
        console.log(event)
      })

      timeSlider.watch('timeExtent', function (value) {
        if (
          routeOn ||
          (startPoint &&
            endPoint &&
            endPoint.latitude != 0 &&
            startPoint.latitude != 0)
        ) {
          // Remake route
          deleteRoute()
          makeRoute()
        }
      })

      const tracker = new Track({
        // Displays user's location
        view,
        id: 'tracker',
      })

      // Add the widgets to the top-right corner of the view
      if (!view.ui.find('searchWidgetStart'))
        view.ui.add(searchWidgetStart, 'top-right')
      if (!view.ui.find('searchWidgetEnd'))
        view.ui.add(searchWidgetEnd, 'top-right')
      if (!view.ui.find('tracker')) view.ui.add(tracker, 'top-left')
      if (!view.ui.find('buttonMenu')) view.ui.add(buttonMenu, 'top-left')
      if (!view.ui.find('timeSlider')) view.ui.add(timeSlider, 'bottom-right')
      view.ui.add(tracker, 'top-right') // For some reason leaving this fixes formatting

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
