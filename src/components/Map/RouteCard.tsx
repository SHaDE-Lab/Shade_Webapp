import { useEffect, useState } from 'react'
import { Card, CardContent, Typography } from '@mui/material'

const RouteCard = ( {average_mrt, length}) => {

  return (
    average_mrt != 0 && length != 0 && (
    <Card variant="outlined" style={{ borderRadius: 16 }}>
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom>
            Route Stats
          </Typography>
          <Typography variant="body1" component="p">
            Average MRT: {average_mrt.toFixed(2)}°C
          </Typography>
          <Typography variant="body1" component="p">
            Length: {length.toFixed(1)} meters
          </Typography>
        </CardContent>
      </Card>
    )
  )
}
export default RouteCard
