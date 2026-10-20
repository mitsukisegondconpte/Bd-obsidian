import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import Badge from './Badge'
import { bannerPlaceholder } from '../../utils/placeholders'

const AUTOPLAY_MS = 6000
const HALF_MS = 325

// Carrousel des séries vedettes : défile automatiquement, se swipe à la
// main, et transitionne d'une série à l'autre via un flash de l'hexagone
// de marque qui se déforme puis se reforme (même langage que BrandLoader).
export default function HeroCarousel({ items }) {
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState('idle') // idle | out | in
  const pendingRef = useRef(0)
  const dragRef = useRef({ startX: 0, dragging: false, moved: false })

  const count = items.length
  const slide = items[index]

  const goTo = (nextIndex) => {
    if (count < 2 || nextIndex === index || phase !== 'idle') return
    pendingRef.current = nextIndex
    setPhase('out')
  }

  const next = () => goTo((index + 1) % count)
  const prev = () => goTo((index - 1 + count) % count)

  useEffect(() => {
    if (phase === 'out') {
      const t = setTimeout(() => {
        setIndex(pendingRef.current)
        setPhase('in')
      }, HALF_MS)
      return () => clearTimeout(t)
    }
    if (phase === 'in') {
      const t = setTimeout(() => setPhase('idle'), HALF_MS)
      return () => clearTimeout(t)
    }
  }, [phase])

  useEffect(() => {
    if (phase !== 'idle' || count < 2) return undefined
    const t = setTimeout(() => goTo((index + 1) % count), AUTOPLAY_MS)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, phase, count])

  const onPointerDown = (e) => {
    dragRef.current = { startX: e.clientX, dragging: true, moved: false }
  }
  const onPointerMove = (e) => {
    if (!dragRef.current.dragging) return
    if (Math.abs(e.clientX - dragRef.current.startX) > 10) dragRef.current.moved = true
  }
  const onPointerUp = (e) => {
    if (!dragRef.current.dragging) return
    const dx = e.clientX - dragRef.current.startX
    dragRef.current.dragging = false
    if (dx > 60) prev()
    else if (dx < -60) next()
  }
  const onLinkClick = (e) => {
    if (dragRef.current.moved) e.preventDefault()
  }

  return (
    <section className="relative pb-16 sm:pb-20">
      <div
        className="relative touch-pan-y select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <Link to={`/serie/${slide.slug}`} className="block" onClick={onLinkClick} draggable={false}>
          <div
            className="relative h-[300px] w-full overflow-hidden sm:h-[400px]"
            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 82%, 0 100%)' }}
          >
            <img
              key={slide.id}
              src={slide.banner_url || bannerPlaceholder({ seed: `${slide.id}-banner` })}
              alt={slide.title}
              draggable={false}
              className={`h-full w-full object-cover ${phase === 'out' ? 'hero-anim-out' : phase === 'in' ? 'hero-anim-in' : ''}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-0 via-surface-0/30 to-transparent" />
            {phase !== 'idle' && (
              <svg
                viewBox="-60 -60 120 120"
                className="hero-hex-overlay pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 text-accent sm:h-56 sm:w-56"
              >
                <polygon
                  points="0,-50 43,-25 43,25 0,50 -43,25 -43,-25"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>

          <div className="relative -mt-14 px-4 sm:-mt-16 sm:px-6">
            <div
              key={`caption-${slide.id}`}
              className={`max-w-xl rotate-[-0.6deg] rounded-xl border-l-4 border-accent bg-surface-1 p-4 shadow-2xl shadow-black/50 sm:p-6 ${phase === 'out' ? 'hero-anim-out' : phase === 'in' ? 'hero-anim-in' : ''}`}
            >
              <Badge variant="hot">Série vedette</Badge>
              <h1 className="mt-2 font-display text-2xl font-extrabold text-white text-balance sm:text-4xl">
                {slide.title}
              </h1>
              <p className="mt-1 line-clamp-2 text-sm text-zinc-300 sm:text-base">{slide.summary}</p>
              <div className="mt-3 flex items-center gap-3 text-sm text-zinc-300">
                <span className="flex items-center gap-1 font-semibold text-accent">
                  <Star size={14} className="fill-accent" /> {slide.rating}
                </span>
                <span>{slide.views.toLocaleString('fr-FR')} vues</span>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {count > 1 && (
        <div className="absolute bottom-1 left-1/2 z-10 flex -translate-x-1/2 gap-1.5 sm:bottom-2">
          {items.map((it, i) => (
            <button
              key={it.id}
              type="button"
              aria-label={`Voir ${it.title}`}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all ${i === index ? 'w-5 bg-accent' : 'w-1.5 bg-white/30'}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
