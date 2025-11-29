<template>
  <div class="chat-container">
    <div class="chat-header" @click="toggleOpen">
      Chat
    </div>

    <div class="chat-body" v-show="isOpen">
      <div class="messages" ref="messagesDiv">
        <div v-for="(msg, index) in messages" :key="index" class="message">
          <template v-if="msg.type === 'chat'">
            <strong class="user">{{ msg.user }}:</strong> {{ msg.text }}
            <span class="timestamp">{{ msg.timestamp }}</span>
          </template>
          <template v-else-if="msg.type === 'system'">
            <em>{{ msg.text }}</em>
          </template>
        </div>
      </div>

      <div class="chat-input">
        <input
          v-model="chatInput"
          @keypress.enter="handleSend"
          placeholder="Type a message..."
        />
        <button @click="handleSend">Send</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, nextTick } from "vue";
import type { ChatMessage } from "./useLobbyWebSocket";

export default defineComponent({
  name: "ChatWindow",
  props: {
    messages: {
      type: Array as () => ChatMessage[],
      required: true
    }
  },
  emits: ["sendMessage"],
  setup(props, { emit }) {
    const chatInput = ref("");
    const messagesDiv = ref<HTMLDivElement | null>(null);
    const isOpen = ref(true);

    const handleSend = () => {
      if (chatInput.value.trim() !== "") {
        emit("sendMessage", chatInput.value);
        chatInput.value = "";
      }
    };

    const toggleOpen = () => {
      isOpen.value = !isOpen.value;
    };

    watch(
      () => props.messages.length,
      async () => {
        await nextTick();
        if (messagesDiv.value) {
          messagesDiv.value.scrollTop = messagesDiv.value.scrollHeight;
        }
      }
    );

    return { chatInput, handleSend, messagesDiv, isOpen, toggleOpen };
  }
});
</script>

<style scoped>

.user {
    color: var(--bs-primary);
}

.chat-container {
  position: fixed;
  right: 20px;
  bottom: 20px;
  width: 300px;
  max-height: 500px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  overflow: hidden;
  background-color: #f8f9fa;
  z-index: 1000;
  color: grey !important;
}

.chat-header {
  background-color: #0d6efd;
  color: white;
  padding: 10px;
  font-weight: bold;
  text-align: center;
  cursor: pointer;
  user-select: none;
}

.chat-body {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.message {
  margin-bottom: 4px;
}

.chat-input {
  display: flex;
  gap: 4px;
  padding: 4px;
}

.chat-input input {
  flex: 1;
}

.timestamp {
  font-size: 0.75rem;
  color: gray;
  margin-left: 4px;
}
</style>
