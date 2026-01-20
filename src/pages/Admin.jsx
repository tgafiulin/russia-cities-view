import { useState, useEffect, useMemo, useRef } from 'react'
import '../App.css'
import './Admin.css'
import citiesData from '../../russia-cities.json'

function Admin() {
  const [visitedCityIds, setVisitedCityIds] = useState(() => {
    const saved = localStorage.getItem('visitedCities')
    return saved ? JSON.parse(saved) : []
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDistricts, setSelectedDistricts] = useState(new Set())
  const [selectedRegions, setSelectedRegions] = useState(new Set())
  const [filtersOpen, setFiltersOpen] = useState(false)
  const regionsInitialized = useRef(false)

  // Получаем уникальные федеральные округа
  const districts = useMemo(() => {
    const districtsSet = new Set()
    citiesData.forEach(city => {
      if (city.region?.district) {
        districtsSet.add(city.region.district)
      }
    })
    return Array.from(districtsSet).sort((a, b) => 
      a.localeCompare(b, 'ru', { sensitivity: 'base' })
    )
  }, [])

  useEffect(() => {
    const allDistricts = new Set()
    citiesData.forEach(city => {
      if (city.region?.district) {
        allDistricts.add(city.region.district)
      }
    })
    setSelectedDistricts(allDistricts)
  }, [])

  // Сохраняем посещенные города в localStorage
  useEffect(() => {
    localStorage.setItem('visitedCities', JSON.stringify(visitedCityIds))
    // Триггерим кастомное событие для обновления других страниц в той же вкладке
    window.dispatchEvent(new Event('visitedCitiesUpdated'))
  }, [visitedCityIds])

  const handleCityToggle = (cityId) => {
    setVisitedCityIds(prev => {
      if (prev.includes(cityId)) {
        return prev.filter(id => id !== cityId)
      } else {
        return [...prev, cityId]
      }
    })
  }

  const handleDistrictToggle = (district) => {
    setSelectedDistricts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(district)) {
        newSet.delete(district)
      } else {
        newSet.add(district)
      }
      return newSet
    })
  }

  const handleSelectAllDistricts = () => {
    if (selectedDistricts.size === districts.length) {
      setSelectedDistricts(new Set())
    } else {
      setSelectedDistricts(new Set(districts))
    }
  }

  const handleRegionToggle = (region) => {
    setSelectedRegions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(region)) {
        newSet.delete(region)
      } else {
        newSet.add(region)
      }
      return newSet
    })
  }

  const handleSelectAllRegions = (availableRegions) => {
    if (selectedRegions.size === availableRegions.length) {
      setSelectedRegions(new Set())
    } else {
      setSelectedRegions(new Set(availableRegions))
    }
  }

  // Фильтрация городов
  const preFilteredCities = citiesData.filter(city => {
    const district = city.region?.district
    if (district && !selectedDistricts.has(district)) {
      return false
    }

    const search = searchTerm.toLowerCase()
    return (
      city.name.toLowerCase().includes(search) ||
      (city.region?.name && city.region.name.toLowerCase().includes(search)) ||
      (district && district.toLowerCase().includes(search))
    )
  })

  const availableRegions = useMemo(() => {
    const regionsSet = new Set()
    preFilteredCities.forEach(city => {
      if (city.region?.name) {
        regionsSet.add(city.region.name)
      }
    })
    return Array.from(regionsSet).sort((a, b) => 
      a.localeCompare(b, 'ru', { sensitivity: 'base' })
    )
  }, [preFilteredCities])

  // Инициализируем регионы только один раз при первой загрузке
  useEffect(() => {
    if (!regionsInitialized.current && selectedRegions.size === 0 && availableRegions.length > 0) {
      setSelectedRegions(new Set(availableRegions))
      regionsInitialized.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableRegions])

  const filteredCities = preFilteredCities.filter(city => {
    const region = city.region?.name
    if (!region) return true
    if (selectedRegions.size === 0) return true
    return selectedRegions.has(region)
  })

  const sortedCities = useMemo(() => {
    return [...filteredCities].sort((a, b) => {
      const nameA = (a.name || '').toLowerCase()
      const nameB = (b.name || '').toLowerCase()
      return nameA.localeCompare(nameB, 'ru')
    })
  }, [filteredCities])

  const visitedCount = visitedCityIds.length
  const filteredVisitedCount = sortedCities.filter(city => 
    visitedCityIds.includes(city.id)
  ).length

  const handleSelectAllFiltered = () => {
    const filteredIds = sortedCities.map(city => city.id)
    const allFilteredVisited = filteredIds.every(id => visitedCityIds.includes(id))
    
    if (allFilteredVisited) {
      // Снимаем отметки со всех отфильтрованных
      setVisitedCityIds(prev => prev.filter(id => !filteredIds.includes(id)))
    } else {
      // Отмечаем все отфильтрованные
      setVisitedCityIds(prev => {
        const newSet = new Set(prev)
        filteredIds.forEach(id => newSet.add(id))
        return Array.from(newSet)
      })
    }
  }

  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (selectedDistricts.size !== districts.length) count++
    if (selectedRegions.size > 0 && selectedRegions.size !== availableRegions.length) count++
    return count
  }, [selectedDistricts.size, districts.length, selectedRegions.size, availableRegions.length])

  return (
    <div className="app admin-page">
      <h1>Админка: Отметка посещенных городов</h1>
      
      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-label">Всего посещено</div>
          <div className="stat-value">{visitedCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">В текущем фильтре</div>
          <div className="stat-value">{filteredVisitedCount} / {sortedCities.length}</div>
        </div>
      </div>

      <div className="accordion">
        <button
          className="accordion-toggle"
          onClick={() => setFiltersOpen(!filtersOpen)}
          aria-expanded={filtersOpen}
        >
          <span>Фильтры</span>
          {activeFiltersCount > 0 && (
            <span className="filter-badge">{activeFiltersCount}</span>
          )}
          <span className={`accordion-icon ${filtersOpen ? 'open' : ''}`}>
            ▼
          </span>
        </button>
        <div className={`accordion-content ${filtersOpen ? 'open' : ''}`}>
          <div className="filters-section">
            <div className="districts-filter">
              <div className="filter-header">
                <h3>Федеральные округа</h3>
                <button 
                  onClick={handleSelectAllDistricts}
                  className="select-all-btn"
                >
                  {selectedDistricts.size === districts.length ? 'Снять все' : 'Выбрать все'}
                </button>
              </div>
              <div className="districts-checkboxes">
                {districts.map(district => (
                  <label key={district} className="district-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedDistricts.has(district)}
                      onChange={() => handleDistrictToggle(district)}
                    />
                    <span>{district}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="regions-filter">
              <div className="filter-header">
                <h3>Регионы</h3>
                <button 
                  onClick={() => handleSelectAllRegions(availableRegions)}
                  className="select-all-btn"
                  disabled={availableRegions.length === 0}
                >
                  {selectedRegions.size === availableRegions.length ? 'Снять все' : 'Выбрать все'}
                </button>
              </div>
              <div className="districts-checkboxes">
                {availableRegions.length > 0 ? (
                  availableRegions.map(region => (
                    <label key={region} className="district-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedRegions.has(region)}
                        onChange={() => handleRegionToggle(region)}
                      />
                      <span>{region}</span>
                    </label>
                  ))
                ) : (
                  <div style={{ padding: '0.5rem', color: '#666' }}>
                    Нет доступных регионов
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="Поиск по названию, региону или федеральному округу..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <div className="cities-count">
          Показано: {sortedCities.length} из {citiesData.length}
        </div>
      </div>

      <div className="admin-actions">
        <button 
          onClick={handleSelectAllFiltered}
          className="select-all-cities-btn"
          disabled={sortedCities.length === 0}
        >
          {filteredVisitedCount === sortedCities.length && sortedCities.length > 0
            ? 'Снять отметки со всех'
            : 'Отметить все показанные'}
        </button>
      </div>

      <div className="admin-cities-list">
        {sortedCities.map((city) => {
          const isVisited = visitedCityIds.includes(city.id)
          return (
            <label 
              key={city.id} 
              className={`admin-city-item ${isVisited ? 'visited' : ''}`}
            >
              <input
                type="checkbox"
                checked={isVisited}
                onChange={() => handleCityToggle(city.id)}
              />
              <div className="city-info">
                <span className="city-name">{city.name}</span>
                <span className="city-details">
                  {city.region?.name && <span>{city.region.name}</span>}
                  {city.region?.district && (
                    <span className="district">{city.region.district}</span>
                  )}
                  {city.population && (
                    <span className="population">
                      {new Intl.NumberFormat('ru-RU').format(city.population)} чел.
                    </span>
                  )}
                </span>
              </div>
            </label>
          )
        })}
        {sortedCities.length === 0 && (
          <div className="no-cities">Города не найдены</div>
        )}
      </div>
    </div>
  )
}

export default Admin
