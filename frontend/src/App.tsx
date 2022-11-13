import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { useState } from 'react'
import axios from 'axios'
import Header from './components/Header/Header'
import InfoPage from './pages/InfoPage'
import MapPage from './pages/MapPage'
import NotFound from './pages/NotFound'
import { MapProvider } from './context/MapContext'

export function App() {
  // This is a test function that communica
  const [data, setData] = useState()
  const urlWithProxy = '/api/v1'

  // This is a test function that works as an event handler,
  // retrieving data from the backend using the test endpoint.
  function getDataFromServer() {
    axios
      .get(urlWithProxy)
      .then((res) => setData(res.data))
      .catch((err) => {
        console.log(err.response.data)
      })
  }
  return (
    <Routes>
      <Route path="/" element={<MapPage />} />
      <Route path="/Map" element={<MapPage />} />
      <Route path="/Info" element={<InfoPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export function WrappedApp() {
  return (
    <BrowserRouter>
      <MapProvider>
        <Header />
        <App />
      </MapProvider>
    </BrowserRouter>
  )
}
