import { initTheme, toggleTheme, getSavedTheme } from '../config/theme'

type ThemeToggleButton = HTMLButtonElement | null

const getButton = (): ThemeToggleButton =>
  document.getElementById('themeToggle') as ThemeToggleButton

const updateButtonLabel = (button: ThemeToggleButton, theme: string) => {
  if (!button) return
  button.textContent = theme === 'dark' ? '☀ Light' : '🌙 Dark'
  button.setAttribute(
    'aria-label',
    `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`
  )
}

window.addEventListener('DOMContentLoaded', () => {
  const currentTheme = initTheme()
  const button = getButton()
  updateButtonLabel(button, currentTheme)

  button?.addEventListener('click', () => {
    const newTheme = toggleTheme()
    updateButtonLabel(button, newTheme)
  })
})
