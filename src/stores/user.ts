import { defineStore } from 'pinia'

export const useUserStore = defineStore("user", {
  state: () => ({
    username: "",
    isAnonymous: true,
    uid: ""
  }),
  actions: {
    setUsername(name: string) {
      this.username = name;
    },
    setAnonymous(value: boolean) {
      this.isAnonymous = value;
    },
    setUid(value: string) {
      this.uid = value;
    }
  }
});