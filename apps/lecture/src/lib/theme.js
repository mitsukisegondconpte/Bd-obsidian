const STORAGE_KEY = 'hypercube-theme'
const VALID = new Set(['system', 'light', 'dark'])

export function getThemePreference() {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    return VALID.has(value) ? value : 'system'
  } catch {
    return 'system'
  }
}

function applyPreference(preference) {
  const dark = preference === 'dark' || (preference === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.dataset.theme = dark ? 'dark' : 'light'
}

export function setThemePreference(preference) {
  const value = VALID.has(preference) ? preference : 'system'
  try {
    window.localStorage.setItem(STORAGE_KEY, value)
  } catch {
    // The preference still applies for this session if storage is unavailable.
  }
  applyPreference(value)
  window.dispatchEvent(new CustomEvent('hypercube-theme-change', { detail: value }))
}

export function initializeTheme() {
  const update = () => applyPreference(getThemePreference())
  update()
  if (window.matchMedia) {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    if (media.addEventListener) media.addEventListener('change', update)
    else media.addListener(update)
  }
}
