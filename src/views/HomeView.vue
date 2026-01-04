<template>
  <main class="container py-5">

  <div class="position-fixed top-0 end-0 m-3 d-flex flex-column gap-2">
    <Login />

    <div class="d-flex align-items-center gap-2 bg-light p-2 rounded shadow-sm">
      <small class="text-muted text-wrap">
        Play against another player on this device
      </small>
      <button class="btn btn-primary btn-sm" @click="playLocal">
        Play
      </button>
    </div>
  </div>

    <!-- Title -->
    <div class="text-center my-4">
      <div class="content">
        <h2>BACKGAMMON</h2>
      </div>
      <QueueModal
        :playerColor="playerColor"
        :boardSize="boardSize"
        :scope="scope"
        :isQueueing="isQueueing"
        @update:isQueueing="val => isQueueing = val"
      />

      <!-- Fishing Rod SVG -->
      <div class="fishing-container">
        <div class="rod">
          <div class="line">
            <div class="fish">
              <svg viewBox="0 0 64 32" width="168" height="104" xmlns="http://www.w3.org/2000/svg">
                <polygon points="6,8 58,8 56,26 8,26" fill="#D2B48C" stroke="#A0522D" stroke-width="0.5"/>
                <path d="M6,8 Q7,6 58,8 Q59,10 60,10 L56,26 Q55,28 8,26 Q7,24 6,8 Z" fill="#F5DEB3" stroke="#A0522D" stroke-width="0.5"/>
                <line x1="10" y1="10" x2="54" y2="11" stroke="#C8A165" stroke-width="0.3"/>
                <line x1="12" y1="14" x2="56" y2="15" stroke="#C8A165" stroke-width="0.3"/>
                <line x1="8" y1="18" x2="50" y2="19" stroke="#C8A165" stroke-width="0.3"/>
                <line x1="14" y1="22" x2="54" y2="23" stroke="#C8A165" stroke-width="0.3"/>
                <line x1="7" y1="9" x2="8" y2="11" stroke="#C8A165" stroke-width="0.2"/>
                <line x1="57" y1="9" x2="58" y2="11" stroke="#C8A165" stroke-width="0.2"/>
                <line x1="10" y1="25" x2="12" y2="26" stroke="#C8A165" stroke-width="0.2"/>
                <line x1="52" y1="24" x2="54" y2="25" stroke="#C8A165" stroke-width="0.2"/>
                <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#5A2E0B" font-size="6" font-family="Orbitron" font-weight="bold">Rules</text>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row justify-content-center mb-4" v-if="!online">
      <Offline/>
    </div>

    <!-- Start a new game -->
    <div class="row justify-content-center g-4 mt-4" v-if="online">
      <div class="col-12 col-lg-8">
        <v-card class="card-lobby pa-4">
          <div class="d-flex align-items-center justify-content-between mb-3">
            <div>
              <h3 class="mb-0">Start a new game</h3>
              <div class="muted-sm">Prepare your game and invite friends — or go public and match with players.</div>
            </div>
            <div class="text-end">
              <small class="text-muted">Preview</small>
              <div class="d-inline-block ms-2 badge bg-light text-dark">
                {{ boardSize }} • {{ scope }}
              </div>
            </div>
          </div>

          <form class="row g-3" @submit.prevent="joinOrQueue">

            <!-- Board size -->
            <div class="col-12">
              <label class="form-label fw-semibold">Board size</label>
              <div class="row row-cols-1 row-cols-sm-3 g-3">
                <div class="col" v-for="size in boardSizes" :key="size.value">
                  <input
                    type="radio"
                    class="btn-check"
                    :id="size.id"
                    name="boardSize"
                    :value="size.value"
                    v-model="boardSize"
                  />
                  <label class="option-card card p-3 text-center h-100 d-block" :for="size.id" style="cursor: pointer;">
                    <div class="mb-2"><i :class="size.icon" style="font-size: 2rem;"></i></div>
                    <div class="fw-bold">{{ size.label }}</div>
                    <div class="muted-sm">{{ size.description }}</div>
                  </label>
                </div>
              </div>
            </div>

            <!-- Player color -->
            <div class="col-12">
              <label class="form-label fw-semibold">Your play as</label>
              <div class="row row-cols-3 g-3">
                <div class="col" v-for="color in playerColors" :key="color.value">
                  <input
                    type="radio"
                    class="btn-check"
                    :id="color.id"
                    name="playerColor"
                    :value="color.value"
                    v-model="playerColor"
                  />
                  <label class="option-card card p-3 text-center h-100 d-flex align-items-center justify-content-center"
                         :for="color.id" style="cursor: pointer;">
                    <div class="checker-icon" :class="color.class"></div>
                  </label>
                </div>
              </div>
            </div>

            <!-- Scope --> 
            <div class="col-12">
              <label class="form-label fw-semibold">Scope</label>
              <div class="d-flex gap-3">
                <div class="form-check form-check-inline" v-for="s in scopes" :key="s.value">
                  <input class="form-check-input" type="radio" :id="s.id" :value="s.value" v-model="scope"/>
                  <label class="form-check-label" :for="s.id">{{ s.label }} <small v-if="s.note" class="text-muted">{{ s.note }}</small></label>
                </div>
              </div>
            </div>

            <!-- Create Button -->
            <!-- #web-comp: Vuetify v-btn Web Component -->
            <div class="col-12 d-flex justify-content-end align-items-center gap-2">
              <span v-if="scope === 'Public'" class="text-muted small me-4">{{ openLobbyCount }} open lobbies</span>
              <button :disabled="!userStore.username" type="submit" class="btn btn-primary">{{ createButtonText }}</button>
            </div>

          </form>
        </v-card>
      </div>

      <!-- Join Lobby -->
      <!-- #web-comp: Vuetify v-card Web Component -->
      <div class="col-12 col-lg-4">
        <v-card class="card-lobby pa-4">
          <div class="d-flex align-items-center justify-content-between mb-3">
            <div>
              <h3 class="mb-0">Join a lobby</h3>
              <div class="muted-sm">Enter a friend’s invite code to join their private game.</div>
            </div>
          </div>

          <div class="row g-3">
            <!-- #web-comp: Vuetify v-text-field Web Component -->
            <div class="col-12">
              <v-text-field
                v-model="joinCode"
                label="Lobby Code"
                placeholder="Enter lobby code..."
                variant="outlined"
                density="comfortable"
              />
            </div>

            <!-- #web-comp: Vuetify v-btn Web Component -->
            <div class="col-12 d-flex justify-content-end">
                <v-btn
                    id="joinLobby"
                    variant="outlined"
                    color="primary"
                    size="large"
                    @click="joinLobby"
                    :disabled="!userStore.username"
                    >
                    Start Match
                </v-btn>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="wave wave-1"></div>
    <div class="wave wave-2"></div>
    <div class="wave wave-3"></div>
  </main>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useApi } from '@/utils/useApi'
import { useQueue } from '@/utils/useQueue'
import QueueModal from './QueueModal.vue'
import { useUserStore } from '@/stores/user'
import { showToast } from '@/utils/toast'
import { useRouter } from 'vue-router'
import { online, goOnline } from "@/api";
import Offline from '@/views/Offline.vue'
import Login from './Login.vue'

const userStore = useUserStore()
const router = useRouter()

// reactive state
const boardSize = ref('Classic')
const scope = ref('Public')
const playerColor = ref('Random')


const {
  openLobbyCount,
  fetchLobbyCount,
} = useApi()

const playLocal = () => {
  router.push('/play')
};

const {
  isQueueing,
  joinCode,
  joinOrQueue,
  joinLobby
} = useQueue(userStore.username, playerColor, boardSize, scope)

let intervalId: number

onMounted(() => {
  fetchLobbyCount()
  intervalId = setInterval(fetchLobbyCount, 5000)
})

onUnmounted(() => {
  clearInterval(intervalId)
})

// Board size options
const boardSizes = [
  { id: 'sizeSmall', label: 'Small', value: 'Small', description: 'Quick rounds, great for a fast game', icon: 'bi bi-arrows-angle-contract' },
  { id: 'sizeMedium', label: 'Medium', value: 'Medium', description: 'Balanced playtime and strategy', icon: 'bi bi-grid-3x3-gap' },
  { id: 'sizeClassic', label: 'Classic', value: 'Classic', description: 'The original and most balanced board', icon: 'bi bi-grid' }
]

// Player color options
const playerColors = [
  { id: 'colorRandom', value: 'Random', class: 'checker-random' },
  { id: 'colorWhite', value: 'White', class: 'checker-white' },
  { id: 'colorBlack', value: 'Black', class: 'checker-black' }
]

// Scope options
const scopes = [
  { id: 'scopePublic', value: 'Public', label: 'Public', note: '(match with players)' },
  { id: 'scopePrivate', value: 'Private', label: 'Private', note: 'Play with friend' }
]

// Computed button text
const createButtonText = computed(() => (scope.value === 'Public' ? 'Quick Join' : 'Create Lobby'))

</script>

<style scoped>

.wave {
  position: fixed;
  left: 0;
  bottom: -10%;
  width: 200%;
  height: 10%;
  background: rgba(255,255,255,0.2);
  z-index: -1;
  border-radius: 100% 50% 50% 100% / 50% 50% 50% 50%; /* wavy shape */
  animation: waveMove 6s linear infinite;
}

/* Wave variations */
/* Individual waves with unique motion */
.wave-1 {
  height: 18%;
  background: rgba(0,190,255,0.3);
  animation: waveMove1 6s linear infinite;
}

.wave-2 {
  height: 30%;
  background: rgba(0,70,110,0.3);
  animation: waveMove2 8s linear infinite;
}

.wave-3 {
  height: 40%;
  background: rgba(0,90,110,0.3);
  animation: waveMove3 10s linear infinite;
}

/* Wave 1 animation */
@keyframes waveMove1 {
  0%   { transform: translateX(0%) translateY(0%) scaleY(1); }
  25%  { transform: translateX(-10%) translateY(-8%) scaleY(1.1); }
  50%  { transform: translateX(-25%) translateY(5%) scaleY(0.9); }
  75%  { transform: translateX(-15%) translateY(-10%) scaleY(1.05); }
  100% { transform: translateX(0%) translateY(0%) scaleY(1); }
}

/* Wave 2 animation */
@keyframes waveMove2 {
  0%   { transform: translateX(0%) translateY(0%) scaleY(1); }
  20%  { transform: translateX(-5%) translateY(-12%) scaleY(1.2); }
  40%  { transform: translateX(-15%) translateY(8%) scaleY(0.85); }
  60%  { transform: translateX(-20%) translateY(-5%) scaleY(1.1); }
  80%  { transform: translateX(-10%) translateY(12%) scaleY(0.9); }
  100% { transform: translateX(0%) translateY(0%) scaleY(1); }
}

/* Wave 3 animation */
@keyframes waveMove3 {
  0%   { transform: translateX(0%) translateY(0%) scaleY(1); }
  15%  { transform: translateX(-8%) translateY(-15%) scaleY(1.25); }
  30%  { transform: translateX(-18%) translateY(10%) scaleY(0.9); }
  50%  { transform: translateX(-28%) translateY(-12%) scaleY(1.1); }
  70%  { transform: translateX(-12%) translateY(8%) scaleY(0.95); }
  85%  { transform: translateX(-5%) translateY(-5%) scaleY(1.05); }
  100% { transform: translateX(0%) translateY(0%) scaleY(1); }
}



h3 {
    color: white !important;
    text-shadow: 0 0 8px #00cfff;
}

/* Muted Text */
.text-muted,
.text-secondary {
    color: #6699cc !important;
}

:root {
    --bs-body-color: unset;
}

/* Cards */
.card-lobby {
    background: rgba(0, 20, 50, 0.7) !important;
    border-radius: 20px !important;
    border: 1px solid rgba(0, 200, 255, 0.3) !important;
    box-shadow: 0 0 20px rgba(0, 200, 255, 0.2), 0 0 40px rgba(0, 120, 255, 0.2) !important;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card-lobby:hover {
    transform: translateY(-3px);
    box-shadow: 0 0 30px rgba(0, 200, 255, 0.4), 0 0 60px rgba(0, 120, 255, 0.4) !important;
}

/* Vuetify Text Field Styles */
:deep(.v-text-field) {
  background: rgba(0, 40, 80, 0.6);
  border-radius: 10px;
}

:deep(.v-text-field .v-field) {
  color: #c0f0ff;
  border-color: #00cfff;
}

:deep(.v-text-field .v-field__input) {
  color: #c0f0ff;
}

:deep(.v-text-field .v-label) {
  color: #6699cc;
}

/* Vuetify Button Styles */
:deep(.v-btn) {
  text-transform: none;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 200, 255, 0.3);
  transition: all 0.3s ease;
}

:deep(.v-btn:hover) {
  box-shadow: 0 0 20px rgba(0, 200, 255, 0.6);
}

/* Option Cards */
.option-card {
    background: rgba(0, 40, 80, 0.6);
    border-radius: 15px;
    border: 1px solid #00cfff;
    color: #c0f0ff;
    padding: 15px;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.option-card {
  position: relative;
  overflow: hidden; /* keep ripple inside */
}

.option-card::after {
  content: "";
  position: absolute;
  bottom: 0;           
  left: 50%;           
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  transform: translateX(-50%) scale(0); 
  transform-origin: bottom center;     
  transition: transform 0.3s ease, opacity 0.3s ease;
  pointer-events: none;
}

.option-card:hover::after {
  transform: translate(-50%, 50%)  scale(1.3); 
  opacity: 0.2;
}

/* Selected Option Cards */
input[name="boardSize"]:checked + .option-card,
input[name="playerColor"]:checked + .option-card {
    border: 2px solid #0077ff;
    box-shadow: 0 0 20px #00cfff, 0 0 40px #0077ff;
}

/* Checker Pieces */
.checker-icon {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    box-shadow: 0 0 10px #00cfff;
    transition: all 0.3s ease;
}

.checker-white {
    background: radial-gradient(circle at 30% 30%, #c5f6ff, #80ccf3);
    border: 1px solid #c0e0ff;
}

.checker-black {
    background: radial-gradient(circle at 30% 30%, #021d37, #00070f);
}

.checker-random {
    background: linear-gradient(90deg, #c5f6ff 50%, #00070f 50%);
    border: 1px solid #0077ff;
}

/* Buttons */
button.btn, button.btn-outline-primary {
    background: linear-gradient(135deg, #00cfff, #0077ff);
    color: #ffffff;
    font-weight: bold;
    padding: 10px 20px;
    border-radius: 15px;
    border: none;
    cursor: pointer;
    box-shadow: 0 0 15px #00cfff, 0 0 25px #0077ff;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

button.btn:hover {
    transform: scale(1.05);
    box-shadow: 0 0 25px #00cfff, 0 0 40px #0077ff;
}

button.btn::after {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    background: rgba(0, 255, 255, 0.2);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    transition: width 0.5s ease, height 0.5s ease, opacity 0.5s ease;
}

button.btn:active::after {
    width: 300px;
    height: 300px;
    opacity: 0.3;
}

/* Scope Radio Labels */
.form-check-label {
    cursor: pointer;
    transition: all 0.3s ease;
}

.form-check-input:checked + .form-check-label {
    color: #00cfff;
}

/* Water Background Animation */
body::after {
    content: '';
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: radial-gradient(circle at center, rgba(0, 100, 255, 0.1), transparent 70%);
    pointer-events: none;
    animation: waterFlow 10s linear infinite;
}

@keyframes waterFlow {
    0% { transform: translate(0,0) }
    50% { transform: translate(10px,10px) }
    100% { transform: translate(0,0) }
}

/* Misc Small Details */
.muted-sm {
    color: rgba(200, 240, 255, 0.6);
}

/* Form Inputs */
input.form-control {
    background: rgba(0, 100, 200, 0.1);
    border: 1px solid #00cfff;
    color: white;
    padding: 10px;
    border-radius: 15px;
    box-shadow: 0 0 10px rgba(0, 200, 255, 0.4);
    transition: all 0.3s ease;
    backdrop-filter: blur(4px);
    font-size: medium;
}

input.form-control:focus {
    border-color: #0077ff;
    box-shadow: 0 0 20px #00cfff, 0 0 40px #0077ff;
    outline: none;
    color: #0077ff;
}


input.form-control::placeholder {
    color: rgba(192, 240, 255, 0.5); /* light, watery color */
    transition: color 0.3s ease;
}

input.form-control:focus::placeholder {
    color: #0077ff; /* slightly stronger */
}   


.content {
  position: relative;
  text-align: center;
  padding-bottom: 36px;
}

.content h2 {
  font-size: clamp(4rem, 8vw, 6em);
  font-family: "Water Splash", sans-serif;
  font-weight: 900;
  margin: 0;
  line-height: 1;
  color: transparent;
  -webkit-text-stroke: 1px rgba(255, 255, 255, 0.92);
  text-shadow: 0 0 8px #00cfff;
  width: 100%;
  letter-spacing: clamp(-2px, -1vw, -8px);
}


/* Wave animation */
@keyframes animate {
  0%,
  100% {
    clip-path: polygon(
      0% 45%,
      16% 44%,
      33% 50%,
      54% 60%,
      70% 61%,
      84% 59%,
      100% 52%,
      100% 100%,
      0% 120%
    );
  }

  50% {
    clip-path: polygon(
      0% 60%,
      15% 65%,
      34% 66%,
      51% 62%,
      67% 50%,
      84% 45%,
      100% 46%,
      100% 100%,
      0% 150%
    );
  }
}

.rod {
  position: absolute;
  top: 0;
  left: 10%;
  width: 6px;
  height: 100px;
  background: #654321;
  transform-origin: top center;
  animation: swing 2s ease-in-out infinite alternate;
}
.line {
  position: absolute;
  top: 100px;
  left: 10%;
  width: 2px;
  height: 100px;
  background: #222;
  transform: translateX(-10%);
  transform-origin: top center;
}
.fish {
  position: absolute;
  top: 200%;
  transform: translateX(-50%) rotate(-90deg);
  transform-origin: top left;
  animation: bob 2s ease-in-out infinite alternate;
}
@keyframes bob {
  0% { transform: translateX(-50%) rotate(-70deg) translateY(0); }
  25% { transform: translateX(-40%) rotate(-80deg) translateY(2px); }
  50% { transform: translateX(-25%) rotate(-90deg) translateY(6px); }
  75% { transform: translateX(-15%) rotate(-100deg) translateY(6px); }
  100% { transform: translateX(-20%) rotate(-90deg) translateY(0); }
}
@keyframes swing {
  0% { transform: rotate(-10deg); }
  50% { transform: rotate(10deg); }
  100% { transform: rotate(-10deg); }
}
</style>
