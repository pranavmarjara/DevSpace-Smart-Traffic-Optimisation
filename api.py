from flask import Blueprint, jsonify, request
from flask_restful import Api, Resource
# from flask_login import login_required  # Temporarily disabled for migration
from datetime import datetime
import os
import glob
import re

from models import db, Intersection, Alert, TrafficVolume, MetricSnapshot

# Path for storing active model selection
ACTIVE_MODEL_FILE = 'models/active_model.txt'

def sanitize_model_name(name: str) -> str:
    """Sanitize and validate model name to prevent path traversal."""
    if not name:
        raise ValueError("Model name cannot be empty")
    
    # Remove any path components and keep only filename
    name = os.path.basename(name)
    
    # Validate against safe pattern (alphanumeric, dots, hyphens, underscores)
    if not re.match(r'^[A-Za-z0-9._-]+$', name):
        raise ValueError("Model name contains invalid characters")
    
    # Ensure .pt extension
    if not name.endswith('.pt'):
        name += '.pt'
    
    return name

def get_active_model() -> str:
    """Get the currently active model from persistent storage."""
    try:
        if os.path.exists(ACTIVE_MODEL_FILE):
            with open(ACTIVE_MODEL_FILE, 'r') as f:
                active_model = f.read().strip()
                if active_model and os.path.exists(f'models/{active_model}'):
                    return active_model
    except Exception:
        pass
    
    # Default fallback
    if os.path.exists('models/dqn.pt'):
        return 'dqn.pt'
    
    # Find any .pt file as fallback
    model_files = glob.glob('models/*.pt')
    if model_files:
        return os.path.basename(model_files[0])
    
    return 'dqn.pt'  # Default even if doesn't exist

def set_active_model(model_name: str) -> bool:
    """Set the active model in persistent storage."""
    try:
        os.makedirs('models', exist_ok=True)
        with open(ACTIVE_MODEL_FILE, 'w') as f:
            f.write(model_name)
        return True
    except Exception:
        return False

api_bp = Blueprint('api', __name__)
api = Api(api_bp)

class IntersectionsResource(Resource):
    # @login_required  # Temporarily disabled for migration
    def get(self):
        # Mock data for now
        return jsonify([
            {
                "id": "int-001",
                "name": "Main St & Oak Ave",
                "location": "Downtown",
                "status": "optimal",
                "vehicleCount": 24,
                "averageWaitTime": 45,
                "signalTimings": {"red": 30, "green": 45, "yellow": 5},
                "aiRecommendation": {"adjustRed": -5, "adjustGreen": 3},
                "emergencyMode": False,
                "pos": {"x": 300, "y": 200}
            },
            {
                "id": "int-002", 
                "name": "Elm St & Pine Ave",
                "location": "Midtown",
                "status": "moderate",
                "vehicleCount": 38,
                "averageWaitTime": 62,
                "signalTimings": {"red": 35, "green": 40, "yellow": 5},
                "aiRecommendation": {"adjustRed": 2, "adjustGreen": -3},
                "emergencyMode": False,
                "pos": {"x": 450, "y": 350}
            },
            {
                "id": "int-003",
                "name": "Cedar Rd & Maple St",
                "location": "Uptown", 
                "status": "congested",
                "vehicleCount": 67,
                "averageWaitTime": 89,
                "signalTimings": {"red": 40, "green": 35, "yellow": 5},
                "aiRecommendation": {"adjustRed": -8, "adjustGreen": 10},
                "emergencyMode": True,
                "pos": {"x": 200, "y": 450}
            }
        ])

class AlertsResource(Resource):
    # @login_required  # Temporarily disabled for migration
    def get(self):
        return jsonify([
            {
                "id": "alert-001",
                "type": "critical",
                "title": "Traffic Congestion",
                "message": "Heavy congestion detected at Cedar Rd & Maple St",
                "timestamp": "2024-01-15T14:30:00Z",
                "location": "Cedar Rd & Maple St",
                "actionRequired": True
            },
            {
                "id": "alert-002",
                "type": "warning", 
                "title": "Signal Malfunction",
                "message": "Traffic signal showing intermittent yellow at Main St & Oak Ave",
                "timestamp": "2024-01-15T13:45:00Z",
                "location": "Main St & Oak Ave",
                "actionRequired": True
            },
            {
                "id": "alert-003",
                "type": "success",
                "title": "Emergency Response",
                "message": "Emergency vehicle passage completed successfully",
                "timestamp": "2024-01-15T13:15:00Z",
                "location": "Elm St & Pine Ave", 
                "actionRequired": False
            }
        ])

class MetricsResource(Resource):
    # @login_required  # Temporarily disabled for migration
    def get(self):
        return jsonify({
            "activeIntersections": 12,
            "averageWaitTime": 65.3,
            "emergencyResponses": 3,
            "efficiencyScore": 87.2
        })

class TrafficVolumeResource(Resource):
    # @login_required  # Temporarily disabled for migration
    def get(self):
        return jsonify([
            {"day": "Mon", "current": 1200, "previous": 1150, "target": 1100},
            {"day": "Tue", "current": 1350, "previous": 1200, "target": 1150},
            {"day": "Wed", "current": 1400, "previous": 1350, "target": 1200},
            {"day": "Thu", "current": 1380, "previous": 1400, "target": 1250},
            {"day": "Fri", "current": 1600, "previous": 1380, "target": 1300},
            {"day": "Sat", "current": 900, "previous": 1600, "target": 950},
            {"day": "Sun", "current": 800, "previous": 900, "target": 850}
        ])

# Register API resources
api.add_resource(IntersectionsResource, '/intersections')
api.add_resource(AlertsResource, '/alerts') 
api.add_resource(MetricsResource, '/metrics')
api.add_resource(TrafficVolumeResource, '/traffic-volume')


class SimulateResource(Resource):
    """Traffic simulation endpoint for the demo page."""
    
    def post(self):
        data = request.get_json()
        mode = data.get('mode', 'hardcoded')  # 'hardcoded' or 'optimized'
        steps = data.get('steps', 100)
        
        try:
            from traffic_env import IntersectionEnv
            import os
            
            env = IntersectionEnv()
            
            # Use the new queue-based optimization or hardcoded mode
            frames = env.run_simulation(steps, mode=mode)
            
            # Calculate summary metrics
            if frames:
                final_metrics = frames[-1]['metrics']
                total_cars = sum(len(frame['cars']) for frame in frames)
                avg_total_cars = total_cars / len(frames) if frames else 0
                
                summary_metrics = {
                    'mode': mode,
                    'total_steps': len(frames),
                    'cars_processed': final_metrics['cars_processed'],
                    'avg_waiting_time': final_metrics['avg_waiting_time'],
                    'avg_queue_length': final_metrics['avg_queue_length'],
                    'avg_total_cars': avg_total_cars,
                    'efficiency_score': max(0, 100 - (final_metrics['avg_waiting_time'] * 2))
                }
            else:
                summary_metrics = {
                    'mode': mode,
                    'total_steps': 0,
                    'cars_processed': 0,
                    'avg_waiting_time': 0,
                    'avg_queue_length': 0,
                    'avg_total_cars': 0,
                    'efficiency_score': 0
                }
            
            return {
                'frames': frames,
                'metrics': summary_metrics,
                'step_duration_sec': 1  # Each step represents 1 second
            }
            
        except Exception as e:
            return {'error': str(e)}, 500

class TrainResource(Resource):
    """Training endpoint to trigger DQN training."""
    
    def post(self):
        """Trigger DQN training and stream JSON progress updates."""
        try:
            from train_dqn import train_dqn_agent_generator
            import json
            from flask import Response
            
            import time
            
            # Extract hyperparameters from request body
            data = request.get_json() or {}
            
            # Extract and sanitize model name
            raw_model_name = data.get('model_name', f'agent_{int(time.time())}.pt')
            try:
                model_name = sanitize_model_name(raw_model_name)
            except ValueError as e:
                return {'error': f'Invalid model name: {str(e)}'}, 400
            
            # Validate and clamp hyperparameters
            episodes = max(100, min(5000, data.get('episodes', 500)))
            learning_rate = max(0.0001, min(0.1, data.get('learningRate', 0.001)))
            gamma = max(0.1, min(1.0, data.get('gamma', 0.99)))
            epsilon_start = max(0.1, min(1.0, data.get('epsilonStart', 1.0)))
            epsilon_end = max(0.01, min(1.0, data.get('epsilonEnd', 0.1)))
            replay_buffer_size = max(1000, min(100000, data.get('replayBufferSize', 10000)))
            
            hyperparams = {
                'episodes': episodes,
                'learning_rate': learning_rate,
                'gamma': gamma,
                'epsilon_start': epsilon_start,
                'epsilon_end': epsilon_end,
                'replay_buffer_size': replay_buffer_size,
                'model_name': model_name
            }
            
            def generate_training_updates():
                """Generator function that yields JSON progress updates."""
                try:
                    for progress_data in train_dqn_agent_generator(**hyperparams):
                        # Convert to JSON and add proper SSE format
                        json_data = json.dumps(progress_data)
                        yield f"data: {json_data}\n\n"
                        
                        # Add a small delay to ensure proper streaming
                        import time
                        time.sleep(0.1)
                        
                except Exception as e:
                    error_data = {
                        'error': True,
                        'message': f"Training failed: {str(e)}",
                        'completed': True
                    }
                    yield f"data: {json.dumps(error_data)}\n"
            
            return Response(
                generate_training_updates(),
                mimetype='text/event-stream',
                headers={
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                    'X-Accel-Buffering': 'no'  # Disable nginx buffering
                }
            )
            
        except Exception as e:
            import json
            error_response = {
                'error': True,
                'message': f"Training failed: {str(e)}",
                'completed': True
            }
            return json.dumps(error_response), 500, {'Content-Type': 'application/json'}

class ModelsResource(Resource):
    """Endpoint to list all available models."""
    
    def get(self):
        """Get list of all trained models in the models/ directory."""
        try:
            if not os.path.exists('models'):
                return {'models': [], 'active_model': None}
            
            # Get all .pt files in models directory
            model_files = glob.glob('models/*.pt')
            models = []
            
            for model_path in model_files:
                model_name = os.path.basename(model_path)
                model_stats = os.stat(model_path)
                
                models.append({
                    'name': model_name,
                    'size': model_stats.st_size,
                    'created': model_stats.st_ctime,
                    'modified': model_stats.st_mtime,
                    'is_active': model_name == get_active_model()
                })
            
            # Sort by creation time (newest first)
            models.sort(key=lambda x: x['created'], reverse=True)
            
            return {
                'models': models,
                'active_model': get_active_model()
            }
            
        except Exception as e:
            return {'error': str(e)}, 500

class UseModelResource(Resource):
    """Endpoint to set the active model."""
    
    def post(self):
        """Set the active model for optimized simulations."""
        try:
            data = request.get_json() or {}
            raw_model_name = data.get('name')
            
            if not raw_model_name:
                return {'error': 'Model name is required'}, 400
            
            # Sanitize model name
            try:
                model_name = sanitize_model_name(raw_model_name)
            except ValueError as e:
                return {'error': f'Invalid model name: {str(e)}'}, 400
            
            model_path = f'models/{model_name}'
            
            if not os.path.exists(model_path):
                return {'error': f'Model {model_name} not found'}, 404
            
            # Update active model persistently
            if not set_active_model(model_name):
                return {'error': 'Failed to set active model'}, 500
            
            return {
                'success': True,
                'active_model': model_name,
                'message': f'Active model set to {model_name}'
            }
            
        except Exception as e:
            return {'error': str(e)}, 500

# Register the endpoints
api.add_resource(SimulateResource, '/simulate')
api.add_resource(TrainResource, '/train')
api.add_resource(ModelsResource, '/models')
api.add_resource(UseModelResource, '/use-model')