// #web-comp: Web Components Registration
// Zentrale Datei zum Registrieren aller Custom Web Components

import './BackgammonDice'
import './BackgammonChecker'
import './BackgammonBoard'

// TypeScript Deklarationen für die Custom Elements
declare global {
  interface HTMLElementTagNameMap {
    'backgammon-dice': HTMLElement
    'backgammon-checker': HTMLElement
    'backgammon-board': HTMLElement
  }
}

export {}
