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

interface SimulationFrame {
  queues: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  lights: {
    ns: string;
    ew: string;
  };
  metrics: {
    cars_processed: number;
    avg_waiting_time: number;
    avg_queue_length: number;
    total_cars: number;
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
    
    const animate = () => {
      if (frameIndex >= frames.length) {
        setIsPlaying(false);
        return;
      }

      const frame = frames[frameIndex];
      drawFrame(ctx, frame, canvas.width, canvas.height);
      setCurrentFrame(frameIndex);
      frameIndex++;
      
      if (isPlaying) {
        setTimeout(() => requestAnimationFrame(animate), 100);
      }
    };
    
    animate();
  };

  const drawFrame = (ctx: CanvasRenderingContext2D, frame: SimulationFrame, width: number, height: number) => {
    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);
    
    // Draw intersection
    const centerX = width / 2;
    const centerY = height / 2;
    const roadWidth = 40;
    
    // Draw roads
    ctx.fillStyle = '#404040';
    // Horizontal road
    ctx.fillRect(0, centerY - roadWidth/2, width, roadWidth);
    // Vertical road  
    ctx.fillRect(centerX - roadWidth/2, 0, roadWidth, height);
    
    // Draw traffic lights
    const lightSize = 12;
    // NS lights
    ctx.fillStyle = frame.lights.ns === 'green' ? '#22c55e' : '#ef4444';
    ctx.fillRect(centerX - lightSize/2, centerY - roadWidth/2 - lightSize - 5, lightSize, lightSize);
    ctx.fillRect(centerX - lightSize/2, centerY + roadWidth/2 + 5, lightSize, lightSize);
    
    // EW lights
    ctx.fillStyle = frame.lights.ew === 'green' ? '#22c55e' : '#ef4444';
    ctx.fillRect(centerX - roadWidth/2 - lightSize - 5, centerY - lightSize/2, lightSize, lightSize);
    ctx.fillRect(centerX + roadWidth/2 + 5, centerY - lightSize/2, lightSize, lightSize);
    
    // Draw car queues
    const carSize = 6;
    const spacing = 8;
    
    // North queue
    for (let i = 0; i < frame.queues.north; i++) {
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(centerX - carSize/2, centerY - roadWidth/2 - spacing * (i + 2), carSize, carSize);
    }
    
    // South queue
    for (let i = 0; i < frame.queues.south; i++) {
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(centerX - carSize/2, centerY + roadWidth/2 + spacing * (i + 2), carSize, carSize);
    }
    
    // East queue
    for (let i = 0; i < frame.queues.east; i++) {
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(centerX + roadWidth/2 + spacing * (i + 2), centerY - carSize/2, carSize, carSize);
    }
    
    // West queue
    for (let i = 0; i < frame.queues.west; i++) {
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(centerX - roadWidth/2 - spacing * (i + 2), centerY - carSize/2, carSize, carSize);
    }
    
    // Draw step counter
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px sans-serif';
    ctx.fillText(`Step: ${frame.step}`, 10, 25);
    ctx.fillText(`Cars Processed: ${frame.metrics.cars_processed}`, 10, 45);
    ctx.fillText(`Avg Wait: ${frame.metrics.avg_waiting_time.toFixed(1)}s`, 10, 65);
  };

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Initial empty intersection
        drawFrame(ctx, {
          queues: { north: 0, south: 0, east: 0, west: 0 },
          lights: { ns: 'green', ew: 'red' },
          metrics: { cars_processed: 0, avg_waiting_time: 0, avg_queue_length: 0, total_cars: 0 },
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
                width={400}
                height={300}
                className="border rounded-lg bg-gray-900 w-full"
                style={{ maxWidth: '400px', height: 'auto' }}
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
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="space-y-1">
                      <div className="font-medium">Cars Processed</div>
                      <div className="text-2xl font-bold text-green-600">
                        {result.metrics.cars_processed}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="font-medium">Efficiency Score</div>
                      <div className="text-2xl font-bold text-blue-600">
                        {result.metrics.efficiency_score.toFixed(1)}%
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="font-medium">Avg Wait Time</div>
                      <div className="text-lg">{result.metrics.avg_waiting_time.toFixed(1)}s</div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="font-medium">Avg Queue Length</div>
                      <div className="text-lg">{result.metrics.avg_queue_length.toFixed(1)}</div>
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