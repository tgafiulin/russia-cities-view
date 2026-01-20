import { Link, useLocation } from 'react-router-dom'
import './Navigation.css'

function Navigation() {
  const location = useLocation()
  const isProduction = import.meta.env.PROD

  return (
    <nav className="navigation">
      <Link 
        to="/" 
        className={location.pathname === '/' ? 'active' : ''}
      >
        Таблица
      </Link>
      <Link 
        to="/map" 
        className={location.pathname === '/map' ? 'active' : ''}
      >
        Карта
      </Link>
      {!isProduction && (
        <Link 
          to="/admin" 
          className={location.pathname === '/admin' ? 'active' : ''}
        >
          Админка
        </Link>
      )}
    </nav>
  )
}

export default Navigation
