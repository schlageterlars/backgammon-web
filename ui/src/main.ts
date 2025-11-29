import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'

const app = createApp(App)

app.use(router)

app.mount('#app')
