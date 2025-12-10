// #web-comp: Custom Web Component - backgammon-dice
// Eigene Web Component für Backgammon Würfel

class BackgammonDice extends HTMLElement {
  private value: number = 1
  private theme: string = 'default'
  
  static get observedAttributes() {
    return ['value', 'theme']
  }
  
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }
  
  connectedCallback() {
    this.render()
  }
  
  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue !== newValue) {
      if (name === 'value') {
        this.value = parseInt(newValue) || 1
      } else if (name === 'theme') {
        this.theme = newValue || 'default'
      }
      this.render()
    }
  }
  
  private render() {
    if (!this.shadowRoot) return
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          --dice-size: 60px;
        }
        
        .dice {
          width: var(--dice-size);
          height: var(--dice-size);
          background: #fff;
          border: 2px solid #333;
          border-radius: 10px;
          display: grid;
          grid-template: repeat(3, 1fr) / repeat(3, 1fr);
          padding: 8px;
          gap: 4px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
          transition: transform 0.3s ease;
        }
        
        .dice:hover {
          transform: scale(1.1);
        }
        
        .dice[data-theme="dark"] {
          background: #2a2a2a;
          border-color: #666;
        }
        
        .dice[data-theme="ocean"] {
          background: linear-gradient(135deg, #00a8cc, #005082);
          border-color: #ffd700;
        }
        
        .dice[data-theme="desert"] {
          background: linear-gradient(135deg, #f4a261, #e76f51);
          border-color: #5a3e2b;
        }
        
        .dice[data-theme="forest"] {
          background: linear-gradient(135deg, #2a9d8f, #264653);
          border-color: #f4f1de;
        }
        
        .dot {
          width: 12px;
          height: 12px;
          background: #333;
          border-radius: 50%;
          opacity: 0;
        }
        
        .dice[data-theme="dark"] .dot,
        .dice[data-theme="ocean"] .dot,
        .dice[data-theme="forest"] .dot {
          background: #fff;
        }
        
        .dice[data-theme="desert"] .dot {
          background: #5a3e2b;
        }
        
        /* Dot positions for each value */
        .dice[data-value="1"] .dot:nth-child(5) { opacity: 1; }
        
        .dice[data-value="2"] .dot:nth-child(1),
        .dice[data-value="2"] .dot:nth-child(9) { opacity: 1; }
        
        .dice[data-value="3"] .dot:nth-child(1),
        .dice[data-value="3"] .dot:nth-child(5),
        .dice[data-value="3"] .dot:nth-child(9) { opacity: 1; }
        
        .dice[data-value="4"] .dot:nth-child(1),
        .dice[data-value="4"] .dot:nth-child(3),
        .dice[data-value="4"] .dot:nth-child(7),
        .dice[data-value="4"] .dot:nth-child(9) { opacity: 1; }
        
        .dice[data-value="5"] .dot:nth-child(1),
        .dice[data-value="5"] .dot:nth-child(3),
        .dice[data-value="5"] .dot:nth-child(5),
        .dice[data-value="5"] .dot:nth-child(7),
        .dice[data-value="5"] .dot:nth-child(9) { opacity: 1; }
        
        .dice[data-value="6"] .dot:nth-child(1),
        .dice[data-value="6"] .dot:nth-child(3),
        .dice[data-value="6"] .dot:nth-child(4),
        .dice[data-value="6"] .dot:nth-child(6),
        .dice[data-value="6"] .dot:nth-child(7),
        .dice[data-value="6"] .dot:nth-child(9) { opacity: 1; }
      </style>
      
      <div class="dice" data-value="${this.value}" data-theme="${this.theme}">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
    `
  }
  
  // Public methods
  public roll(): number {
    this.value = Math.floor(Math.random() * 6) + 1
    this.setAttribute('value', this.value.toString())
    return this.value
  }
  
  public getValue(): number {
    return this.value
  }
  
  public setTheme(theme: string) {
    this.theme = theme
    this.setAttribute('theme', theme)
  }
}

// Register the custom element
customElements.define('backgammon-dice', BackgammonDice)

export default BackgammonDice
