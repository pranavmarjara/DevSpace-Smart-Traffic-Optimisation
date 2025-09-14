// Analytics Chart Web Component - Vanilla HTML/CSS/JS
class AnalyticsChart extends HTMLElement {
  constructor() {
    super();
    this.data = [];
    this.title = '';
    this.type = 'bar';
    this.timeframe = '';
    this.improvement = 0;
    this.unit = '';
  }

  static get observedAttributes() {
    return ['data', 'title', 'type', 'timeframe', 'improvement', 'unit'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      if (name === 'data') {
        try {
          this.data = JSON.parse(newValue);
        } catch (e) {
          this.data = [];
        }
      } else {
        this[name] = newValue;
      }
      this.render();
    }
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const improvementColor = this.improvement >= 0 ? 'text-chart-1' : 'text-destructive';
    const improvementIcon = this.improvement >= 0 ? '↗' : '↘';
    
    this.innerHTML = `
      <div class="bg-card text-card-foreground rounded-lg border p-6 space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold">${this.title}</h3>
            <p class="text-sm text-muted-foreground">${this.timeframe}</p>
          </div>
          <div class="text-right">
            <div class="flex items-center gap-1 text-sm ${improvementColor}">
              <span>${improvementIcon}</span>
              <span>${Math.abs(this.improvement)}%</span>
            </div>
            <p class="text-xs text-muted-foreground">improvement</p>
          </div>
        </div>
        
        <div class="h-64 bg-muted/10 rounded-lg relative overflow-hidden">
          <canvas id="chart-${this.id || 'chart'}" class="w-full h-full"></canvas>
        </div>
        
        <div class="flex items-center justify-between text-sm text-muted-foreground">
          <span>Data points: ${this.data.length}</span>
          <span>Unit: ${this.unit}</span>
        </div>
      </div>
    `;
    
    this.drawChart();
  }

  drawChart() {
    const canvas = this.querySelector('canvas');
    if (!canvas || !this.data.length) return;
    
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    // Set actual canvas size for high DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    // Chart dimensions
    const padding = 40;
    const chartWidth = rect.width - padding * 2;
    const chartHeight = rect.height - padding * 2;
    
    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);
    
    if (this.type === 'bar') {
      this.drawBarChart(ctx, padding, chartWidth, chartHeight);
    } else {
      this.drawLineChart(ctx, padding, chartWidth, chartHeight);
    }
  }

  drawBarChart(ctx, padding, chartWidth, chartHeight) {
    const maxValue = Math.max(...this.data.map(d => Math.max(d.current, d.previous, d.target || 0)));
    const barWidth = chartWidth / this.data.length;
    const subBarWidth = barWidth * 0.25;
    
    // Draw bars
    this.data.forEach((item, index) => {
      const x = padding + index * barWidth;
      const currentHeight = (item.current / maxValue) * chartHeight;
      const previousHeight = (item.previous / maxValue) * chartHeight;
      const targetHeight = item.target ? (item.target / maxValue) * chartHeight : 0;
      
      // Current value bar (blue)
      ctx.fillStyle = 'hsl(221.2 83.2% 53.3%)';
      ctx.fillRect(x + subBarWidth * 0.5, padding + chartHeight - currentHeight, subBarWidth, currentHeight);
      
      // Previous value bar (gray)
      ctx.fillStyle = 'hsl(215.4 16.3% 46.9%)';
      ctx.fillRect(x + subBarWidth * 1.75, padding + chartHeight - previousHeight, subBarWidth, previousHeight);
      
      // Target line (green)
      if (item.target) {
        ctx.strokeStyle = 'hsl(142.1 76.2% 36.3%)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, padding + chartHeight - targetHeight);
        ctx.lineTo(x + barWidth, padding + chartHeight - targetHeight);
        ctx.stroke();
      }
      
      // Label
      ctx.fillStyle = 'hsl(215.4 16.3% 46.9%)';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(item.name, x + barWidth / 2, padding + chartHeight + 20);
    });
  }

  drawLineChart(ctx, padding, chartWidth, chartHeight) {
    const maxValue = Math.max(...this.data.map(d => Math.max(d.current, d.previous, d.target || 0)));
    const stepX = chartWidth / (this.data.length - 1);
    
    // Draw current line (blue)
    ctx.strokeStyle = 'hsl(221.2 83.2% 53.3%)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    this.data.forEach((item, index) => {
      const x = padding + index * stepX;
      const y = padding + chartHeight - (item.current / maxValue) * chartHeight;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    
    // Draw previous line (gray)
    ctx.strokeStyle = 'hsl(215.4 16.3% 46.9%)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    this.data.forEach((item, index) => {
      const x = padding + index * stepX;
      const y = padding + chartHeight - (item.previous / maxValue) * chartHeight;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    
    // Draw data points
    this.data.forEach((item, index) => {
      const x = padding + index * stepX;
      const currentY = padding + chartHeight - (item.current / maxValue) * chartHeight;
      const previousY = padding + chartHeight - (item.previous / maxValue) * chartHeight;
      
      // Current point
      ctx.fillStyle = 'hsl(221.2 83.2% 53.3%)';
      ctx.beginPath();
      ctx.arc(x, currentY, 4, 0, 2 * Math.PI);
      ctx.fill();
      
      // Previous point
      ctx.fillStyle = 'hsl(215.4 16.3% 46.9%)';
      ctx.beginPath();
      ctx.arc(x, previousY, 4, 0, 2 * Math.PI);
      ctx.fill();
      
      // Label
      ctx.fillStyle = 'hsl(215.4 16.3% 46.9%)';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(item.name, x, padding + chartHeight + 20);
    });
  }

  // Public methods for React integration
  setData(data) {
    this.data = data;
    this.render();
  }

  setProps(props) {
    Object.keys(props).forEach(key => {
      if (key === 'data') {
        this.data = props[key];
      } else {
        this[key] = props[key];
      }
    });
    this.render();
  }
}

customElements.define('analytics-chart', AnalyticsChart);