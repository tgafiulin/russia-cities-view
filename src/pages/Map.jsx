import { useMemo, useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import citiesData from '../../russia-cities.json'
import '../Map.css'

// Фикс для иконок в React Leaflet
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
})

L.Marker.prototype.options.icon = DefaultIcon

function Map() {
  const [visitedCityIds, setVisitedCityIds] = useState(() => 
    JSON.parse(localStorage.getItem('visitedCities') || '[]')
  )

  // Обновляем при изменении localStorage (для синхронизации между вкладками и страницами)
  useEffect(() => {
    const handleStorageChange = () => {
      setVisitedCityIds(JSON.parse(localStorage.getItem('visitedCities') || '[]'))
    }
    // Стандартное событие для синхронизации между вкладками
    window.addEventListener('storage', handleStorageChange)
    // Кастомное событие для синхронизации в той же вкладке
    window.addEventListener('visitedCitiesUpdated', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('visitedCitiesUpdated', handleStorageChange)
    }
  }, [])
  
  const visitedCities = useMemo(() => 
    citiesData.filter(city => 
      city.coords && visitedCityIds.includes(city.id)
    ),
    [visitedCityIds]
  )

  // Центрируем карту на России (примерно центр европейской части)
  const center = useMemo(() => 
    visitedCities.length > 0 
      ? [visitedCities[0].coords.lat, visitedCities[0].coords.lon]
      : [55.7558, 37.6173], // Москва по умолчанию
    [visitedCities]
  )

  return (
    <div className="map-page">
      <div className="map-header">
        <h1>Карта посещенных городов</h1>
        <div className="map-stats">
          Посещено: {visitedCities.length} из {citiesData.length} городов
        </div>
      </div>
      <div className="map-container">
        <MapContainer
          center={center}
          zoom={5}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {visitedCities.map(city => (
            <Marker
              key={city.id}
              position={[city.coords.lat, city.coords.lon]}
            >
              <Popup>
                <strong>{city.name}</strong><br />
                {city.region?.name && <span>{city.region.name}</span>}
                {city.population && (
                  <>
                    <br />
                    <span style={{ fontSize: '0.9em', color: '#666' }}>
                      Население: {new Intl.NumberFormat('ru-RU').format(city.population)}
                    </span>
                  </>
                )}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}

export default Map
