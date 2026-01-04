<template>
  <div v-if="dice && dice.length" class="dice-container">
    <div 
      v-for="(diceInfo, i) in diceWithIds" 
      :key="diceInfo.id" 
      class="die"
      :class="{ 'animate': shouldAnimate(diceInfo.id) }"
      :style="getDiceStyle(diceInfo.id)"
    >
      <img :src="getDiceImage(diceInfo.value)" :alt="`Dice ${diceInfo.value}`" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from 'vue'

const props = defineProps<{
  dice: number[]
}>()

// Get current theme's dice folder
const getDiceFolder = () => {
  const theme = document.documentElement.getAttribute('data-theme') || 'default'
  const folderMap: Record<string, string> = {
    'default': '',
    'classic-wood': '',
    'dark': 'dark',
    'ocean': 'ocean',
    'desert': 'desert'
  }
  return folderMap[theme] || ''
}

const getDiceImage = (value: number) => {
  const folder = getDiceFolder()
  const path = folder ? `/assets/images/dice/${folder}/${value}.png` : `/assets/images/dice/${value}.png` 
  return path
}

// Store positions mapped by unique dice ID
const dicePositions = ref<Map<string, { left: number; top: number; rotation: number }>>(new Map())
const diceIdCounter = ref(0)
const diceIds = ref<string[]>([])
const animatingIds = ref<Set<string>>(new Set())

// Create stable IDs for each die
const diceWithIds = computed(() => {
  return props.dice.map((value, index) => ({
    value,
    id: diceIds.value[index] || `die-${diceIdCounter.value++}`
  }))
})

// Generate a single non-overlapping position
const generatePosition = (existingPositions: { left: number; top: number; rotation: number }[]) => {
  const minDistance = 15 // Minimum distance between dice in percentage
  let attempts = 0
  let validPosition = false
  let newPos = { left: 0, top: 0, rotation: 0 }
  
  while (!validPosition && attempts < 50) {
    newPos = {
      left: 30 + Math.random() * 40,
      top: 45 + Math.random() * 10,
      rotation: Math.random() * 360
    }
    
    // Check distance to all existing positions
    validPosition = existingPositions.length === 0 || existingPositions.every(pos => {
      const dx = pos.left - newPos.left
      const dy = pos.top - newPos.top
      const distance = Math.sqrt(dx * dx + dy * dy)
      return distance >= minDistance
    })
    
    attempts++
  }
  
  return newPos
}

// Update positions only when new dice are rolled (dice count increases)
watch(() => props.dice, (newDice, oldDice) => {
  const currentCount = newDice?.length || 0
  const prevCount = oldDice?.length || 0
  // Only reposition when dice count increases (new roll) or on initial load
  if (currentCount > prevCount || prevCount === 0) {
    // Clear old positions and IDs for new roll
    dicePositions.value.clear()
    diceIds.value = []
    animatingIds.value.clear()
    
    // Generate new positions and IDs for each die
    const existingPositions: { left: number; top: number; rotation: number }[] = []
    
    for (let i = 0; i < props.dice.length; i++) {
      const id = `die-${diceIdCounter.value++}`
      const position = generatePosition(existingPositions)
      
      diceIds.value.push(id)
      dicePositions.value.set(id, position)
      existingPositions.push(position)
      animatingIds.value.add(id)
    }
    
    // Remove animation class after animation completes
    setTimeout(() => {
      animatingIds.value.clear()
    }, 300) // Match animation duration
  } else if (currentCount < prevCount) {
    // When a die is removed, update the IDs array but keep existing positions
    diceIds.value = diceIds.value.slice(0, currentCount)
  }
}, { immediate: true })

const shouldAnimate = (id: string) => {
  return animatingIds.value.has(id)
}

const getDiceStyle = (id: string) => { 
  const pos = dicePositions.value.get(id)
  if (!pos) return {}
  return {
    left: `${pos.left}%`,
    top: `${pos.top}%`,
    transform: `translate(-50%, -50%) rotate(${pos.rotation}deg)` 
  }
}
</script>

<style scoped>
.dice-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 10;
}

.die {
  position: absolute;
  width: 60px;
  height: 60px;
  filter: var(--dice-shadow);
}

.die.animate {
  animation: diceRoll 0.3s ease-out;
}

.die img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

@keyframes diceRoll {
  0% {
    scale: 0.5;
    opacity: 0;
  }
  50% {
    scale: 1.2;
  }
  100% {
    scale: 1;
    opacity: 1;
  }
}
@keyframes diceRoll {
  0% {
    transform: translate(-50%, -50%) rotate(0deg) scale(0.5);
    opacity: 0;
  }
  50% {
    transform: translate(-50%, -50%) rotate(180deg) scale(1.2);
  }
  100% {
    opacity: 1;
  }
}
</style>
