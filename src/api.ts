import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

console.log("Api URL:", api.defaults.baseURL);

export default api;