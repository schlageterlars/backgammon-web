<!-- #web-comp: Demo Seite für alle Web Components -->
<template>
  <div class="demo-container">
    <h1>Web Components Demo</h1>
    
    <section class="demo-section">
      <h2>Vuetify Web Components (aus Library)</h2>
      <div class="component-showcase">
        <!-- #web-comp: Vuetify v-btn -->
        <v-btn color="primary">Vuetify Button</v-btn>
        
        <!-- #web-comp: Vuetify v-card -->
        <v-card class="ma-2 pa-4" max-width="300">
          <v-card-title>Vuetify Card</v-card-title>
          <v-card-text>Dies ist eine Vuetify v-card Web Component</v-card-text>
        </v-card>
        
        <!-- #web-comp: Vuetify v-text-field -->
        <v-text-field
          label="Vuetify Text Field"
          variant="outlined"
          class="ma-2"
        />
      </div>
    </section>
    
    <section class="demo-section">
      <h2>Custom Web Components (selbst erstellt)</h2>
      
      <div class="component-showcase">
        <div class="demo-item">
          <h3>Backgammon Dice</h3>
          <!-- #web-comp: Custom backgammon-dice Web Component -->
          <div class="dice-demo">
            <backgammon-dice :value="diceValue1" :theme="currentTheme" />
            <backgammon-dice :value="diceValue2" :theme="currentTheme" />
          </div>
          <v-btn @click="rollDice" class="mt-2">Würfeln</v-btn>
        </div>
        
        <div class="demo-item">
          <h3>Backgammon Checker</h3>
          <!-- #web-comp: Custom backgammon-checker Web Component -->
          <div class="checker-demo">
            <backgammon-checker 
              color="white" 
              :theme="currentTheme"
              :size="60"
              @checker-click="onCheckerClick"
            />
            <backgammon-checker 
              color="black" 
              :theme="currentTheme"
              :size="60"
              @checker-click="onCheckerClick"
            />
          </div>
          <p class="mt-2">{{ checkerMessage }}</p>
        </div>
        
        <div class="demo-item full-width">
          <h3>Backgammon Board</h3>
          <!-- #web-comp: Custom backgammon-board Web Component -->
          <backgammon-board 
            :board-size="boardSize"
            :theme="currentTheme"
            @point-click="onPointClick"
          />
          <p class="mt-2">{{ boardMessage }}</p>
        </div>
      </div>
      
      <div class="controls">
        <h3>Steuerung</h3>
        <v-select
          v-model="currentTheme"
          :items="themes"
          label="Theme"
          variant="outlined"
          class="mb-2"
        />
        <v-select
          v-model="boardSize"
          :items="boardSizes"
          label="Board Size"
          variant="outlined"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const diceValue1 = ref(1)
const diceValue2 = ref(6)
const currentTheme = ref('default')
const boardSize = ref('classic')
const checkerMessage = ref('Klicke auf einen Spielstein')
const boardMessage = ref('Klicke auf einen Point')

const themes = ['default', 'dark', 'ocean', 'desert', 'forest', 'classic-wood']
const boardSizes = ['small', 'medium', 'classic']

const rollDice = () => {
  diceValue1.value = Math.floor(Math.random() * 6) + 1
  diceValue2.value = Math.floor(Math.random() * 6) + 1
}

const onCheckerClick = (event: CustomEvent) => {
  checkerMessage.value = `${event.detail.color} Spielstein wurde angeklickt!`
}

const onPointClick = (event: CustomEvent) => {
  boardMessage.value = `Point ${event.detail.pointIndex} wurde angeklickt!`
}
</script>

<style scoped>
.demo-container {
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
  color: var(--text-color);
}

h1 {
  text-align: center;
  margin-bottom: 40px;
  color: #00cfff;
  text-shadow: 0 0 10px #00cfff;
}

.demo-section {
  margin-bottom: 60px;
  padding: 30px;
  background: rgba(0, 20, 50, 0.5);
  border-radius: 20px;
  border: 1px solid rgba(0, 200, 255, 0.3);
}

h2 {
  margin-bottom: 20px;
  color: #00cfff;
}

h3 {
  margin-bottom: 15px;
  color: #6699cc !important;
}

.component-showcase {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  margin-bottom: 20px;
}

.demo-item {
  flex: 1;
  min-width: 300px;
  padding: 20px;
  background: rgba(0, 40, 80, 0.4);
  border-radius: 15px;
  border: 1px solid #00cfff;
}

.demo-item.full-width {
  flex-basis: 100%;
}

.dice-demo,
.checker-demo {
  display: flex;
  gap: 20px;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.controls {
  margin-top: 30px;
  padding: 20px;
  background: rgba(0, 40, 80, 0.4);
  border-radius: 15px;
}

p {
  text-align: center;
  color: #c0f0ff;
  font-size: 14px;
}
</style>
