export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'veldra_theme'

export const getSavedTheme = (): Theme | null => {
  if (typeof window === 'undefined') return null
  const value = window.localStorage.getItem(STORAGE_KEY)
  return value === 'dark' || value === 'light' ? value : null
}

export const saveTheme = (theme: Theme): void => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, theme)
}

export const applyTheme = (theme: Theme): void => {
  if (typeof document === 'undefined') return

  document.documentElement.classList.remove('light', 'dark')
  document.documentElement.classList.add(theme)
  document.body.classList.remove('light', 'dark')
  document.body.classList.add(theme)

  saveTheme(theme)
}

export const getPreferredTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light'
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  return prefersDark ? 'dark' : 'light'
}

export const initTheme = (): Theme => {
  const saved = getSavedTheme()
  const theme = saved || getPreferredTheme()
  applyTheme(theme)
  return theme
}

export const toggleTheme = (): Theme => {
  const current = getSavedTheme() || getPreferredTheme()
  const nextTheme: Theme = current === 'dark' ? 'light' : 'dark'
  applyTheme(nextTheme)
  return nextTheme
}
