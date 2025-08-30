import { Routes, Route, Navigate, NavLink, useNavigate, Link } from 'react-router-dom'
import CityGate from './pages/CityGate.jsx'
import Explore from './pages/Explore.jsx'
import RestaurantDetail from './pages/RestaurantDetail.jsx'
import Login from './pages/Login.jsx'
import { isAuth, getUser, clearAuth } from './auth'
import Favorites from './pages/Favorites.jsx'
import logo from './assets/logo-rest.png'



export default function App() {
  const authed = isAuth()
  const user = getUser()
  const navigate = useNavigate()

  function logout() {
    clearAuth()
    navigate('/login')
  }

  return (
    <>
<header className="app-header">
  {/* Izquierda: marca + navegación */}
  <div className="header-left">
    <Link to="/" className="brand" aria-label="Inicio">
  <img src={logo} alt="Guía de restaurantes peruanos" className="brand-logo" />
</Link>


    <nav className="main-nav">
      <Link to="/city">Elegir ciudad</Link>
      <Link to="/explore">Explorar</Link>
      <Link to="/favorites">Favoritos</Link>
    </nav>
  </div>

  {/* Derecha: usuario */}
  <div className="header-right">
    {isAuth() ? (
      <>
        <span>Hola, {(() => {
          const u = getUser?.();
          const name = u?.name || 'usuario';
          return name.split(' ')[0];
        })()}</span>
        <button
          onClick={() => {
            clearAuth();
            // si usas HashRouter, esto funciona siempre:
            window.location.hash = '#/login';
          }}
        >
          Salir
        </button>
      </>
    ) : (
      <Link to="/login">Entrar</Link>
    )}
  </div>
</header>



      <main style={{ padding:16, maxWidth: 1000, margin:'0 auto' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/city" replace />} />
          <Route path="/city" element={<CityGate />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/login" element={<Login />} />
          <Route path="/restaurants/:id" element={<RestaurantDetail />} />
          <Route path="*" element={<p>Página no encontrada</p>} />
          <Route path="/favorites" element={<Favorites />} />

        </Routes>
      </main>
    </>
  )
}
