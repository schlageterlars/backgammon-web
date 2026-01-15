import { ref } from 'vue'
import api from "@/api";

export interface UserProfile {
  uid: string
  username: string
  creationTime: number
  lastSignInTime: number
}
export interface GameSummary {
  lobbyId: string
  endedAt?: number      
  won?: boolean
  color?: string
  scope?: string         
  boardSize?: string     
  opponentUid?: string
  opponentName?: string
}

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

  const fetchUserGames = async (uid: string, page = 1, pageSize = 5): Promise<GameSummary[]> => {
    const { data } = await api.get<GameSummary[]>(`/user/${uid}/games?page=${page}&pageSize=${pageSize}`)
    return data
  }

  const fetchUser = async (uid: string): Promise<UserProfile> => {
    const { data } = await api.get<UserProfile>(`/user/${uid}`)
    return data
  }

  return {
    fetchUser,
    fetchUserGames,
    openLobbyCount,
    fetchLobbyCount,
    getOpenLobbyCount,
  }
}
