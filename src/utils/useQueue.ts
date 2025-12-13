// useQueue.ts (Composable)
import { ref, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from '@/utils/toast'
import api from "@/api";
import axios from 'axios';

export function useQueue(
  username: string | null,
  playerColor: Ref<string>,
  boardSize: Ref<string>,
  scope: Ref<string>
) {
  const router = useRouter()
  const isQueueing = ref(false)
  const joinCode = ref('')

  async function joinQueue() {
    const startTime = new Date().toISOString()

    try {
      console.log(`[${startTime}] Sending join-queue request for player:`, playerColor.value)

      const socket = new WebSocket(`ws://localhost:9000/queue-ws`)

      socket.onopen = () => {
        console.log(`[${startTime}] WebSocket connected`)
        isQueueing.value = true

        const joinQueueMsg = {
          playerId: username,
          options: {
            player: playerColor.value,
            boardSize: boardSize.value,
            scope: scope.value
          }
        }

        socket.send(JSON.stringify(joinQueueMsg))
      }

      socket.onmessage = (event) => {
        const msg = JSON.parse(event.data)
        console.log(`[${startTime}] WebSocket message received:`, msg)

        if (msg.type === 'matchFound') {
          console.log(`[${startTime}] Lobby found, navigating to /lobby/${msg.lobbyId}`)
          router.push(`/lobby/${msg.lobbyId}`)
          socket.close()
        }
      }

      socket.onerror = (err) => {
        console.error('WebSocket error:', err)
      }

      socket.onclose = () => {
        isQueueing.value = false
        console.log(`[${startTime}] WebSocket closed`)
      }
    } catch (err) {
      console.error('Error joining queue:', err)
    } finally {
      isQueueing.value = false
    }
  }

  async function joinOrQueue() {
    if (scope.value === 'Public') {
      joinQueue()
    } else {
      createLobby(new URLSearchParams({
        player: playerColor.value,
        boardSize: boardSize.value,
        scope: scope.value
      }))
    }
  }

  async function createLobby(formData: URLSearchParams) {
    try {
      const response = await api.post("/lobby", formData);
      const lobbyId = response.data.lobbyId;

      if (!lobbyId) {
        throw new Error("Backend did not return a lobbyId.");
      }
      showToast(`${lobbyId} successfully created!`, "success");
      router.push(`/lobby/${lobbyId}`);

    } catch (err) {
      console.error("Create lobby failed:", err);;

      if (axios.isAxiosError(err)) {
        const backendMsg = err.response?.data?.error || "Backend error";
        showToast(`Could not create lobby: ${backendMsg}`, "danger");
      } else {
        showToast("Could not contact server. Check your connection.", "danger");
      }
    }
  }

  function joinLobby() {
    if (joinCode.value.trim() === '') {
      showToast('Please enter a lobby code', 'warning')
      return
    }

    router.push(`/lobby/${joinCode.value}`)
  }

  return {
    isQueueing,
    joinCode,
    joinQueue,
    joinOrQueue,
    joinLobby
  }
}
