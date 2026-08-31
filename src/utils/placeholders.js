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

// Pas de titre incrusté : le nom de la série est déjà affiché en HTML sous
// la couverture (voir SeriesCard). On dessine juste une texture illustrée
// avec l'initiale de l'oeuvre en filigrane, façon jaquette générique.
export function coverPlaceholder({ seed, title, w = 500, h = 700 }) {
  const [c1, c2] = paletteFor(seed)
  const initial = title.trim()[0]?.toUpperCase() ?? '?'

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c1}" />
      <stop offset="1" stop-color="${c2}" />
    </linearGradient>
    ${screentone('dots')}
    <linearGradient id="fadeTop" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#000" stop-opacity="0.45" />
      <stop offset="0.25" stop-color="#000" stop-opacity="0" />
    </linearGradient>
    <linearGradient id="fadeBottom" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0.7" stop-color="#000" stop-opacity="0" />
      <stop offset="1" stop-color="#000" stop-opacity="0.75" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)" />
  <rect width="${w}" height="${h}" fill="url(#dots)" />
  <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" font-family="Poppins, Arial, sans-serif" font-weight="800" font-size="${Math.round(w * 0.62)}" fill="#ffffff" opacity="0.16">${escapeXml(initial)}</text>
  <rect width="${w}" height="${h}" fill="url(#fadeTop)" />
  <rect width="${w}" height="${h}" fill="url(#fadeBottom)" />
</svg>`.trim()

  return toDataUri(svg)
}

export function bannerPlaceholder({ seed, title, w = 1400, h = 500 }) {
  const [c1, c2] = paletteFor(seed)
  const initial = title.trim()[0]?.toUpperCase() ?? '?'
  const cx = w * 0.82

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="0.4">
      <stop offset="0" stop-color="${c1}" />
      <stop offset="1" stop-color="${c2}" />
    </linearGradient>
    ${screentone('dots2', 0.14)}
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)" />
  <rect width="${w}" height="${h}" fill="url(#dots2)" />
  <text x="${cx}" y="${h / 2}" text-anchor="middle" dominant-baseline="middle" font-family="Poppins, Arial, sans-serif" font-weight="800" font-size="${Math.round(h * 0.5)}" fill="#ffffff" opacity="0.14">${escapeXml(initial)}</text>
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
