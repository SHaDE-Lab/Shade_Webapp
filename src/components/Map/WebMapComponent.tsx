import { useRef, useEffect, useState } from 'react'
import Search from '@arcgis/core/widgets/Search'
import FeatureLayer from '@arcgis/core/layers/FeatureLayer'
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer'
import esriConfig from '@arcgis/core/config'
import LayerSearchSource from '@arcgis/core/widgets/Search/LayerSearchSource'
import Graphic from '@arcgis/core/Graphic'
import Point from '@arcgis/core/geometry/Point'
import TimeSlider from '@arcgis/core/widgets/TimeSlider'
import Track from '@arcgis/core/widgets/Track'
import TimeInterval from '@arcgis/core/TimeInterval'
import { Polyline } from '@arcgis/core/geometry'
import { useMap } from '../../context/MapContext'

import './index.css'

export default function WebMapComponent() {
  const mapDiv = useRef(null)
  const view = useMap()
  const backendUrl = import.meta.env.VITE_BACKEND_URL
  const [startPoint, setStartPoint] = useState<Point>()
  const [endPoint, setEndPoint] = useState<Point>()
  const [graphicsLayer, setGraphicsLayer] = useState<GraphicsLayer>()
  const [path, setPath] = useState<Graphic>()
  const [thumbPosition, setThumbPosition] = useState<Date>(new Date())

  const startMarkerSymbol = {
    type: 'simple-marker', // autocasts as new SimpleMarkerSymbol()
    color: [26, 219, 80],
  }
  const startPointGraphic = useRef<Graphic>(
    new Graphic({
      geometry: startPoint,
      symbol: startMarkerSymbol,
    })
  )

  const endMarkerSymbol = {
    type: 'simple-marker', // autocasts as new SimpleMarkerSymbol()
    color: [226, 119, 40],
  }
  const endPointGraphic = useRef<Graphic>(
    new Graphic({
      geometry: startPoint,
      symbol: endMarkerSymbol,
    })
  )

  const addBuildingLayer = () => {
    const buildingsLayer = new FeatureLayer({
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

    if (!view.map.findLayerById('buildings')) view.map.add(buildingsLayer)
  }
  const addRouteLayer = () => {}

  const addStartSearch = () => {
    /* BUILDING SEARCH */
    const startSearchWidgetSource = new LayerSearchSource({
      layer: view.map.layers.find((layer) => layer.id === 'buildings'),
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
    })

    searchWidgetStart.on('search-clear', (event) => {
      setStartPoint(undefined)
    })

    searchWidgetStart.on('select-result', function (event) {
      const { longitude } = event.result.extent.center
      const { latitude } = event.result.extent.center

      setStartPoint(new Point().set({ longitude, latitude }))
    })

    if (!view.ui.find('searchWidgetStart'))
      view.ui.add(searchWidgetStart, 'top-right')
  }
  const addEndSearch = () => {
    const endSearchWidgetSource = new LayerSearchSource({
      layer: view.map.layers.find((layer) => layer.id === 'buildings'),
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
    })

    searchWidgetEnd.on('search-clear', (event) => {
      setEndPoint(undefined)
    })

    searchWidgetEnd.on('select-result', (event) => {
      const { longitude } = event.result.extent.center
      const { latitude } = event.result.extent.center
      const endPoint = new Point().set({ longitude, latitude })
      setEndPoint(endPoint)
    })

    if (!view.ui.find('searchWidgetEnd'))
      view.ui.add(searchWidgetEnd, 'top-right')
  }
  const addSearchWidgets = () => {
    addStartSearch()
    addEndSearch()
  }

  const addTimeSlider = () => {
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

    timeSlider.watch('timeExtent', (value) => {
        setThumbPosition(value.end)
      }
    )
    if (!view.ui.find('timeSlider')) view.ui.add(timeSlider, 'bottom-right')
  }
  const addTracker = () => {
    const tracker = new Track({
      view,
      id: 'tracker',
    })

    if (!view.ui.find('tracker')) view.ui.add(tracker, 'top-left')
  }

  function deleteRoute() { 
    if (!path) return
    graphicsLayer?.remove(path)
  }

  async function makeRoute() {
    deleteRoute() // clears route first

    // Determines Start and End Points
    const startLat = startPoint?.latitude
    const startLong = startPoint?.longitude

    const endLat = endPoint?.latitude
    const endLong = endPoint?.longitude

    // FORMAT INTO UTC TIME LIKE THIS: 2021-10-01-0000
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
    const path = new Graphic({
      geometry: new Polyline({
        paths: coordinates, // Access coordinates here
      }),
      symbol,
    })
    // Add the route feature to the graphics layer
    graphicsLayer?.add(path)
    setPath(path)
  }

  useEffect(() => {
    esriConfig.apiKey = import.meta.env.VITE_ARC_GIS_API_KEY
    if (mapDiv.current) {
      view.container = mapDiv.current

      addBuildingLayer()
      addRouteLayer()
      addSearchWidgets()
      addTimeSlider()
      addTracker()

      const graphicsLayer = new GraphicsLayer()
      view.map.add(graphicsLayer)
      setGraphicsLayer(graphicsLayer)

      view.when(() => {
        view.goTo({
          center: [-111.93, 33.419],
          zoom: 15,
        })
      })
    }
  }, [view])

  const shouldDrawRoute = () => {
    return startPoint && endPoint && thumbPosition && thumbPosition != new Date()
     && startPoint.latitude != 0 && endPoint.latitude != 0 
     && startPoint.longitude != 0 && endPoint.longitude != 0
     && startPoint != endPoint
  }
  useEffect(() => {
    if(!shouldDrawRoute()) return
    deleteRoute()
    makeRoute()
  }, [startPoint, endPoint, thumbPosition])

  useEffect(() => {
    if (!startPoint) {
      graphicsLayer?.remove(startPointGraphic.current)
      deleteRoute()
      return
    }

    graphicsLayer?.remove(startPointGraphic.current)
    startPointGraphic.current.geometry = startPoint
    graphicsLayer?.add(startPointGraphic.current)
    
  }, [startPoint])


  useEffect(() => {
    if (!endPoint) {
      graphicsLayer?.remove(endPointGraphic.current)
      deleteRoute()
      return
    }

    graphicsLayer?.remove(endPointGraphic.current)
    endPointGraphic.current.geometry = endPoint
    graphicsLayer?.add(endPointGraphic.current)
    
  }, [endPoint])

  return (
    <div
      style={{ padding: 0, margin: 0, height: '100%', width: '100%' }}
      ref={mapDiv}
    />
  )
}
