<!-- src/components/Login.vue -->
<script setup lang="ts">
import { ref } from "vue";
import { auth, provider, signInWithPopup, signOut, onAuthStateChanged } from "../firebase";
import type { User } from "firebase/auth";

// Reactive user state
const user = ref<User | null>(null);

// Login with Google
const login = async (): Promise<void> => {
  try {
    await signInWithPopup(auth, provider);
  } catch (err) {
    console.error("Login error:", err);
  }
};

// Logout
const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (err) {
    console.error("Logout error:", err);
  }
};

// Track Firebase auth state
onAuthStateChanged(auth, (currentUser: User | null) => {
  user.value = currentUser;
});
</script>

<template>
  <div class="d-flex align-items-center gap-2 bg-light p-2 rounded shadow-sm">
    <div v-if="user" class="d-flex align-items-center gap-2">
      <span class="fw-bold" id="user_displayname">Welcome, {{ user.displayName }}</span>
      <button class="btn btn-outline-secondary btn-sm" @click="logout">Logout</button>
    </div>
    <div v-else>
      <button class="btn btn-primary btn-sm" @click="login">Login with Google</button>
    </div>
  </div>
</template>

<style scoped>
 #user_displayname {
  color: #021d37
 }
</style>
