// Performance Metrics Web Component - Vanilla HTML/CSS/JS
class PerformanceMetrics extends HTMLElement {
  constructor() {
    super();
    this.title = '';
    this.value = '';
    this.change = 0;
    this.changeLabel = '';
    this.description = '';
    this.target = '';
  }

  static get observedAttributes() {
    return ['title', 'value', 'change', 'change-label', 'description', 'target'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      if (name === 'change-label') {
        this.changeLabel = newValue;
      } else {
        this[name.replace('-', '')] = newValue;
      }
      this.render();
    }
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const changeValue = parseFloat(this.change) || 0;
    const isPositive = changeValue >= 0;
    const changeColor = isPositive ? 'text-chart-1' : 'text-destructive';
    const changeIcon = isPositive ? '↗' : '↘';
    
    this.innerHTML = `
      <div class="bg-card text-card-foreground rounded-lg border p-6">
        <div class="flex items-center justify-between space-y-0 pb-2">
          <h3 class="text-sm font-medium tracking-tight">${this.title}</h3>
          <div class="h-4 w-4 text-muted-foreground">
            <!-- Icon slot -->
          </div>
        </div>
        <div class="space-y-1">
          <div class="text-2xl font-bold">${this.value}</div>
          <div class="flex items-center space-x-2 text-xs">
            <span class="${changeColor} flex items-center">
              ${changeIcon} ${Math.abs(changeValue)}%
            </span>
            <span class="text-muted-foreground">${this.changeLabel}</span>
          </div>
          ${this.target ? `
            <div class="text-xs text-muted-foreground pt-1">
              Target: <span class="text-chart-3">${this.target}</span>
            </div>
          ` : ''}
        </div>
        <div class="pt-2">
          <p class="text-xs text-muted-foreground">${this.description}</p>
        </div>
      </div>
    `;
  }

  // Public methods for React integration
  setProps(props) {
    Object.keys(props).forEach(key => {
      if (key === 'changeLabel') {
        this.changeLabel = props[key];
      } else {
        this[key] = props[key];
      }
    });
    this.render();
  }
}

customElements.define('performance-metrics', PerformanceMetrics);