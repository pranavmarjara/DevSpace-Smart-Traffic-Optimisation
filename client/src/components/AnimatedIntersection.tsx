import React, { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";

interface Vehicle {
  id: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  color: string;
  direction: 'north' | 'south' | 'east' | 'west';
  status: 'approaching' | 'waiting' | 'moving' | 'exiting';
  speed: number;
}

interface TrafficLightState {
  north: 'red' | 'yellow' | 'green';
  south: 'red' | 'yellow' | 'green';
  east: 'red' | 'yellow' | 'green';
  west: 'red' | 'yellow' | 'green';
}

interface AnimatedIntersectionProps {
  intersection: {
    id: string;
    name: string;
    status: 'optimal' | 'moderate' | 'congested';
    signalTimings: {
      northSouth: number;
      eastWest: number;
    };
  };
  isSelected?: boolean;
  onSelect?: () => void;
  className?: string;
}

const INTERSECTION_SIZE = 400;
const ROAD_WIDTH = 80;
const TRAFFIC_LIGHT_SIZE = 16;
const VEHICLE_SIZE = 8;

// Vehicle spawn positions and target positions
const SPAWN_POSITIONS = {
  north: { x: INTERSECTION_SIZE/2 - 20, y: -10 },
  south: { x: INTERSECTION_SIZE/2 + 20, y: INTERSECTION_SIZE + 10 },
  east: { x: INTERSECTION_SIZE + 10, y: INTERSECTION_SIZE/2 - 20 },
  west: { x: -10, y: INTERSECTION_SIZE/2 + 20 }
};

const INTERSECTION_POSITIONS = {
  north: { x: INTERSECTION_SIZE/2 - 20, y: INTERSECTION_SIZE/2 - 40 },
  south: { x: INTERSECTION_SIZE/2 + 20, y: INTERSECTION_SIZE/2 + 40 },
  east: { x: INTERSECTION_SIZE/2 + 40, y: INTERSECTION_SIZE/2 - 20 },
  west: { x: INTERSECTION_SIZE/2 - 40, y: INTERSECTION_SIZE/2 + 20 }
};

const EXIT_POSITIONS = {
  north: { x: INTERSECTION_SIZE/2 - 20, y: INTERSECTION_SIZE + 10 },
  south: { x: INTERSECTION_SIZE/2 + 20, y: -10 },
  east: { x: -10, y: INTERSECTION_SIZE/2 - 20 },
  west: { x: INTERSECTION_SIZE + 10, y: INTERSECTION_SIZE/2 + 20 }
};

export default function AnimatedIntersection({ 
  intersection, 
  isSelected = false, 
  onSelect,
  className = ""
}: AnimatedIntersectionProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [trafficLights, setTrafficLights] = useState<TrafficLightState>({
    north: 'red',
    south: 'red', 
    east: 'green',
    west: 'green'
  });
  const [currentPhase, setCurrentPhase] = useState<'ns' | 'ew'>('ew');
  const [phaseTimer, setPhaseTimer] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const vehicleIdCounter = useRef(0);
  const animationRef = useRef<number>();

  // Traffic light timing logic
  useEffect(() => {
    const timer = setInterval(() => {
      setPhaseTimer(prev => {
        const newTimer = prev + 1;
        const currentDuration = currentPhase === 'ns' ? intersection.signalTimings.northSouth : intersection.signalTimings.eastWest;
        
        // Yellow light phase (last 3 seconds)
        if (newTimer >= currentDuration - 3 && !isTransitioning) {
          setIsTransitioning(true);
          setTrafficLights(prev => {
            const newLights = { ...prev };
            if (currentPhase === 'ns') {
              newLights.north = 'yellow';
              newLights.south = 'yellow';
            } else {
              newLights.east = 'yellow';
              newLights.west = 'yellow';
            }
            return newLights;
          });
        }
        
        // Switch phase
        if (newTimer >= currentDuration) {
          setIsTransitioning(false);
          setCurrentPhase(prev => prev === 'ns' ? 'ew' : 'ns');
          setTrafficLights(prev => {
            if (currentPhase === 'ns') {
              return {
                north: 'red',
                south: 'red',
                east: 'green', 
                west: 'green'
              };
            } else {
              return {
                north: 'green',
                south: 'green',
                east: 'red',
                west: 'red'
              };
            }
          });
          return 0;
        }
        
        return newTimer;
      });
    }, 1000); // 1 second intervals for realistic timing

    return () => clearInterval(timer);
  }, [currentPhase, intersection.signalTimings, isTransitioning]);

  // Vehicle spawning logic
  useEffect(() => {
    const spawnInterval = setInterval(() => {
      // Random chance to spawn vehicles
      if (Math.random() < 0.3) {
        const directions: ('north' | 'south' | 'east' | 'west')[] = ['north', 'south', 'east', 'west'];
        const direction = directions[Math.floor(Math.random() * directions.length)];
        const colors = ['#ef4444', '#3b82f6', '#eab308', '#f3f4f6', '#10b981'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        const newVehicle: Vehicle = {
          id: `vehicle_${vehicleIdCounter.current++}`,
          ...SPAWN_POSITIONS[direction],
          ...SPAWN_POSITIONS[direction],
          targetX: INTERSECTION_POSITIONS[direction].x,
          targetY: INTERSECTION_POSITIONS[direction].y,
          color,
          direction,
          status: 'approaching',
          speed: 1 + Math.random() * 0.5
        };

        setVehicles(prev => [...prev, newVehicle]);
      }
    }, 2000 + Math.random() * 3000); // Random spawn every 2-5 seconds

    return () => clearInterval(spawnInterval);
  }, []);

  // Vehicle movement animation
  useEffect(() => {
    const animate = () => {
      setVehicles(prevVehicles => {
        return prevVehicles.map(vehicle => {
          const canMove = vehicle.status === 'approaching' || 
                         (vehicle.status === 'waiting' && 
                          ((vehicle.direction === 'north' || vehicle.direction === 'south') && 
                           trafficLights[vehicle.direction] === 'green')) ||
                         (vehicle.status === 'waiting' && 
                          ((vehicle.direction === 'east' || vehicle.direction === 'west') && 
                           trafficLights[vehicle.direction] === 'green'));

          if (!canMove && vehicle.status === 'approaching') {
            // Check if vehicle should stop at intersection
            const distanceToIntersection = Math.sqrt(
              Math.pow(vehicle.targetX - vehicle.x, 2) + 
              Math.pow(vehicle.targetY - vehicle.y, 2)
            );
            
            if (distanceToIntersection < 20 && trafficLights[vehicle.direction] !== 'green') {
              return { ...vehicle, status: 'waiting' };
            }
          }

          if (canMove || vehicle.status === 'moving' || vehicle.status === 'exiting') {
            const dx = vehicle.targetX - vehicle.x;
            const dy = vehicle.targetY - vehicle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 2) {
              // Reached target, set new target
              if (vehicle.status === 'approaching' || vehicle.status === 'waiting') {
                return {
                  ...vehicle,
                  x: vehicle.targetX,
                  y: vehicle.targetY,
                  targetX: EXIT_POSITIONS[vehicle.direction].x,
                  targetY: EXIT_POSITIONS[vehicle.direction].y,
                  status: 'moving'
                };
              } else {
                // Vehicle has exited, remove it
                return null;
              }
            } else {
              // Move toward target
              const moveX = (dx / distance) * vehicle.speed;
              const moveY = (dy / distance) * vehicle.speed;
              
              return {
                ...vehicle,
                x: vehicle.x + moveX,
                y: vehicle.y + moveY,
                status: vehicle.status === 'waiting' ? 'moving' : vehicle.status
              };
            }
          }

          return vehicle;
        }).filter(Boolean) as Vehicle[];
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [trafficLights]);

  const TrafficLight = ({ 
    direction, 
    x, 
    y 
  }: { 
    direction: keyof TrafficLightState; 
    x: number; 
    y: number; 
  }) => (
    <g transform={`translate(${x}, ${y})`}>
      {/* Traffic light pole */}
      <rect x="-2" y="0" width="4" height="30" fill="#666" />
      
      {/* Traffic light housing */}
      <rect x="-8" y="-24" width="16" height="24" rx="2" fill="#333" />
      
      {/* Red light */}
      <circle 
        cx="0" 
        cy="-18" 
        r="4" 
        fill={trafficLights[direction] === 'red' ? '#ef4444' : '#7f1d1d'}
        opacity={trafficLights[direction] === 'red' ? 1 : 0.3}
      />
      
      {/* Yellow light */}
      <circle 
        cx="0" 
        cy="-12" 
        r="4" 
        fill={trafficLights[direction] === 'yellow' ? '#eab308' : '#713f12'}
        opacity={trafficLights[direction] === 'yellow' ? 1 : 0.3}
      />
      
      {/* Green light */}
      <circle 
        cx="0" 
        cy="-6" 
        r="4" 
        fill={trafficLights[direction] === 'green' ? '#10b981' : '#064e3b'}
        opacity={trafficLights[direction] === 'green' ? 1 : 0.3}
      />
    </g>
  );

  return (
    <Card 
      className={`relative transition-all duration-300 ${
        isSelected ? 'ring-2 ring-primary shadow-lg' : ''
      } ${className}`}
      onClick={onSelect}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">{intersection.name}</h3>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            intersection.status === 'optimal' ? 'bg-green-100 text-green-800' :
            intersection.status === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {intersection.status}
          </div>
        </div>

        <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
          <svg 
            width="100%" 
            height="100%" 
            viewBox={`0 0 ${INTERSECTION_SIZE} ${INTERSECTION_SIZE}`}
            className="absolute inset-0"
          >
            {/* Grass background */}
            <rect x="0" y="0" width={INTERSECTION_SIZE} height={INTERSECTION_SIZE} fill="#22c55e" />
            
            {/* Roads */}
            {/* North-South road */}
            <rect 
              x={INTERSECTION_SIZE/2 - ROAD_WIDTH/2} 
              y="0" 
              width={ROAD_WIDTH} 
              height={INTERSECTION_SIZE} 
              fill="#374151" 
            />
            
            {/* East-West road */}
            <rect 
              x="0" 
              y={INTERSECTION_SIZE/2 - ROAD_WIDTH/2} 
              width={INTERSECTION_SIZE} 
              height={ROAD_WIDTH} 
              fill="#374151" 
            />

            {/* Road markings - dashed yellow lines */}
            <line 
              x1={INTERSECTION_SIZE/2} 
              y1="0" 
              x2={INTERSECTION_SIZE/2} 
              y2={INTERSECTION_SIZE/2 - ROAD_WIDTH/2} 
              stroke="#eab308" 
              strokeWidth="2" 
              strokeDasharray="10,5" 
            />
            <line 
              x1={INTERSECTION_SIZE/2} 
              y1={INTERSECTION_SIZE/2 + ROAD_WIDTH/2} 
              x2={INTERSECTION_SIZE/2} 
              y2={INTERSECTION_SIZE} 
              stroke="#eab308" 
              strokeWidth="2" 
              strokeDasharray="10,5" 
            />
            <line 
              x1="0" 
              y1={INTERSECTION_SIZE/2} 
              x2={INTERSECTION_SIZE/2 - ROAD_WIDTH/2} 
              y2={INTERSECTION_SIZE/2} 
              stroke="#eab308" 
              strokeWidth="2" 
              strokeDasharray="10,5" 
            />
            <line 
              x1={INTERSECTION_SIZE/2 + ROAD_WIDTH/2} 
              y1={INTERSECTION_SIZE/2} 
              x2={INTERSECTION_SIZE} 
              y2={INTERSECTION_SIZE/2} 
              stroke="#eab308" 
              strokeWidth="2" 
              strokeDasharray="10,5" 
            />

            {/* Crosswalks */}
            <g stroke="#f3f4f6" strokeWidth="3">
              {/* North crosswalk */}
              {[...Array(8)].map((_, i) => (
                <line 
                  key={`north-${i}`}
                  x1={INTERSECTION_SIZE/2 - ROAD_WIDTH/2 + 5 + i * 9} 
                  y1={INTERSECTION_SIZE/2 - ROAD_WIDTH/2 - 5} 
                  x2={INTERSECTION_SIZE/2 - ROAD_WIDTH/2 + 5 + i * 9} 
                  y2={INTERSECTION_SIZE/2 - ROAD_WIDTH/2 - 15} 
                />
              ))}
              
              {/* South crosswalk */}
              {[...Array(8)].map((_, i) => (
                <line 
                  key={`south-${i}`}
                  x1={INTERSECTION_SIZE/2 - ROAD_WIDTH/2 + 5 + i * 9} 
                  y1={INTERSECTION_SIZE/2 + ROAD_WIDTH/2 + 5} 
                  x2={INTERSECTION_SIZE/2 - ROAD_WIDTH/2 + 5 + i * 9} 
                  y2={INTERSECTION_SIZE/2 + ROAD_WIDTH/2 + 15} 
                />
              ))}
              
              {/* East crosswalk */}
              {[...Array(8)].map((_, i) => (
                <line 
                  key={`east-${i}`}
                  x1={INTERSECTION_SIZE/2 + ROAD_WIDTH/2 + 5} 
                  y1={INTERSECTION_SIZE/2 - ROAD_WIDTH/2 + 5 + i * 9} 
                  x2={INTERSECTION_SIZE/2 + ROAD_WIDTH/2 + 15} 
                  y2={INTERSECTION_SIZE/2 - ROAD_WIDTH/2 + 5 + i * 9} 
                />
              ))}
              
              {/* West crosswalk */}
              {[...Array(8)].map((_, i) => (
                <line 
                  key={`west-${i}`}
                  x1={INTERSECTION_SIZE/2 - ROAD_WIDTH/2 - 5} 
                  y1={INTERSECTION_SIZE/2 - ROAD_WIDTH/2 + 5 + i * 9} 
                  x2={INTERSECTION_SIZE/2 - ROAD_WIDTH/2 - 15} 
                  y2={INTERSECTION_SIZE/2 - ROAD_WIDTH/2 + 5 + i * 9} 
                />
              ))}
            </g>

            {/* Traffic lights */}
            <TrafficLight direction="north" x={INTERSECTION_SIZE/2 + 25} y={INTERSECTION_SIZE/2 - ROAD_WIDTH/2 - 10} />
            <TrafficLight direction="south" x={INTERSECTION_SIZE/2 - 25} y={INTERSECTION_SIZE/2 + ROAD_WIDTH/2 + 10} />
            <TrafficLight direction="east" x={INTERSECTION_SIZE/2 + ROAD_WIDTH/2 + 10} y={INTERSECTION_SIZE/2 + 25} />
            <TrafficLight direction="west" x={INTERSECTION_SIZE/2 - ROAD_WIDTH/2 - 10} y={INTERSECTION_SIZE/2 - 25} />

            {/* Vehicles */}
            {vehicles.map(vehicle => (
              <circle
                key={vehicle.id}
                cx={vehicle.x}
                cy={vehicle.y}
                r={VEHICLE_SIZE}
                fill={vehicle.color}
                stroke="#000"
                strokeWidth="1"
                className="transition-all duration-100"
              />
            ))}
          </svg>

          {/* Timer display */}
          <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
            Phase: {currentPhase.toUpperCase()} | Timer: {phaseTimer}s
          </div>
        </div>
      </div>
    </Card>
  );
}