<template>
  <v-dialog v-model="queueDialog" max-width="500" persistent>
    <v-card class="pa-6 text-center">

        <v-card-title class="d-flex align-center justify-center">
        <v-progress-circular
            indeterminate
            size="30"
            class="mr-3"
        ></v-progress-circular>
        Waiting for Opponent…
        </v-card-title>

        <v-card-text class="mt-4">
            <div class="mb-2">
                Please wait while we find the best match for you.
            </div>

            <v-chip-group
                class="d-flex justify-center"
                column
                :active-class="'v-chip--active'"
            >
                <v-chip color="primary" variant="tonal">Color: {{ playerColor }}</v-chip>
                <v-chip color="secondary" variant="tonal">Board: {{ boardSize }}</v-chip>
                <v-chip color="success" variant="tonal">Mode: {{ scope }}</v-chip>
            </v-chip-group>
        </v-card-text>

      <v-card-actions class="d-flex justify-center mt-4">
        <v-btn color="error" outlined @click="cancelQueue">
          Cancel
        </v-btn>
      </v-card-actions>

    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps({
  playerColor: { type: String, required: true },
  boardSize: { type: String, required: true },
  scope: { type: String, required: true },
  isQueueing: { type: Boolean, required: true },
})

const queueDialog = ref(props.isQueueing)

watch(
  () => props.isQueueing,
  (val) => {
    queueDialog.value = val
  }
)

const emit = defineEmits<{
  (e: 'update:isQueueing', value: boolean): void
}>()

function cancelQueue() {
  emit('update:isQueueing', false)
}
</script>