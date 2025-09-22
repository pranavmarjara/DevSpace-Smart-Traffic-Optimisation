import React, { useState } from 'react';
import AnimatedIntersection from './AnimatedIntersection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, Play, Pause } from "lucide-react";

interface GridIntersection {
  id: string;
  name: string;
  status: 'optimal' | 'moderate' | 'congested';
  signalTimings: {
    northSouth: number;
    eastWest: number;
  };
  x: number; // Grid position
  y: number; // Grid position
}

interface AnimatedTrafficGridProps {
  intersections: GridIntersection[];
  selectedIntersection?: string;
  onIntersectionSelect: (id: string) => void;
}

export default function AnimatedTrafficGrid({
  intersections,
  selectedIntersection,
  onIntersectionSelect
}: AnimatedTrafficGridProps) {
  const [isGlobalOptimizing, setIsGlobalOptimizing] = useState(false);
  
  const congestedCount = intersections.filter(i => i.status === 'congested').length;
  const moderateCount = intersections.filter(i => i.status === 'moderate').length;
  const optimalCount = intersections.filter(i => i.status === 'optimal').length;

  const handleGlobalOptimization = async () => {
    setIsGlobalOptimizing(true);
    
    // Realistic global optimization delay (8-15 seconds)
    const delay = 8000 + Math.random() * 7000;
    
    setTimeout(() => {
      setIsGlobalOptimizing(false);
      // In a real system, this would trigger backend optimization
      console.log('Global traffic optimization completed');
    }, delay);
  };

  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-xl font-bold">Live Traffic Network</CardTitle>
          <CardDescription>
            Real-time animated view of traffic intersections with live vehicle movement
          </CardDescription>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Optimal ({optimalCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Moderate ({moderateCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Congested ({congestedCount})</span>
            </div>
          </div>
          
          <Button
            onClick={handleGlobalOptimization}
            disabled={isGlobalOptimizing}
            variant="default"
            size="sm"
          >
            {isGlobalOptimizing ? (
              <>
                <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                Optimizing... ({Math.floor(8 + Math.random() * 7)}s)
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Optimize All
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {intersections.map((intersection) => (
            <AnimatedIntersection
              key={intersection.id}
              intersection={intersection}
              isSelected={selectedIntersection === intersection.id}
              onSelect={() => onIntersectionSelect(intersection.id)}
              className="transition-all duration-300 hover:shadow-lg cursor-pointer"
            />
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Live animation updates every second • Vehicle movement in real-time</span>
            <Badge variant="outline" className="text-green-600 border-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              LIVE
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}