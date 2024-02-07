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
import { useMap } from '../../context/MapContext'
import './index.css'
import Feature from 'esri/widgets/Feature'

export default function WebMapComponent() {
  const mapDiv = useRef(null)
  const view = useMap()
  const backendUrl = import.meta.env.VITE_BACKEND_URL
  const [startPoint, setStartPoint] = useState<Point>()
  const [endPoint, setEndPoint] = useState<Point>()
  const [graphicsLayer, setGraphicsLayer] = useState<GraphicsLayer>()
  const [thumbPosition, setThumbPosition] = useState<Date>(new Date())
  const [routeLayer, setRouteLayer] = useState<FeatureLayer>()
  const [routeFeatures, setRouteFeatures] = useState<Array<Feature>>([])

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

    searchWidgetStart.on('select-result', (event) => {
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
    })
    if (!view.ui.find('timeSlider')) view.ui.add(timeSlider, 'bottom-right')
  }
  const addTracker = () => {
    const tracker = new Track({
      view,
      id: 'tracker',
    })

    if (!view.ui.find('tracker')) view.ui.add(tracker, 'top-left')
  }

  const deleteRoute = () => {
    if (routeFeatures?.length > 0) {
      // Delete all features from the feature layer
      routeLayer
        ?.applyEdits({
          deleteFeatures: routeFeatures,
        })
        .then(() => {
          console.log('All features deleted successfully')
        })
        .catch((error) => {
          console.error('Error deleting features:', error)
        })
    }
  }

  const makeRoute = async () => {
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

    const mrtValues = JSON.parse(responseJson.mrt)

    const { coordinates } = routeFeatureCollection

    // group each pair of coordinates into a single array
    // [ a,b,c,d ] => [ [a,b], [b,c], [c,d], ...
    const lineSegments = coordinates.map((coord, index) => {
      if (index === 0) return
      return [coordinates[index - 1], coord]
    })
    // remove the first element bc its undefined
    lineSegments.shift()

    const featuresToAdd: Array<Feature> = []

    lineSegments.forEach((lineSegment, index) => {
      // Create a feature with the line segment geometry and MRT value
      const feature = {
        geometry: {
          type: 'polyline',
          paths: [lineSegment],
        },
        attributes: {
          mrt: mrtValues[index], // Assuming mrtValues is an array of MRT values corresponding to each line segment
        },
      }
      featuresToAdd.push(feature)
    })

    // Add features to the feature layer
    routeLayer
      ?.applyEdits({
        addFeatures: featuresToAdd,
      })
      .then((result) => {
        console.log('Features added successfully:', result)
      })
      .catch((error) => {
        console.error('Error adding features:', error)
      })
    setRouteFeatures(featuresToAdd)
  }

  useEffect(() => {
    esriConfig.apiKey = import.meta.env.VITE_ARC_GIS_API_KEY
    if (mapDiv.current) {
      view.container = mapDiv.current

      addBuildingLayer()
      addSearchWidgets()
      addTimeSlider()
      addTracker()

      const graphics = new GraphicsLayer()
      view.map.add(graphics)
      setGraphicsLayer(graphics)

      const route = new FeatureLayer({
        objectIdField: 'ObjectID',
        geometryType: 'polyline',
        spatialReference: { wkid: 4326 },
        id: 'route',
        source: [],
        fields: [
          {
            name: 'mrt',
            alias: 'MRT',
            type: 'double', // Assuming "mrt" values are integers, adjust type accordingly
          },
        ],
      })
      // Add the feature layer to the map
      view.map.add(route)
      setRouteLayer(route)

      const renderer = {
        type: 'simple',
        symbol: {
          type: 'simple-line',
          width: 8, // Constant width for the lines
          style: 'solid',
          color: 'lightblue', // Default color for the lines
        },
        visualVariables: [
          {
            type: 'color',
            field: 'mrt', // Field to base the color on
            stops: [
              { value: 0, color: 'lightblue' },           // 0
              { value: 10, color: 'blue' },               // 10
              { value: 20, color: 'dodgerblue' },         // 20
              { value: 30, color: 'deepskyblue' },        // 30
              { value: 40, color: 'cyan' },               // 40
              { value: 60, color: 'yellow' },             // 60
              { value: 70, color: 'orange' },             // 70
              { value: 80, color: 'darkorange' },         // 80
              { value: 90, color: 'orangered' },          // 90
              { value: 100, color: 'red' },               // 100
              { value: 110, color: 'firebrick' },         // 110
              { value: 120, color: 'maroon' },            // 120
              { value: 130, color: 'darkred' },           // 130
              { value: 140, color: 'brown' },             // 140
              { value: 150, color: 'black' }              // 150
            ]
          },
        ],
      }
      route.renderer = renderer

      view.when(() => {
        view.goTo({
          center: [-111.93, 33.419],
          zoom: 15,
        })
      })
    }
  }, [view])

  const shouldDrawRoute = () => {
    return (
      startPoint &&
      endPoint &&
      thumbPosition &&
      thumbPosition != new Date() &&
      startPoint.latitude != 0 &&
      endPoint.latitude != 0 &&
      startPoint.longitude != 0 &&
      endPoint.longitude != 0 &&
      startPoint != endPoint
    )
  }

  useEffect(() => {
    if (!shouldDrawRoute()) return
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
