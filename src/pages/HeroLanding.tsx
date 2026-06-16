import { useEffect, useRef, useState, useCallback, lazy, Suspense } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { Link } from 'react-router'
import { Menu, X } from 'lucide-react'

const GlobeWidget = lazy(() => import('../components/GlobeWidget'))

// ─── Spring config for staggered character animation ───
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.03,
      delayChildren: 2.0,
    },
  },
}

const charVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 150,
      damping: 12,
    },
  },
}

// ─── Tagline component with staggered character animation ───
function StaggeredTagline({ text }: { text: string }) {
  const words = text.split(' ')

  return (
    <motion.div
      className="hero-tagline"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      aria-label={text}
    >
      {words.map((word, wi) => (
        <span key={wi} className="word-container">
          {word.split('').map((char, ci) => (
            <motion.span
              key={ci}
              className="char-span"
              variants={charVariants}
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </motion.div>
  )
}

// ─── Monogram Logo SVG ───
function MonogramIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="18" stroke="#6366F1" strokeWidth="4" strokeLinecap="round" strokeDasharray="80 30" />
      <circle cx="24" cy="24" r="8" fill="#6366F1" />
      <circle cx="24" cy="24" r="13" stroke="rgba(99, 102, 241, 0.4)" strokeWidth="2" />
    </svg>
  )
}

export default function HeroLanding() {
  // ─── Refs ───
  const overlayRef = useRef<HTMLDivElement>(null)
  const orbRef = useRef<HTMLDivElement>(null)
  const cursorDotRef = useRef<HTMLDivElement>(null)
  const layer1Ref = useRef<HTMLDivElement>(null)
  const layer2Ref = useRef<HTMLDivElement>(null)
  const layer3Ref = useRef<HTMLDivElement>(null)
  const animFrameRef = useRef<number>(0)

  // ─── State ───
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [overlayDone, setOverlayDone] = useState(false)

  // ─── Animation controls ───
  const wordmarkControls = useAnimation()
  const navControls = useAnimation()
  const subTaglineControls = useAnimation()
  const ctaControls = useAnimation()
  const layer1Controls = useAnimation()
  const layer2Controls = useAnimation()
  const layer3Controls = useAnimation()
  const footerControls = useAnimation()
  const scrollIndicatorControls = useAnimation()

  // ─── Check for touch device & reduced motion ───
  const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // ─── Parallax + cursor system ───
  const mouseState = useRef({
    targetX: 0, targetY: 0,
    currentX: 0, currentY: 0,
    orbX: 0, orbY: 0,
    dotX: 0, dotY: 0,
    mouseX: 0, mouseY: 0,
  })

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const ms = mouseState.current
    ms.mouseX = e.clientX
    ms.mouseY = e.clientY
    ms.targetX = (e.clientX / window.innerWidth - 0.5) * 2
    ms.targetY = (e.clientY / window.innerHeight - 0.5) * 2
  }, [])

  // Handle cursor dot expansion on interactive elements
  const handleMouseOver = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement
    if (!cursorDotRef.current) return
    const isInteractive = target.closest('a, button, .globe-container, [role="button"]')
    if (isInteractive) {
      cursorDotRef.current.classList.add('expanded')
    } else {
      cursorDotRef.current.classList.remove('expanded')
    }
  }, [])

  // ─── Main animation loop ───
  useEffect(() => {
    if (isTouchDevice || prefersReducedMotion) return

    const lerpFactor = 0.1
    const orbLerp = 0.04
    const dotLerp = 0.15

    function animate() {
      const ms = mouseState.current

      // Parallax lerp
      ms.currentX += (ms.targetX - ms.currentX) * lerpFactor
      ms.currentY += (ms.targetY - ms.currentY) * lerpFactor

      // Orb lerp (heavy lag)
      ms.orbX += (ms.mouseX - ms.orbX) * orbLerp
      ms.orbY += (ms.mouseY - ms.orbY) * orbLerp

      // Cursor dot lerp (slight lag)
      ms.dotX += (ms.mouseX - ms.dotX) * dotLerp
      ms.dotY += (ms.mouseY - ms.dotY) * dotLerp

      // Apply parallax transforms
      if (layer1Ref.current) {
        layer1Ref.current.style.transform =
          `translate(${ms.currentX * 60}px, ${ms.currentY * 30}px)`
      }
      if (layer2Ref.current) {
        layer2Ref.current.style.transform =
          `translate(${ms.currentX * 30}px, ${ms.currentY * 20}px)`
      }
      if (layer3Ref.current) {
        layer3Ref.current.style.transform =
          `translate(${ms.currentX * 15}px, ${ms.currentY * 10}px)`
      }

      // Apply orb position
      if (orbRef.current) {
        orbRef.current.style.transform =
          `translate(${ms.orbX - 300}px, ${ms.orbY - 300}px)`
      }

      // Apply cursor dot position
      if (cursorDotRef.current) {
        const isExpanded = cursorDotRef.current.classList.contains('expanded')
        const offset = isExpanded ? 24 : 4
        cursorDotRef.current.style.transform =
          `translate(${ms.dotX - offset}px, ${ms.dotY - offset}px)`
      }

      animFrameRef.current = requestAnimationFrame(animate)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseover', handleMouseOver)
    animFrameRef.current = requestAnimationFrame(animate)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseover', handleMouseOver)
      cancelAnimationFrame(animFrameRef.current)
    }
  }, [handleMouseMove, handleMouseOver, isTouchDevice, prefersReducedMotion])

  // ─── Touch device: auto-float via CSS animation ───
  useEffect(() => {
    if (!isTouchDevice) return
    if (layer1Ref.current) layer1Ref.current.style.animation = 'float-auto-1 8s ease-in-out infinite'
    if (layer2Ref.current) layer2Ref.current.style.animation = 'float-auto-2 10s ease-in-out infinite'
    if (layer3Ref.current) layer3Ref.current.style.animation = 'float-auto-3 12s ease-in-out infinite'
  }, [isTouchDevice])

  // ─── Page entrance sequence ───
  useEffect(() => {
    if (prefersReducedMotion) {
      // Instant reveal
      setOverlayDone(true)
      wordmarkControls.set({ opacity: 1, filter: 'blur(0px)' })
      navControls.set({ opacity: 1, y: 0 })
      subTaglineControls.set({ opacity: 1, y: 0 })
      ctaControls.set({ opacity: 1, y: 0 })
      layer1Controls.set({ opacity: 1, y: 0 })
      layer2Controls.set({ opacity: 1, y: 0 })
      layer3Controls.set({ opacity: 1, scale: 1 })
      footerControls.set({ opacity: 1 })
      scrollIndicatorControls.set({ opacity: 1 })
      return
    }

    // Overlay fade
    const overlayTimer = setTimeout(() => {
      if (overlayRef.current) {
        overlayRef.current.style.transition = 'opacity 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
        overlayRef.current.style.opacity = '0'
      }
    }, 0)

    const overlayRemoveTimer = setTimeout(() => {
      setOverlayDone(true)
    }, 1500)

    // Wordmark: blur resolve at 1.6s
    const wordmarkTimer = setTimeout(() => {
      wordmarkControls.start({
        opacity: 1,
        filter: 'blur(0px)',
        transition: { duration: 1.2, ease: [0.33, 1, 0.68, 1] },
      })
    }, 1600)

    // Navigation: fade in at 2.0s
    const navTimer = setTimeout(() => {
      navControls.start({
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.33, 1, 0.68, 1] },
      })
    }, 2000)

    // Layer 1 card: fade in at 2.4s
    const layer1Timer = setTimeout(() => {
      layer1Controls.start({
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: [0.33, 1, 0.68, 1] },
      })
    }, 2400)

    // Sub-tagline + Layer 2: fade in at 2.6s
    const layer2Timer = setTimeout(() => {
      layer2Controls.start({
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: [0.33, 1, 0.68, 1] },
      })
      subTaglineControls.start({
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.33, 1, 0.68, 1] },
      })
    }, 2600)

    // Globe + CTA: at 2.8s
    const layer3Timer = setTimeout(() => {
      layer3Controls.start({
        opacity: 1,
        scale: 1,
        transition: { duration: 1.0, ease: [0.22, 1, 0.36, 1] },
      })
      ctaControls.start({
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.33, 1, 0.68, 1] },
      })
    }, 2800)

    // Footer: at 3.0s
    const footerTimer = setTimeout(() => {
      footerControls.start({
        opacity: 1,
        transition: { duration: 0.6 },
      })
    }, 3000)

    // Scroll indicator: at 3.2s
    const scrollTimer = setTimeout(() => {
      scrollIndicatorControls.start({
        opacity: 1,
        transition: { duration: 0.4 },
      })
    }, 3200)

    return () => {
      clearTimeout(overlayTimer)
      clearTimeout(overlayRemoveTimer)
      clearTimeout(wordmarkTimer)
      clearTimeout(navTimer)
      clearTimeout(layer1Timer)
      clearTimeout(layer2Timer)
      clearTimeout(layer3Timer)
      clearTimeout(footerTimer)
      clearTimeout(scrollTimer)
    }
  }, [
    prefersReducedMotion, wordmarkControls, navControls,
    subTaglineControls, ctaControls, layer1Controls,
    layer2Controls, layer3Controls, footerControls, scrollIndicatorControls,
  ])

  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ backgroundColor: '#F8F9FC' }}
    >
      {/* ─── Entrance Overlay ─── */}
      {!overlayDone && (
        <div ref={overlayRef} className="entrance-overlay" />
      )}

      {/* ─── Ambient Cursor Orb ─── */}
      {!isTouchDevice && !prefersReducedMotion && (
        <div ref={orbRef} className="ambient-orb" aria-hidden="true" />
      )}

      {/* ─── Custom Cursor Dot ─── */}
      {!isTouchDevice && !prefersReducedMotion && (
        <div ref={cursorDotRef} className="cursor-dot" aria-hidden="true" />
      )}

      {/* ─── Navigation Bar ─── */}
      <motion.nav
        className="hero-nav"
        initial={{ opacity: 0, y: -20 }}
        animate={navControls}
        id="hero-nav"
      >
        {/* Left: Logo */}
        <Link to="/" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
          <MonogramIcon size={24} />
          <span
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 500,
              fontSize: '16px',
              color: '#0F1729',
              letterSpacing: '-0.01em',
            }}
          >
            RoamSense
          </span>
        </Link>

        {/* Center: Nav Links (hidden < 768px) */}
        <div className="hero-nav-links-center" style={{ display: 'flex', gap: '32px' }}>
          <Link to="/safety" className="hero-nav-link">Safety Map</Link>
          <Link to="/expenses" className="hero-nav-link">Expenses</Link>
          <Link to="/analytics" className="hero-nav-link">Insights</Link>
          <a href="#hero-footer" className="hero-nav-link">About</a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="hamburger-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Right: CTA */}
        <Link to="/expenses" className="hero-nav-cta hidden sm:inline-block">
          Get Started
        </Link>
      </motion.nav>

      {/* ─── Mobile Menu Overlay ─── */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-[999] bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center gap-8"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          <button
            className="absolute top-6 right-6 p-2"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={24} color="#0F1729" />
          </button>
          {[
            { label: 'Safety Map', to: '/safety' },
            { label: 'Expenses', to: '/expenses' },
            { label: 'Insights', to: '/analytics' },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileMenuOpen(false)}
              className="text-2xl font-medium text-[#0F1729] hover:text-[#6366F1] transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/expenses"
            onClick={() => setMobileMenuOpen(false)}
            className="hero-cta-btn mt-4"
          >
            Get Started
          </Link>
        </div>
      )}

      {/* ─── Parallax Background Layer (z-0) ─── */}

      {/* Layer 1 — Live Safety Coverage Card (upper-left) */}
      <motion.div
        ref={layer1Ref}
        className="glass-panel parallax-layer"
        style={{ top: '18%', left: '8%', width: '240px', zIndex: 0 }}
        initial={{ opacity: 0, y: 30 }}
        animate={layer1Controls}
      >
        <div className="card-label">LIVE COVERAGE</div>
        <div className="card-metric" style={{ marginTop: '8px' }}>196</div>
        <div className="card-sub-label" style={{ marginTop: '4px' }}>Countries Monitored</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '16px', maxWidth: '120px' }}>
          <div className="bar-chart-bar" />
          <div className="bar-chart-bar" />
          <div className="bar-chart-bar" />
          <div className="bar-chart-bar" />
          <div className="bar-chart-bar" />
        </div>
      </motion.div>

      {/* Layer 2 — Trust Indicator Card (lower-right) */}
      <motion.div
        ref={layer2Ref}
        className="glass-panel parallax-layer"
        style={{ bottom: '22%', right: '10%', width: '220px', zIndex: 1 }}
        initial={{ opacity: 0, y: 20 }}
        animate={layer2Controls}
      >
        <div className="card-label">ACTIVE USERS</div>
        <div className="card-metric" style={{ marginTop: '8px' }}>2.4M+</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
          <div className="card-sub-label">Travelers Protected</div>
          <div className="pulse-dot" />
        </div>
      </motion.div>

      {/* Layer 3 — 3D Globe Widget (upper-right) */}
      <motion.div
        ref={layer3Ref}
        className="parallax-layer"
        style={{
          position: 'absolute',
          top: '12%',
          right: '12%',
          zIndex: 2,
        }}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={layer3Controls}
      >
        <Suspense
          fallback={
            <div className="globe-container flex items-center justify-center">
              <div className="text-white/30 text-sm">Loading…</div>
            </div>
          }
        >
          <GlobeWidget />
        </Suspense>
      </motion.div>

      {/* ─── Centered Content (z-2) ─── */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ zIndex: 2, pointerEvents: 'none' }}
      >
        <div style={{ pointerEvents: 'auto', textAlign: 'center' }}>
          {/* Wordmark */}
          <motion.h1
            className="hero-wordmark"
            initial={{ opacity: 0, filter: 'blur(8px)' }}
            animate={wordmarkControls}
          >
            RoamSense
          </motion.h1>

          {/* Tagline — staggered character spring expansion */}
          <div style={{ marginTop: '20px' }}>
            <StaggeredTagline text="Travel safer. Spend smarter." />
          </div>

          {/* Sub-tagline */}
          <motion.p
            className="hero-sub-tagline"
            style={{ marginTop: '12px', marginLeft: 'auto', marginRight: 'auto' }}
            initial={{ opacity: 0, y: 10 }}
            animate={subTaglineControls}
          >
            Real-time safety advisories. Intelligent expense tracking.
            All in one beautiful dashboard.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            style={{ marginTop: '40px' }}
            initial={{ opacity: 0, y: 15 }}
            animate={ctaControls}
          >
            <Link to="/expenses" className="hero-cta-btn" id="hero-cta">
              Explore the Dashboard
            </Link>
          </motion.div>
        </div>
      </div>

      {/* ─── Scroll Indicator ─── */}
      <motion.div
        className="absolute flex justify-center"
        style={{ bottom: '40px', left: '50%', transform: 'translateX(-50%)', zIndex: 2 }}
        initial={{ opacity: 0 }}
        animate={scrollIndicatorControls}
        aria-hidden="true"
      >
        <div className="scroll-indicator-line">
          <div className="scroll-indicator-dot" />
        </div>
      </motion.div>

      {/* ─── Footer ─── */}
      <motion.footer
        className="hero-footer"
        id="hero-footer"
        initial={{ opacity: 0 }}
        animate={footerControls}
        style={{ zIndex: 2 }}
      >
        <span className="hero-footer-text">© 2025 RoamSense</span>
        <div style={{ display: 'flex', gap: '24px' }}>
          <a href="#" className="hero-footer-link">Privacy</a>
          <a href="#" className="hero-footer-link">Terms</a>
          <a href="#" className="hero-footer-link">Support</a>
        </div>
      </motion.footer>
    </div>
  )
}
