<!-- src/components/Login.vue -->
<script setup lang="ts">
import { computed, ref } from "vue";
import { auth, provider, signInWithPopup, signOut } from "../firebase";
import { linkWithPopup,  } from "firebase/auth";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();

const username = computed(() => userStore.username);
const isAnonymous = computed(() => userStore.isAnonymous);

// Login with Google
const login = async (): Promise<void> => {
  try {
    const user = auth.currentUser;

    if (user && user.isAnonymous) {
      await linkWithPopup(user, provider);
    } else {
      await signInWithPopup(auth, provider);
    }
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
</script>

<template>
  <div class="d-flex align-items-center gap-2 bg-light p-2 rounded shadow-sm">
    <div v-if="!isAnonymous" class="d-flex align-items-center gap-2">
      <span class="fw-bold" id="user_displayname">Welcome, {{ username }}</span>
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
