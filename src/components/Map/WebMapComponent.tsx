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
import Legend from '@arcgis/core/widgets/Legend'
import Feature from 'esri/widgets/Feature'
import Expand from '@arcgis/core/widgets/Expand'
import { CircularProgress } from '@mui/material'
import { useMap } from '../../context/MapContext'
import './index.css'
import RouteCard from './RouteCard'

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
  const [loading, setLoading] = useState(false)
  const [averageMRT, setAverageMRT] = useState(0)
  const [routeLength, setRouteLength] = useState(0)

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
      locationEnabled: true,
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
      layout: 'compact',
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

    var timeSliderExpand = new Expand({
      view: view,
      content: timeSlider,
      expandIconClass: "esri-icon-time-clock",
      group: "top-left",
      id: 'timeSliderExpand',
      mode: 'floating',
    })

    if (!view.ui.find('timeSliderExpand')) view.ui.add(timeSliderExpand, 'top-right')
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
        setAverageMRT(0)
        setRouteLength(0)
    }
  }

  const makeRoute = async () => {
    setLoading(true)
    deleteRoute() // clears route first

    // Determines Start and End Points
    const startLat = startPoint?.latitude
    const startLong = startPoint?.longitude

    const endLat = endPoint?.latitude
    const endLong = endPoint?.longitude

    // FORMAT INTO UTC TIME LIKE THIS: 2021-10-01-0000
    const date = `${thumbPosition.getUTCFullYear()}-${
      thumbPosition.getUTCMonth() + 1 < 10
        ? `0${thumbPosition.getUTCMonth() + 1}`
        : thumbPosition.getUTCMonth() + 1
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
    try {
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors', // Add CORS header
        headers: new Headers({
          'ngrok-skip-browser-warning': '69420',
        }),
      })
      const responseJson = await response.json()

      const routeFeatureCollection = JSON.parse(responseJson.geojson)

      const mrtValues = JSON.parse(responseJson.mrt)

      const { coordinates } = routeFeatureCollection

      // group each pair of coordinates into a single array
      // [ a,b,c,d ] => [ [a,b], [b,c], [c,d] ]
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
      console.log(responseJson.stats)
      // SET STATS
      const averageMRT = responseJson.stats.average_mrt
      const totalMRT = responseJson.stats.mrt
      const { length } = responseJson.stats

      // display these in the UI
      setAverageMRT(averageMRT)
      setRouteLength(length)
    } catch (error) {
      console.error('Error fetching route:', error)
    } finally {
      setLoading(false)
    }
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

      const colors = [
        '#ffffcc',
        '#ffeda0',
        '#fed976',
        '#feb24c',
        '#fd8d3c',
        '#fc4e2a',
        '#e31a1c',
        '#bd0026',
        '#800026',
      ]
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
              // five degree increments from 20 to 80
              { value: 25, color: colors[0] }, // 0 - 25
              { value: 35, color: colors[1] }, // 25-35
              { value: 40, color: colors[2] }, // 35-40
              { value: 45, color: colors[3] }, // 40-45
              { value: 50, color: colors[4] }, // 45 - 50
              { value: 55, color: colors[5] }, // 50 - 55
              { value: 60, color: colors[6] }, // 55- 60
              { value: 70, color: colors[7] }, // 60 - 70
              { value: 80, color: colors[8] }, // 70- 80
            ],
          },
        ],
      }

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
      route.renderer = renderer
      // Add the feature layer to the map
      view.map.add(route)
      setRouteLayer(route)

      view.when(() => {
        view.goTo({
          center: [-111.93, 33.419],
          zoom: 15,
        })
      })
      if(!view.ui.find('legend')){
        console.log('adding legend')
        const legend = new Legend({
          view,
          id: 'legend',
          layerInfos: [
            {
              layer: route,
              title: 'MRT',
            },
          ],
          respectLayerVisibility: true,
        })

        const expand = new Expand({
          view,
          content: legend,
          expandIconClass: 'esri-icon-legend',
          group: 'top-left',
          id: 'legendExpand',
          mode: 'floating',
        })
        if (!view.ui.find('legendExpand')) view.ui.add(expand, 'top-left')
      }
    }

    // Add the legend to the view
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
      startPoint != endPoint &&
      !loading
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
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999,
          display: loading ? 'flex' : 'none',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress />
      </div>
      <div
        style={{
          position: 'absolute',
          left: '1vh',
          bottom: '8vh',
          zIndex: 999,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <RouteCard averageMRT={averageMRT} routeLength={routeLength} />
      </div>

      <div
        style={{ padding: 0, margin: 0, height: '100%', width: '100%' }}
        ref={mapDiv}
      />
    </div>
  )
}
