// System Alerts Panel Web Component - Vanilla HTML/CSS/JS
class SystemAlertsPanel extends HTMLElement {
  constructor() {
    super();
    this.alerts = [];
  }

  static get observedAttributes() {
    return ['alerts'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue && name === 'alerts') {
      try {
        this.alerts = JSON.parse(newValue);
      } catch (e) {
        this.alerts = [];
      }
      this.render();
    }
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `
      <div class="bg-card text-card-foreground rounded-lg border p-6">
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">System Alerts</h3>
            <span class="text-sm text-muted-foreground">${this.alerts.length} alerts</span>
          </div>
          
          <div class="space-y-3 max-h-96 overflow-y-auto">
            ${this.alerts.length === 0 ? 
              '<div class="text-center py-8 text-muted-foreground text-sm">No active alerts</div>' :
              this.alerts.map(alert => this.renderAlert(alert)).join('')
            }
          </div>
        </div>
      </div>
    `;
    
    this.addEventListeners();
  }

  renderAlert(alert) {
    const typeStyles = this.getAlertTypeStyles(alert.type);
    
    return `
      <div class="border rounded-lg p-3 ${typeStyles.bg}">
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1 space-y-1">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded text-xs font-medium ${typeStyles.badge}">
                ${alert.type.toUpperCase()}
              </span>
              <span class="text-xs text-muted-foreground">${alert.timestamp}</span>
            </div>
            <h4 class="font-medium text-sm">${alert.title}</h4>
            <p class="text-xs text-muted-foreground">${alert.message}</p>
            <div class="text-xs text-muted-foreground">${alert.location}</div>
          </div>
          
          ${alert.actionRequired ? `
            <div class="flex flex-col gap-1">
              <button 
                class="px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors action-btn"
                data-alert-id="${alert.id}"
                data-action="take-action"
              >
                Take Action
              </button>
              <button 
                class="px-2 py-1 text-xs border border-border rounded hover:bg-muted transition-colors dismiss-btn"
                data-alert-id="${alert.id}"
                data-action="dismiss"
              >
                Dismiss
              </button>
            </div>
          ` : `
            <button 
              class="px-2 py-1 text-xs border border-border rounded hover:bg-muted transition-colors dismiss-btn"
              data-alert-id="${alert.id}"
              data-action="dismiss"
            >
              Dismiss
            </button>
          `}
        </div>
      </div>
    `;
  }

  getAlertTypeStyles(type) {
    switch (type) {
      case 'critical':
        return {
          bg: 'bg-destructive/5 border-destructive/20',
          badge: 'bg-destructive text-destructive-foreground'
        };
      case 'warning':
        return {
          bg: 'bg-chart-2/5 border-chart-2/20',
          badge: 'bg-chart-2 text-chart-2-foreground'
        };
      case 'success':
        return {
          bg: 'bg-chart-3/5 border-chart-3/20',
          badge: 'bg-chart-3 text-chart-3-foreground'
        };
      default:
        return {
          bg: 'bg-muted/5 border-border',
          badge: 'bg-muted text-muted-foreground'
        };
    }
  }

  addEventListeners() {
    // Add event listeners for action buttons
    this.querySelectorAll('.action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const alertId = e.target.dataset.alertId;
        this.dispatchEvent(new CustomEvent('alert-action', {
          detail: { alertId },
          bubbles: true
        }));
      });
    });

    // Add event listeners for dismiss buttons
    this.querySelectorAll('.dismiss-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const alertId = e.target.dataset.alertId;
        this.dispatchEvent(new CustomEvent('alert-dismiss', {
          detail: { alertId },
          bubbles: true
        }));
      });
    });
  }

  // Public methods for React integration
  setAlerts(alerts) {
    this.alerts = alerts;
    this.render();
  }
}

customElements.define('system-alerts-panel', SystemAlertsPanel);