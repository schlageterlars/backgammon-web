import type { Ref } from "vue"

/* ──────────────────────────────
   Chat
────────────────────────────── */

export interface ChatMessage {
  type: "system" | "chat"
  user?: string
  text?: string
  timestamp?: string
}

/* ──────────────────────────────
   Game state
────────────────────────────── */

export interface BoardState {
  fields: number[]
  barWhite: number
  barBlack: number
}

export interface GameState {
  game: BoardState
  dice?: number[]
  currentPlayer?: string
}

/* ──────────────────────────────
   Lobby
────────────────────────────── */

export interface User {
  name: string
  connected: boolean
}

export interface LobbyState {
  white?: User
  black?: User
  gameStarted: boolean
}

/* ──────────────────────────────
   Composable contract
────────────────────────────── */

export interface UseLobby {
  messages: ChatMessage[]
  player: Ref<string>
  gameState: Ref<GameState | null>
  lobbyState: Ref<LobbyState | null>
  connected: Ref<boolean>

  sendMessage(text: string): void
  sendMove(from: number, to: number): void
  close(): void
}
