from app import create_app, db
import os

# Create the Flask application instance for deployment/gunicorn
app = create_app()

# Initialize database tables only once, not on every startup
if os.environ.get('INIT_DB', '').lower() in ('true', '1', 'yes'):
    with app.app_context():
        db.create_all()
        print("Database tables created successfully")

if __name__ == '__main__':
    # For development, initialize DB tables
    with app.app_context():
        db.create_all()
        print("Database tables created successfully.")
    
    print("Starting Smart Traffic Management System on port 5000...")
    app.run(host='0.0.0.0', port=5000, debug=True)