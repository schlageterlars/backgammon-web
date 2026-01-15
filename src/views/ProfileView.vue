<template>
    <button class="btn-back" @click="goBack">
        <i class="bi bi-arrow-left"></i> Back
    </button>
    <main class="container py-5">
        <div class="position-fixed top-0 end-0 m-3 d-flex flex-column gap-2">
            <Login />
        </div>
        <!-- Profile Header -->
        <div class="profile-header text-center mb-5">
            <div class="content">
                <h2 class="profile-title">{{ username }}</h2>
            </div>
            <div class="profile-meta mt-2">
                <span class="meta-label">Created </span>
                <span class="meta-value">{{ creationTime }}</span>
            </div>
        </div>


        <!-- Game History -->
        <div class="row justify-content-center">
            <div class="col-12 col-lg-8">
                <div class=" p-4">
                    <h3 class="mb-3">Game History</h3>
                    <table class="game-history-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Date</th>
                                <th>Opponent</th>
                                <th>Result</th>
                                <th>Board Size</th>
                                <th>Scope</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(game, index) in paginatedGames" :key="game.lobbyId" class="table-row">
                                <td>{{ startIndex + index + 1 }}</td>
                                <td>{{ formatDate(game.endedAt) }}</td>
                                <td>{{ game.opponentName }}</td>
                                <td :class="resultClass(game.won ?? false)">{{ game.won ? "Win" : 'Lose' }}</td>
                                <td>{{ game.boardSize }}</td>
                                <td>{{ game.scope }}</td>
                            </tr>
                        </tbody>
                    </table>


                    <!-- Pagination -->
                    <div class="d-flex justify-content-between mt-3">
                        <button class="btn btn-outline-primary" @click="prevPage"
                            :disabled="currentPage === 1">Prev</button>
                        <div class="text-white">Page {{ currentPage }} / {{ totalPages }}</div>
                        <button class="btn btn-outline-primary" @click="nextPage"
                            :disabled="currentPage === totalPages">Next</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="wave wave-1"></div>
        <div class="wave wave-2"></div>
        <div class="wave wave-3"></div>

    </main>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useApi, type GameSummary } from '@/utils/useApi'
import { useRoute } from 'vue-router'
import Login from './Login.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
    router.back()
}


// Get uid from route param
const route = useRoute()
const uid = route.params.uid as string

// Username & games
const username = ref("...")
const creationTime = ref("...")
const lastSignInTime = ref("...")
const games = ref([] as GameSummary[])

// Pagination
const currentPage = ref(1)
const itemsPerPage = 5
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage)
const paginatedGames = computed(() => games.value.slice(startIndex.value, startIndex.value + itemsPerPage))
const totalPages = computed(() => Math.ceil(games.value.length / itemsPerPage))

// API
const {fetchUser, fetchUserGames} = useApi()

onMounted(async () => {
    // Optionally fetch real username (if uid != username)
    const userInfo = await fetchUser(uid)
    username.value = userInfo.username
    creationTime.value = new Date(userInfo.creationTime).toLocaleString()
    lastSignInTime.value = new Date(userInfo.lastSignInTime).toLocaleString()

    // Fetch game history
    games.value = await fetchUserGames(uid)
})

// Pagination methods
const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++ }
const prevPage = () => { if (currentPage.value > 1) currentPage.value-- }

// Helpers
const formatDate = (ms?: number | string) => {
  if (!ms) return ''
  const d = new Date(+ms)
  return d.toLocaleDateString() + ', ' + d.toLocaleTimeString()
}

const resultClass = (result: Boolean) => {
    return {
        'text-success': result,
        'text-danger': !result,
    }
}
</script>

<style scoped>
.btn-back {
    position: fixed;
    top: 20px;
    left: 20px;
    background: linear-gradient(135deg, rgba(0, 207, 255, 0.7) 0%, rgba(0, 119, 255, 0.7) 100%);
    color: #fff;
    font-weight: bold;
    padding: 8px 16px;
    border-radius: 15px;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.3s ease;
    z-index: 1000;
}

.btn-back:active {
    transform: scale(0.7);
}

.btn-back i {
    font-size: 1rem;
}

h3 {
    color: white !important;
    text-shadow: 0 0 8px #00cfff;
}

h2 {
    font-size: clamp(3rem, 8vw, 5em);
    font-family: "Water Splash", sans-serif;
    font-weight: 500;
    margin: 0;
    line-height: 1;
    color: transparent;
    -webkit-text-stroke: 1px rgba(255, 255, 255, 0.92);
    text-shadow: 0 0 8px #00cfff;
    width: 100%;
    letter-spacing: clamp(-2px, -1vw, -8px);
}

/* Game History Table */
.game-history-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    background: rgba(0, 20, 50, 0.6);
    /* semi-transparent dark card */
    border: 1px solid rgba(0, 200, 255, 0.4);
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 0 20px rgba(0, 200, 255, 0.3), 0 0 40px rgba(0, 120, 255, 0.3);
    transition: all 0.3s ease;
}

.game-history-table thead tr {
    background: rgba(0, 50, 120, 0.7);
    color: #00cfff;
    text-align: left;
}

.game-history-table thead th {
    padding: 12px 15px;
    font-weight: bold;
    font-family: "Orbitron", sans-serif;
    font-size: 0.9rem;
    letter-spacing: 0.5px;
    border-bottom: 1px solid rgba(0, 200, 255, 0.4);
}

.game-history-table tbody td {
    padding: 12px 15px;
    color: #c0f0ff;
    font-weight: 500;
    font-family: "Orbitron", sans-serif;
    font-size: 0.85rem;
    border-bottom: 1px solid rgba(0, 200, 255, 0.2);
}

.table-row:hover {
    background: rgba(0, 150, 255, 0.1);
    box-shadow: inset 0 0 10px rgba(0, 200, 255, 0.3);
    cursor: default;
    transition: all 0.3s ease;
}

/* Result Colors */
.text-success {
    color: #2cff00;
    font-weight: bold;
    text-shadow: 0 0 10px #00cfff;

}

.text-danger {
    color: #ff3b3b;
    font-weight: bold;
}

.text-warning {
    color: #ffd500;
    font-weight: bold;
}

/* Rounded first/last cells for neon style */
.game-history-table th:first-child,
.game-history-table td:first-child {
    border-top-left-radius: 15px;
    border-bottom-left-radius: 15px;
}

.game-history-table th:last-child,
.game-history-table td:last-child {
    border-top-right-radius: 15px;
    border-bottom-right-radius: 15px;
}

/* Keep the same card/wave styles as before */
.card-lobby {
    background: rgba(0, 20, 50, 0.7);
    border-radius: 20px;
    border: 1px solid rgba(0, 200, 255, 0.3);
    box-shadow: 0 0 20px rgba(0, 200, 255, 0.2), 0 0 40px rgba(0, 120, 255, 0.2);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card-lobby:hover {
    transform: translateY(-3px);
    box-shadow: 0 0 30px rgba(0, 200, 255, 0.4), 0 0 60px rgba(0, 120, 255, 0.4);
}

.text-shadow {
    text-shadow: 0 0 8px #00cfff;
}

.text-cyan {
    color: #00cfff;
}


.wave {
    position: fixed;
    left: 0;
    bottom: -10%;
    width: 200%;
    height: 10%;
    background: rgba(255, 255, 255, 0.2);
    z-index: -1;
    border-radius: 100% 50% 50% 100% / 50% 50% 50% 50%;
    /* wavy shape */
    animation: waveMove 6s linear infinite;
}

/* Wave variations */
/* Individual waves with unique motion */
.wave-1 {
    height: 18%;
    background: rgba(0, 190, 255, 0.3);
    animation: waveMove1 6s linear infinite;
}

.wave-2 {
    height: 30%;
    background: rgba(0, 70, 110, 0.3);
    animation: waveMove2 8s linear infinite;
}

.wave-3 {
    height: 40%;
    background: rgba(0, 90, 110, 0.3);
    animation: waveMove3 10s linear infinite;
}

/* Wave 1 animation */
@keyframes waveMove1 {
    0% {
        transform: translateX(0%) translateY(0%) scaleY(1);
    }

    25% {
        transform: translateX(-10%) translateY(-8%) scaleY(1.1);
    }

    50% {
        transform: translateX(-25%) translateY(5%) scaleY(0.9);
    }

    75% {
        transform: translateX(-15%) translateY(-10%) scaleY(1.05);
    }

    100% {
        transform: translateX(0%) translateY(0%) scaleY(1);
    }
}

/* Wave 2 animation */
@keyframes waveMove2 {
    0% {
        transform: translateX(0%) translateY(0%) scaleY(1);
    }

    20% {
        transform: translateX(-5%) translateY(-12%) scaleY(1.2);
    }

    40% {
        transform: translateX(-15%) translateY(8%) scaleY(0.85);
    }

    60% {
        transform: translateX(-20%) translateY(-5%) scaleY(1.1);
    }

    80% {
        transform: translateX(-10%) translateY(12%) scaleY(0.9);
    }

    100% {
        transform: translateX(0%) translateY(0%) scaleY(1);
    }
}

/* Wave 3 animation */
@keyframes waveMove3 {
    0% {
        transform: translateX(0%) translateY(0%) scaleY(1);
    }

    15% {
        transform: translateX(-8%) translateY(-15%) scaleY(1.25);
    }

    30% {
        transform: translateX(-18%) translateY(10%) scaleY(0.9);
    }

    50% {
        transform: translateX(-28%) translateY(-12%) scaleY(1.1);
    }

    70% {
        transform: translateX(-12%) translateY(8%) scaleY(0.95);
    }

    85% {
        transform: translateX(-5%) translateY(-5%) scaleY(1.05);
    }

    100% {
        transform: translateX(0%) translateY(0%) scaleY(1);
    }
}
</style>
