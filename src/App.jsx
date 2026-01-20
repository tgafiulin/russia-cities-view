import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Map from './pages/Map'
import Admin from './pages/Admin'
import Navigation from './components/Navigation'
import './App.css'

function App() {
  const isProduction = import.meta.env.PROD

  return (
    <BrowserRouter>
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/map" element={<Map />} />
        {!isProduction && <Route path="/admin" element={<Admin />} />}
        {isProduction && <Route path="/admin" element={<Navigate to="/" replace />} />}
      </Routes>
    </BrowserRouter>
  )
}

export default App
