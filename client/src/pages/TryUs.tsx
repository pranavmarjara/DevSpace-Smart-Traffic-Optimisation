import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Zap, BarChart3, Loader2 } from "lucide-react";

interface SimulationMetrics {
  mode: string;
  total_steps: number;
  cars_processed: number;
  avg_waiting_time: number;
  avg_queue_length: number;
  avg_total_cars: number;
  efficiency_score: number;
}

interface Car {
  x: number;
  y: number;
  color: string;
}

interface SimulationFrame {
  cars: Car[];
  lights: {
    N: string;
    S: string;
    E: string;
    W: string;
  };
  metrics: {
    cars_processed: number;
    avg_waiting_time: number;
    avg_queue_length: number;
    total_cars: number;
    time_wasted: number;
  };
  step: number;
}

interface SimulationResult {
  frames: SimulationFrame[];
  metrics: SimulationMetrics;
}

export default function TryUs() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentMode, setCurrentMode] = useState<string>("");
  const [simulationResults, setSimulationResults] = useState<{
    hardcoded?: SimulationResult;
    optimized?: SimulationResult;
  }>({});
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const runSimulation = async (mode: 'hardcoded' | 'optimized') => {
    setIsSimulating(true);
    setCurrentMode(mode);
    
    try {
      const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: mode,
          steps: 100
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: SimulationResult = await response.json();
      setSimulationResults(prev => ({
        ...prev,
        [mode]: data
      }));
      
      // Start visualization
      if (data.frames.length > 0) {
        setCurrentFrame(0);
        setIsPlaying(true);
        visualizeSimulation(data.frames);
      }
    } catch (error) {
      console.error('Simulation failed:', error);
      alert(`Simulation failed: ${error}`);
    } finally {
      setIsSimulating(false);
    }
  };

  const runComparison = async () => {
    setCurrentMode("comparison");
    await runSimulation('hardcoded');
    await runSimulation('optimized');
  };

  const visualizeSimulation = (frames: SimulationFrame[]) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameIndex = 0;
    const fps = 5; // ~5 FPS as requested
    const interval = 1000 / fps;
    let lastTime = 0;
    
    const animate = (currentTime: number) => {
      if (currentTime - lastTime >= interval) {
        if (frameIndex >= frames.length) {
          setIsPlaying(false);
          return;
        }

        const frame = frames[frameIndex];
        drawFrame(ctx, frame, canvas.width, canvas.height);
        setCurrentFrame(frameIndex);
        frameIndex++;
        lastTime = currentTime;
      }
      
      if (isPlaying) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  };

  const drawFrame = (ctx: CanvasRenderingContext2D, frame: SimulationFrame, width: number, height: number) => {
    // Clear canvas with dark background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);
    
    // Draw road background - two vertical + two horizontal roads
    const roadWidth = 60;
    const centerX = width / 2;
    const centerY = height / 2;
    
    ctx.fillStyle = '#404040';
    
    // Horizontal road (east-west)
    ctx.fillRect(0, centerY - roadWidth/2, width, roadWidth);
    
    // Vertical road (north-south)  
    ctx.fillRect(centerX - roadWidth/2, 0, roadWidth, height);
    
    // Draw intersection center slightly darker
    ctx.fillStyle = '#353535';
    ctx.fillRect(centerX - roadWidth/2, centerY - roadWidth/2, roadWidth, roadWidth);
    
    // Draw lane dividers
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    
    // Horizontal lane divider
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(centerX - roadWidth/2, centerY);
    ctx.moveTo(centerX + roadWidth/2, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();
    
    // Vertical lane divider
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, centerY - roadWidth/2);
    ctx.moveTo(centerX, centerY + roadWidth/2);
    ctx.lineTo(centerX, height);
    ctx.stroke();
    
    ctx.setLineDash([]);
    
    // Draw cars using normalized positions (0-1) scaled to canvas dimensions
    frame.cars.forEach(car => {
      const carX = car.x * width;
      const carY = car.y * height;
      const carSize = 8;
      
      ctx.fillStyle = car.color;
      ctx.beginPath();
      ctx.arc(carX, carY, carSize / 2, 0, 2 * Math.PI);
      ctx.fill();
      
      // Add a subtle border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();
    });
    
    // Draw traffic lights as colored circles near intersection
    const lightRadius = 8;
    const lightOffset = roadWidth/2 + 15;
    
    // North light
    ctx.fillStyle = frame.lights.N === 'green' ? '#22c55e' : '#ef4444';
    ctx.beginPath();
    ctx.arc(centerX, centerY - lightOffset, lightRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // South light
    ctx.fillStyle = frame.lights.S === 'green' ? '#22c55e' : '#ef4444';
    ctx.beginPath();
    ctx.arc(centerX, centerY + lightOffset, lightRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    
    // East light
    ctx.fillStyle = frame.lights.E === 'green' ? '#22c55e' : '#ef4444';
    ctx.beginPath();
    ctx.arc(centerX + lightOffset, centerY, lightRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    
    // West light
    ctx.fillStyle = frame.lights.W === 'green' ? '#22c55e' : '#ef4444';
    ctx.beginPath();
    ctx.arc(centerX - lightOffset, centerY, lightRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    
    // Draw simulation info
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`Step: ${frame.step}`, 20, 30);
    
    ctx.font = '14px sans-serif';
    ctx.fillText(`Cars: ${frame.metrics.total_cars}`, 20, 55);
    ctx.fillText(`Processed: ${frame.metrics.cars_processed}`, 20, 75);
    ctx.fillText(`Avg Wait: ${frame.metrics.avg_waiting_time.toFixed(1)}s`, 20, 95);
    ctx.fillText(`Time Wasted: ${frame.metrics.time_wasted.toFixed(1)}s`, 20, 115);
  };

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Initial empty intersection
        drawFrame(ctx, {
          cars: [],
          lights: { N: 'green', S: 'green', E: 'red', W: 'red' },
          metrics: { cars_processed: 0, avg_waiting_time: 0, avg_queue_length: 0, total_cars: 0, time_wasted: 0 },
          step: 0
        }, canvas.width, canvas.height);
      }
    }
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Traffic Simulation Demo</h1>
          <p className="text-muted-foreground">
            Try our AI-powered traffic optimization system
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Simulation Canvas */}
        <Card>
          <CardHeader>
            <CardTitle>Live Simulation</CardTitle>
            <CardDescription>
              Watch traffic flow through the intersection in real-time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={800}
                height={500}
                className="border rounded-lg bg-gray-900 w-full h-auto"
                style={{ width: '100%', height: 'auto' }}
              />
              {isSimulating && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                  <div className="flex items-center gap-2 text-white">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Running {currentMode} simulation...
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Control Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Simulation Controls</CardTitle>
            <CardDescription>
              Choose different traffic light control strategies
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => runSimulation('hardcoded')}
              disabled={isSimulating}
              className="w-full"
              variant="outline"
            >
              <Play className="w-4 h-4 mr-2" />
              Run Hardcoded Policy
            </Button>
            
            <Button
              onClick={() => runSimulation('optimized')}
              disabled={isSimulating}
              className="w-full"
              variant="outline"
            >
              <Zap className="w-4 h-4 mr-2" />
              Run AI Optimization
            </Button>
            
            <Button
              onClick={runComparison}
              disabled={isSimulating}
              className="w-full"
              variant="default"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Compare Both
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      {Object.keys(simulationResults).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Simulation Results</CardTitle>
            <CardDescription>
              Performance comparison of different control strategies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(simulationResults).map(([mode, result]) => (
                <div key={mode} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={mode === 'optimized' ? 'default' : 'secondary'}>
                      {mode === 'optimized' ? 'AI Optimized' : 'Hardcoded'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="space-y-1">
                      <div className="font-medium text-muted-foreground">Cars Processed</div>
                      <div className="text-2xl font-bold text-green-600">
                        {result.metrics.cars_processed}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="font-medium text-muted-foreground">Efficiency Score</div>
                      <div className="text-2xl font-bold text-blue-600">
                        {result.metrics.efficiency_score.toFixed(1)}%
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="font-medium text-muted-foreground">Time Wasted</div>
                      <div className={`text-xl font-bold ${
                        mode === 'optimized' ? 'text-green-500' : 'text-orange-500'
                      }`}>
                        {result.frames.length > 0 
                          ? result.frames[result.frames.length - 1].metrics.time_wasted.toFixed(1) + 's'
                          : '0s'
                        }
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="font-medium text-muted-foreground">Avg Wait Time</div>
                      <div className="text-lg font-semibold">{result.metrics.avg_waiting_time.toFixed(1)}s</div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="font-medium text-muted-foreground">Avg Queue Length</div>
                      <div className="text-lg font-semibold">{result.metrics.avg_queue_length.toFixed(1)}</div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="font-medium text-muted-foreground">Total Cars</div>
                      <div className="text-lg font-semibold">{result.metrics.avg_total_cars.toFixed(1)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}