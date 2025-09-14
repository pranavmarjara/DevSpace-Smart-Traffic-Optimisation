from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_wtf.csrf import CSRFProtect
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize extensions
db = SQLAlchemy()
login_manager = LoginManager()
csrf = CSRFProtect()

def create_app():
    # Configure Flask to serve the React build from dist/public
    app = Flask(__name__, 
                static_folder='dist/public', 
                static_url_path='')
    
    # Configuration
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize extensions with app
    db.init_app(app)
    login_manager.init_app(app)
    csrf.init_app(app)
    
    # Login manager configuration  
    login_manager.login_view = 'auth.login'  # type: ignore
    login_manager.login_message = 'Please log in to access this page.'
    
    # Register blueprints
    from api import api_bp
    
    # Exempt API blueprint from CSRF protection for JSON API calls
    csrf.exempt(api_bp)
    
    # Only register the API blueprint - the React frontend will handle routing
    app.register_blueprint(api_bp, url_prefix='/api')
    
    # Serve React app for all non-API routes
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_react_app(path):
        # If it's a static file request, try to serve it
        if '.' in path:
            try:
                return app.send_static_file(path)
            except:
                pass
        # Otherwise serve the React app
        return app.send_static_file('index.html')
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)