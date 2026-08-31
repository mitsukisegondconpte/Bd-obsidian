// Motif hypercube animé : l'hexagone isométrique du logo se déforme puis se
// reforme en boucle, dans le même langage visuel que le logo de marque.
export default function BrandLoader({ size = 88, className = '' }) {
  const s = size / 2
  const solid = `0,${-s} ${s * 0.87},${-s * 0.5} ${s * 0.87},${s * 0.5} 0,${s} ${-s * 0.87},${s * 0.5} ${-s * 0.87},${-s * 0.5}`
  const deformed = `${s * 0.1},${-s * 1.22} ${s * 1.12},${-s * 0.22} ${s * 0.62},${s * 0.78} ${-s * 0.14},${s * 1.08} ${-s * 1.02},${s * 0.3} ${-s * 0.58},${-s * 0.82}`
  const stroke = Math.max(2.5, size * 0.032)

  return (
    <svg
      viewBox={`${-s * 1.4} ${-s * 1.4} ${size * 1.4} ${size * 1.4}`}
      width={size}
      height={size}
      className={`text-accent ${className}`}
      role="img"
      aria-label="Chargement"
    >
      <g stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={stroke}>
        <polygon points={solid}>
          <animate
            attributeName="points"
            values={`${solid};${deformed};${solid}`}
            keyTimes="0;0.5;1"
            dur="2.4s"
            calcMode="spline"
            keySplines="0.45 0 0.2 1;0.45 0 0.2 1"
            repeatCount="indefinite"
          />
        </polygon>
        <line x1="0" y1="0" x2="0" y2={-s}>
          <animate attributeName="opacity" values="1;0;1" keyTimes="0;0.5;1" dur="2.4s" repeatCount="indefinite" />
        </line>
        <line x1="0" y1="0" x2={s * 0.87} y2={s * 0.5}>
          <animate attributeName="opacity" values="1;0;1" keyTimes="0;0.5;1" dur="2.4s" repeatCount="indefinite" />
        </line>
        <line x1="0" y1="0" x2={-s * 0.87} y2={s * 0.5}>
          <animate attributeName="opacity" values="1;0;1" keyTimes="0;0.5;1" dur="2.4s" repeatCount="indefinite" />
        </line>
      </g>
      <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="9s" repeatCount="indefinite" />
    </svg>
  )
}
