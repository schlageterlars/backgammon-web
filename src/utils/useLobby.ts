import { useLobbyWebSocket } from "./useLobbyWebSocket"
import { useLocalLobby } from "@/utils/useLocalLobby"
import type { UseLobby } from "@/types/lobby-types"

export type LobbyMode = "online" | "offline"

export function useLobby(
  lobbyId: string,
  username: string | null,
  mode: LobbyMode
): UseLobby {
  return mode === "offline"
    ? useLocalLobby()
    : useLobbyWebSocket(lobbyId, username)
}
