# RoamSense - Hero Page Design PRD

## Overview

A single-viewport hero landing experience for RoamSense, a premium AI-powered travel safety and expense management platform. The hero opens with a cinematic entrance: the page arrives as an overexposed white void that gradually resolves into a luminous off-white surface, revealing the RoamSense wordmark and ambient atmospheric elements. A **staggered typographic expansion** breathes life into the scene — each character of the tagline scales from zero to full size with spring physics, creating a mesmerizing entrance. Behind the typography, a **multi-layer parallax system** responds to cursor movement, with glassmorphic panels floating at different z-depths. Subtle ambient lighting effects — a slow-rotating radial gradient orb that chases the cursor — create an ethereal, premium atmosphere. The overall effect is clean, intelligent, and inviting: the intersection of calm authority and modern elegance.

## Theme

- **Concept**: A premium AI travel companion platform — sophisticated, trustworthy, and effortlessly modern. Think of a financial dashboard reimagined as a first-class lounge experience.
- **Mood**: Clean, calm, intelligent, premium, luminous
- **Color palette**:
  - Primary background: `#F8F9FC` (cool off-white with subtle blue undertone)
  - Secondary surface: `#FFFFFF` (pure white for floating cards and panels)
  - Primary text: `#0F1729` (deep slate — almost black, for maximum contrast)
  - Secondary text: `rgba(15, 23, 41, 0.55)` (mid-tone slate for supporting copy)
  - Accent: `#6366F1` (indigo — used sparingly for CTAs, cursor orb, and interactive highlights)
  - Accent secondary: `#818CF8` (lighter indigo for gradient endpoints and glows)
  - Muted text: `rgba(15, 23, 41, 0.35)` (for labels and tertiary information)
  - Border / divider: `rgba(15, 23, 41, 0.08)` (ultra-subtle structural lines)
  - Card shadow: `0 4px 24px rgba(15, 23, 41, 0.06)` (soft, diffused elevation)
  - Dark surface (floating globe): `#0F1729` to `#1a1f3a` gradient (used for the embedded 3D globe widget only)
  - Glass tint: `rgba(255, 255, 255, 0.72)` with `backdrop-filter: blur(20px)`
  - Orb gradient (cursor effect): `radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0.05) 40%, transparent 70%)`
- **Typography**:
  - Headline / wordmark: **Outfit**, weight 500, `clamp(48px, 5vw, 72px)`, letter-spacing `-0.02em`, line-height `1.05`
  - Tagline: **Outfit**, weight 400, `clamp(18px, 1.8vw, 22px)`, letter-spacing `0.01em`, line-height `1.5`
  - Sub-label: **Outfit**, weight 500, `11px`, letter-spacing `0.12em`, text-transform `uppercase`
  - Body / button: **Outfit**, weight 400, `14px`, letter-spacing `0.01em`
  - Nav links: **Outfit**, weight 400, `13px`, letter-spacing `0.02em`
  - Data / metric numbers: **Outfit**, weight 600, `clamp(28px, 3vw, 40px)`, letter-spacing `-0.01em`
  - Monospace accents (trust indicators): **Geist Mono** (fallback), weight 400, `12px`, letter-spacing `0.08em`
- **Spacing scale**:
  - Page horizontal padding: `clamp(24px, 4vw, 80px)`
  - Section vertical gap: `clamp(48px, 8vh, 96px)`
  - Element gap (small): `12px`
  - Element gap (medium): `24px`
  - Element gap (large): `48px`
- **Scroll behavior**: Single-viewport — `overflow: hidden` on body. Entrance animation auto-plays on page load.
- **Cursor**: Default arrow — custom accent-colored dot (`8px` circle, `background: #6366F1`, `mix-blend-mode: normal`) follows cursor position with slight lag (`transition: transform 0.12s ease-out`). The dot expands to `48px` when hovering over interactive elements (buttons, nav links, the globe widget), with `background: rgba(99, 102, 241, 0.12)` and `backdrop-filter: blur(4px)`. A larger ambient radial gradient orb (`500px` diameter) follows the cursor with more lag (`transition: transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)`), creating a soft indigo glow at the cursor position.

## Structure

### Navigation Bar
- **Position**: Fixed top, full width, z-index `1000`
- **Layout**: Three-column flex — left (logo mark), center (nav links), right (CTA button)
- **Height**: `72px`
- **Background**: `rgba(248, 249, 252, 0.85)` with `backdrop-filter: blur(20px)` (glassmorphic — frosted, not dark)
- **Border bottom**: `1px solid rgba(15, 23, 41, 0.06)` (barely visible hairline)
- **Horizontal padding**: Same as page padding
- **Content**:
  - **Left**: RoamSense logomark — a geometric monogram icon (`24px × 24px`) + wordmark "RoamSense" in **Outfit 500**, `16px`, color `#0F1729`, letter-spacing `-0.01em`. The monogram is a stylized orbit/radar scanner formed by a dashed circle, a solid inner circle, and a translucent middle circle in `#6366F1`.
  - **Center links** (hidden below `768px`, horizontal flex with `gap: 32px`):
    - "Safety Map" — smooth-scrolls to `#safety` (page is single viewport, so link opens a lightbox overlay with the globe)
    - "Expenses" — link to `#expenses` section (expands a slide-out panel from the right)
    - "Insights" — link to `#insights` (expands a slide-out panel from the right)
    - "About" — link to `#about` (scrolls to footer area within the same viewport)
    - Each link: **Outfit 400**, `13px`, color `rgba(15, 23, 41, 0.55)`. Hover: color `#0F1729`, underline slides in from left (`width: 0 → 100%`, `transition: 0.3s ease`). Active: color `#6366F1`.
  - **Right**: "Get Started" pill button — `background: #0F1729`, color `#FFFFFF`, **Outfit 500**, `13px`, padding `10px 24px`, border-radius `24px`. Hover: `background: #6366F1`, `box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3)`, transition `0.3s ease`.
- **Entrance animation**: Nav fades in from `opacity: 0` with `y: -20px → 0`, `duration: 0.6s`, `ease: power2.out`, `delay: 2.0s` (after the main entrance resolves).

### Hero Section
- **Layout**: Single viewport, no scroll. Content is vertically and horizontally centered with flexbox (`align-items: center`, `justify-content: center`).
- **Background**: `#F8F9FC` (cool off-white) as base. The **multi-layer parallax background** sits behind the content at `z-index: 0`. The **radial gradient orb** (cursor tracking) sits at `z-index: 1`. Content sits at `z-index: 2`.
- **Content placement**: All text and the main CTA are perfectly centered both vertically and horizontally. A secondary tagline sits below the headline with `margin-top: 20px`. The CTA button sits below with `margin-top: 40px`.
- **Decorative elements**:
  - **Floating metric cards** (the **multi-layer parallax background**): Two glassmorphic panels positioned asymmetrically around the centered content. Each panel uses `background: rgba(255, 255, 255, 0.72)`, `backdrop-filter: blur(20px)`, `border: 1px solid rgba(15, 23, 41, 0.08)`, `border-radius: 20px`, `padding: 24px 28px`, `box-shadow: 0 4px 24px rgba(15, 23, 41, 0.06)`. They float at different z-depths and respond to cursor movement.
  - **3D Globe widget**: A small, rounded dark card (`280px × 280px`, `border-radius: 24px`) floating in the upper-right quadrant, containing an interactive rotating globe visualization. It has a dark gradient background (`#0F1729` to `#1a1f3a`) and serves as a visual anchor — suggesting the platform's global safety coverage. It is NOT a video but a live WebGL canvas (Three.js / react-globe.gl).

### Floating Elements (Parallax Background Layer)

**Element 1 — Live Safety Coverage Card** (upper-left quadrant)
- **Position**: `top: 18%`, `left: 8%`
- **Size**: `240px × auto`
- **Content**:
  - Label: "LIVE COVERAGE" in **Outfit 500**, `11px`, `letter-spacing: 0.12em`, uppercase, color `rgba(15, 23, 41, 0.35)`
  - Metric: "196" in **Outfit 600**, `32px`, color `#0F1729`, letter-spacing `-0.01em`
  - Sub-label: "Countries Monitored" in **Outfit 400**, `13px`, color `rgba(15, 23, 41, 0.55)`
  - Mini bar chart: 5 horizontal bars (`height: 4px`, `border-radius: 2px`, max-width `120px`, gap `6px`) showing fluctuating safety scores — `background: #6366F1` with varying opacities (`0.15`, `0.3`, `0.5`, `0.7`, `1.0`).
- **Parallax**: This element uses **Layer 1** (farthest, largest movement). `translateX` amplitude: `-60px to +60px`, `translateY` amplitude: `-30px to +30px`.
- **Entrance animation**: After page resolves (at `2.4s`), card fades in from `opacity: 0`, `y: 30px → 0`, `duration: 0.8s`, `ease: power2.out`. Bars animate in staggered with `0.1s` delay each, `scaleX: 0 → 1` from left origin.

**Element 2 — Trust Indicator Card** (lower-right quadrant)
- **Position**: `bottom: 22%`, `right: 10%`
- **Size**: `220px × auto`
- **Content**:
  - Label: "ACTIVE USERS" in **Outfit 500**, `11px`, `letter-spacing: 0.12em`, uppercase, color `rgba(15, 23, 41, 0.35)`
  - Metric: "2.4M+" in **Outfit 600**, `32px`, color `#0F1729`
  - Sub-label: "Travelers Protected" in **Outfit 400**, `13px`, color `rgba(15, 23, 41, 0.55)`
  - Pulse indicator: `8px` circle, `background: #10B981` (success green), with a pulsing ring animation (`box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4) → 0 0 0 12px rgba(16, 185, 129, 0)`, `animation: pulse 2s infinite`).
- **Parallax**: This element uses **Layer 2** (mid-depth). `translateX` amplitude: `-30px to +30px`, `translateY` amplitude: `-20px to +20px`.
- **Entrance animation**: Fades in at `2.6s`, `opacity: 0 → 1`, `y: 20px → 0`, `duration: 0.8s`, `ease: power2.out`. Pulse begins after card is visible.

**Element 3 — 3D Globe Widget** (upper-right quadrant)
- **Position**: `top: 12%`, `right: 12%`
- **Size**: `280px × 280px`, `border-radius: 24px`
- **Background**: `linear-gradient(135deg, #0F1729 0%, #1a1f3a 100%)` — dark card on light surface for dramatic contrast
- **Content**: Interactive 3D globe (see Core Effect section). The globe auto-rotates slowly (`0.3 deg/frame`). Country markers glow in semantic colors (green for safe, amber for caution, red for danger, purple for critical). An atmospheric glow ring in `#6366F1` encircles the globe.
- **Parallax**: This element uses **Layer 3** (closest, smallest movement). `translateX` amplitude: `-15px to +15px`, `translateY` amplitude: `-10px to +10px`.
- **Entrance animation**: Card scales from `scale: 0.85 → 1` and fades from `opacity: 0 → 1`, `duration: 1.0s`, `ease: power3.out`, `delay: 2.8s`. Globe begins rotation immediately after card is visible.

### Main Content (Centered)

**Wordmark / Headline**
- **Text**: "RoamSense"
- **Font**: **Outfit 500**, `clamp(48px, 5vw, 72px)`, letter-spacing `-0.02em`
- **Color**: `#0F1729`
- **Position**: Dead center of viewport, `z-index: 2`
- **Entrance animation**: Part of the **page reveal sequence** — characters do NOT use staggered expansion (reserved for tagline). Instead, the wordmark fades in with a subtle blur resolve: `filter: blur(8px) → blur(0)`, `opacity: 0 → 1`, `duration: 1.2s`, `ease: power2.out`, `delay: 1.6s` (during the overexposed-to-normal transition).

**Tagline**
- **Text**: "Travel safer. Spend smarter."
- **Font**: **Outfit 400**, `clamp(18px, 1.8vw, 22px)`, letter-spacing `0.01em`
- **Color**: `rgba(15, 23, 41, 0.55)`
- **Position**: Below wordmark, `margin-top: 20px`
- **Entrance animation**: **Staggered typographic expansion** (see Core Effect). Each character scales from `scale: 0` to `scale: 1` with `spring` physics (stiffness: 150, damping: 12). Starts at `delay: 2.0s` (after wordmark resolve). Characters reveal left to right with `0.03s` stagger.

**Sub-tagline**
- **Text**: "Real-time safety advisories. Intelligent expense tracking. All in one beautiful dashboard."
- **Font**: **Outfit 400**, `14px`, letter-spacing `0.01em`
- **Color**: `rgba(15, 23, 41, 0.35)`
- **Position**: Below main tagline, `margin-top: 12px`, max-width `400px`, text-align center
- **Entrance animation**: Fade in `opacity: 0 → 1`, `y: 10px → 0`, `duration: 0.6s`, `ease: power2.out`, `delay: 2.6s` (after tagline expansion completes).

**CTA Button**
- **Text**: "Explore the Dashboard"
- **Font**: **Outfit 500**, `14px`, letter-spacing `0.01em`
- **Style**: `background: #6366F1`, color `#FFFFFF`, padding `14px 32px`, border-radius `28px` (pill shape). `box-shadow: 0 4px 20px rgba(99, 102, 241, 0.2)`.
- **Position**: Below sub-tagline, `margin-top: 40px`
- **Hover**: `background: #4f52c0` (darker indigo), `box-shadow: 0 6px 28px rgba(99, 102, 241, 0.35)`, `transform: translateY(-2px)`, transition `0.3s ease`.
- **Entrance animation**: Fade in `opacity: 0 → 1`, `y: 15px → 0`, `duration: 0.6s`, `ease: power2.out`, `delay: 2.8s`.

**Scroll Indicator** (optional, at bottom center)
- A thin vertical line (`1px` wide, `32px` tall, `background: rgba(15, 23, 41, 0.2)`) with a small dot that animates down and fades, repeating infinitely. Indicates the page has more content below (if expanded) or simply adds kinetic energy.
- **Position**: `bottom: 40px`, center
- **Entrance**: Fades in at `3.2s`.

### Footer (Bottom Edge)
- **Position**: Absolute bottom of viewport, full width
- **Height**: `48px`
- **Background**: Transparent (inherits `#F8F9FC`)
- **Layout**: Two-column flex, items centered vertically
- **Left**: "© 2025 RoamSense" in **Outfit 400**, `12px`, color `rgba(15, 23, 41, 0.35)`
- **Right**: Three text links — "Privacy", "Terms", "Support" — **Outfit 400**, `12px`, color `rgba(15, 23, 41, 0.35)`, `gap: 24px`. Hover: color `rgba(15, 23, 41, 0.7)`.
- **Entrance animation**: Fade in `opacity: 0 → 1`, `duration: 0.6s`, `delay: 3.0s`.

## Core Effect

### 1. Multi-Layer Parallax Background (Mouse-Responsive Floating Panels)

This effect creates the sensation of depth by moving three floating UI panels at different speeds in response to mouse position. Each panel is a glassmorphic card containing live-looking data (metrics, charts, an interactive globe). The panels move with differing amplitudes — closer panels move less, farther panels move more — creating convincing parallax depth.

**Architecture**:
- Three floating card elements, each absolutely positioned on the page with CSS `position: absolute`.
- A shared `mousemove` listener on `document` captures normalized cursor position: `x = (e.clientX / window.innerWidth - 0.5) * 2` (range: -1 to +1), `y = (e.clientY / window.innerHeight - 0.5) * 2`.
- Each card subscribes to the cursor position and applies a CSS `transform: translate(dx, dy)` where `dx = x * amplitudeX`, `dy = y * amplitudeY`.
- Movement is smoothed via `lerp` (linear interpolation) at `0.1` factor per frame for silky, weighted motion.

**Layer configuration**:

| Layer | Element | Amplitude X | Amplitude Y | Z-Index | Description |
|-------|---------|-------------|-------------|---------|-------------|
| 1 | Safety Coverage Card | ±60px | ±30px | 0 | Farthest — moves most |
| 2 | Trust Indicator Card | ±30px | ±20px | 1 | Mid-depth |
| 3 | Globe Widget | ±15px | ±10px | 2 | Closest — moves least |

**Smoothing algorithm** (run per frame via `requestAnimationFrame`):
```javascript
let currentX = 0, currentY = 0;
const lerpFactor = 0.1;

function animate() {
  currentX += (targetX - currentX) * lerpFactor;
  currentY += (targetY - currentY) * lerpFactor;
  layer1.style.transform = `translate(${currentX * 60}px, ${currentY * 30}px)`;
  layer2.style.transform = `translate(${currentX * 30}px, ${currentY * 20}px)`;
  layer3.style.transform = `translate(${currentX * 15}px, ${currentY * 10}px)`;
  requestAnimationFrame(animate);
}
```

**CSS for glassmorphic panels**:
```css
.glass-panel {
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(15, 23, 41, 0.08);
  border-radius: 20px;
  padding: 24px 28px;
  box-shadow: 0 4px 24px rgba(15, 23, 41, 0.06);
  position: absolute;
  will-change: transform;
}
```

**Mini bar chart inside Layer 1** (CSS-only): Five `div` elements with `height: 4px`, `border-radius: 2px`, `background: #6366F1`, and varying widths (`40%`, `55%`, `70%`, `85%`, `100%`) and opacities (`0.15`, `0.3`, `0.5`, `0.7`, `1.0`). They animate in with `scaleX: 0 → 1` via `transform-origin: left`, staggered `0.1s` each.

**Pulse indicator inside Layer 2** (CSS animation):
```css
@keyframes pulse-ring {
  0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
  70% { box-shadow: 0 0 0 12px rgba(16, 185, 129, 0); }
  100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}
.pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10B981;
  animation: pulse-ring 2s infinite;
}
```

### 2. Staggered Typographic Expansion (Tagline Character Animation)

The tagline "Travel safer. Spend smarter." animates character-by-character, each letter scaling from `0` to `1` with spring physics. Letters are grouped into words — each word is wrapped in a container `div` with `display: inline-block` and `overflow: hidden`, and characters are rendered as individual `span` elements.

**Key parameters**:
- **Spring physics** (Framer Motion): `stiffness: 150`, `damping: 12`, `mass: 1`. This creates a bouncy, elastic feel — each character overshoots slightly then settles.
- **Stagger**: Each character starts `0.03s` after the previous. For a 24-character tagline, total animation duration is approximately `24 * 0.03s + settle time ≈ 1.2s`.
- **Scale origin**: `transform-origin: bottom center` — characters appear to grow upward from their baseline, not from their center.
- **Per-character styling**: Each character `span` has `display: inline-block` (required for transform), `will-change: transform`, and `backface-visibility: hidden` (prevents subpixel blur).

**React / Framer Motion implementation pattern**:
```javascript
const tagline = "Travel safer. Spend smarter.";
const words = tagline.split(" ");

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.03,
      delayChildren: 2.0,
    }
  }
};

const charVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 150,
      damping: 12,
    }
  }
};

<motion.div variants={containerVariants} initial="hidden" animate="visible">
  {words.map((word, wi) => (
    <span key={wi} style={{ display: "inline-block", overflow: "hidden", marginRight: "0.3em" }}>
      {word.split("").map((char, ci) => (
        <motion.span
          key={ci}
          variants={charVariants}
          style={{
            display: "inline-block",
            transformOrigin: "bottom center",
            willChange: "transform",
          }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  ))}
</motion.div>
```

**Critical CSS**:
```css
.word-container {
  display: inline-block;
  overflow: hidden;
  vertical-align: bottom;
  margin-right: 0.3em;
}

.char-span {
  display: inline-block;
  transform-origin: bottom center;
  will-change: transform;
  backface-visibility: hidden;
}
```

**Design notes**:
- Words MUST be separated into individual `overflow: hidden` containers. Without this, the growing letters clip outside their word boundaries messily.
- The `display: inline-block` on both word containers AND character spans is non-negotiable — transforms do not work on inline elements.
- The `bottom center` transform origin is what makes the effect feel like text "blooming" upward from the baseline, rather than scaling from the center.

### 3. Cursor-Following Radial Gradient Orb (Ambient Lighting)

A large, soft indigo radial gradient follows the cursor with significant lag, creating an ambient lighting effect that makes the white surface feel alive and responsive. The orb is subtle — it does not distract but adds an ethereal quality.

**Implementation**:
- A single `div` element, `position: fixed`, `pointer-events: none`, `z-index: 1` (behind content, above background).
- Size: `600px × 600px`, centered on cursor via `transform: translate(-50%, -50%)`.
- Gradient: `radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.12) 0%, rgba(99, 102, 241, 0.04) 35%, transparent 70%)`.
- Movement: Uses the same `targetX/Y` from the parallax system but with a much lower lerp factor (`0.04`) for heavy, dreamy lag.

```css
.ambient-orb {
  position: fixed;
  top: 0;
  left: 0;
  width: 600px;
  height: 600px;
  pointer-events: none;
  z-index: 1;
  background: radial-gradient(
    circle at 50% 50%,
    rgba(99, 102, 241, 0.12) 0%,
    rgba(99, 102, 241, 0.04) 35%,
    transparent 70%
  );
  border-radius: 50%;
  transform: translate(-50%, -50%);
  will-change: transform;
}
```

```javascript
let orbX = 0, orbY = 0;
const orbLerp = 0.04;

function animate() {
  orbX += (mouseX - orbX) * orbLerp;
  orbY += (mouseY - orbY) * orbLerp;
  orbElement.style.transform = `translate(${orbX - 300}px, ${orbY - 300}px)`;
  requestAnimationFrame(animate);
}
```

### 4. 3D Interactive Globe (Three.js / react-globe.gl)

The globe widget in Layer 3 is a live, interactive 3D visualization — NOT a video. It rotates automatically and displays colored country markers representing safety advisory levels.

**Architecture**:
- Built with **react-globe.gl** (React wrapper for globe.gl / Three.js).
- Container: A `div` with `width: 280px`, `height: 280px`, `border-radius: 24px`, `overflow: hidden`, `background: linear-gradient(135deg, #0F1729 0%, #1a1f3a 100%)`.
- The globe instance is configured with:
  - `globeImageUrl`: A Blue Marble earth texture (CDN-hosted NASA texture or procedural fallback).
  - `bumpImageUrl`: Earth topology height map (optional).
  - `backgroundColor`: `"rgba(0,0,0,0)"` (transparent, container provides the dark gradient).
  - `atmosphereColor`: `"#6366F1"` — indigo glow ring around the globe's limb.
  - `atmosphereAltitude`: `0.2` — thickness of the atmospheric glow.
  - `width`: `280`, `height`: `280`.

**Country markers (data points)**:
- Each marker is a dot on the globe surface at `[lat, lng]` coordinates.
- Marker size: Scaled by safety score, range `0.4` to `0.9` (in globe.gl units).
- Marker color: Semantic mapping — `#10B981` (safe), `#F59E0B` (caution), `#EF4444` (danger), `#7C3AED` (critical).
- Marker altitude: `0.02` (slightly above surface) for safe countries, `0.05` for danger/critical (they "float" higher to draw attention).

**Auto-rotation**:
```javascript
globeRef.current.controls().autoRotate = true;
globeRef.current.controls().autoRotateSpeed = 0.5;
globeRef.current.pointOfView({ lat: 20, lng: 0, altitude: 2.5 });
```

**Fallback if globe.gl fails to load**: Render a static SVG illustration of a globe with colored dot markers arranged on a wireframe sphere. The SVG rotates via CSS `@keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }` over `60s` linear infinite. This preserves the visual intent without WebGL.

### 5. Page Entrance Sequence (Overexposed White → Resolved)

The page begins as an overexposed white void and gradually resolves into the full scene. This creates a cinematic, premium opening.

**Timeline** (all times relative to page load):

| Time | Element | Animation |
|------|---------|-----------|
| `0.0s` | Full page overlay | White div covering viewport: `background: #FFFFFF`, `z-index: 9999` |
| `0.0s – 1.5s` | Overlay fade | `opacity: 1 → 0`, `duration: 1.5s`, `ease: power2.inOut`. Overlay removed at `1.5s`. |
| `0.5s – 1.5s` | Background resolve | Base `#F8F9FC` background fades in under the white overlay |
| `1.6s` | Wordmark | `filter: blur(8px) → blur(0)`, `opacity: 0 → 1`, `duration: 1.2s` |
| `2.0s` | Navigation bar | `opacity: 0 → 1`, `y: -20px → 0`, `duration: 0.6s` |
| `2.0s – 3.2s` | Tagline characters | Staggered spring expansion, `delayChildren: 2.0s` |
| `2.4s` | Layer 1 card | `opacity: 0 → 1`, `y: 30px → 0`, `duration: 0.8s` |
| `2.6s` | Layer 2 card | `opacity: 0 → 1`, `y: 20px → 0`, `duration: 0.8s` |
| `2.6s` | Sub-tagline | `opacity: 0 → 1`, `y: 10px → 0`, `duration: 0.6s` |
| `2.8s` | Globe widget | `scale: 0.85 → 1`, `opacity: 0 → 1`, `duration: 1.0s` |
| `2.8s` | CTA button | `opacity: 0 → 1`, `y: 15px → 0`, `duration: 0.6s` |
| `3.0s` | Footer | `opacity: 0 → 1`, `duration: 0.6s` |
| `3.2s` | Scroll indicator | `opacity: 0 → 1`, `duration: 0.4s` |
| `1.5s+` | Ambient orb | Begins tracking cursor |
| `1.5s+` | Parallax system | Begins responding to cursor movement |

**White overlay implementation**:
```css
.entrance-overlay {
  position: fixed;
  inset: 0;
  background: #FFFFFF;
  z-index: 9999;
  pointer-events: none;
}
```

```javascript
timeline.to('.entrance-overlay', {
  opacity: 0,
  duration: 1.5,
  ease: 'power2.inOut',
  onComplete: () => overlay.remove()
});
```

## Assets

### Images

| ID | Prompt | Transparency |
|---|---|---|
| `monogram-icon` | Minimal geometric monogram icon combining orbit and radar elements — a dashed indigo ring, a central solid indigo circle, and a semi-transparent middle circle. Clean vector aesthetic with no text. Used as the RoamSense brand mark. | Yes |
| `globe-fallback` | Wireframe globe illustration — a sphere constructed from latitude and longitude grid lines in subtle white (rgba(255,255,255,0.15)) on a transparent background. 20 evenly spaced meridians and 10 latitude lines. Clean, minimal, technical aesthetic. Used as fallback if the 3D globe fails to load. | Yes |

### Videos

No video assets required — all motion is procedural (Three.js globe, CSS animations, JS-driven parallax, Framer Motion spring physics).

## Dependencies

- `three` — Three.js core for 3D globe rendering
- `react-globe.gl` — React wrapper for globe.gl (simplifies globe setup with markers and atmosphere)
- `framer-motion` — React animation library for the staggered character expansion, card entrances, and page transitions
- `gsap` — Animation library for the entrance timeline and parallax orchestration (optional — can be replaced by Framer Motion's `useAnimation` if bundle size is a concern)

## Notes

### Responsive Behavior
- **Below `768px`**: Center nav links collapse into a hamburger menu. The three floating parallax cards (Layer 1, 2, 3) hide entirely on mobile to prevent clutter — the hero becomes a clean centered composition with just the wordmark, tagline, and CTA. The ambient orb remains but is reduced to `400px` diameter.
- **Below `480px`**: Wordmark scales down to `40px`. Tagline wraps to two lines. CTA button becomes full-width (`width: 100%`, max-width `320px`).
- **Touch devices**: Parallax system should disable mouse tracking and fall back to subtle automatic floating motion — each layer drifts in a slow sine wave (`Math.sin(time * 0.0005) * amplitude`) to maintain the sense of life without cursor input.

### Performance
- `will-change: transform` is set on all parallax elements for GPU compositing.
- The ambient orb uses a large `border-radius: 50%` with radial gradient — this is expensive to render. On low-end devices, reduce orb size to `300px` or replace with a CSS `box-shadow` glow on a smaller element.
- The Three.js globe renders continuously even when off-screen. Use `IntersectionObserver` to pause the globe render loop (`renderer.setAnimationLoop(null)`) when not visible, and resume when scrolled into view.
- For the Framer Motion staggered text: ensure `backface-visibility: hidden` is set on character spans to prevent subpixel antialiasing issues during scale transforms.

### Accessibility
- All animations respect `prefers-reduced-motion: reduce`. In reduced-motion mode: the white overlay fades quickly (`0.3s`), the tagline appears instantly without character stagger, parallax layers remain static at their center positions, the globe does not auto-rotate, and the pulse indicator is a static green dot.
- The ambient orb is decorative (`aria-hidden="true"`, `pointer-events: none`) and does not interfere with screen readers.
- Nav links have visible focus rings (`outline: 2px solid #6366F1`, `outline-offset: 2px`).
- Color contrast ratios: `#0F1729` on `#F8F9FC` = 15.8:1 (AAA). `rgba(15, 23, 41, 0.55)` on `#F8F9FC` = 5.2:1 (AA for large text). All text meets WCAG AA.

### Multi-line Headline
The tagline "Travel safer. Spend smarter." is the multi-line element in this design (not the wordmark). If expanded to a longer message, each line should maintain the same character stagger timing (`0.03s` per char, `0.3s` line delay). Do NOT use `<br>` tags inside the staggered animation — split by line and render each as a separate container with its own `overflow: hidden` wrapper.

### Build Notes
- The Outfit font should be loaded via Google Fonts CDN: `https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap`.
- The `backdrop-filter: blur(20px)` property requires the `-webkit-backdrop-filter` prefix for Safari. Both must be specified.
- `react-globe.gl` bundles its own Three.js instance. If the project already uses Three.js directly, there may be a duplication issue — use `globe.gl` (the vanilla JS version) with a custom React wrapper to share the Three.js instance, or configure Vite's `optimizeDeps` to deduplicate.
- For the globe textures: use a reliable CDN source like `https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg` and `https://unpkg.com/three-globe/example/img/earth-topology.png`. If these fail to load, the globe should render with a dark sphere (`#1e293b`) and the indigo atmospheric ring only — this is an acceptable degraded state.
