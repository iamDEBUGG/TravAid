import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import Expenses from './pages/Expenses'
import Safety from './pages/Safety'
import Analytics from './pages/Analytics'
import NotFound from './pages/NotFound'
import Navigation from './components/Navigation'

export default function App() {
  return (
    <div className="min-h-screen bg-[var(--canvas)]">
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/safety" element={<Safety />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}
