import { useMemo, useState, useEffect, useRef } from 'react'
import citiesData from '../../russia-cities.json'
import '../Map.css'

function Map() {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const clustererRef = useRef(null)
  const [visitedCityIds, setVisitedCityIds] = useState(() => 
    JSON.parse(localStorage.getItem('visitedCities') || '[]')
  )
  const [ymapsLoaded, setYmapsLoaded] = useState(false)

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

  // Проверяем загрузку Яндекс.Карт
  useEffect(() => {
    if (window.ymaps) {
      setYmapsLoaded(true)
    } else {
      const checkYmaps = setInterval(() => {
        if (window.ymaps) {
          setYmapsLoaded(true)
          clearInterval(checkYmaps)
        }
      }, 100)
      return () => clearInterval(checkYmaps)
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


  // Инициализация карты (только один раз)
  useEffect(() => {
    if (!ymapsLoaded || !mapRef.current || mapInstanceRef.current) return

    window.ymaps.ready(() => {
      if (mapInstanceRef.current) return

      const initialCenter = [55.7558, 37.6173] // Москва по умолчанию

      const map = new window.ymaps.Map(mapRef.current, {
        center: initialCenter,
        zoom: 5,
        controls: ['zoomControl', 'fullscreenControl', 'typeSelector', 'geolocationControl']
      })

      mapInstanceRef.current = map

      // Создаем кластеризатор
      const clusterer = new window.ymaps.Clusterer({
        preset: 'islands#invertedBlueClusterIcons',
        groupByCoordinates: false,
        clusterDisableClickZoom: true,
        clusterHideIconOnBalloonOpen: true,
        geoObjectHideIconOnBalloonOpen: false,
        clusterBalloonContentLayout: 'cluster#balloonCarousel',
        clusterBalloonItemContentLayout: 'cluster#balloonCarouselItem',
        clusterBalloonPanelMaxMapArea: 0,
        clusterBalloonContentLayoutWidth: 300,
        clusterBalloonContentLayoutHeight: 200,
        clusterBalloonPagerSize: 5,
        clusterBalloonPagerType: 'marker',
        clusterBalloonPagerVisible: true,
      })

      clustererRef.current = clusterer
      map.geoObjects.add(clusterer)
    })

    return () => {
      if (clustererRef.current) {
        clustererRef.current = null
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy()
        mapInstanceRef.current = null
      }
    }
  }, [ymapsLoaded])

  // Обновление маркеров и центра карты при изменении посещенных городов
  useEffect(() => {
    // Пропускаем обновление, если карта еще не инициализирована (маркеры добавятся при инициализации)
    if (!ymapsLoaded || !mapInstanceRef.current || !clustererRef.current || !window.ymaps) return

    window.ymaps.ready(() => {
      if (!mapInstanceRef.current || !clustererRef.current) return

      const clusterer = clustererRef.current

      // Очищаем все маркеры из кластеризатора
      clusterer.removeAll()

      // Создаем массив маркеров для кластеризатора
      const placemarks = visitedCities.map(city => {
        const balloonContent = `
          <div style="padding: 5px;">
            <strong>${city.name}</strong><br />
            ${city.region?.name ? `<span>${city.region.name}</span><br />` : ''}
            ${city.population ? `<span style="font-size: 0.9em; color: #666;">Население: ${new Intl.NumberFormat('ru-RU').format(city.population)}</span>` : ''}
          </div>
        `

        return new window.ymaps.Placemark(
          [city.coords.lat, city.coords.lon],
          {
            balloonContent: balloonContent,
            hintContent: city.name,
          },
          {
            preset: 'islands#blueCircleDotIcon',
            openHintOnHover: true,
          }
        )
      })

      // Добавляем все маркеры в кластеризатор
      if (placemarks.length > 0) {
        clusterer.add(placemarks)
      }

      // Обновляем центр карты, если есть посещенные города
      if (visitedCities.length > 0 && mapInstanceRef.current) {
        mapInstanceRef.current.setCenter([visitedCities[0].coords.lat, visitedCities[0].coords.lon])
      }
    })
  }, [visitedCities, ymapsLoaded])

  return (
    <div className="map-page">
      <div className="map-header">
        <h1>Карта посещенных городов</h1>
        <div className="map-stats">
          Посещено: {visitedCities.length} из {citiesData.length} городов
        </div>
      </div>
      <div className="map-container">
        {!ymapsLoaded && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            fontSize: '1.1rem',
            color: '#666'
          }}>
            Загрузка карты...
          </div>
        )}
        <div ref={mapRef} style={{ width: '100%', height: '100%', display: ymapsLoaded ? 'block' : 'none' }}></div>
      </div>
    </div>
  )
}

export default Map
