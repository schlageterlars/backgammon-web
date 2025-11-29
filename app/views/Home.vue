<template>
  <main class="container py-5">
    <div class="text-center my-4">
      <h2>BACKGAMMON</h2>
    </div>

    <div class="row justify-content-center mb-4">
      <div class="col-12 col-md-10 col-lg-8">
        <input type="text" v-model="username" class="form-control"
               placeholder="Enter your name" required>
      </div>
    </div>

    <div class="row justify-content-center g-4 mt-4">

      <!-- Start a new game -->
      <div class="col-12 col-lg-8">
        <div class="card card-lobby p-4">

          <h3>Start a new game</h3>

          <form @submit.prevent="createLobby" class="row g-3">

            <!-- Board size -->
            <div class="col-12">
              <label>Board size</label>
              <div class="row row-cols-1 row-cols-sm-3 g-3">
                <div class="col" v-for="size in boardSizes" :key="size.value">
                  <input type="radio" :id="size.value" name="boardSize"
                         :value="size.value" v-model="boardSize">
                  <label :for="size.value">{{ size.label }}</label>
                </div>
              </div>
            </div>

            <!-- Player color -->
            <div class="col-12">
              <label>Your play as</label>
              <div class="row row-cols-3 g-3">
                <div class="col" v-for="color in playerColors" :key="color.value">
                  <input type="radio" :id="color.value" name="playerColor"
                         :value="color.value" v-model="playerColor">
                  <label :for="color.value">{{ color.label }}</label>
                </div>
              </div>
            </div>

            <!-- Scope -->
            <div class="col-12">
              <label>Scope</label>
              <div>
                <label v-for="s in scopes" :key="s.value">
                  <input type="radio" name="scope" :value="s.value" v-model="scope">
                  {{ s.label }}
                </label>
              </div>
            </div>

            <!-- Create Button -->
            <div class="col-12">
              <button type="submit" class="btn btn-primary">
                {{ createButtonText }}
              </button>
            </div>

          </form>
        </div>
      </div>

    </div>
  </main>
</template>

<script>
export default {
  name: "Home",
  data() {
    return {
      username: "",               // binds to the input
      boardSize: "Classic",
      playerColor: "White",
      scope: "Public",
      boardSizes: [
        { value: "Small", label: "Small" },
        { value: "Medium", label: "Medium" },
        { value: "Classic", label: "Classic" }
      ],
      playerColors: [
        { value: "White", label: "White" },
        { value: "Black", label: "Black" },
        { value: "Random", label: "Random" }
      ],
      scopes: [
        { value: "Public", label: "Public" },
        { value: "Private", label: "Private" }
      ]
    }
  },
  computed: {
    createButtonText() {
      return this.scope === "Public" ? "Quick Join" : "Create Lobby"
    }
  },
  methods: {
    async createLobby() {
      if (!this.username) return alert("Enter your username");

      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;

      const response = await fetch("/lobby", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Csrf-Token": csrfToken
        },
        body: new URLSearchParams({
          player: this.playerColor,
          boardSize: this.boardSize,
          scope: this.scope
        })
      });

      if (response.redirected) {
        const url = new URL(response.url);
        const lobbyId = url.pathname.split("/").pop();
        this.$router.push(`/lobby/${lobbyId}`);
      } else {
        alert(await response.text());
      }
    }
  },
  mounted() {
    // Optionally initialize username from session
    const initialUsername = window.INIT_USERNAME || "";
    if (initialUsername) this.username = initialUsername;
  }
}
</script>
