// useLobbyWebSocket.ts
import { ref, reactive, onMounted, onBeforeUnmount } from "vue";

export interface ChatMessage {
    type: string;
    user?: string;
    text?: string;
    timestamp?: string;
}

export interface BoardState {
    fields: number[];
    barWhite: number;
    barBlack: number;
}

export interface GameState {
    game: BoardState;
    dice?: number[];
    currentPlayer?: string;
}

export function useLobbyWebSocket(lobbyId: string, username: string) {
    const ws = ref<WebSocket | null>(null);
    const messages = reactive<ChatMessage[]>([]);
    const player = ref<string>("");
    const connected = ref(false);
    const gameState = ref<GameState | null>(null);

    const sendMessage = (text: string) => {
        if (ws.value && text.trim() !== "") {
            ws.value.send(
                JSON.stringify({
                    type: "ChatMessage",
                    user: username,
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

    const connect = () => {
        ws.value = new WebSocket(
            `ws://localhost:9000/lobby/${lobbyId}/ws?user=${encodeURIComponent(username)}`
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

            // Handle PlayerAssigned
            if (type === "PlayerAssigned") {
                player.value = content.color;
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

    onMounted(connect);

    onBeforeUnmount(() => {
        ws.value?.close();
    });

    return {
        ws,
        messages,
        player,
        connected,
        gameState,
        sendMessage,
        sendMove
    };
}
