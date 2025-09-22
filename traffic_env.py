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
        
        # Traffic light states: 'green', 'yellow', 'red'
        # NS group (north-south), EW group (east-west)
        self.light_state = {'ns': 'green', 'ew': 'red'}  # Start with NS green
        self.current_phase = 'ns'  # Which group currently has green/yellow
        
        # Timing configuration
        self.step_count = 0
        self.light_timer = 0
        self.current_phase_duration = 30  # Default phase duration
        self.min_green_time = 5  # Minimum green time before switching
        self.max_green_time = 60  # Maximum green time
        self.yellow_time = 3  # Yellow phase duration
        self.step_duration_sec = 1  # Each step represents 1 second
        
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
        self.light_state = {'ns': 'green', 'ew': 'red'}
        self.current_phase = 'ns'
        self.step_count = 0
        self.light_timer = 0
        self.current_phase_duration = 30
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
        if self.light_state['ns'] == 'green':
            for direction in ['north', 'south']:
                if self.queues[direction]:
                    # Remove car from queue (car goes through intersection)
                    car_spawn_time = self.queues[direction].pop(0)
                    self.cars_processed += 1
                    self.total_waiting_time += (self.step_count - car_spawn_time)
        
        # Process east-west traffic
        if self.light_state['ew'] == 'green':
            for direction in ['east', 'west']:
                if self.queues[direction]:
                    # Remove car from queue (car goes through intersection)
                    car_spawn_time = self.queues[direction].pop(0)
                    self.cars_processed += 1
                    self.total_waiting_time += (self.step_count - car_spawn_time)
    
    def _switch_lights(self):
        """Switch traffic light states with yellow phase."""
        if self.current_phase == 'ns':
            if self.light_state['ns'] == 'green':
                # NS goes to yellow
                self.light_state['ns'] = 'yellow'
                self.light_timer = 0
                self.current_phase_duration = self.yellow_time
            elif self.light_state['ns'] == 'yellow':
                # NS goes to red, EW goes to green
                self.light_state['ns'] = 'red'
                self.light_state['ew'] = 'green'
                self.current_phase = 'ew'
                self.light_timer = 0
                self.current_phase_duration = 30  # Default green time
        else:  # current_phase == 'ew'
            if self.light_state['ew'] == 'green':
                # EW goes to yellow
                self.light_state['ew'] = 'yellow'
                self.light_timer = 0
                self.current_phase_duration = self.yellow_time
            elif self.light_state['ew'] == 'yellow':
                # EW goes to red, NS goes to green
                self.light_state['ew'] = 'red'
                self.light_state['ns'] = 'green'
                self.current_phase = 'ns'
                self.light_timer = 0
                self.current_phase_duration = 30  # Default green time
    
    def _get_state(self) -> np.ndarray:
        """Get current state representation: queue lengths [N, S, E, W] + current light phase."""
        queue_lengths = [len(self.queues[direction]) for direction in self.directions]
        # Current light phase: 0 = NS green/yellow, 1 = EW green/yellow
        current_phase_num = 0 if self.current_phase == 'ns' else 1
        state = queue_lengths + [current_phase_num]
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
        
        # Calculate remaining times for each direction
        remaining_times = self._calculate_remaining_times()
        
        return {
            'cars': cars,
            'lights': {
                'N': {'color': self.light_state['ns'], 'remaining': remaining_times['N']},
                'S': {'color': self.light_state['ns'], 'remaining': remaining_times['S']},
                'E': {'color': self.light_state['ew'], 'remaining': remaining_times['E']},
                'W': {'color': self.light_state['ew'], 'remaining': remaining_times['W']}
            },
            'phase': self.current_phase,
            'phase_remaining': self.current_phase_duration - self.light_timer,
            'phase_duration': self.current_phase_duration,
            'step_duration_sec': self.step_duration_sec,
            'queues': {direction: len(self.queues[direction]) for direction in self.directions},
            'metrics': {
                'cars_processed': self.cars_processed,
                'avg_waiting_time': self.total_waiting_time / max(1, self.cars_processed),
                'avg_queue_length': self.avg_queue_length,
                'total_cars': sum(len(self.queues[direction]) for direction in self.directions),
                'time_wasted': self.total_waiting_time
            },
            'step': self.step_count
        }
    
    def _calculate_remaining_times(self) -> Dict[str, int]:
        """Calculate remaining time for each direction's lights."""
        remaining_times = {'N': 0, 'S': 0, 'E': 0, 'W': 0}
        
        if self.current_phase == 'ns':
            if self.light_state['ns'] == 'green':
                # NS is green, show countdown for green
                remaining_times['N'] = remaining_times['S'] = self.current_phase_duration - self.light_timer
                # EW is red, show time until their turn (green + yellow for current phase)
                ew_wait_time = (self.current_phase_duration - self.light_timer) + self.yellow_time
                remaining_times['E'] = remaining_times['W'] = ew_wait_time
            elif self.light_state['ns'] == 'yellow':
                # NS is yellow, show countdown for yellow
                remaining_times['N'] = remaining_times['S'] = self.current_phase_duration - self.light_timer
                # EW will be green soon
                remaining_times['E'] = remaining_times['W'] = self.current_phase_duration - self.light_timer
        else:  # current_phase == 'ew'
            if self.light_state['ew'] == 'green':
                # EW is green, show countdown for green
                remaining_times['E'] = remaining_times['W'] = self.current_phase_duration - self.light_timer
                # NS is red, show time until their turn
                ns_wait_time = (self.current_phase_duration - self.light_timer) + self.yellow_time
                remaining_times['N'] = remaining_times['S'] = ns_wait_time
            elif self.light_state['ew'] == 'yellow':
                # EW is yellow, show countdown for yellow
                remaining_times['E'] = remaining_times['W'] = self.current_phase_duration - self.light_timer
                # NS will be green soon
                remaining_times['N'] = remaining_times['S'] = self.current_phase_duration - self.light_timer
        
        return remaining_times
    
    def _should_switch_optimized(self) -> bool:
        """Queue-based optimization logic to determine if lights should switch."""
        # Must wait minimum green time
        if self.light_timer < self.min_green_time:
            return False
        
        # Must switch at maximum green time
        if self.light_timer >= self.max_green_time:
            return True
        
        # Calculate queue totals for each group
        ns_queue_total = len(self.queues['north']) + len(self.queues['south'])
        ew_queue_total = len(self.queues['east']) + len(self.queues['west'])
        
        # Switch if opposing direction has significantly more cars waiting
        if self.current_phase == 'ns':
            # Currently NS is green, check if EW has more cars + hysteresis
            return ew_queue_total > ns_queue_total + 1
        else:
            # Currently EW is green, check if NS has more cars + hysteresis
            return ns_queue_total > ew_queue_total + 1
    
    def run_simulation(self, steps: int, policy_func=None, mode='hardcoded') -> List[Dict[str, Any]]:
        """Run a complete simulation and return all frames."""
        self.reset()
        frames = []
        
        for _ in range(steps):
            if mode == 'optimized':
                # Use queue-based optimization
                if self.light_state[self.current_phase] == 'green':
                    # Only switch from green (not yellow)
                    action = 0 if self._should_switch_optimized() else 1
                else:
                    # Continue yellow phase until it's complete
                    action = 0 if self.light_timer >= self.current_phase_duration else 1
            else:
                # Hardcoded mode: switch every 30 steps (fixed timing)
                if self.light_state[self.current_phase] == 'green':
                    action = 0 if self.light_timer >= 30 else 1
                else:
                    # Continue yellow phase until it's complete
                    action = 0 if self.light_timer >= self.current_phase_duration else 1
            
            self.step(action)
            frames.append(self.render_frame())
        
        return frames