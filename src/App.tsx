import { BrowserRouter, Route, Routes } from 'react-router-dom'
import EvanPage from './pages/EvanPage'
import Home from './pages/Home'
import NotFound from './pages/NotFound'

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/Evan" element={<EvanPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export function WrappedApp() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  )
}
