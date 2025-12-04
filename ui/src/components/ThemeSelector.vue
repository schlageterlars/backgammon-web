<template>
  <div class="theme-selector">
    <label for="theme-select">Theme:</label>
    <select 
      id="theme-select" 
      v-model="currentTheme" 
      @change="handleThemeChange"
      class="theme-select"
    >
      <option value="default">Standard</option>
      <option value="classic-wood">Classic Wood</option>
      <option value="dark">Dark</option>
      <option value="ocean">Ocean</option>
      <option value="desert">Desert</option>
      <option value="forest">Forest</option>
    </select>
  </div>
</template>

<script lang="ts" setup>
import { useTheme, type Theme } from '../utils/useTheme'

const { currentTheme, setTheme } = useTheme()

const handleThemeChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  setTheme(target.value as Theme)
}
</script>

<style scoped>
.theme-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
}

label {
  font-weight: 500;
  color: var(--text-color);
}

.theme-select {
  padding: 0.375rem 0.75rem;
  border: 1px solid var(--chat-border);
  border-radius: 0.25rem;
  background-color: var(--chat-background);
  color: var(--text-color);
  font-size: 0.875rem;
  cursor: pointer;
  transition: border-color 0.15s ease-in-out;
}

.theme-select:hover {
  border-color: var(--button-primary);
}

.theme-select:focus {
  outline: none;
  border-color: var(--button-primary);
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}
</style>
