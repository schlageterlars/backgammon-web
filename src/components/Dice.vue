<template>
  <div v-if="dice && dice.length" class="dice-container">
    <!-- Dice images -->
    <div 
      v-for="(diceInfo, i) in diceWithIds" 
      :key="diceInfo.id" 
      class="die"
      :class="{ 'animate': shouldAnimate(diceInfo.id) }"
      :style="getDiceStyle(diceInfo.id)"
    >
      <img :src="getDiceImage(diceInfo.value)" :alt="`Dice ${diceInfo.value}`" />
    </div>

    <!-- Pasch overlay with firework -->
    <div v-if="isPasch" class="pasch-overlay">
      <div class="pasch-text">PASCH!</div>
      <div class="firework">
        <span v-for="n in 150" :key="n" class="particle" :style="getParticleStyle(n)"></span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from 'vue'

const props = defineProps<{
  dice: number[]
}>()

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
  return folder ? `/assets/images/dice/${folder}/${value}.png` : `/assets/images/dice/${value}.png`
}

// Dice positions
const dicePositions = ref<Map<string, { left: number; top: number; rotation: number }>>(new Map())
const diceIdCounter = ref(0)
const diceIds = ref<string[]>([])
const animatingIds = ref<Set<string>>(new Set())

const diceWithIds = computed(() =>
  props.dice.map((value, index) => ({
    value,
    id: diceIds.value[index] || `die-${diceIdCounter.value++}`
  }))
)

const generatePosition = (existingPositions: { left: number; top: number; rotation: number }[]) => {
  const minDistance = 35
  let attempts = 0
  let validPosition = false
  let newPos = { left: 0, top: 0, rotation: 0 }
  
  while (!validPosition && attempts < 50) {
    newPos = {
      left: 30 + Math.random() * 40,
      top: 45 + Math.random() * 10,
      rotation: Math.random() * 360
    }
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

watch(() => props.dice, (newDice, oldDice) => {
  const currentCount = newDice?.length || 0
  const prevCount = oldDice?.length || 0
  if (currentCount > prevCount || prevCount === 0) {
    dicePositions.value.clear()
    diceIds.value = []
    animatingIds.value.clear()
    const existingPositions: { left: number; top: number; rotation: number }[] = []

    for (let i = 0; i < props.dice.length; i++) {
      const id = `die-${diceIdCounter.value++}`
      const position = generatePosition(existingPositions)
      diceIds.value.push(id)
      dicePositions.value.set(id, position)
      existingPositions.push(position)
      animatingIds.value.add(id)
    }

    setTimeout(() => animatingIds.value.clear(), 300)
  } else if (currentCount < prevCount) {
    diceIds.value = diceIds.value.slice(0, currentCount)
  }
}, { immediate: true })

const shouldAnimate = (id: string) => animatingIds.value.has(id)
const getDiceStyle = (id: string) => {
  const pos = dicePositions.value.get(id)
  if (!pos) return {}
  return {
    left: `${pos.left}%`,
    top: `${pos.top}%`,
    transform: `translate(-50%, -50%) rotate(${pos.rotation}deg)`
  }
}

// --- Pasch logic ---
const isPasch = computed(() => props.dice.length > 2)

// Firework particle style
const getParticleStyle = (index: number) => {
  const angle = (index - 1) * (360 / 30) // more spread
  const distance = 100 + Math.random() * 50 // bigger explosion
  const rad = angle * (Math.PI / 180)
  const x = Math.cos(rad) * distance
  const y = Math.sin(rad) * distance
  const delay = Math.random() * 0.2
  return {
    '--x': `${x}px`,
    '--y': `${y}px`,
    animationDelay: `${delay}s`
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

/* Dice animation */
@keyframes diceRoll {
  0% { transform: translate(-50%, -50%) rotate(0deg) scale(0.5); opacity: 0; }
  50% { transform: translate(-50%, -50%) rotate(180deg) scale(1.2); }
  100% { opacity: 1; transform: translate(-50%, -50%) rotate(360deg) scale(1); }
}

/* Pasch overlay */
.pasch-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 20;
}

.pasch-text {
  font-size: 4rem; /* bigger text */
  font-weight: bold;
  color: #ffdd55;
  text-shadow: 0 0 15px #ffdd55, 0 0 25px #ff8800, 0 0 40px #ff5500;
  animation: popIn 0.2s ease-out 0.2s forwards, fadeOut 0.2s ease-out 0.6s forwards;
  margin-bottom: 1rem;
}

@keyframes popIn {
  0% { transform: scale(0.3); opacity: 0; }
  100% { transform: scale(1.2); opacity: 1; }
}

@keyframes fadeOut {
  0% { opacity: 1; }
  100% { opacity: 0; }
}

/* Firework particles */
.firework {
  position: absolute; /* center exactly */
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
}

.particle {
  position: absolute;
  width: 12px;
  height: 12px;
  background: #ffdd55;
  border-radius: 50%;
  animation: explode 1s ease-out forwards;
  top: 0;
  left: 0;
}

@keyframes explode { 0% { transform: translate(0,0) scale(0); opacity: 1; } 100% { transform: translate(var(--x), var(--y)) scale(1); opacity: 0; } }
</style>
