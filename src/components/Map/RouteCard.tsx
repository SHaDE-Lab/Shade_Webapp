import { useState } from 'react'
import { Switch, Card, CardContent, Typography, Box, FormControlLabel } from '@mui/material'
import { convertToFahrenheit, convertToFeet } from '../../utils'

interface RouteCardProps {
  average_mrt: number
  length: number
}

const RouteCard = ( {average_mrt, length}: RouteCardProps) => {
  const [useMetric, setMetric] = useState<boolean>(true)
  
  const displayTemp = (mrt: number)  =>{
    return useMetric ? `${mrt.toFixed(2)}°C` : `${convertToFahrenheit(mrt).toFixed(2)}°F`
  } 
  const displayLength = (length: number) =>{
    return useMetric ? `${length.toFixed(1)} m` : `${convertToFeet(length).toFixed(1)} ft`
  }

  return (
    average_mrt != 0 && length != 0 && (
    <Card variant="outlined" style={{ borderRadius: 16 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-evenly" gap={2}>
            <Typography variant="h6" component="h2" gutterBottom>
              Route Stats
            </Typography>
            <FormControlLabel
              control = {<Switch
                checked={useMetric}
                onChange={() => setMetric(!useMetric)}
              /> }
              label={useMetric ? 'Metric' : 'Imperial'}
              labelPlacement={'end'}
            />
          </Box>
          <Typography variant="body1" component="p">
            Average MRT: {displayTemp(average_mrt)}
          </Typography>
          <Typography variant="body1" component="p">
            Length: {displayLength(length)}
          </Typography>
        </CardContent>
      </Card>
    )
  )
}
export default RouteCard
