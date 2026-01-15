<template>
  <div
    class="status-panel"
    :style="{ top: top + 'px', right: right + 'px', position: 'absolute' }"
    @mousedown="startDrag"
  >
    <div class="leave-container">
      <span class="lobby-id" @click.stop="copyLobbyId">
        {{ state ? `Lobby: ${lobbyId}` : 'Local Game' }}
      </span>
      <button class="leave-btn" @click="$emit('leave')">✖</button>
    </div>

      <div class="players-container" v-if="state">
        <div class="player-card" :class="{ 'active-turn': isWhiteTurn }">
          <div class="color-dot bg-white border border-gray-400"></div>
          <span class="username" @click="goToProfile(whitePlayer?.uid)">{{ whitePlayer?.name || 'Waiting...' }}</span>
          <span v-if="whitePlayer && !whitePlayer.connected" class="text-red-500"> (Disconnected)</span>
        </div>
        <div class="player-card" :class="{ 'active-turn': isBlackTurn }">
          <div class="color-dot bg-black"></div>
          <span class="username" @click="goToProfile(blackPlayer?.uid)">{{ blackPlayer?.name || 'Waiting...' }}</span>
          <span v-if="blackPlayer && !blackPlayer.connected" class="text-red-500"> (Disconnected)</span>
        </div>
      </div>

      <div
        v-if="timeLeftSeconds !== null"
        class="timer"
        :class="{
          'timer-left': isWhiteTurn,
          'timer-right': isBlackTurn
        }"
      >
        ⏱ {{ timeLeftSeconds }}s
      </div>
  </div>
</template>

<script setup lang="ts">
import type { LobbyState } from '@/types/lobby-types'
import { showToast } from '@/utils/toast'
import { useRouter } from 'vue-router'

const router = useRouter()

const goToProfile = (uid?: string) => {
  if (uid) {
    router.push(`/profile/${uid}`)
  } else {
    console.warn('User UID not available')
  }
}
</script>


<script lang="ts">

export default {
  components: {},
  props: {
    lobbyId: { type: String, required: true },
    currentPlayer: {type: String},
    timeLeftSeconds: {
      type: Number as () => number | null,
      default: null
    },  
    state: {
      type: Object as () => LobbyState | null,
      required: false,
      default: null
    }
  },
  data() {
    return {
      isDragging: false,
      startX: 0,
      startY: 0,
      right: 20, // distance from the right
      top: 20
    };
  },
  computed: {
    whitePlayer() {
      return this.state?.white || null;
    },
    blackPlayer() {
      return this.state?.black || null;
    },
    gameStarted() {
      return this.state?.gameStarted ?? false;
    },
    isWaiting() {
      return !this.gameStarted;
    },
    isWhiteTurn() {
      return this.currentPlayer?.toLowerCase() === 'white';
    },
    isBlackTurn() {
      return this.currentPlayer?.toLowerCase() === 'black';
    }
  },
  methods: {
    copyLobbyId() {
      navigator.clipboard.writeText(this.lobbyId).then(() => showToast('Lobby ID copied!'));
    },
    startDrag(e: { clientX: number; clientY: number; }) {
      this.isDragging = true;
      this.startX = e.clientX;
      this.startY = e.clientY;
      document.addEventListener('mousemove', this.onDrag);
      document.addEventListener('mouseup', this.stopDrag);
    },
    onDrag(e: { clientX: number; clientY: number; }) {
      if (this.isDragging) {
        const dx = e.clientX - this.startX;
        const dy = e.clientY - this.startY;
        this.top += dy;
        this.right -= dx; // update right instead of left
        this.startX = e.clientX;
        this.startY = e.clientY;
      }
    },
    stopDrag() {
      this.isDragging = false;
      document.removeEventListener('mousemove', this.onDrag);
      document.removeEventListener('mouseup', this.stopDrag);
    }
  }
};
</script>

<style scoped>
.timer-left {
  text-align: start;
}

.timer-right {
  text-align: end;
}

.text-red-500 {
  color: #f56565; 
  font-size: 0.85em;
  font-weight: 500;
}
.status-panel {
  position: fixed;
  top: 20px;
  right: 20px;
  max-width: 330px;
  background: var(--status-background);
  border: 2px solid var(--status-border);
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.leave-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.lobby-id {
  font-weight: 600;
  color: var(--text-color);
  display: flex;
  font-size: 00.75rem;
  align-items: center;
  flex-shrink: 1; 
  display: block; 
  gap: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  user-select: none;
}

.copy-btn {
  background: transparent;
  border: none;
  color: #fff;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}
.copy-btn:hover {
  color: #ffd700;
}

.leave-btn {
  padding: 6px 12px;
  font-size: 14px;
  background: var(--button-danger, #b33);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.leave-btn:hover {
  background: var(--button-danger-hover, #922);
}

.players-container {
  display: flex;
  flex-wrap: wrap;  
  gap: 12px;             
}

.player-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 10px;
  flex: 1 1 0;
  background: var(--chat-background);
  border: 1px solid var(--chat-border);
  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  transition: all 0.3s ease;
}

.player-card.active-turn {
  border: 2px solid gold !important;
  box-shadow: 0 0 20px 1px rgba(255, 215, 0, 0.8) !important;
  background: rgba(255, 215, 0, 0.15);
  transform: scale(1.05);
}

.color-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
}
.status-box {
  padding: 8px;
  border-radius: 8px;
  background: rgba(255, 255, 0, 0.2);
  color: #fff;
  text-align: center;
  font-size: 14px;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.2);
}
.username {
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  color: var(--text-color);
}

.username:hover {
  transform: scale(1.01);
}
</style>