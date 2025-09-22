import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, Zap, BarChart3, Loader2, Brain, Settings } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

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
  
  // Training state management
  const [isTraining, setIsTraining] = useState(false);
  const [trainingLogs, setTrainingLogs] = useState('');
  const [trainingComplete, setTrainingComplete] = useState(false);
  const [trainingError, setTrainingError] = useState<string | null>(null);
  const [trainingProgress, setTrainingProgress] = useState({
    episode: 0,
    totalEpisodes: 0,
    currentReward: 0,
    avgReward: 0,
    loss: 0,
    avgLoss: 0,
    epsilon: 0
  });
  const [trainingChartData, setTrainingChartData] = useState<Array<{episode: number, avg_reward: number}>>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);
  
  // Hyperparameter state management
  const [hyperparams, setHyperparams] = useState({
    episodes: 500,
    learningRate: 0.001,
    gamma: 0.99,
    epsilonStart: 1.0,
    epsilonEnd: 0.1,
    replayBufferSize: 10000
  });
  const [currentHyperparams, setCurrentHyperparams] = useState<typeof hyperparams | null>(null);

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

  const runTraining = async () => {
    setIsTraining(true);
    setTrainingLogs('');
    setTrainingComplete(false);
    setTrainingError(null);
    setTrainingProgress({
      episode: 0,
      totalEpisodes: 0,
      currentReward: 0,
      avgReward: 0,
      loss: 0,
      avgLoss: 0,
      epsilon: 0
    });
    setTrainingChartData([]);
    setCurrentHyperparams(hyperparams); // Store current hyperparams for display
    
    try {
      const response = await fetch('/api/train', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(hyperparams),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle streaming JSON response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (reader) {
        let buffer = '';
        
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          
          // Split by lines and process complete lines
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line in buffer
          
          for (const line of lines) {
            if (line.trim() && line.startsWith('data: ')) {
              try {
                const jsonStr = line.replace('data: ', '');
                const progressData = JSON.parse(jsonStr);
                
                // Handle error responses
                if (progressData.error) {
                  setTrainingError(progressData.message);
                  if (progressData.completed) {
                    setIsTraining(false);
                    return;
                  }
                  continue;
                }
                
                // Update progress state
                if (progressData.episode !== undefined) {
                  setTrainingProgress({
                    episode: progressData.episode,
                    totalEpisodes: progressData.total_episodes,
                    currentReward: progressData.current_reward || 0,
                    avgReward: progressData.avg_reward || 0,
                    loss: progressData.loss || 0,
                    avgLoss: progressData.avg_loss || 0,
                    epsilon: progressData.epsilon || 0
                  });
                  
                  // Update chart data
                  if (progressData.chart_data) {
                    setTrainingChartData(progressData.chart_data);
                  }
                  
                  // Add to training logs
                  const logLine = `Episode ${progressData.episode}/${progressData.total_episodes} - Reward: ${(progressData.current_reward || 0).toFixed(2)} - Loss: ${(progressData.loss || 0).toFixed(4)} - Epsilon: ${(progressData.epsilon || 0).toFixed(3)}`;
                  setTrainingLogs(prev => prev + logLine + '\n');
                }
                
                // Handle completion
                if (progressData.completed) {
                  setTrainingComplete(true);
                  if (progressData.message) {
                    setTrainingLogs(prev => prev + progressData.message + '\n');
                  }
                }
                
                // Auto-scroll to bottom
                setTimeout(() => {
                  logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
                
              } catch (jsonError) {
                console.error('Failed to parse JSON:', jsonError, line);
                setTrainingLogs(prev => prev + line.replace('data: ', '') + '\n');
              }
            }
          }
        }
      } else {
        // Fallback for browsers that don't support streaming
        const text = await response.text();
        try {
          const progressData = JSON.parse(text);
          if (progressData.error) {
            setTrainingError(progressData.message);
          } else {
            setTrainingLogs(text);
            setTrainingComplete(true);
          }
        } catch {
          setTrainingLogs(text);
          setTrainingComplete(true);
        }
      }
      
      setTrainingError(null);
    } catch (error) {
      console.error('Training failed:', error);
      setTrainingError(`Training failed: ${error}`);
    } finally {
      setIsTraining(false);
    }
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

      {/* Hyperparameter Configuration */}
      <Card className="mx-auto max-w-4xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Training Hyperparameters
          </CardTitle>
          <CardDescription>
            Adjust the training parameters before starting the agent training
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="episodes">Episodes</Label>
              <Input
                id="episodes"
                type="number"
                value={hyperparams.episodes}
                onChange={(e) => setHyperparams({...hyperparams, episodes: parseInt(e.target.value) || 500})}
                disabled={isTraining}
                min="100"
                max="5000"
                step="100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="learningRate">Learning Rate</Label>
              <Input
                id="learningRate"
                type="number"
                value={hyperparams.learningRate}
                onChange={(e) => setHyperparams({...hyperparams, learningRate: parseFloat(e.target.value) || 0.001})}
                disabled={isTraining}
                min="0.0001"
                max="0.1"
                step="0.0001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gamma">Gamma / Discount Factor</Label>
              <Input
                id="gamma"
                type="number"
                value={hyperparams.gamma}
                onChange={(e) => setHyperparams({...hyperparams, gamma: parseFloat(e.target.value) || 0.99})}
                disabled={isTraining}
                min="0.1"
                max="1.0"
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="epsilonStart">Epsilon Start</Label>
              <Input
                id="epsilonStart"
                type="number"
                value={hyperparams.epsilonStart}
                onChange={(e) => setHyperparams({...hyperparams, epsilonStart: parseFloat(e.target.value) || 1.0})}
                disabled={isTraining}
                min="0.1"
                max="1.0"
                step="0.1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="epsilonEnd">Epsilon End</Label>
              <Input
                id="epsilonEnd"
                type="number"
                value={hyperparams.epsilonEnd}
                onChange={(e) => setHyperparams({...hyperparams, epsilonEnd: parseFloat(e.target.value) || 0.1})}
                disabled={isTraining}
                min="0.01"
                max="1.0"
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="replayBufferSize">Replay Buffer Size</Label>
              <Input
                id="replayBufferSize"
                type="number"
                value={hyperparams.replayBufferSize}
                onChange={(e) => setHyperparams({...hyperparams, replayBufferSize: parseInt(e.target.value) || 10000})}
                disabled={isTraining}
                min="1000"
                max="100000"
                step="1000"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Control Buttons */}
      <div className="flex justify-center gap-4">
        <Button
          onClick={runTraining}
          disabled={isTraining || isSimulating.hardcoded || isSimulating.optimized}
          variant="secondary"
          size="lg"
        >
          {isTraining ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Brain className="w-4 h-4 mr-2" />
          )}
          Train Agent
        </Button>
        
        <Button
          onClick={() => runSimulation('hardcoded')}
          disabled={isTraining || isSimulating.hardcoded}
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
          disabled={isTraining || isSimulating.optimized}
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
          disabled={isTraining || isSimulating.hardcoded || isSimulating.optimized}
          variant="default"
          size="lg"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Compare
        </Button>
      </div>

      {/* Enhanced Training Display */}
      {(isTraining || trainingLogs || trainingComplete || trainingError) && (
        <Card className="mx-auto max-w-6xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Agent Training
              {isTraining && <Loader2 className="w-4 h-4 animate-spin" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {trainingError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 font-medium">Training Failed</p>
                <p className="text-red-600 text-sm">{trainingError}</p>
              </div>
            )}
            
            {trainingComplete && !trainingError && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-700 font-medium">✅ Training Complete! Model saved.</p>
                <p className="text-green-600 text-sm">You can now use "Optimize Now" and "Compare" with the trained model.</p>
              </div>
            )}
            
            {(isTraining || trainingProgress.totalEpisodes > 0) && (
              <div className="space-y-4">
                {/* Hyperparameters Display */}
                {currentHyperparams && (
                  <Card className="p-4 bg-muted/50">
                    <div className="text-sm font-medium mb-3">Training Configuration:</div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div><strong>Episodes:</strong> {currentHyperparams.episodes}</div>
                      <div><strong>Learning Rate:</strong> {currentHyperparams.learningRate}</div>
                      <div><strong>Gamma:</strong> {currentHyperparams.gamma}</div>
                      <div><strong>Epsilon:</strong> {currentHyperparams.epsilonStart} → {currentHyperparams.epsilonEnd}</div>
                      <div><strong>Buffer Size:</strong> {currentHyperparams.replayBufferSize.toLocaleString()}</div>
                    </div>
                  </Card>
                )}
                
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Training Progress</span>
                    <span className="text-muted-foreground">
                      {trainingProgress.episode} / {trainingProgress.totalEpisodes} episodes
                    </span>
                  </div>
                  <Progress 
                    value={(trainingProgress.episode / trainingProgress.totalEpisodes) * 100} 
                    className="h-2"
                  />
                  <div className="text-center text-sm text-muted-foreground">
                    {((trainingProgress.episode / trainingProgress.totalEpisodes) * 100).toFixed(1)}% complete
                  </div>
                </div>

                {/* Stats Panel */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="p-4">
                    <div className="text-sm text-muted-foreground">Current Episode</div>
                    <div className="text-2xl font-bold text-blue-600">{trainingProgress.episode}</div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-sm text-muted-foreground">Latest Reward</div>
                    <div className="text-2xl font-bold text-green-600">{trainingProgress.currentReward.toFixed(2)}</div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-sm text-muted-foreground">Avg Reward</div>
                    <div className="text-2xl font-bold text-purple-600">{trainingProgress.avgReward.toFixed(2)}</div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-sm text-muted-foreground">Current Loss</div>
                    <div className="text-2xl font-bold text-orange-600">{trainingProgress.loss.toFixed(4)}</div>
                  </Card>
                </div>

                {/* Line Chart */}
                {trainingChartData.length > 0 && (
                  <Card className="p-4">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg">Average Reward Progress</CardTitle>
                      <CardDescription>Average reward per 50 episodes</CardDescription>
                    </CardHeader>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trainingChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="episode" 
                            label={{ value: 'Episode', position: 'insideBottom', offset: -5 }}
                          />
                          <YAxis 
                            label={{ value: 'Avg Reward', angle: -90, position: 'insideLeft' }}
                          />
                          <Tooltip 
                            formatter={(value: number) => [value.toFixed(2), 'Avg Reward']}
                            labelFormatter={(episode) => `Episode ${episode}`}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="avg_reward" 
                            stroke="#8884d8" 
                            strokeWidth={2}
                            dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, stroke: '#8884d8', strokeWidth: 2 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                )}
              </div>
            )}
            
            {/* Training Logs (Collapsible) */}
            {(trainingLogs || isTraining) && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Training Logs:</h4>
                <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-48 overflow-y-auto">
                  <pre className="whitespace-pre-wrap">{trainingLogs}</pre>
                  {isTraining && (
                    <div className="flex items-center gap-2 mt-2 text-blue-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Training in progress...
                    </div>
                  )}
                  <div ref={logsEndRef} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

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