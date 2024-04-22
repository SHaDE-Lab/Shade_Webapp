import { useState } from 'react'
import {
  Switch,
  Card,
  CardContent,
  Typography,
  Box,
  FormControlLabel,
} from '@mui/material'
import { convertToFahrenheit, convertToFeet } from '../../utils'

interface RouteCardProps {
  averageMRT: number
  routeLength: number
}

function RouteCard({ averageMRT, routeLength }: RouteCardProps) {
  const [useMetric, setMetric] = useState<boolean>(false)
  const DISPLAY_LENGTH_KM_THRESHOLD = 1000
  const DISPLAY_LENGTH_MILE_THRESHOLD = 528

  const displayTemp = (mrt: number) => {
    return useMetric
      ? `${mrt.toFixed(2)}°C`
      : `${convertToFahrenheit(mrt).toFixed(2)}°F`
  }
  const displayLength = (length: number) => {
    if (useMetric)
      return length < DISPLAY_LENGTH_KM_THRESHOLD
        ? `${length.toFixed(1)} m`
        : `${(length / 1000).toFixed(2)} km`
    const lengthInFeet = convertToFeet(length)
    return lengthInFeet < DISPLAY_LENGTH_MILE_THRESHOLD
      ? `${lengthInFeet.toFixed(1)} ft`
      : `${(lengthInFeet / 5280).toFixed(2)} mi`
  }

  return (
    averageMRT !== 0 &&
    routeLength !== 0 && (
      <Card variant="outlined" style={{ borderRadius: 16 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-evenly" gap={2}>
            <Typography variant="h6" component="h2" gutterBottom>
              Route Stats
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={useMetric}
                  onChange={() => setMetric(!useMetric)}
                />
              }
              label={useMetric ? 'Metric' : 'Imperial'}
              labelPlacement="end"
            />
          </Box>
          <Typography variant="body1" component="p">
            Average MRT: {displayTemp(averageMRT)}
          </Typography>
          <Typography variant="body1" component="p">
            Length: {displayLength(routeLength)}
          </Typography>
        </CardContent>
      </Card>
    )
  )
}
export default RouteCard
