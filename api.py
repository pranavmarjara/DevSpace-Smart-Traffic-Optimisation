from flask import Blueprint, jsonify, request
from flask_restful import Api, Resource
# from flask_login import login_required  # Temporarily disabled for migration
from datetime import datetime

from models import db, Intersection, Alert, TrafficVolume, MetricSnapshot

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
            
            env = IntersectionEnv()
            
            if mode == 'optimized':
                try:
                    from train_dqn import get_optimized_policy
                    policy_func = get_optimized_policy()
                    frames = env.run_simulation(steps, policy_func)
                except Exception as e:
                    # Fallback to hardcoded if optimized fails
                    print(f"Optimized policy failed: {e}, falling back to hardcoded")
                    frames = env.run_simulation(steps)
            else:
                # Use hardcoded alternating policy
                frames = env.run_simulation(steps)
            
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
            
            return jsonify({
                'frames': frames,
                'metrics': summary_metrics
            })
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500

# Register the new simulation endpoint
api.add_resource(SimulateResource, '/simulate')