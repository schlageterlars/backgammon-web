import { defineStore } from 'pinia'

export const useUserStore = defineStore("user", {
  state: () => ({
    username: "",
    isAnonymous: true
  }),
  actions: {
    setUsername(name: string) {
      this.username = name;
    },
    setAnonymous(value: boolean) {
      this.isAnonymous = value;
    }
  }
});