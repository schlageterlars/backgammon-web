<template>
  <div class="lobby">
    <button class="leave-btn" @click="leaveLobby">
        ✖
    </button>
    <chat-window :messages="messages" @sendMessage="sendMessage" />
    <div v-if="player" class="badge" :class="player === 'White' ? 'bg-light text-dark' : 'bg-dark text-light'">
      You are {{ player.toUpperCase() }}
    </div>

    <div v-if="gameState">
      <div id="game" class="m-3">
        <Board v-if="gameState.game" :board="gameState.game" :send-move="sendMove"/>
        </div>
      <div v-if="gameState.dice && gameState.dice.length">
        <h4>Dice:</h4>
        <ul class="dice-list">
          <li v-for="(d, i) in gameState.dice" :key="i">{{ d }}</li>
        </ul>
      </div>
      <div>
        <strong>Current Player:</strong> {{ gameState.currentPlayer }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useLobbyWebSocket, BoardState } from '../utils/lobbyWebSocket';
import ChatWindow from "./ChatWindow.vue";
import Board from './Board.vue' 
import { useRoute, useRouter } from 'vue-router'
import { onMounted } from 'vue'

const route = useRoute();
const lobbyId = route.params.id as string;

onMounted(() => {
  console.log('Lobby ID:', lobbyId)
})

const username = "player1";

// Call composable
const { messages, player, gameState, connected, sendMessage, sendMove } =
  useLobbyWebSocket(lobbyId, username);

const board: BoardState | null = gameState.game

const router = useRouter()
function leaveLobby() {
  router.push("/")
}
</script>


<style scoped>
.leave-btn {
  position: absolute;
  top: 16px;
  right: 16px;

  padding: 8px 16px;
  font-size: 14px;

  background: #b33;
  color: white;
  border: none;
  border-radius: 6px;

  cursor: pointer;
  transition: background 0.2s;
}

.leave-btn:hover {
  background: #922;
}

.lobby {
  position: relative;
  height: 100vh;
background: linear-gradient(
  135deg,
  #f0e4c2 0%,
  #e3d2a3 25%,
  #d4bc87 50%,
  #c9a971 75%,
  #b8925b 100%
);

  overflow: hidden; 
}

/* Noise layer */
.lobby::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.5;         
  mix-blend-mode: multiply;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.5' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 200px 200px;
}
.dice-list {
  display: flex;
  gap: 8px;
  list-style: none;
  padding: 0;
}
</style>
