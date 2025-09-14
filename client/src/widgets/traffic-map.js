// Traffic Map Web Component - Vanilla HTML/CSS/JS
class TrafficMap extends HTMLElement {
  constructor() {
    super();
    this.intersections = [];
    this.selectedIntersection = '';
  }

  static get observedAttributes() {
    return ['intersections', 'selected-intersection'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      if (name === 'intersections') {
        try {
          this.intersections = JSON.parse(newValue);
        } catch (e) {
          this.intersections = [];
        }
      } else if (name === 'selected-intersection') {
        this.selectedIntersection = newValue;
      }
      this.render();
    }
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `
      <div class="lg:col-span-2">
        <div class="bg-card text-card-foreground rounded-lg border p-6">
          <div class="space-y-4">
            <div>
              <h3 class="text-lg font-semibold">Traffic Network Map</h3>
              <p class="text-sm text-muted-foreground">Real-time status of monitored intersections</p>
            </div>
            
            <div class="relative h-96 bg-muted/10 rounded-lg overflow-hidden">
              <svg width="100%" height="100%" class="traffic-map-svg">
                ${this.intersections.map(intersection => this.renderIntersection(intersection)).join('')}
              </svg>
            </div>
            
            <div class="flex items-center gap-4 text-sm">
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 bg-chart-3 rounded-full"></div>
                <span>Optimal</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 bg-chart-2 rounded-full"></div>
                <span>Moderate</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 bg-destructive rounded-full"></div>
                <span>Congested</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    this.addEventListeners();
  }

  renderIntersection(intersection) {
    const color = this.getStatusColor(intersection.status);
    const isSelected = intersection.id === this.selectedIntersection;
    const strokeWidth = isSelected ? 3 : 1;
    
    return `
      <g class="intersection-group cursor-pointer" data-intersection-id="${intersection.id}">
        <circle 
          cx="${intersection.x}%" 
          cy="${intersection.y}%" 
          r="8" 
          fill="${color}" 
          stroke="white" 
          stroke-width="${strokeWidth}"
          class="transition-all duration-200 hover:r-10"
        />
        <text 
          x="${intersection.x}%" 
          y="${intersection.y - 15}%" 
          text-anchor="middle" 
          class="fill-foreground text-xs font-medium"
        >
          ${intersection.name}
        </text>
        <text 
          x="${intersection.x}%" 
          y="${intersection.y + 25}%" 
          text-anchor="middle" 
          class="fill-muted-foreground text-xs"
        >
          ${intersection.vehicleCount} vehicles
        </text>
      </g>
    `;
  }

  getStatusColor(status) {
    switch (status) {
      case 'optimal': return 'hsl(142.1 76.2% 36.3%)';
      case 'moderate': return 'hsl(47.9 95.8% 53.1%)';
      case 'congested': return 'hsl(0 84.2% 60.2%)';
      default: return 'hsl(215.4 16.3% 46.9%)';
    }
  }

  addEventListeners() {
    const groups = this.querySelectorAll('.intersection-group');
    groups.forEach(group => {
      group.addEventListener('click', (e) => {
        const intersectionId = group.dataset.intersectionId;
        this.selectedIntersection = intersectionId;
        this.render();
        
        // Dispatch custom event for React integration
        this.dispatchEvent(new CustomEvent('intersection-select', {
          detail: { intersectionId },
          bubbles: true
        }));
      });
    });
  }

  // Public methods for React integration
  setIntersections(intersections) {
    this.intersections = intersections;
    this.render();
  }

  setSelectedIntersection(id) {
    this.selectedIntersection = id;
    this.render();
  }
}

customElements.define('traffic-map', TrafficMap);