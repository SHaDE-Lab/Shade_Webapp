import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Header from './components/Header/Header'
import InfoPage from './pages/InfoPage'
import MapPage from './pages/MapPage'
import NotFound from './pages/NotFound'

export function App() {
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
      <Header />
      <App />
    </BrowserRouter>
  )
}
