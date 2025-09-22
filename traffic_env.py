import numpy as np
import random
from typing import Dict, List, Tuple, Any


class IntersectionEnv:
    """Traffic intersection environment for RL training and simulation."""
    
    def __init__(self, spawn_rate: float = 0.3, max_queue_length: int = 20):
        self.spawn_rate = spawn_rate
        self.max_queue_length = max_queue_length
        
        # Traffic directions: North, South, East, West
        self.directions = ['north', 'south', 'east', 'west']
        
        # Initialize queues for each direction
        self.queues = {direction: [] for direction in self.directions}
        
        # Traffic light states (0 = red, 1 = green)
        # NS group (north-south), EW group (east-west)
        self.light_state = {'ns': 1, 'ew': 0}  # Start with NS green
        
        # Timing
        self.step_count = 0
        self.light_timer = 0
        self.current_phase_duration = 30  # Default phase duration
        
        # Metrics
        self.total_waiting_time = 0
        self.cars_processed = 0
        self.avg_queue_length = 0
        
        # Action space: 0 = switch lights, 1 = keep same
        self.action_space_size = 2
        
        # State space: queue lengths [N, S, E, W] + current light phase
        self.state_space_size = len(self.directions) + 1
        
    def reset(self) -> np.ndarray:
        """Reset the environment to initial state."""
        self.queues = {direction: [] for direction in self.directions}
        self.light_state = {'ns': 1, 'ew': 0}
        self.step_count = 0
        self.light_timer = 0
        self.total_waiting_time = 0
        self.cars_processed = 0
        self.avg_queue_length = 0
        return self._get_state()
    
    def step(self, action: int) -> Tuple[np.ndarray, float, bool, Dict]:
        """Execute one time step in the environment."""
        self.step_count += 1
        
        # Handle action (0 = switch lights, 1 = keep same)
        if action == 0:
            self._switch_lights()
        
        # Spawn new cars
        self._spawn_cars()
        
        # Process cars through intersection
        self._process_cars()
        
        # Update timing
        self.light_timer += 1
        
        # Calculate metrics
        self._update_metrics()
        
        # Calculate reward
        reward = self._calculate_reward()
        
        # Check if episode is done after fixed max steps
        done = self.step_count >= 200
        
        return self._get_state(), reward, done, self._get_info()
    
    def _spawn_cars(self):
        """Randomly spawn cars in each direction."""
        for direction in self.directions:
            if random.random() < self.spawn_rate:
                if len(self.queues[direction]) < self.max_queue_length:
                    # Add car with spawn time for waiting time calculation
                    self.queues[direction].append(self.step_count)
    
    def _process_cars(self):
        """Process cars through the intersection based on light state."""
        # Process north-south traffic
        if self.light_state['ns'] == 1:
            for direction in ['north', 'south']:
                if self.queues[direction]:
                    # Remove car from queue (car goes through intersection)
                    car_spawn_time = self.queues[direction].pop(0)
                    self.cars_processed += 1
                    self.total_waiting_time += (self.step_count - car_spawn_time)
        
        # Process east-west traffic
        if self.light_state['ew'] == 1:
            for direction in ['east', 'west']:
                if self.queues[direction]:
                    # Remove car from queue (car goes through intersection)
                    car_spawn_time = self.queues[direction].pop(0)
                    self.cars_processed += 1
                    self.total_waiting_time += (self.step_count - car_spawn_time)
    
    def _switch_lights(self):
        """Switch traffic light states."""
        self.light_state['ns'] = 1 - self.light_state['ns']
        self.light_state['ew'] = 1 - self.light_state['ew']
        self.light_timer = 0
    
    def _get_state(self) -> np.ndarray:
        """Get current state representation: queue lengths [N, S, E, W] + current light phase."""
        queue_lengths = [len(self.queues[direction]) for direction in self.directions]
        # Current light phase: 0 = NS green, 1 = EW green
        current_phase = 0 if self.light_state['ns'] == 1 else 1
        state = queue_lengths + [current_phase]
        return np.array(state, dtype=np.float32)
    
    def _calculate_reward(self) -> float:
        """Calculate reward: -sum(queue_lengths) (penalize waiting cars)."""
        return -sum(len(self.queues[direction]) for direction in self.directions)
    
    def _update_metrics(self):
        """Update environment metrics."""
        total_cars = sum(len(self.queues[direction]) for direction in self.directions)
        self.avg_queue_length = total_cars / len(self.directions) if self.directions else 0
    
    def _get_info(self) -> Dict:
        """Get additional information about the environment."""
        return {
            'queues': {direction: len(self.queues[direction]) for direction in self.directions},
            'light_state': self.light_state.copy(),
            'cars_processed': self.cars_processed,
            'avg_waiting_time': self.total_waiting_time / max(1, self.cars_processed),
            'avg_queue_length': self.avg_queue_length,
            'step_count': self.step_count
        }
    
    def render_frame(self) -> Dict[str, Any]:
        """Generate a frame for visualization."""
        cars = []
        
        # Generate car positions based on queue lengths
        # Intersection center is at (0.5, 0.5)
        center_x, center_y = 0.5, 0.5
        car_spacing = 0.04
        
        # North queue (cars moving south, positioned above intersection)
        for i in range(len(self.queues['north'])):
            cars.append({
                'x': center_x,
                'y': center_y - 0.1 - (i * car_spacing),
                'color': '#3b82f6'  # Blue
            })
        
        # South queue (cars moving north, positioned below intersection)
        for i in range(len(self.queues['south'])):
            cars.append({
                'x': center_x,
                'y': center_y + 0.1 + (i * car_spacing),
                'color': '#3b82f6'  # Blue
            })
        
        # East queue (cars moving west, positioned right of intersection)
        for i in range(len(self.queues['east'])):
            cars.append({
                'x': center_x + 0.1 + (i * car_spacing),
                'y': center_y,
                'color': '#3b82f6'  # Blue
            })
        
        # West queue (cars moving east, positioned left of intersection)
        for i in range(len(self.queues['west'])):
            cars.append({
                'x': center_x - 0.1 - (i * car_spacing),
                'y': center_y,
                'color': '#3b82f6'  # Blue
            })
        
        return {
            'cars': cars,
            'lights': {
                'N': 'green' if self.light_state['ns'] == 1 else 'red',
                'S': 'green' if self.light_state['ns'] == 1 else 'red',
                'E': 'green' if self.light_state['ew'] == 1 else 'red',
                'W': 'green' if self.light_state['ew'] == 1 else 'red'
            },
            'metrics': {
                'cars_processed': self.cars_processed,
                'avg_waiting_time': self.total_waiting_time / max(1, self.cars_processed),
                'avg_queue_length': self.avg_queue_length,
                'total_cars': sum(len(self.queues[direction]) for direction in self.directions),
                'time_wasted': self.total_waiting_time
            },
            'step': self.step_count
        }
    
    def run_simulation(self, steps: int, policy_func=None) -> List[Dict[str, Any]]:
        """Run a complete simulation and return all frames."""
        self.reset()
        frames = []
        
        for _ in range(steps):
            # Get action from policy or use default alternating
            if policy_func:
                action = policy_func(self._get_state())
            else:
                # Simple alternating policy: switch every 30 steps
                action = 1 if self.light_timer >= 30 else 0
            
            self.step(action)
            frames.append(self.render_frame())
        
        return frames