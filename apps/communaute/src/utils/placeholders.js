const PALETTES = [
  ['#3a1420', '#c23a54'],
  ['#1a1c3a', '#4a5bc2'],
  ['#3a2a14', '#c28a3a'],
  ['#14301a', '#3ac26a'],
  ['#2a1436', '#8a3ac2'],
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

export function avatarPlaceholder({ seed, name, size = 128 }) {
  const [c1, c2] = paletteFor(seed)
  const initials = (name ?? '?')
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
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export function bannerPlaceholder({ seed, w = 800, h = 240 }) {
  const [c1, c2] = paletteFor(seed)
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c1}" />
      <stop offset="1" stop-color="${c2}" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)" />
</svg>`.trim()
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}
