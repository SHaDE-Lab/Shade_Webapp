import { Box } from '@mui/material'
import WebMapComponent from '../components/Map/WebMapComponent'

export default function MapPage() {
  return (
    <Box sx={{ padding: 0, margin: 0, height: '100%', width: '100%' }}>
      <WebMapComponent />
    </Box>
  )
}
