from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import uuid

from app import db

class User(UserMixin, db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Intersection(db.Model):
    __tablename__ = 'intersections'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(200))
    status = db.Column(db.Enum('optimal', 'moderate', 'congested', name='intersection_status'), default='optimal')
    vehicle_count = db.Column(db.Integer, default=0)
    average_wait_time = db.Column(db.Float, default=0.0)
    signal_timings = db.Column(db.JSON)
    ai_recommendation = db.Column(db.JSON)
    emergency_mode = db.Column(db.Boolean, default=False)
    pos_x = db.Column(db.Float)
    pos_y = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    alerts = db.relationship('Alert', backref='intersection', lazy=True)

class Alert(db.Model):
    __tablename__ = 'alerts'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    type = db.Column(db.Enum('success', 'warning', 'critical', name='alert_type'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    location = db.Column(db.String(200))
    action_required = db.Column(db.Boolean, default=False)
    dismissed = db.Column(db.Boolean, default=False)
    intersection_id = db.Column(db.String(36), db.ForeignKey('intersections.id'))

class TrafficVolume(db.Model):
    __tablename__ = 'traffic_volumes'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    day = db.Column(db.String(20), nullable=False)
    current = db.Column(db.Integer, nullable=False)
    previous = db.Column(db.Integer, nullable=False)
    target = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class MetricSnapshot(db.Model):
    __tablename__ = 'metric_snapshots'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    active_intersections = db.Column(db.Integer, default=0)
    average_wait_time = db.Column(db.Float, default=0.0)
    emergency_responses = db.Column(db.Integer, default=0)
    efficiency_score = db.Column(db.Float, default=0.0)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)