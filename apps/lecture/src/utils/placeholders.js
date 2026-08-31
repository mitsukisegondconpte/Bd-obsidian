// Génère des visuels placeholder en SVG (data URI), sans dépendance réseau.
// Remplacer par les vraies couvertures / avatars / planches une fois le
// backend et les assets définitifs branchés.

const PALETTES = [
  ['#2a1f45', '#7a3fae'],
  ['#3a1b1b', '#c94b4b'],
  ['#1b3a33', '#2fae7a'],
  ['#1b2a3a', '#3f7aae'],
  ['#3a2f1b', '#d99a2b'],
  ['#3a1b33', '#ae3f9a'],
  ['#1b1b3a', '#5b5b96'],
  ['#2a1b1b', '#d9573a'],
]

function hashStr(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

function paletteFor(seed) {
  const h = hashStr(String(seed))
  return PALETTES[h % PALETTES.length]
}

function toDataUri(svg) {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

function screentone(id, opacity = 0.18) {
  return `
    <pattern id="${id}" width="10" height="10" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.1" fill="#000" opacity="${opacity}" />
    </pattern>
  `
}

// Silhouette de cube isométrique (clin d'oeil au logo Hypercube) : un
// hexagone avec un embranchement en Y et une petite pointe, utilisé comme
// motif en filigrane plutôt qu'une simple lettre plate.
function cubeMotif({ x, y, size, rotate = 0, opacity = 0.16, color = '#ffffff' }) {
  const s = size
  const pts = {
    top: [0, -s],
    tr: [s * 0.87, -s * 0.5],
    br: [s * 0.87, s * 0.5],
    bottom: [0, s],
    bl: [-s * 0.87, s * 0.5],
    tl: [-s * 0.87, -s * 0.5],
  }
  const hex = [pts.top, pts.tr, pts.br, pts.bottom, pts.bl, pts.tl].map((p) => p.join(',')).join(' ')

  return `
    <g transform="translate(${x} ${y}) rotate(${rotate})" opacity="${opacity}" stroke="${color}" fill="none" stroke-width="${Math.max(2, s * 0.035)}" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="${hex}" />
      <line x1="0" y1="0" x2="${pts.top[0]}" y2="${pts.top[1]}" />
      <line x1="0" y1="0" x2="${pts.br[0]}" y2="${pts.br[1]}" />
      <line x1="0" y1="0" x2="${pts.bl[0]}" y2="${pts.bl[1]}" />
      <line x1="0" y1="${-s}" x2="0" y2="${-s * 1.28}" />
    </g>
  `
}

// Découpe diagonale à deux tons façon jaquette illustrée, avec le motif
// cube en filigrane — plus "vivant" qu'un dégradé plat avec une lettre.
export function coverPlaceholder({ seed, title, w = 500, h = 700 }) {
  const [c1, c2] = paletteFor(seed)
  const h1 = hashStr(String(seed))
  const rotate = (h1 % 24) - 12
  const splitY = h * (0.34 + ((h1 >> 3) % 10) / 100)

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="gTop" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c2}" />
      <stop offset="1" stop-color="${c1}" />
    </linearGradient>
    <linearGradient id="gBottom" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c1}" />
      <stop offset="1" stop-color="#0b0b0e" />
    </linearGradient>
    ${screentone('dots')}
    <linearGradient id="fadeBottom" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0.55" stop-color="#000" stop-opacity="0" />
      <stop offset="1" stop-color="#000" stop-opacity="0.8" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#gBottom)" />
  <polygon points="0,0 ${w},0 ${w},${splitY - h * 0.16} 0,${splitY}" fill="url(#gTop)" />
  <rect width="${w}" height="${h}" fill="url(#dots)" />
  ${cubeMotif({ x: w * 0.78, y: h * 0.24, size: w * 0.22, rotate, opacity: 0.28, color: '#ffffff' })}
  ${cubeMotif({ x: w * 0.16, y: h * 0.82, size: w * 0.15, rotate: rotate * -1.4, opacity: 0.16, color: '#ffffff' })}
  <rect width="${w}" height="${h}" fill="url(#fadeBottom)" />
  <text x="24" y="${h - 22}" font-family="Poppins, Arial, sans-serif" font-weight="800" font-size="${Math.round(w * 0.09)}" fill="#ffffff" opacity="0.9">${escapeXml(title.trim()[0]?.toUpperCase() ?? '?')}</text>
</svg>`.trim()

  return toDataUri(svg)
}

export function bannerPlaceholder({ seed, w = 1400, h = 500 }) {
  const [c1, c2] = paletteFor(seed)
  const h1 = hashStr(String(seed))
  const rotate = (h1 % 20) - 10

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="0.5">
      <stop offset="0" stop-color="${c1}" />
      <stop offset="1" stop-color="${c2}" />
    </linearGradient>
    ${screentone('dots2', 0.14)}
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)" />
  <polygon points="${w * 0.58},0 ${w},0 ${w},${h} ${w * 0.74},${h}" fill="#000000" opacity="0.18" />
  <rect width="${w}" height="${h}" fill="url(#dots2)" />
  ${cubeMotif({ x: w * 0.84, y: h * 0.5, size: h * 0.42, rotate, opacity: 0.22, color: '#ffffff' })}
  ${cubeMotif({ x: w * 0.1, y: h * 0.22, size: h * 0.16, rotate: rotate * -1.6, opacity: 0.14, color: '#ffffff' })}
</svg>`.trim()

  return toDataUri(svg)
}

export function avatarPlaceholder({ seed, name, size = 128 }) {
  const [c1, c2] = paletteFor(seed)
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c1}" />
      <stop offset="1" stop-color="${c2}" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#g)" />
  <text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle" font-family="Poppins, Arial, sans-serif" font-weight="700" font-size="${Math.round(size * 0.4)}" fill="#ffffff">${initials}</text>
</svg>`.trim()

  return toDataUri(svg)
}

// Planche de lecture : simule une page façon "screentone" avec un cadre de
// case et un numéro de page, pour signaler clairement qu'il s'agit d'un
// gabarit en attente de la vraie planche.
export function pagePlaceholder({ seed, page, total, w = 800, h = 1200 }) {
  const [c1, c2] = paletteFor(`${seed}-${page}`)
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${c1}" />
      <stop offset="1" stop-color="${c2}" />
    </linearGradient>
    ${screentone('dots3', 0.16)}
  </defs>
  <rect width="${w}" height="${h}" fill="#0a0a0c" />
  <rect x="18" y="18" width="${w - 36}" height="${h - 36}" fill="url(#g)" />
  <rect x="18" y="18" width="${w - 36}" height="${h - 36}" fill="url(#dots3)" />
  <rect x="18" y="18" width="${w - 36}" height="${h - 36}" fill="none" stroke="#0a0a0c" stroke-width="6" />
  <text x="${w / 2}" y="${h / 2}" text-anchor="middle" dominant-baseline="middle" font-family="Poppins, Arial, sans-serif" font-weight="800" font-size="${Math.round(w * 0.12)}" fill="#ffffff" opacity="0.35">${page}</text>
  <text x="${w - 34}" y="${h - 34}" text-anchor="end" font-family="Poppins, Arial, sans-serif" font-weight="600" font-size="${Math.round(w * 0.028)}" fill="#ffffff" opacity="0.55">Planche ${page} / ${total} — aperçu</text>
</svg>`.trim()

  return toDataUri(svg)
}

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
