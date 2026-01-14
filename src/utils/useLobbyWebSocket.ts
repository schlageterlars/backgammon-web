// useLobbyWebSocket.ts
import { ref, reactive, onMounted, onBeforeUnmount } from "vue";
import type { ChatMessage, GameState, LobbyState, UseLobby } from "@/types/lobby-types"
import { auth } from "@/firebase";
import { showToast } from "./toast";

export function useLobbyWebSocket(lobbyId: string, username: string | null): UseLobby {
    const ws = ref<WebSocket | null>(null);
    const messages = reactive<ChatMessage[]>([]);
    const player = ref<string>("");
    const connected = ref(false);
    const gameState = ref<GameState | null>(null);
    const lobbyState = ref<LobbyState | null>(null);
    const timeLeftSeconds = ref<number | null>(null);

    const sendMessage = (text: string) => {
        if (ws.value && text.trim() !== "") {
            ws.value.send(
                JSON.stringify({
                    type: "ChatMessage",
                    text
                })
            );
        }
    };

    const sendMove = (from: number, to: number) => {
        if (ws.value) {
            ws.value.send(
                JSON.stringify({
                    type: "MoveMessage",
                    from: String(from),
                    to: String(to)
                })
            );
        }
    };

    const close = () => {
        console.log(`close ${ws}`)
        if (ws.value) {
            ws.value.close() 
            ws.value = null
        }   
    }

    const connect = async () => {
        if (ws.value) return

        const token = await auth.currentUser?.getIdToken();

        if (!token) {
            showToast("Authentication required to connect.", "danger");
            return;
        }

        ws.value = new WebSocket(
            `ws://localhost:9000/lobby/${lobbyId}/ws?token=${encodeURIComponent(token)}`
        );

        ws.value.onopen = () => {
            connected.value = true;
            messages.push({ type: "system", text: "Connected to lobby!" });
        };

        ws.value.onmessage = (event) => {
            let data: any;
            try {
                data = JSON.parse(event.data);
            } catch {
                data = { message: event.data };
            }

            const type = data.type;
            const content = data.data;
            const timestamp = new Date(data.timestamp || Date.now()).toLocaleTimeString();

            // Handle GameUpdate
            if (type === "GameUpdate") {
                gameState.value = {
                    game: content.game,
                    dice: content.dice,
                    currentPlayer: content.currentPlayer
                };
            }

            // Handle LobbyUpdate
            if (type === "LobbyUpdate") {
                lobbyState.value = {
                    white: content.white,
                    black: content.black,
                    gameStarted: content.gameStarted
                };
            }

            if (type == "TimerTick") {
                timeLeftSeconds.value = content.seconds;
            }

            // Handle PlayerAssigned
            if (type === "PlayerAssigned") {
                player.value = content.color;
            }

            if (type == "ServerInfo") {
                messages.push({
                    type: "system",
                    text: content.text,
                    timestamp
                });
            }

            // Handle ChatBroadcast
            if (type === "ChatBroadcast") {
                messages.push({
                    type: "chat",
                    user: content.user,
                    text: content.text,
                    timestamp
                });
            }
        };

        ws.value.onclose = () => {
            connected.value = false;
            messages.push({ type: "system", text: "WebSocket closed." });
        };
    };

    onMounted(() => {
        connect();
    });
    onBeforeUnmount(() => {
        ws.value?.close();
    });

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
