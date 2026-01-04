import { ref, watch } from 'vue'

const themes = [
  { value: 'default', label: 'Modern', icon: 'bi-file-earmark-fill' },
  { value: 'classic-wood', label: 'Classic Wood', icon: 'bi-box-fill' },
  { value: 'dark', label: 'Dark', icon: 'bi-moon-stars-fill' },
  { value: 'ocean', label: 'Ocean', icon: 'bi-water' },
  { value: 'desert', label: 'Desert', icon: 'bi-sun-fill' },
  { value: 'forest', label: 'Forest', icon: 'bi-tree-fill' }
] as const

export type Theme = typeof themes[number]['value']

const THEME_STORAGE_KEY = 'backgammon-theme'

const currentTheme = ref<Theme>('default')

export function useTheme() {
  // Load theme from localStorage on init
  const loadTheme = () => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null
    if (saved && isTheme(saved)) {
      currentTheme.value = saved
      applyTheme(saved)
    }
  }

  function isTheme(value: string): value is Theme {
    return themes.some(t => t.value === value)
  }

  // Apply theme to document
  const applyTheme = (theme: Theme) => {
    if (theme === 'default') {
      document.documentElement.removeAttribute('data-theme')
    } else {
      document.documentElement.setAttribute('data-theme', theme)
    }
  }

  // Set theme
  const setTheme = (theme: Theme) => {
    currentTheme.value = theme
    applyTheme(theme)
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }

  // Watch for theme changes
  watch(currentTheme, (newTheme) => {
    applyTheme(newTheme)
  })

  // Load theme on init
  if (typeof window !== 'undefined') {
    loadTheme()
  }

  return {
    themes,
    currentTheme,
    setTheme,
  }
}
