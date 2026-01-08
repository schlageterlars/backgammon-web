import './assets/main.css'
import './themes/themes.css'

// #web-comp: Import Custom Web Components
import './components/web-components'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// pinia
import { createPinia } from 'pinia'
import piniaPersist from 'pinia-plugin-persistedstate'
import { initAuth } from './firebase'


const vuetify = createVuetify({
  components,
  directives,
})

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPersist) 
app.use(pinia)

app.use(router)
app.use(vuetify)

await initAuth();

app.mount('#app')
