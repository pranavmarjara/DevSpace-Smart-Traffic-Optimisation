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
  baseSpeed: number;
}

interface TrafficLightState {
  north: 'red' | 'yellow' | 'green';
  south: 'red' | 'yellow' | 'green';
  east: 'red' | 'yellow' | 'green';
  west: 'red' | 'yellow' | 'green';
}

interface VehicleSpawnEvent {
  time: number;
  direction: 'north' | 'south' | 'east' | 'west';
  color: string;
  speed: number;
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
  vehicleSpawnEvents?: VehicleSpawnEvent[];
  simulationTime?: number;
  useRandomSpawning?: boolean;
}

const INTERSECTION_SIZE = 400;
const ROAD_WIDTH = 80;
const TRAFFIC_LIGHT_SIZE = 16;
const VEHICLE_SIZE = 8;
const MIN_VEHICLE_DISTANCE = 25; // Minimum distance between vehicles
const SAFE_FOLLOWING_DISTANCE = 30; // Safe following distance

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
  className = "",
  vehicleSpawnEvents = [],
  simulationTime = 0,
  useRandomSpawning = true
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
  
  // Validate signal timings - allow short timings for demo mode (< 15s), otherwise clamp to 30-45s
  const validatedSignalTimings = {
    northSouth: intersection.signalTimings.northSouth < 15 
      ? Math.max(2, intersection.signalTimings.northSouth) // Demo mode: minimum 2s
      : Math.max(30, Math.min(45, intersection.signalTimings.northSouth)), // Normal mode: 30-45s
    eastWest: intersection.signalTimings.eastWest < 15
      ? Math.max(2, intersection.signalTimings.eastWest) // Demo mode: minimum 2s  
      : Math.max(30, Math.min(45, intersection.signalTimings.eastWest)) // Normal mode: 30-45s
  };
  
  const vehicleIdCounter = useRef(0);
  const animationRef = useRef<number>();
  const lastSpawnIndex = useRef(0);

  // Calculate yellow duration consistently
  const getYellowDuration = (phaseDuration: number) => phaseDuration <= 5 ? 1 : 3;

  // Traffic light timing logic
  useEffect(() => {
    const timer = setInterval(() => {
      setPhaseTimer(prev => {
        const newTimer = prev + 1;
        const currentDuration = currentPhase === 'ns' ? validatedSignalTimings.northSouth : validatedSignalTimings.eastWest;
        const yellowDuration = getYellowDuration(currentDuration);
        
        // Start yellow light phase
        if (newTimer >= currentDuration - yellowDuration && !isTransitioning) {
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
        
        // Switch phase when timer reaches full duration
        if (newTimer >= currentDuration) {
          setIsTransitioning(false);
          setCurrentPhase(prev => prev === 'ns' ? 'ew' : 'ns');
          setTrafficLights(prev => {
            if (currentPhase === 'ns') {
              // Switching from NS to EW
              return {
                north: 'red',
                south: 'red',
                east: 'green', 
                west: 'green'
              };
            } else {
              // Switching from EW to NS
              return {
                north: 'green',
                south: 'green',
                east: 'red',
                west: 'red'
              };
            }
          });
          return 0; // Reset timer for next phase
        }
        
        return newTimer;
      });
    }, 1000); // Update every second

    return () => clearInterval(timer);
  }, [currentPhase, validatedSignalTimings.northSouth, validatedSignalTimings.eastWest]);

  // Helper function to check for vehicle collisions in same lane
  const checkCollisionInLane = (newVehicle: Vehicle, existingVehicles: Vehicle[]): boolean => {
    const sameDirectionVehicles = existingVehicles.filter(v => v.direction === newVehicle.direction);
    
    for (const vehicle of sameDirectionVehicles) {
      const distance = Math.sqrt(
        Math.pow(vehicle.x - newVehicle.x, 2) + 
        Math.pow(vehicle.y - newVehicle.y, 2)
      );
      
      if (distance < MIN_VEHICLE_DISTANCE) {
        return true; // Collision detected
      }
    }
    return false;
  };

  // Helper function to find vehicles ahead in same lane
  const findVehicleAhead = (vehicle: Vehicle, allVehicles: Vehicle[]): Vehicle | null => {
    const sameDirectionVehicles = allVehicles.filter(v => 
      v.direction === vehicle.direction && v.id !== vehicle.id
    );
    
    let closestVehicle: Vehicle | null = null;
    let closestDistance = Infinity;
    
    for (const otherVehicle of sameDirectionVehicles) {
      // Check if the other vehicle is ahead in the movement direction
      let isAhead = false;
      let distance = 0;
      
      switch (vehicle.direction) {
        case 'north':
          isAhead = otherVehicle.y > vehicle.y;
          distance = otherVehicle.y - vehicle.y;
          break;
        case 'south':
          isAhead = otherVehicle.y < vehicle.y;
          distance = vehicle.y - otherVehicle.y;
          break;
        case 'east':
          isAhead = otherVehicle.x < vehicle.x;
          distance = vehicle.x - otherVehicle.x;
          break;
        case 'west':
          isAhead = otherVehicle.x > vehicle.x;
          distance = otherVehicle.x - vehicle.x;
          break;
      }
      
      if (isAhead && distance < closestDistance && distance > 0) {
        closestDistance = distance;
        closestVehicle = otherVehicle;
      }
    }
    
    return closestVehicle;
  };

  // Synchronized vehicle spawning logic
  useEffect(() => {
    if (!useRandomSpawning && vehicleSpawnEvents.length > 0) {
      // Spawn vehicles based on synchronized events
      const currentTime = simulationTime;
      
      for (let i = lastSpawnIndex.current; i < vehicleSpawnEvents.length; i++) {
        const spawnEvent = vehicleSpawnEvents[i];
        
        if (spawnEvent.time <= currentTime) {
          const newVehicle: Vehicle = {
            id: `vehicle_${vehicleIdCounter.current++}`,
            ...SPAWN_POSITIONS[spawnEvent.direction],
            targetX: INTERSECTION_POSITIONS[spawnEvent.direction].x,
            targetY: INTERSECTION_POSITIONS[spawnEvent.direction].y,
            color: spawnEvent.color,
            direction: spawnEvent.direction,
            status: 'approaching',
            speed: spawnEvent.speed,
            baseSpeed: spawnEvent.speed
          };
          
          // Only spawn if no collision
          setVehicles(prev => {
            if (!checkCollisionInLane(newVehicle, prev)) {
              return [...prev, newVehicle];
            }
            return prev;
          });
          
          lastSpawnIndex.current = i + 1;
        } else {
          break;
        }
      }
    }
  }, [simulationTime, vehicleSpawnEvents, useRandomSpawning]);

  // Random vehicle spawning logic (fallback)
  useEffect(() => {
    if (!useRandomSpawning) return;
    
    const spawnInterval = setInterval(() => {
      // Random chance to spawn vehicles
      if (Math.random() < 0.3) {
        const directions: ('north' | 'south' | 'east' | 'west')[] = ['north', 'south', 'east', 'west'];
        const direction = directions[Math.floor(Math.random() * directions.length)];
        const colors = ['#ef4444', '#3b82f6', '#eab308', '#f3f4f6', '#10b981'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const baseSpeed = 1 + Math.random() * 0.5;
        
        const newVehicle: Vehicle = {
          id: `vehicle_${vehicleIdCounter.current++}`,
          ...SPAWN_POSITIONS[direction],
          targetX: INTERSECTION_POSITIONS[direction].x,
          targetY: INTERSECTION_POSITIONS[direction].y,
          color,
          direction,
          status: 'approaching',
          speed: baseSpeed,
          baseSpeed
        };

        setVehicles(prev => {
          if (!checkCollisionInLane(newVehicle, prev)) {
            return [...prev, newVehicle];
          }
          return prev;
        });
      }
    }, 2000 + Math.random() * 3000); // Random spawn every 2-5 seconds

    return () => clearInterval(spawnInterval);
  }, [useRandomSpawning]);

  // Vehicle movement animation with performance optimization
  useEffect(() => {
    let frameCount = 0;
    const animate = () => {
      frameCount++;
      // Only update React state every 4 frames (15fps instead of 60fps)
      if (frameCount % 4 !== 0) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      setVehicles(prevVehicles => {
        return prevVehicles.map(vehicle => {
          // Check for vehicle ahead and adjust speed accordingly
          const vehicleAhead = findVehicleAhead(vehicle, prevVehicles);
          let adjustedSpeed = vehicle.baseSpeed;
          
          if (vehicleAhead) {
            let distanceToVehicleAhead = 0;
            
            switch (vehicle.direction) {
              case 'north':
                distanceToVehicleAhead = vehicleAhead.y - vehicle.y;
                break;
              case 'south':
                distanceToVehicleAhead = vehicle.y - vehicleAhead.y;
                break;
              case 'east':
                distanceToVehicleAhead = vehicle.x - vehicleAhead.x;
                break;
              case 'west':
                distanceToVehicleAhead = vehicleAhead.x - vehicle.x;
                break;
            }
            
            // Adjust speed based on distance to vehicle ahead
            if (distanceToVehicleAhead < SAFE_FOLLOWING_DISTANCE) {
              if (distanceToVehicleAhead < MIN_VEHICLE_DISTANCE) {
                adjustedSpeed = 0; // Stop if too close
              } else {
                // Gradually reduce speed as we get closer
                const speedReduction = (SAFE_FOLLOWING_DISTANCE - distanceToVehicleAhead) / SAFE_FOLLOWING_DISTANCE;
                adjustedSpeed = vehicle.baseSpeed * (1 - speedReduction * 0.8);
              }
            }
          }
          
          // Check if vehicle should stop at intersection
          if (vehicle.status === 'approaching') {
            const distanceToIntersection = Math.sqrt(
              Math.pow(vehicle.targetX - vehicle.x, 2) + 
              Math.pow(vehicle.targetY - vehicle.y, 2)
            );
            
            // If close to intersection and light is not green, stop and wait
            if (distanceToIntersection < 25 && trafficLights[vehicle.direction] !== 'green') {
              return { ...vehicle, status: 'waiting', speed: 0 };
            }
          }

          // Determine if vehicle can move based on status and traffic light
          const canMove = vehicle.status === 'approaching' || 
                         vehicle.status === 'moving' ||
                         vehicle.status === 'exiting' ||
                         (vehicle.status === 'waiting' && trafficLights[vehicle.direction] === 'green');

          if (canMove && adjustedSpeed > 0) {
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
                  status: 'moving',
                  speed: adjustedSpeed
                };
              } else {
                // Vehicle has exited, remove it
                return null;
              }
            } else {
              // Move toward target with adjusted speed
              const moveX = (dx / distance) * adjustedSpeed;
              const moveY = (dy / distance) * adjustedSpeed;
              
              return {
                ...vehicle,
                x: vehicle.x + moveX,
                y: vehicle.y + moveY,
                speed: adjustedSpeed,
                status: vehicle.status === 'waiting' ? 'moving' : vehicle.status
              };
            }
          }

          return { ...vehicle, speed: adjustedSpeed };
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

  // Calculate remaining time for each direction
  const calculateRemainingTime = (direction: keyof TrafficLightState): number => {
    const currentDuration = currentPhase === 'ns' ? validatedSignalTimings.northSouth : validatedSignalTimings.eastWest;
    const yellowDuration = getYellowDuration(currentDuration);
    
    // Check if this direction is in the current active phase
    const isNSDirection = direction === 'north' || direction === 'south';
    const isEWDirection = direction === 'east' || direction === 'west';
    const isActivePhase = (isNSDirection && currentPhase === 'ns') || (isEWDirection && currentPhase === 'ew');
    
    if (isActivePhase) {
      // This direction is currently active
      if (trafficLights[direction] === 'green') {
        // Show time until yellow starts
        return Math.max(0, currentDuration - yellowDuration - phaseTimer);
      } else if (trafficLights[direction] === 'yellow') {
        // Show remaining yellow time
        const yellowStartTime = currentDuration - yellowDuration;
        const yellowElapsed = phaseTimer - yellowStartTime;
        return Math.max(0, yellowDuration - yellowElapsed);
      }
    } else {
      // This direction is red, show time until it becomes active
      const remainingCurrentPhase = Math.max(0, currentDuration - phaseTimer);
      return remainingCurrentPhase;
    }
    
    return 0;
  };

  const TrafficLight = ({ 
    direction, 
    x, 
    y 
  }: { 
    direction: keyof TrafficLightState; 
    x: number; 
    y: number; 
  }) => {
    const remainingTime = calculateRemainingTime(direction);
    
    return (
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
        
        {/* Countdown timer */}
        <g transform="translate(20, -12)">
          {/* Timer background */}
          <rect 
            x="-8" 
            y="-8" 
            width="16" 
            height="16" 
            rx="2" 
            fill="rgba(0, 0, 0, 0.8)" 
            stroke="#fff" 
            strokeWidth="1"
          />
          {/* Timer text */}
          <text 
            x="0" 
            y="2" 
            textAnchor="middle" 
            fill="white" 
            fontSize="10" 
            fontWeight="bold"
          >
            {Math.ceil(remainingTime)}
          </text>
        </g>
      </g>
    );
  };

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

          {/* Enhanced timer display with queue info */}
          <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
            <div>Phase: {currentPhase.toUpperCase()} | Timer: {phaseTimer}s</div>
            <div className="text-xs opacity-75">
              Vehicles: {vehicles.length} | Status: {intersection.status}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}