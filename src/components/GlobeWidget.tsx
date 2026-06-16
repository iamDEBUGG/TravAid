import { useEffect, useRef, useState, memo } from 'react'

// Static sample data for hero page globe markers
const GLOBE_MARKERS = [
  // Safe (green)
  { lat: 60.17, lng: 24.94, color: '#10B981', size: 0.6, alt: 0.02 }, // Helsinki
  { lat: 64.14, lng: -21.93, color: '#10B981', size: 0.7, alt: 0.02 }, // Reykjavik
  { lat: 47.37, lng: 8.54, color: '#10B981', size: 0.6, alt: 0.02 }, // Zurich
  { lat: 35.68, lng: 139.69, color: '#10B981', size: 0.7, alt: 0.02 }, // Tokyo
  { lat: -33.87, lng: 151.21, color: '#10B981', size: 0.6, alt: 0.02 }, // Sydney
  { lat: 52.52, lng: 13.41, color: '#10B981', size: 0.5, alt: 0.02 }, // Berlin
  { lat: 55.68, lng: 12.57, color: '#10B981', size: 0.6, alt: 0.02 }, // Copenhagen
  { lat: 1.35, lng: 103.82, color: '#10B981', size: 0.7, alt: 0.02 }, // Singapore
  { lat: -36.85, lng: 174.76, color: '#10B981', size: 0.6, alt: 0.02 }, // Auckland
  { lat: 45.42, lng: -75.69, color: '#10B981', size: 0.5, alt: 0.02 }, // Ottawa
  // Caution (amber)
  { lat: 19.43, lng: -99.13, color: '#F59E0B', size: 0.5, alt: 0.03 }, // Mexico City
  { lat: -23.55, lng: -46.63, color: '#F59E0B', size: 0.6, alt: 0.03 }, // Sao Paulo
  { lat: 13.76, lng: 100.50, color: '#F59E0B', size: 0.5, alt: 0.03 }, // Bangkok
  { lat: 28.61, lng: 77.21, color: '#F59E0B', size: 0.6, alt: 0.03 }, // Delhi
  { lat: 30.04, lng: 31.24, color: '#F59E0B', size: 0.5, alt: 0.03 }, // Cairo
  // Danger (red)
  { lat: 33.31, lng: 44.37, color: '#EF4444', size: 0.5, alt: 0.05 }, // Baghdad
  { lat: 15.35, lng: 44.21, color: '#EF4444', size: 0.4, alt: 0.05 }, // Sanaa
  { lat: 2.05, lng: 45.34, color: '#EF4444', size: 0.4, alt: 0.05 }, // Mogadishu
  // Critical (purple)
  { lat: 33.51, lng: 36.29, color: '#7C3AED', size: 0.5, alt: 0.05 }, // Damascus
  { lat: 34.52, lng: 69.17, color: '#7C3AED', size: 0.5, alt: 0.05 }, // Kabul
]

// SVG Fallback Globe
function GlobeFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg
        viewBox="0 0 200 200"
        className="globe-fallback-svg"
        width="200"
        height="200"
        aria-hidden="true"
      >
        {/* Main sphere outline */}
        <circle
          cx="100" cy="100" r="85"
          fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8"
        />
        {/* Latitude lines */}
        {[-60, -30, 0, 30, 60].map((lat) => {
          const ry = 85 * Math.cos((lat * Math.PI) / 180)
          const cy = 100 - 85 * Math.sin((lat * Math.PI) / 180)
          return (
            <ellipse
              key={lat}
              cx="100" cy={cy} rx={ry} ry={ry * 0.3}
              fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5"
            />
          )
        })}
        {/* Meridian lines */}
        {[0, 30, 60, 90, 120, 150].map((lon) => {
          const rx = 85 * Math.sin((lon * Math.PI) / 180)
          return (
            <ellipse
              key={lon}
              cx="100" cy="100" rx={rx} ry="85"
              fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5"
            />
          )
        })}
        {/* Atmosphere glow */}
        <circle
          cx="100" cy="100" r="88"
          fill="none" stroke="#6366F1" strokeWidth="1" opacity="0.3"
        />
        <circle
          cx="100" cy="100" r="92"
          fill="none" stroke="#6366F1" strokeWidth="0.5" opacity="0.15"
        />
        {/* Sample dots */}
        {GLOBE_MARKERS.slice(0, 10).map((m, i) => {
          const x = 100 + Math.cos((i * 36 * Math.PI) / 180) * 55
          const y = 100 + Math.sin((i * 36 * Math.PI) / 180) * 55
          return (
            <circle key={i} cx={x} cy={y} r="3" fill={m.color} opacity="0.8" />
          )
        })}
      </svg>
    </div>
  )
}

const GlobeWidget = memo(function GlobeWidget() {
  const containerRef = useRef<HTMLDivElement>(null)
  const globeRef = useRef<any>(null)
  const [useWebGL, setUseWebGL] = useState(true)
  const [GlobeComponent, setGlobeComponent] = useState<any>(null)

  // Dynamically import react-globe.gl
  useEffect(() => {
    let cancelled = false

    async function loadGlobe() {
      try {
        const mod = await import('react-globe.gl')
        if (!cancelled) {
          setGlobeComponent(() => mod.default)
        }
      } catch {
        if (!cancelled) {
          setUseWebGL(false)
        }
      }
    }

    // Check WebGL support
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      if (!gl) {
        setUseWebGL(false)
        return
      }
    } catch {
      setUseWebGL(false)
      return
    }

    loadGlobe()
    return () => { cancelled = true }
  }, [])

  // Setup globe auto-rotation once mounted
  useEffect(() => {
    if (globeRef.current) {
      const controls = globeRef.current.controls()
      if (controls) {
        controls.autoRotate = true
        controls.autoRotateSpeed = 0.5
        controls.enableZoom = false
        controls.enablePan = false
      }
      globeRef.current.pointOfView({ lat: 20, lng: 0, altitude: 2.5 })
    }
  }, [GlobeComponent])

  // Pause rendering when not visible
  useEffect(() => {
    if (!containerRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (globeRef.current) {
          const controls = globeRef.current.controls()
          if (controls) {
            controls.autoRotate = entry.isIntersecting
          }
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [GlobeComponent])

  if (!useWebGL || !GlobeComponent) {
    return (
      <div ref={containerRef} className="globe-container">
        <GlobeFallback />
      </div>
    )
  }

  const Globe = GlobeComponent

  return (
    <div ref={containerRef} className="globe-container">
      <Globe
        ref={globeRef}
        width={280}
        height={280}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl="https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
        atmosphereColor="#6366F1"
        atmosphereAltitude={0.2}
        pointsData={GLOBE_MARKERS}
        pointLat="lat"
        pointLng="lng"
        pointColor="color"
        pointRadius="size"
        pointAltitude="alt"
        pointsMerge={true}
      />
    </div>
  )
})

export default GlobeWidget
