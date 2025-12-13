import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    username: null as string | null
  }),
  actions: {
    setUsername(name: string) {
      this.username = name
    }
  },
  persist: true 
})