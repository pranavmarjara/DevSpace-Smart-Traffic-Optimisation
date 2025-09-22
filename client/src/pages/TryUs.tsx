import { useState, useRef, useEffect, useCallback } from "react";
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

interface InterpolatedCar extends Car {
  targetX: number;
  targetY: number;
}

export default function TryUs() {
  const hardcodedCanvasRef = useRef<HTMLCanvasElement>(null);
  const optimizedCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isSimulating, setIsSimulating] = useState<{
    hardcoded: boolean;
    optimized: boolean;
  }>({ hardcoded: false, optimized: false });
  const [simulationResults, setSimulationResults] = useState<{
    hardcoded?: SimulationResult;
    optimized?: SimulationResult;
  }>({});
  const [animationStates, setAnimationStates] = useState<{
    hardcoded: { playing: boolean; frame: number; cars: InterpolatedCar[] };
    optimized: { playing: boolean; frame: number; cars: InterpolatedCar[] };
  }>({
    hardcoded: { playing: false, frame: 0, cars: [] },
    optimized: { playing: false, frame: 0, cars: [] }
  });

  const runSimulation = async (mode: 'hardcoded' | 'optimized') => {
    setIsSimulating(prev => ({ ...prev, [mode]: true }));
    
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
      
      // Start visualization for this mode
      if (data.frames.length > 0) {
        setAnimationStates(prev => ({
          ...prev,
          [mode]: { playing: true, frame: 0, cars: [] }
        }));
        visualizeSimulation(data.frames, mode);
      }
    } catch (error) {
      console.error('Simulation failed:', error);
      alert(`Simulation failed: ${error}`);
    } finally {
      setIsSimulating(prev => ({ ...prev, [mode]: false }));
    }
  };

  const runComparison = async () => {
    await Promise.all([
      runSimulation('hardcoded'),
      runSimulation('optimized')
    ]);
  };

  const visualizeSimulation = (frames: SimulationFrame[], mode: 'hardcoded' | 'optimized') => {
    const canvasRef = mode === 'hardcoded' ? hardcodedCanvasRef : optimizedCanvasRef;
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameIndex = 0;
    let interpolatedCars: InterpolatedCar[] = [];
    const fps = 10; // Increased for smoother animation
    const interval = 1000 / fps;
    let lastTime = 0;
    
    const animate = (currentTime: number) => {
      if (currentTime - lastTime >= interval) {
        const state = animationStates[mode];
        if (!state.playing || frameIndex >= frames.length) {
          setAnimationStates(prev => ({
            ...prev,
            [mode]: { ...prev[mode], playing: false }
          }));
          return;
        }

        const frame = frames[frameIndex];
        
        // Update car targets for interpolation
        if (frameIndex === 0) {
          interpolatedCars = frame.cars.map(car => ({
            ...car,
            targetX: car.x,
            targetY: car.y
          }));
        } else {
          // Update targets for existing cars and add new ones
          const newCars: InterpolatedCar[] = [];
          frame.cars.forEach(car => {
            const existing = interpolatedCars.find(ic => ic.color === car.color);
            if (existing) {
              existing.targetX = car.x;
              existing.targetY = car.y;
              newCars.push(existing);
            } else {
              newCars.push({
                ...car,
                targetX: car.x,
                targetY: car.y
              });
            }
          });
          interpolatedCars = newCars;
        }
        
        // Smooth interpolation towards targets
        interpolatedCars.forEach(car => {
          const lerpFactor = 0.3;
          car.x += (car.targetX - car.x) * lerpFactor;
          car.y += (car.targetY - car.y) * lerpFactor;
        });
        
        drawFrame(ctx, { ...frame, cars: interpolatedCars }, canvas.width, canvas.height, mode);
        
        setAnimationStates(prev => ({
          ...prev,
          [mode]: { ...prev[mode], frame: frameIndex, cars: interpolatedCars }
        }));
        
        frameIndex++;
        lastTime = currentTime;
      }
      
      if (animationStates[mode].playing) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  };

  const drawFrame = (ctx: CanvasRenderingContext2D, frame: SimulationFrame, width: number, height: number, mode: string) => {
    // Clear canvas with dark background
    ctx.fillStyle = '#0f0f23';
    ctx.fillRect(0, 0, width, height);
    
    // Draw road background
    const roadWidth = 60;
    const centerX = width / 2;
    const centerY = height / 2;
    
    ctx.fillStyle = '#2a2a2a';
    
    // Horizontal road (east-west)
    ctx.fillRect(0, centerY - roadWidth/2, width, roadWidth);
    
    // Vertical road (north-south)  
    ctx.fillRect(centerX - roadWidth/2, 0, roadWidth, height);
    
    // Draw intersection center
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(centerX - roadWidth/2, centerY - roadWidth/2, roadWidth, roadWidth);
    
    // Draw lane dividers
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);
    
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
    
    // Draw cars with smooth rendering
    frame.cars.forEach(car => {
      const carX = car.x * width;
      const carY = car.y * height;
      const carSize = 10;
      
      // Car shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.arc(carX + 2, carY + 2, carSize / 2, 0, 2 * Math.PI);
      ctx.fill();
      
      // Car body
      ctx.fillStyle = car.color;
      ctx.beginPath();
      ctx.arc(carX, carY, carSize / 2, 0, 2 * Math.PI);
      ctx.fill();
      
      // Car highlight
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
    
    // Draw traffic lights with glowing effect
    const lightRadius = 12;
    const lightOffset = roadWidth/2 + 25;
    
    const drawGlowingLight = (x: number, y: number, color: string, isOn: boolean) => {
      if (isOn) {
        // Outer glow
        const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, lightRadius * 2);
        glowGradient.addColorStop(0, color);
        glowGradient.addColorStop(0.5, color + '40');
        glowGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(x, y, lightRadius * 2, 0, 2 * Math.PI);
        ctx.fill();
      }
      
      // Light base (dark circle)
      ctx.fillStyle = '#333333';
      ctx.beginPath();
      ctx.arc(x, y, lightRadius, 0, 2 * Math.PI);
      ctx.fill();
      
      // Light color
      if (isOn) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, lightRadius - 2, 0, 2 * Math.PI);
        ctx.fill();
      }
      
      // Border
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.stroke();
    };
    
    // Traffic lights at corners
    drawGlowingLight(centerX, centerY - lightOffset, '#22c55e', frame.lights.N === 'green');
    drawGlowingLight(centerX, centerY + lightOffset, '#22c55e', frame.lights.S === 'green');
    drawGlowingLight(centerX + lightOffset, centerY, '#22c55e', frame.lights.E === 'green');
    drawGlowingLight(centerX - lightOffset, centerY, '#22c55e', frame.lights.W === 'green');
    
    // Draw red lights over green positions if red
    drawGlowingLight(centerX, centerY - lightOffset, '#ef4444', frame.lights.N === 'red');
    drawGlowingLight(centerX, centerY + lightOffset, '#ef4444', frame.lights.S === 'red');
    drawGlowingLight(centerX + lightOffset, centerY, '#ef4444', frame.lights.E === 'red');
    drawGlowingLight(centerX - lightOffset, centerY, '#ef4444', frame.lights.W === 'red');
  };

  const initializeCanvas = useCallback((canvas: HTMLCanvasElement, mode: string) => {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      drawFrame(ctx, {
        cars: [],
        lights: { N: 'red', S: 'red', E: 'green', W: 'green' },
        metrics: { cars_processed: 0, avg_waiting_time: 0, avg_queue_length: 0, total_cars: 0, time_wasted: 0 },
        step: 0
      }, canvas.width, canvas.height, mode);
    }
  }, []);

  useEffect(() => {
    if (hardcodedCanvasRef.current) {
      initializeCanvas(hardcodedCanvasRef.current, 'hardcoded');
    }
    if (optimizedCanvasRef.current) {
      initializeCanvas(optimizedCanvasRef.current, 'optimized');
    }
  }, [initializeCanvas]);

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Traffic Simulation Demo
        </h1>
        <p className="text-muted-foreground mt-2">
          Compare hardcoded vs AI-optimized traffic light control
        </p>
      </div>

      {/* Control Buttons */}
      <div className="flex justify-center gap-4">
        <Button
          onClick={() => runSimulation('hardcoded')}
          disabled={isSimulating.hardcoded}
          variant="outline"
          size="lg"
        >
          {isSimulating.hardcoded ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Play className="w-4 h-4 mr-2" />
          )}
          Run Hardcoded
        </Button>
        
        <Button
          onClick={() => runSimulation('optimized')}
          disabled={isSimulating.optimized}
          variant="outline"
          size="lg"
        >
          {isSimulating.optimized ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Zap className="w-4 h-4 mr-2" />
          )}
          Optimize Now
        </Button>
        
        <Button
          onClick={runComparison}
          disabled={isSimulating.hardcoded || isSimulating.optimized}
          variant="default"
          size="lg"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Compare
        </Button>
      </div>

      {/* Dual Canvas Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Hardcoded Simulation */}
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-orange-600">Hardcoded</h3>
            <p className="text-sm text-muted-foreground">Traditional fixed timing</p>
          </div>
          
          <div className="relative border-2 border-orange-200 rounded-lg overflow-hidden">
            <canvas
              ref={hardcodedCanvasRef}
              width={400}
              height={300}
              className="w-full h-auto bg-slate-900"
            />
            {isSimulating.hardcoded && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="flex items-center gap-2 text-white">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Simulating...
                </div>
              </div>
            )}
          </div>
          
          {simulationResults.hardcoded && (
            <Card className="border-orange-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-orange-600">Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Time Wasted</div>
                    <div className="text-lg font-bold text-orange-600">
                      {simulationResults.hardcoded.frames.length > 0
                        ? simulationResults.hardcoded.frames[simulationResults.hardcoded.frames.length - 1].metrics.time_wasted.toFixed(1) + 's'
                        : '0s'
                      }
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Avg Wait/Car</div>
                    <div className="text-lg font-bold">
                      {simulationResults.hardcoded.metrics.avg_waiting_time.toFixed(1)}s
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Cars Processed</div>
                    <div className="text-lg font-bold text-green-600">
                      {simulationResults.hardcoded.metrics.cars_processed}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Efficiency</div>
                    <div className="text-lg font-bold text-blue-600">
                      {simulationResults.hardcoded.metrics.efficiency_score.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Optimized Simulation */}
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-green-600">Optimized</h3>
            <p className="text-sm text-muted-foreground">AI-powered adaptive control</p>
          </div>
          
          <div className="relative border-2 border-green-200 rounded-lg overflow-hidden">
            <canvas
              ref={optimizedCanvasRef}
              width={400}
              height={300}
              className="w-full h-auto bg-slate-900"
            />
            {isSimulating.optimized && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="flex items-center gap-2 text-white">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Optimizing...
                </div>
              </div>
            )}
          </div>
          
          {simulationResults.optimized && (
            <Card className="border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-green-600">Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Time Wasted</div>
                    <div className="text-lg font-bold text-green-600">
                      {simulationResults.optimized.frames.length > 0
                        ? simulationResults.optimized.frames[simulationResults.optimized.frames.length - 1].metrics.time_wasted.toFixed(1) + 's'
                        : '0s'
                      }
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Avg Wait/Car</div>
                    <div className="text-lg font-bold">
                      {simulationResults.optimized.metrics.avg_waiting_time.toFixed(1)}s
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Cars Processed</div>
                    <div className="text-lg font-bold text-green-600">
                      {simulationResults.optimized.metrics.cars_processed}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Efficiency</div>
                    <div className="text-lg font-bold text-blue-600">
                      {simulationResults.optimized.metrics.efficiency_score.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Comparison Summary */}
      {simulationResults.hardcoded && simulationResults.optimized && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="text-center text-blue-700">Comparison Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-sm text-muted-foreground">Time Saved</div>
                <div className="text-2xl font-bold text-green-600">
                  {(() => {
                    const hardcodedWasted = simulationResults.hardcoded.frames.length > 0
                      ? simulationResults.hardcoded.frames[simulationResults.hardcoded.frames.length - 1].metrics.time_wasted
                      : 0;
                    const optimizedWasted = simulationResults.optimized.frames.length > 0
                      ? simulationResults.optimized.frames[simulationResults.optimized.frames.length - 1].metrics.time_wasted
                      : 0;
                    const saved = hardcodedWasted - optimizedWasted;
                    return saved > 0 ? `${saved.toFixed(1)}s` : '0s';
                  })()}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Efficiency Improvement</div>
                <div className="text-2xl font-bold text-blue-600">
                  {(simulationResults.optimized.metrics.efficiency_score - simulationResults.hardcoded.metrics.efficiency_score).toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Wait Time Reduction</div>
                <div className="text-2xl font-bold text-purple-600">
                  {(simulationResults.hardcoded.metrics.avg_waiting_time - simulationResults.optimized.metrics.avg_waiting_time).toFixed(1)}s
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}