import { ref, onMounted, type Ref, reactive } from "vue"
import { ControllerJS } from "@/assets/backgammon-opt.min.js";
import type { GameState, UseLobby } from "@/types/lobby-types";

export function useLocalLobby(): UseLobby {
  const connected = ref(true) // always "connected" offline
  const player = ref<string>("local")
  const lobbyState = ref(null) // explicitly unused
  const messages = reactive([]) // unused

  const gameState: Ref<GameState | null> = ref(null)

  /** 🔁 Pull fresh state from Scala.js */
  const updateGameState = () => {
    const controller = ControllerJS

    gameState.value = {
      game: {
        fields: controller.getFields(),
        barWhite: controller.getBarWhite(),
        barBlack: controller.getBarBlack()
      },
      dice: controller.getDice(),
      currentPlayer: controller.getCurrentPlayer()
    }
    console.log(gameState.value)
    console.log(controller.getFields())
  }

  /** 🎯 Replacement for WebSocket sendMove */
  const sendMove = (from: number, to: number) => {
    ControllerJS.doMove(from, to)
    updateGameState()
  }

  const close = () => { }
  const sendMessage = (text: string) => { }

  /** 🚀 Initialize game engine */
  onMounted(() => {
    ControllerJS.init()
    updateGameState()
  })

  return {
    messages,
    player,
    connected,
    gameState,
    lobbyState,
    sendMessage,
    sendMove,
    close
  };
}
