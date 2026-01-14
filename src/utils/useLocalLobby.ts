import { ref, onMounted, type Ref, reactive } from "vue"
import { ControllerJS } from "@/assets/backgammon-opt.min.js";
import type { GameState, UseLobby } from "@/types/lobby-types";

export function useLocalLobby(): UseLobby {
  const connected = ref(true) 
  const player = ref<string>("local")
  const lobbyState = ref(null) 
  const messages = reactive([])
  const timeLeftSeconds = ref<number | null>(null);


  const gameState: Ref<GameState | null> = ref(null)

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

  const sendMove = (from: number, to: number) => {
    ControllerJS.doMove(from, to)
    updateGameState()
  }

  const close = () => { }
  const sendMessage = (text: string) => { }

  onMounted(() => {
    ControllerJS.init()
    updateGameState()
  })

  return {
    timeLeftSeconds,
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
