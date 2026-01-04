<template>
  <!-- #web-comp: Vuetify v-card, v-toolbar, v-list Web Components -->
  <v-card class="chat-container">
    <v-toolbar color="primary" density="compact" @click="toggleOpen">
      <v-toolbar-title>Chat</v-toolbar-title>
    </v-toolbar>

    <div class="chat-body" v-show="isOpen">
      <v-list class="messages" ref="messagesDiv">
        <v-list-item v-for="(msg, index) in messages" :key="index" class="message">
          <template v-if="msg.type === 'chat'">
            <strong class="user">{{ msg.user }}:</strong> {{ msg.text }}
            <span class="timestamp">{{ msg.timestamp }}</span>
          </template>
          <template v-else-if="msg.type === 'system'">
            <em>{{ msg.text }}</em>
          </template>
        </v-list-item>
      </v-list>

      <!-- #web-comp: Vuetify v-text-field with append button -->
      <div class="chat-input pa-2">
        <v-text-field
          v-model="chatInput"
          @keypress.enter="handleSend"
          placeholder="Type a message..."
          variant="outlined"
          density="compact"
          hide-details
        >
          <template v-slot:append-inner>
            <v-btn @click="handleSend" color="primary" size="small">Send</v-btn>
          </template>
        </v-text-field>
      </div>
    </div>
  </v-card>
</template>

<script lang="ts">
import { defineComponent, ref, watch, nextTick } from "vue";
import type { ChatMessage } from "@/types/lobby-types"

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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2) !important;
  border-radius: 10px !important;
  background-color: var(--chat-background) !important;
  border: 1px solid var(--chat-border) !important;
  z-index: 1000;
  color: var(--text-color);
}

[data-theme="classic-wood"] .chat-container {
  background-color: #f8f9fa !important;
  border: none !important;
  color: grey;
}

.chat-container :deep(.v-toolbar) {
  background: var(--button-primary) !important;
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
  background: transparent !important;
}

.messages :deep(.v-list-item) {
  min-height: auto;
  padding: 4px 8px;
}

.message {
  margin-bottom: 4px;
}

.chat-input {
  padding: 8px;
}

.chat-input :deep(.v-text-field) {
  background: transparent;
}

.timestamp {
  font-size: 0.75rem;
  color: gray;
  margin-left: 4px;
}
</style>
