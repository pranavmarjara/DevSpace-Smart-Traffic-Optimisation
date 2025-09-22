from app import create_app, db
from models import User, Intersection, Alert, TrafficVolume, MetricSnapshot

app = create_app()

# Import models here to register them with SQLAlchemy
@app.shell_context_processor
def make_shell_context():
    return {
        'db': db,
        'User': User,
        'Intersection': Intersection,
        'Alert': Alert,
        'TrafficVolume': TrafficVolume,
        'MetricSnapshot': MetricSnapshot
    }

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        print("Database tables created successfully.")
    print(f"Starting Smart Traffic Management System on port 5000...")
    app.run(host='0.0.0.0', port=5000, debug=True, use_reloader=False)