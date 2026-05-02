import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { trpc } from '@/providers/trpc'
import { motion, AnimatePresence } from 'framer-motion'
import Globe from 'react-globe.gl'
import {
  Search, Shield, AlertTriangle, X, CheckCircle, XCircle,
  MapPin, Heart, Scale, Cloud, Activity
} from 'lucide-react'

function useContainerSize(ref: React.RefObject<HTMLDivElement | null>) {
  const [size, setSize] = useState({ width: 0, height: 0 })
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({ width: Math.round(width), height: Math.round(height) })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  return size
}

function getMarkerColor(score: number) {
  if (score >= 80) return '#10B981'
  if (score >= 50) return '#F59E0B'
  if (score >= 20) return '#EF4444'
  return '#7C3AED'
}

function getAdvisoryLabel(level: string) {
  switch (level) {
    case 'safe': return { text: 'Safe', color: 'var(--success)', bg: 'var(--success-light)' }
    case 'moderate': return { text: 'Moderate', color: 'var(--warning)', bg: 'var(--warning-light)' }
    case 'high_risk': return { text: 'High Risk', color: 'var(--danger)', bg: 'var(--danger-light)' }
    case 'critical': return { text: 'Critical', color: 'var(--danger)', bg: 'var(--danger-light)' }
    default: return { text: level, color: 'var(--text-muted)', bg: 'var(--border)' }
  }
}

function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const color = getMarkerColor(score)
  const radius = (size - 8) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E5E7EB" strokeWidth="4" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-1000" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[20px] font-bold text-[var(--text-primary)]">{score}</span>
      </div>
    </div>
  )
}

function ScoreBar({ label, score, icon: Icon, positive }: { label: string; score: number; icon: React.ElementType; positive: boolean }) {
  const color = getMarkerColor(score)
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Icon size={14} style={{ color }} />
          <span className="text-[13px] font-medium text-[var(--text-primary)]">{label}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-semibold" style={{ color }}>{score}/100</span>
          {positive ? (
            score >= 70 ? <CheckCircle size={13} className="text-[var(--success)]" /> : <XCircle size={13} className="text-[var(--danger)]" />
          ) : (
            score <= 40 ? <CheckCircle size={13} className="text-[var(--success)]" /> : <XCircle size={13} className="text-[var(--danger)]" />
          )}
        </div>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }} className="h-full rounded-full" style={{ backgroundColor: color }} />
      </div>
    </div>
  )
}

export default function Safety() {
  const [search, setSearch] = useState('')
  const [selectedCountry, setSelectedCountry] = useState<number | null>(null)
  const [regionFilter, setRegionFilter] = useState('')
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null)
  const globeRef = useRef<any>(null)
  const globeContainerRef = useRef<HTMLDivElement>(null)
  const containerSize = useContainerSize(globeContainerRef)

  const { data: countries } = trpc.country.list.useQuery({
    limit: 200, search: search || undefined, region: regionFilter || undefined,
    sortBy: 'overall_score', sortOrder: 'desc',
  })

  const { data: alerts } = trpc.country.getAlerts.useQuery(
    { countryId: selectedCountry! }, { enabled: !!selectedCountry }
  )

  const { data: regions } = trpc.country.getRegions.useQuery()

  const selectedCountryData = useMemo(() =>
    countries?.find(c => c.id === selectedCountry), [countries, selectedCountry])

  const markers = useMemo(() => {
    if (!countries) return []
    return countries.filter(c => c.latitude && c.longitude).map(c => ({
      lat: Number(c.latitude), lng: Number(c.longitude),
      size: 0.4 + (c.overallScore / 200),
      color: getMarkerColor(c.overallScore),
      name: c.name, score: c.overallScore, flag: c.flag,
      id: c.id, advisory: c.advisoryLevel,
    }))
  }, [countries])

  const handleMarkerClick = useCallback((marker: any) => {
    setSelectedCountry(marker.id)
    if (globeRef.current) {
      globeRef.current.pointOfView({ lat: marker.lat, lng: marker.lng, altitude: 1.5 }, 1000)
    }
  }, [])

  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = true
      globeRef.current.controls().autoRotateSpeed = 0.4
      globeRef.current.controls().enableZoom = true
    }
  }, [])

  // Positives and Concerns analysis
  const getPositives = (c: typeof selectedCountryData) => {
    if (!c) return []
    const positives: string[] = []
    if (c.crimeRate >= 75) positives.push('Very low crime rate — safe streets')
    else if (c.crimeRate >= 60) positives.push('Moderate crime rate — generally safe')
    if (c.healthcareScore >= 80) positives.push('Excellent healthcare facilities')
    else if (c.healthcareScore >= 60) positives.push('Good healthcare available')
    if (c.politicalStability >= 80) positives.push('Highly stable political environment')
    else if (c.politicalStability >= 65) positives.push('Reasonably stable politically')
    if (c.naturalDisasterRisk <= 45) positives.push('Low natural disaster risk')
    if (c.overallScore >= 85) positives.push('Top-rated travel destination')
    return positives
  }

  const getConcerns = (c: typeof selectedCountryData) => {
    if (!c) return []
    const concerns: string[] = []
    if (c.crimeRate < 50) concerns.push('Elevated crime levels — exercise caution')
    if (c.healthcareScore < 50) concerns.push('Limited healthcare infrastructure')
    if (c.politicalStability < 50) concerns.push('Political instability — monitor news')
    if (c.naturalDisasterRisk >= 55) concerns.push('Moderate natural disaster risk')
    if (c.advisoryLevel === 'critical') concerns.push('CRITICAL: Avoid all non-essential travel')
    else if (c.advisoryLevel === 'high_risk') concerns.push('HIGH RISK: Reconsider travel plans')
    return concerns
  }

  const regionNames: Record<string, string> = {
    'Americas': 'Americas', 'Europe': 'Europe',
    'Asia Pacific': 'Asia Pacific', 'Middle East & Africa': 'Middle East & Africa',
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-8 pt-28 pb-12">
      <div className="mb-6">
        <h1 className="text-[32px] font-medium text-[var(--text-primary)]">Global Travel Safety</h1>
        <p className="text-[15px] text-[var(--text-muted)]">Interactive 3D globe — click any country to view safety details</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Globe Container */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 bg-gradient-to-br from-[#0a0e27] to-[#1a1f3a] border border-[var(--border)] rounded-[20px] shadow-lg overflow-hidden relative"
          style={{ minHeight: 520 }}>
          <div ref={globeContainerRef} className="absolute inset-0 flex items-center justify-center">
            {containerSize.width > 0 && containerSize.height > 0 && (
            <Globe
              ref={globeRef}
              globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
              bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
              backgroundColor="rgba(0,0,0,0)"
              width={containerSize.width}
              height={containerSize.height}
              atmosphereColor="#6366F1"
              atmosphereAltitude={0.2}
              pointsData={markers}
              pointLat={(d: any) => d.lat}
              pointLng={(d: any) => d.lng}
              pointColor={(d: any) => d.color}
              pointRadius={(d: any) => d.advisory === 'critical' ? 0.4 : d.size * 0.25}
              pointAltitude={(d: any) => d.advisory === 'critical' || d.advisory === 'high_risk' ? 0.06 : 0.02}
              onPointClick={(d: any) => handleMarkerClick(d)}
              onPointHover={(d: any) => setHoveredCountry(d ? `${d.flag} ${d.name} — Score: ${d.score}` : null)}
              labelsData={markers}
              labelLat={(d: any) => d.lat}
              labelLng={(d: any) => d.lng}
              labelText={(d: any) => ''}
              labelSize={(d: any) => d.size}
              labelColor={(d: any) => d.color}
              labelDotRadius={(d: any) => 0}
              labelAltitude={0.01}
              onLabelClick={(d: any) => handleMarkerClick(d)}
            />
            )}
          </div>

          {/* Hover tooltip */}
          {hoveredCountry && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-[var(--border)] shadow-lg z-10">
              <span className="text-[14px] font-medium text-[var(--text-primary)]">{hoveredCountry}</span>
            </div>
          )}

          <div className="absolute bottom-4 left-4 flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-[13px] font-medium flex items-center gap-2 border border-white/10">
              <div className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
              {countries?.length || 0} Countries Monitored
            </div>
          </div>

          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl p-3 border border-[var(--border)] shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Safety Score</div>
            {[
              { color: '#10B981', label: 'Safe (80-100)' },
              { color: '#F59E0B', label: 'Moderate (50-79)' },
              { color: '#EF4444', label: 'High Risk (20-49)' },
              { color: '#7C3AED', label: 'Critical (0-19)' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2 mb-1.5 last:mb-0">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[12px] text-[var(--text-secondary)]">{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          <div className="bg-white border border-[var(--border)] rounded-2xl p-4 shadow-sm">
            <div className="relative mb-3">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input type="text" placeholder="Search countries..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border)] text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setRegionFilter('')}
                className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all ${!regionFilter ? 'bg-[var(--accent)] text-white' : 'bg-gray-100 text-[var(--text-secondary)] hover:bg-gray-200'}`}>All</button>
              {regions?.map(r => (
                <button key={r.region} onClick={() => setRegionFilter(r.region || '')}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all ${regionFilter === r.region ? 'bg-[var(--accent)] text-white' : 'bg-gray-100 text-[var(--text-secondary)] hover:bg-gray-200'}`}>
                  {regionNames[r.region || ''] || r.region}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden flex-1 max-h-[600px] flex flex-col">
            <div className="p-4 border-b border-[var(--border-subtle)]">
              <h3 className="text-[16px] font-medium">Countries</h3>
            </div>
            <div className="overflow-y-auto flex-1">
              {countries?.map((country) => {
                const advisory = getAdvisoryLabel(country.advisoryLevel)
                return (
                  <div key={country.id} onClick={() => {
                    setSelectedCountry(country.id)
                    if (globeRef.current && country.latitude && country.longitude) {
                      globeRef.current.pointOfView({ lat: Number(country.latitude), lng: Number(country.longitude), altitude: 1.5 }, 1000)
                    }
                  }}
                    className={`flex items-center gap-3 px-4 py-3 border-b border-[var(--border-subtle)] cursor-pointer transition-all ${
                      selectedCountry === country.id ? 'bg-[var(--accent-light)]' : 'hover:bg-gray-50'
                    }`}>
                    <span className="text-[24px]">{country.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-medium text-[var(--text-primary)] truncate">{country.name}</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
                      style={{ backgroundColor: advisory.bg, color: advisory.color }}>{country.overallScore}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Country Detail Panel */}
      <AnimatePresence>
        {selectedCountryData && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="bg-white border border-[var(--border)] rounded-2xl p-6 shadow-lg mb-6 relative">
            <button onClick={() => setSelectedCountry(null)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 text-[var(--text-muted)]"><X size={18} /></button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left: Overview */}
              <div className="flex flex-col items-center text-center">
                <span className="text-[56px] mb-2">{selectedCountryData.flag}</span>
                <h2 className="text-[24px] font-semibold text-[var(--text-primary)] mb-1">{selectedCountryData.name}</h2>
                <div className="text-[13px] text-[var(--text-muted)] mb-4">{selectedCountryData.region}</div>
                <ScoreRing score={selectedCountryData.overallScore} />
                <div className="mt-3 px-4 py-1.5 rounded-full text-[13px] font-semibold"
                  style={{ backgroundColor: getAdvisoryLabel(selectedCountryData.advisoryLevel).bg, color: getAdvisoryLabel(selectedCountryData.advisoryLevel).color }}>
                  {getAdvisoryLabel(selectedCountryData.advisoryLevel).text}
                </div>
                {selectedCountryData.travelAdvisory && (
                  <div className="mt-4 p-3 rounded-xl bg-[var(--accent-light)] text-left w-full">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin size={14} className="text-[var(--accent)]" />
                      <span className="text-[13px] font-medium text-[var(--accent)]">Travel Advisory</span>
                    </div>
                    <p className="text-[12px] text-[var(--text-secondary)]">{selectedCountryData.travelAdvisory}</p>
                  </div>
                )}
              </div>

              {/* Middle: Safety Breakdown + Positives/Concerns */}
              <div>
                <h3 className="text-[16px] font-medium mb-4">Safety Breakdown</h3>
                <ScoreBar label="Crime Safety" score={selectedCountryData.crimeRate} icon={Shield} positive={true} />
                <ScoreBar label="Healthcare" score={selectedCountryData.healthcareScore} icon={Heart} positive={true} />
                <ScoreBar label="Political Stability" score={selectedCountryData.politicalStability} icon={Scale} positive={true} />
                <ScoreBar label="Disaster Risk" score={selectedCountryData.naturalDisasterRisk} icon={Cloud} positive={false} />

                {/* Positives */}
                <div className="mt-4">
                  <h4 className="text-[13px] font-semibold text-[var(--success)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle size={14} /> What's Positive
                  </h4>
                  <div className="space-y-1.5">
                    {getPositives(selectedCountryData).map((p, i) => (
                      <div key={i} className="flex items-start gap-2 text-[12px] text-[var(--text-secondary)]">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--success)] mt-1.5 shrink-0" />
                        {p}
                      </div>
                    ))}
                    {getPositives(selectedCountryData).length === 0 && (
                      <div className="text-[12px] text-[var(--text-muted)]">No standout positives identified</div>
                    )}
                  </div>
                </div>

                {/* Concerns */}
                {getConcerns(selectedCountryData).length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-[13px] font-semibold text-[var(--danger)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <AlertTriangle size={14} /> Concerns
                    </h4>
                    <div className="space-y-1.5">
                      {getConcerns(selectedCountryData).map((c, i) => (
                        <div key={i} className="flex items-start gap-2 text-[12px] text-[var(--text-secondary)]">
                          <div className="w-1.5 h-1.5 rounded-full bg-[var(--danger)] mt-1.5 shrink-0" />
                          {c}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Alerts */}
              <div>
                <h3 className="text-[16px] font-medium mb-4">Active Alerts</h3>
                {alerts && alerts.length > 0 ? (
                  <div className="space-y-3">
                    {alerts.map((alert) => (
                      <div key={alert.id}
                        className={`p-3 rounded-xl border-l-[3px] ${
                          alert.severity === 'critical' ? 'bg-red-50 border-l-[var(--danger)]'
                            : alert.severity === 'warning' ? 'bg-amber-50 border-l-[var(--warning)]'
                            : 'bg-blue-50 border-l-blue-400'
                        }`}>
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle size={14} className={
                            alert.severity === 'critical' ? 'text-[var(--danger)]' :
                            alert.severity === 'warning' ? 'text-[var(--warning)]' : 'text-blue-400'
                          } />
                          <span className="text-[13px] font-semibold text-[var(--text-primary)]">{alert.title}</span>
                        </div>
                        <p className="text-[12px] text-[var(--text-muted)] line-clamp-3">{alert.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-[var(--text-muted)] text-[13px]">
                    <Shield size={32} className="mx-auto mb-2 text-[var(--success)]" />
                    No active alerts for this country.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Regional Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {regions?.map((region, i) => {
          const regionColor = region.avgScore >= 80 ? 'var(--success)' : region.avgScore >= 50 ? 'var(--warning)' : 'var(--danger)'
          return (
            <motion.div key={region.region} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }} className="bg-white border border-[var(--border)] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${regionColor}15` }}>
                  <GlobeIcon size={18} style={{ color: regionColor }} />
                </div>
              </div>
              <div className="text-[14px] font-medium text-[var(--text-primary)] mb-1">{regionNames[region.region || ''] || region.region}</div>
              <div className="text-[24px] font-semibold" style={{ color: regionColor }}>{region.avgScore}</div>
              <div className="text-[12px] text-[var(--text-muted)] mt-1">{region.countryCount} countries</div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function GlobeIcon({ size, style }: { size: number; style: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={style.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}
