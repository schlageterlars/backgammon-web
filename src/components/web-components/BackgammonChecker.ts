// #web-comp: Custom Web Component - backgammon-checker
// Eigene Web Component für Backgammon Spielsteine

class BackgammonChecker extends HTMLElement {
  private color: 'white' | 'black' = 'white'
  private size: number = 50
  private selected: boolean = false
  private theme: string = 'default'
  
  static get observedAttributes() {
    return ['color', 'size', 'selected', 'theme']
  }
  
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }
  
  connectedCallback() {
    this.render()
    this.addEventListeners()
  }
  
  disconnectedCallback() {
    this.removeEventListeners()
  }
  
  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue !== newValue) {
      switch (name) {
        case 'color':
          this.color = (newValue === 'black' ? 'black' : 'white')
          break
        case 'size':
          this.size = parseInt(newValue) || 50
          break
        case 'selected':
          this.selected = newValue === 'true' || newValue === ''
          break
        case 'theme':
          this.theme = newValue || 'default'
          break
      }
      this.render()
    }
  }
  
  private addEventListeners() {
    const checker = this.shadowRoot?.querySelector('.checker')
    checker?.addEventListener('click', this.handleClick.bind(this))
  }
  
  private removeEventListeners() {
    const checker = this.shadowRoot?.querySelector('.checker')
    checker?.removeEventListener('click', this.handleClick.bind(this))
  }
  
  private handleClick() {
    this.dispatchEvent(new CustomEvent('checker-click', {
      detail: { color: this.color },
      bubbles: true,
      composed: true
    }))
  }
  
  private getGradient(): string {
    if (this.color === 'white') {
      switch (this.theme) {
        case 'dark':
          return 'radial-gradient(circle at 30% 30%, #e0e0e0, #a0a0a0)'
        case 'ocean':
          return 'radial-gradient(circle at 30% 30%, #ffd700, #ffb700)'
        case 'desert':
          return 'radial-gradient(circle at 30% 30%, #fffbeb, #fef3c7)'
        case 'forest':
          return 'radial-gradient(circle at 30% 30%, #f4f1de, #e0d3b8)'
        default:
          return 'radial-gradient(circle at 30% 30%, #fff, #cfcfcf)'
      }
    } else {
      switch (this.theme) {
        case 'dark':
          return 'radial-gradient(circle at 30% 30%, #333, #000)'
        case 'ocean':
          return 'radial-gradient(circle at 30% 30%, #2d4059, #1a2332)'
        case 'desert':
          return 'radial-gradient(circle at 30% 30%, #5a3e2b, #3d2817)'
        case 'forest':
          return 'radial-gradient(circle at 30% 30%, #2f3e46, #1d252b)'
        default:
          return 'radial-gradient(circle at 30% 30%, #444, #000)'
      }
    }
  }
  
  private getBorderColor(): string {
    if (this.color === 'white') {
      return this.theme === 'desert' ? '#d4a574' : '#b5b5b5'
    } else {
      return this.theme === 'ocean' ? '#005082' : '#222'
    }
  }
  
  private render() {
    if (!this.shadowRoot) return
    
    const gradient = this.getGradient()
    const borderColor = this.getBorderColor()
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          --checker-size: ${this.size}px;
        }
        
        .checker {
          width: var(--checker-size);
          height: var(--checker-size);
          border-radius: 50%;
          background: ${gradient};
          border: 3px solid ${borderColor};
          box-shadow: 
            0 4px 8px rgba(0, 0, 0, 0.4),
            inset 0 2px 4px rgba(255, 255, 255, 0.3),
            inset 0 -2px 4px rgba(0, 0, 0, 0.3);
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }
        
        .checker::before {
          content: '';
          position: absolute;
          top: 15%;
          left: 15%;
          width: 40%;
          height: 40%;
          background: radial-gradient(circle, rgba(255,255,255,0.4), transparent);
          border-radius: 50%;
        }
        
        .checker:hover {
          transform: scale(1.1);
          box-shadow: 
            0 6px 12px rgba(0, 0, 0, 0.5),
            inset 0 2px 4px rgba(255, 255, 255, 0.4),
            inset 0 -2px 4px rgba(0, 0, 0, 0.4);
        }
        
        .checker.selected {
          border-color: gold;
          box-shadow: 
            0 0 20px rgba(255, 215, 0, 0.8),
            0 4px 8px rgba(0, 0, 0, 0.4),
            inset 0 2px 4px rgba(255, 255, 255, 0.3),
            inset 0 -2px 4px rgba(0, 0, 0, 0.3);
          transform: scale(1.15);
        }
        
        .checker:active {
          transform: scale(0.95);
        }
      </style>
      
      <div class="checker ${this.selected ? 'selected' : ''}"></div>
    `
    
    this.addEventListeners()
  }
  
  // Public methods
  public setSelected(selected: boolean) {
    this.selected = selected
    this.setAttribute('selected', selected.toString())
  }
  
  public isSelected(): boolean {
    return this.selected
  }
  
  public getColor(): string {
    return this.color
  }
}

// Register the custom element
customElements.define('backgammon-checker', BackgammonChecker)

export default BackgammonChecker
