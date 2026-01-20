import { useState, useEffect, useMemo } from 'react'
import './App.css'
import citiesData from '../russia-cities.json'

function App() {
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDistricts, setSelectedDistricts] = useState(new Set())
  const [selectedRegions, setSelectedRegions] = useState(new Set())
  const [minPopulation, setMinPopulation] = useState('')
  const [maxPopulation, setMaxPopulation] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [sortColumn, setSortColumn] = useState(null) // 'name' или 'population'
  const [sortDirection, setSortDirection] = useState('asc') // 'asc' или 'desc'

  // Получаем уникальные федеральные округа и сортируем по алфавиту
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
    // Данные уже загружены через импорт
    setCities(citiesData)
    // По умолчанию все округа выбраны
    const allDistricts = new Set()
    citiesData.forEach(city => {
      if (city.region?.district) {
        allDistricts.add(city.region.district)
      }
    })
    setSelectedDistricts(allDistricts)
    setLoading(false)
  }, [])

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

  const handleSelectAll = () => {
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

  const handleSort = (column) => {
    if (sortColumn === column) {
      // Если кликнули на ту же колонку, меняем направление
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // Если кликнули на другую колонку, устанавливаем новую сортировку
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  // Сначала фильтруем по округам, населению и поиску (без учета регионов)
  // чтобы получить список доступных регионов
  const preFilteredCities = cities.filter(city => {
    // Фильтр по федеральным округам
    const district = city.region?.district
    if (district && !selectedDistricts.has(district)) {
      return false
    }

    // Фильтр по населению
    const population = city.population || 0
    if (minPopulation && population < parseInt(minPopulation)) {
      return false
    }
    if (maxPopulation && population > parseInt(maxPopulation)) {
      return false
    }

    // Фильтр по поисковому запросу
    const search = searchTerm.toLowerCase()
    return (
      city.name.toLowerCase().includes(search) ||
      (city.region?.name && city.region.name.toLowerCase().includes(search)) ||
      (district && district.toLowerCase().includes(search))
    )
  })

  // Получаем доступные регионы из предфильтрованных данных
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

  // Инициализируем выбранные регионы, если они пусты, но есть доступные регионы
  useEffect(() => {
    if (selectedRegions.size === 0 && availableRegions.length > 0) {
      setSelectedRegions(new Set(availableRegions))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableRegions])

  // Применяем фильтр по регионам к предфильтрованным данным
  const filteredCities = preFilteredCities.filter(city => {
    const region = city.region?.name
    if (!region) return true
    // Если не выбрано ни одного региона, показываем все
    if (selectedRegions.size === 0) return true
    return selectedRegions.has(region)
  })

  // Применяем сортировку к отфильтрованным данным
  const sortedCities = useMemo(() => {
    if (!sortColumn) return filteredCities

    const sorted = [...filteredCities].sort((a, b) => {
      if (sortColumn === 'name') {
        // Сортировка по названию (алфавитная)
        const nameA = (a.name || '').toLowerCase()
        const nameB = (b.name || '').toLowerCase()
        if (sortDirection === 'asc') {
          return nameA.localeCompare(nameB, 'ru')
        } else {
          return nameB.localeCompare(nameA, 'ru')
        }
      } else if (sortColumn === 'population') {
        // Сортировка по населению
        const popA = a.population || 0
        const popB = b.population || 0
        if (sortDirection === 'asc') {
          return popA - popB
        } else {
          return popB - popA
        }
      } else if (sortColumn === 'region') {
        // Сортировка по региону (алфавитная)
        const regionA = (a.region?.name || '').toLowerCase()
        const regionB = (b.region?.name || '').toLowerCase()
        if (sortDirection === 'asc') {
          return regionA.localeCompare(regionB, 'ru')
        } else {
          return regionB.localeCompare(regionA, 'ru')
        }
      }
      return 0
    })

    return sorted
  }, [filteredCities, sortColumn, sortDirection])

  const formatPopulation = (pop) => {
    if (!pop) return '—'
    return new Intl.NumberFormat('ru-RU').format(pop)
  }

  // Подсчет активных фильтров для индикатора
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (minPopulation || maxPopulation) count++
    if (selectedDistricts.size !== districts.length) count++
    if (selectedRegions.size > 0 && selectedRegions.size !== availableRegions.length) count++
    return count
  }, [minPopulation, maxPopulation, selectedDistricts.size, districts.length, selectedRegions.size, availableRegions.length])

  if (loading) {
    return <div className="loading">Загрузка данных...</div>
  }

  return (
    <div className="app">
      <h1>Города России</h1>
      
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
          <div className="population-filter">
            <div className="population-filter-content">
              <h3>Население</h3>
              <div className="population-inputs">
                <input
                  id="min-population"
                  type="number"
                  min="0"
                  placeholder="От"
                  value={minPopulation}
                  onChange={(e) => setMinPopulation(e.target.value)}
                  className="population-input"
                />
                <input
                  id="max-population"
                  type="number"
                  min="0"
                  placeholder="До"
                  value={maxPopulation}
                  onChange={(e) => setMaxPopulation(e.target.value)}
                  className="population-input"
                />
                {(minPopulation || maxPopulation) && (
                  <button
                    onClick={() => {
                      setMinPopulation('')
                      setMaxPopulation('')
                    }}
                    className="clear-population-btn"
                  >
                    Сбросить
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="filters-section">
            <div className="districts-filter">
              <div className="filter-header">
                <h3>Федеральные округа</h3>
                <button 
                  onClick={handleSelectAll}
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
          Показано: {sortedCities.length} из {cities.length}
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>№</th>
              <th 
                className="sortable" 
                onClick={() => handleSort('name')}
              >
                <span>
                  Название
                  {sortColumn === 'name' && (
                    <span className="sort-indicator">
                      {sortDirection === 'asc' ? ' ▲' : ' ▼'}
                    </span>
                  )}
                </span>
              </th>
              <th 
                className="sortable" 
                onClick={() => handleSort('population')}
              >
                <span>
                  Население
                  {sortColumn === 'population' && (
                    <span className="sort-indicator">
                      {sortDirection === 'asc' ? ' ▲' : ' ▼'}
                    </span>
                  )}
                </span>
              </th>
              <th 
                className="sortable" 
                onClick={() => handleSort('region')}
              >
                <span>
                  Регион
                  {sortColumn === 'region' && (
                    <span className="sort-indicator">
                      {sortDirection === 'asc' ? ' ▲' : ' ▼'}
                    </span>
                  )}
                </span>
              </th>
              <th>Федеральный округ</th>
            </tr>
          </thead>
          <tbody>
            {sortedCities.map((city, index) => (
              <tr key={city.id || index}>
                <td>{index + 1}</td>
                <td className="city-name">{city.name}</td>
                <td className="population">{formatPopulation(city.population)}</td>
                <td>{city.region?.name || '—'}</td>
                <td>{city.region?.district || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default App
