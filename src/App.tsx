import { Routes, Route, useLocation } from 'react-router'
import HeroLanding from './pages/HeroLanding'
import Expenses from './pages/Expenses'
import Safety from './pages/Safety'
import Analytics from './pages/Analytics'
import NotFound from './pages/NotFound'
import Navigation from './components/Navigation'

export default function App() {
  const location = useLocation()
  const isHeroPage = location.pathname === '/'

  return (
    <div className={isHeroPage ? '' : 'min-h-screen bg-[var(--canvas)]'}>
      {/* Hero page has its own navigation built-in */}
      {!isHeroPage && <Navigation />}
      <Routes>
        <Route path="/" element={<HeroLanding />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/safety" element={<Safety />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}
