import { ref } from 'vue'
import api from "@/api";

export function useApi() {
  const openLobbyCount = ref<number | null>(null)

  async function fetchLobbyCount() {
    const res = await api.get("/matchmaking/count");
    openLobbyCount.value = parseInt(res.data)
    return openLobbyCount.value
  }

  async function getOpenLobbyCount() {
    if (openLobbyCount.value === null) await fetchLobbyCount()
    return openLobbyCount.value
  }

  return {
    openLobbyCount,
    fetchLobbyCount,
    getOpenLobbyCount,
  }
}
