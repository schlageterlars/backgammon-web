// #web-comp: Custom Web Component - backgammon-board
// Eigene Web Component für das komplette Backgammon Brett

class BackgammonBoard extends HTMLElement {
  private boardSize: 'small' | 'medium' | 'classic' = 'classic'
  private theme: string = 'default'
  private boardState: any = null
  
  static get observedAttributes() {
    return ['board-size', 'theme', 'board-state']
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
      switch (name) {
        case 'board-size':
          this.boardSize = (newValue as any) || 'classic'
          break
        case 'theme':
          this.theme = newValue || 'default'
          break
        case 'board-state':
          try {
            this.boardState = JSON.parse(newValue)
          } catch (e) {
            console.error('Invalid board state JSON', e)
          }
          break
      }
      this.render()
    }
  }
  
  private getPointCount(): number {
    switch (this.boardSize) {
      case 'small': return 12
      case 'medium': return 18
      case 'classic': return 24
      default: return 24
    }
  }
  
  private getBoardColors(): { background: string; pointLight: string; pointDark: string } {
    switch (this.theme) {
      case 'dark':
        return {
          background: '#1a1a2e',
          pointLight: '#16213e',
          pointDark: '#0f3460'
        }
      case 'ocean':
        return {
          background: '#00a8cc',
          pointLight: '#005082',
          pointDark: '#00334e'
        }
      case 'desert':
        return {
          background: '#f4a261',
          pointLight: '#e9c46a',
          pointDark: '#e76f51'
        }
      case 'forest':
        return {
          background: '#264653',
          pointLight: '#2a9d8f',
          pointDark: '#1b3a32'
        }
      default:
        return {
          background: '#ADE8F4',
          pointLight: '#ffffff',
          pointDark: '#023E8A'
        }
    }
  }
  
  private renderPoints(): string {
    const pointCount = this.getPointCount()
    const colors = this.getBoardColors()
    const pointsPerSide = pointCount / 2
    
    let html = '<div class="points-container">'
    
    // Top points
    html += '<div class="points-top">'
    for (let i = 0; i < pointsPerSide; i++) {
      const color = i % 2 === 0 ? colors.pointLight : colors.pointDark
      html += `<div class="point point-top" data-index="${i}" style="background: ${color}"></div>`
    }
    html += '</div>'
    
    // Bar (middle section)
    html += '<div class="bar"></div>'
    
    // Bottom points
    html += '<div class="points-bottom">'
    for (let i = pointsPerSide; i < pointCount; i++) {
      const color = i % 2 === 0 ? colors.pointLight : colors.pointDark
      html += `<div class="point point-bottom" data-index="${i}" style="background: ${color}"></div>`
    }
    html += '</div>'
    
    html += '</div>'
    return html
  }
  
  private render() {
    if (!this.shadowRoot) return
    
    const colors = this.getBoardColors()
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .board {
          width: 100%;
          aspect-ratio: 4 / 3;
          background: ${colors.background};
          border: 8px solid #654321;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          padding: 20px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
          position: relative;
        }
        
        .points-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          gap: 20px;
        }
        
        .points-top,
        .points-bottom {
          display: flex;
          justify-content: space-around;
          height: 40%;
        }
        
        .point {
          flex: 1;
          margin: 0 4px;
          clip-path: polygon(50% 0%, 100% 100%, 0% 100%);
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .point-bottom {
          clip-path: polygon(0% 0%, 100% 0%, 50% 100%);
        }
        
        .point:hover {
          filter: brightness(1.2);
          transform: scale(1.05);
        }
        
        .bar {
          height: 20%;
          background: linear-gradient(90deg, #654321, #8B4513, #654321);
          border-radius: 4px;
          box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.5);
        }
        
        .bear-off {
          position: absolute;
          right: -80px;
          top: 50%;
          transform: translateY(-50%);
          width: 60px;
          height: 200px;
          background: rgba(101, 67, 33, 0.8);
          border: 2px solid #654321;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        
        .bear-off-section {
          width: 90%;
          height: 45%;
          border: 1px dashed #fff;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: #fff;
        }
      </style>
      
      <div class="board">
        ${this.renderPoints()}
        <div class="bear-off">
          <div class="bear-off-section">White</div>
          <div class="bear-off-section">Black</div>
        </div>
      </div>
    `
    
    this.addPointClickListeners()
  }
  
  private addPointClickListeners() {
    const points = this.shadowRoot?.querySelectorAll('.point')
    points?.forEach(point => {
      point.addEventListener('click', (e) => {
        const index = (e.target as HTMLElement).getAttribute('data-index')
        this.dispatchEvent(new CustomEvent('point-click', {
          detail: { pointIndex: parseInt(index || '0') },
          bubbles: true,
          composed: true
        }))
      })
    })
  }
  
  // Public methods
  public setBoardSize(size: 'small' | 'medium' | 'classic') {
    this.boardSize = size
    this.setAttribute('board-size', size)
  }
  
  public setTheme(theme: string) {
    this.theme = theme
    this.setAttribute('theme', theme)
  }
  
  public setBoardState(state: any) {
    this.boardState = state
    this.setAttribute('board-state', JSON.stringify(state))
  }
  
  public getBoardSize(): string {
    return this.boardSize
  }
}

// Register the custom element
customElements.define('backgammon-board', BackgammonBoard)

export default BackgammonBoard
