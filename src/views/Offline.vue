<template>
  <div class="col-12 col-lg-8">
    <div class="card card-lobby p-4 text-center offline-card">
      <div class="d-flex flex-column align-items-center justify-content-center mb-3">
        <h3 class="mb-3">No network connection? No problem.</h3>
        <div class="muted-sm mb-4">
          You are currently offline. You can still play locally or try reconnecting.
        </div>
        <div class="d-flex gap-3">
          <!-- Play Local: offline-friendly, softer style -->
          <button class="btn btn-local" @click="playLocal">
            🎮 Play Local
          </button>
          <!-- Go Online: highlighted primary action -->
          <button class="btn btn-online" @click="tryGoOnline" :disabled="loading">
            🌐 {{ loading ? 'Trying...' : 'Go Online' }}
          </button>
        </div>
        <div v-if="!loading && !onlineState" class="text-warning mt-3">
          Still offline. Check your network or try again.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { online, goOnline } from "@/api";
import { useRouter } from "vue-router";

const router = useRouter()

const loading = ref(false);
const onlineState = online;

async function tryGoOnline() {
  loading.value = true;
  const delay = new Promise<void>((resolve) => setTimeout(resolve, 500));
  await Promise.all([goOnline(), delay]);
  loading.value = false;
}

function playLocal() {
    router.push("/play")
}
</script>

<style scoped>
.card-lobby.offline-card {
  background: linear-gradient(to top, rgba(0, 20, 50, 0.9), rgba(0, 40, 80, 0.8));
  border-radius: 20px;
  border: 1px solid rgba(0, 200, 255, 0.3);
  box-shadow: 0 0 25px rgba(0, 200, 255, 0.3), 0 0 50px rgba(0, 120, 255, 0.2);
  padding: 2.5rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card-lobby.offline-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 0 35px rgba(0, 200, 255, 0.5), 0 0 70px rgba(0, 120, 255, 0.4);
}

/* Local play button: softer, secondary style */
.btn-local {
  background: rgba(255, 255, 255, 0.1);
  color: #c0f0ff;
  border: 1px solid #00cfff;
  border-radius: 15px;
  padding: 10px 25px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-local:hover {
  background: rgba(0, 200, 255, 0.2);
  color: #ffffff;
  transform: scale(1.05);
  box-shadow: 0 0 15px #00cfff, 0 0 30px #0077ff;
}

/* Go online button: highlighted, primary style */
.btn-online {
  background: linear-gradient(135deg, #00cfff, #0077ff);
  color: #ffffff;
  font-weight: bold;
  padding: 10px 25px;
  border-radius: 15px;
  border: none;
  cursor: pointer;
  box-shadow: 0 0 15px #00cfff, 0 0 25px #0077ff;
  transition: all 0.3s ease;
}

.btn-online:hover {
  transform: scale(1.05);
  box-shadow: 0 0 25px #00cfff, 0 0 40px #0077ff;
}

/* Offline warning text */
.text-warning {
  color: #ffc107; /* yellowish warning */
  font-weight: bold;
}

/* Muted helper text */
.muted-sm {
  color: rgba(200, 240, 255, 0.7);
}
</style>
