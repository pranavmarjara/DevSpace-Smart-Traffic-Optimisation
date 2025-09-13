from flask import Blueprint, render_template
from flask_login import login_required

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/')
@login_required
def index():
    return render_template('dashboard/index.html')

@dashboard_bp.route('/analytics')
@login_required
def analytics():
    return render_template('dashboard/index.html')

@dashboard_bp.route('/monitor')
@login_required
def monitor():
    return render_template('dashboard/index.html')

@dashboard_bp.route('/alerts')
@login_required
def alerts():
    return render_template('dashboard/index.html')

@dashboard_bp.route('/control')
@login_required
def control():
    return render_template('dashboard/index.html')

@dashboard_bp.route('/optimization')
@login_required
def optimization():
    return render_template('dashboard/index.html')

@dashboard_bp.route('/settings')
@login_required
def settings():
    return render_template('dashboard/index.html')