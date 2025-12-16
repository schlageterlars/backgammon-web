import axios from "axios";
import { ref } from "vue";

export const online = ref(false);

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 5000, 
});

console.log("Api URL:", api.defaults.baseURL);

async function checkOnline(): Promise<boolean> {
  if (!import.meta.env.VITE_API_URL) {
    console.warn("VITE_API_URL is not defined");
    online.value = false;
    return false;
  }

  if (!navigator.onLine) {
    console.warn("No network connection");
    online.value = false;
    return false;
  }

  try {
    await api.get("/");
    online.value = true;
    console.log("API is reachable");
  } catch (err: unknown) {
    online.value = false;

    if (axios.isAxiosError(err)) {
      if (err.response) {
        console.warn(`API responded with status ${err.response.status}`);
      } else if (err.request) {
        console.warn("No response from API. It may be down.");
      } else {
        console.warn("Axios error:", err.message);
      }
    } else if (err instanceof Error) {
      console.warn("Error:", err.message);
    } else {
      console.warn("Unknown error occurred while checking API");
    }
  }

  return online.value;
}

export async function goOnline(): Promise<boolean> {
  return await checkOnline();
}

window.addEventListener("online", () => {
  console.log("Browser is back online. Checking API...");
  goOnline();
});

window.addEventListener("offline", () => {
  console.log("Browser is offline");
  online.value = false;
});

goOnline()

export default api;