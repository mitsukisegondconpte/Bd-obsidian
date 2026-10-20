// Couverture générée localement quand l'oeuvre n'a pas d'image (catalogue,
// upload ou externe) — style "jaquette de livre" plutôt que le motif BD de
// la plateforme lecture, pour rester cohérent avec du texte long.

const PALETTES = [
  ['#241a0d', '#8a5a1f'],
  ['#1a1408', '#b5872b'],
  ['#221007', '#a1481f'],
  ['#101a16', '#2f8a6c'],
  ['#160f1e', '#6a4a9e'],
  ['#1c1005', '#c76b1f'],
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
  return PALETTES[hashStr(String(seed)) % PALETTES.length]
}

export function bookCoverPlaceholder({ seed, title, w = 500, h = 700 }) {
  const [c1, c2] = paletteFor(seed)
  const initial = title.trim()[0]?.toUpperCase() ?? '?'

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c1}" />
      <stop offset="1" stop-color="${c2}" />
    </linearGradient>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0.55" stop-color="#000" stop-opacity="0" />
      <stop offset="1" stop-color="#000" stop-opacity="0.55" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)" />
  <rect x="${w * 0.09}" y="${h * 0.09}" width="${w * 0.82}" height="${h * 0.82}" fill="none" stroke="#ffffff" stroke-opacity="0.35" stroke-width="2" />
  <text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle" font-family="Merriweather, Georgia, serif" font-weight="700" font-size="${Math.round(w * 0.34)}" fill="#ffffff" opacity="0.85">${escapeXml(initial)}</text>
  <rect width="${w}" height="${h}" fill="url(#fade)" />
</svg>`.trim()

  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export function avatarPlaceholder({ seed, name, size = 128 }) {
  const [c1, c2] = paletteFor(seed)
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
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
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
