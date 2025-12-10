<template>
    <div>
  <div class="lobby">
  <StatusPanel
    v-if="lobbyState"
    :lobbyId="lobbyId"
    :state="lobbyState"
    @leave="leaveLobby"
  />
    <chat-window :messages="messages" @sendMessage="sendMessage" />
    <div v-if="gameState">
      <div id="game">
        <Board v-if="gameState.game" :board="gameState.game" :send-move="sendMove"/>
        </div>
      <div v-if="gameState.dice && gameState.dice.length">
        <h4>Dice:</h4>
        <ul class="dice-list">
          <li v-for="(d, i) in gameState.dice" :key="i">{{ d }}</li>
        </ul>
      </div>
    </div>
  </div>
</div>
</template>

<script lang="ts" setup>
import { useLobbyWebSocket, type BoardState } from '../utils/useLobbyWebSocket';
import ChatWindow from "./ChatWindow.vue";
import Board from './Board.vue' 
import { useRoute, useRouter } from 'vue-router'
import { onMounted } from 'vue'
import { useApi } from '@/utils/useApi'
import StatusPanel from "./StatusPanel.vue";


const route = useRoute();
const lobbyId = route.params.id as string;

const {
  username,
  fetchUsername,
} = useApi()

onMounted(async () => {
  console.log('Lobby ID:', lobbyId)
  fetchUsername()
})

// Call composable
const { messages, player, gameState, lobbyState, connected, sendMessage, sendMove, close } =
  useLobbyWebSocket(lobbyId, username);

const router = useRouter()
function leaveLobby() {
  close()
  router.push('/')
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
