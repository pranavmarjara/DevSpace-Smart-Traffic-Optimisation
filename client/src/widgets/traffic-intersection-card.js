// Traffic Intersection Card Web Component - Vanilla HTML/CSS/JS
class TrafficIntersectionCard extends HTMLElement {
  constructor() {
    super();
    this.intersection = null;
  }

  static get observedAttributes() {
    return ['intersection'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue && name === 'intersection') {
      try {
        this.intersection = JSON.parse(newValue);
      } catch (e) {
        this.intersection = null;
      }
      this.render();
    }
  }

  connectedCallback() {
    this.render();
  }

  render() {
    if (!this.intersection) return;

    const statusColor = this.getStatusColor(this.intersection.status);
    const statusBadge = this.getStatusBadge(this.intersection.status);
    
    this.innerHTML = `
      <div class="bg-card text-card-foreground rounded-lg border p-4 space-y-3">
        <div class="flex items-center justify-between">
          <h4 class="font-semibold text-sm">${this.intersection.name}</h4>
          ${statusBadge}
        </div>
        
        <div class="text-xs text-muted-foreground">
          ${this.intersection.location}
        </div>
        
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div class="text-muted-foreground text-xs">Vehicles</div>
            <div class="font-semibold">${this.intersection.vehicleCount}</div>
          </div>
          <div>
            <div class="text-muted-foreground text-xs">Wait Time</div>
            <div class="font-semibold">${this.intersection.averageWaitTime}s</div>
          </div>
        </div>
        
        <div class="space-y-2">
          <div class="text-xs text-muted-foreground">Signal Timings</div>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div class="bg-muted/50 rounded p-2">
              <div class="text-muted-foreground">N-S</div>
              <div class="font-medium">${this.intersection.signalTimings.northSouth || 'N/A'}s</div>
            </div>
            <div class="bg-muted/50 rounded p-2">
              <div class="text-muted-foreground">E-W</div>
              <div class="font-medium">${this.intersection.signalTimings.eastWest || 'N/A'}s</div>
            </div>
          </div>
        </div>
        
        ${this.intersection.aiRecommendation ? `
          <div class="pt-2 border-t">
            <div class="text-xs text-chart-1 font-medium">AI Recommendation</div>
            <div class="text-xs text-muted-foreground mt-1">
              N-S: ${this.intersection.aiRecommendation.northSouth}s, 
              E-W: ${this.intersection.aiRecommendation.eastWest}s
            </div>
          </div>
        ` : ''}
        
        ${this.intersection.emergencyMode ? `
          <div class="bg-destructive/10 border border-destructive/20 rounded p-2">
            <div class="text-xs text-destructive font-medium">Emergency Mode Active</div>
          </div>
        ` : ''}
      </div>
    `;
  }

  getStatusColor(status) {
    switch (status) {
      case 'optimal': return 'chart-3';
      case 'moderate': return 'chart-2';
      case 'congested': return 'destructive';
      default: return 'muted-foreground';
    }
  }

  getStatusBadge(status) {
    const color = this.getStatusColor(status);
    const label = status.charAt(0).toUpperCase() + status.slice(1);
    
    return `<span class="px-2 py-1 rounded-full text-xs font-medium bg-${color}/10 text-${color}">${label}</span>`;
  }

  // Public methods for React integration
  setIntersection(intersection) {
    this.intersection = intersection;
    this.render();
  }
}

customElements.define('traffic-intersection-card', TrafficIntersectionCard);