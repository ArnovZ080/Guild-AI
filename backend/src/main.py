import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from src.models.user import db
from src.models.data_room import DataRoom, DocumentMeta, ConnectorCredential
from src.models.workflow import OutcomeContract, Workflow, AgentExecution, Deliverable, EvaluationResult
from src.routes.user import user_bp
from src.routes.data_rooms import data_rooms_bp
from src.routes.oauth import oauth_bp
from src.routes.workflows import workflows_bp
from src.config import config

# Get configuration from environment
config_name = os.environ.get('FLASK_ENV', 'development')
app_config = config.get(config_name, config['default'])

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config.from_object(app_config)

# Enable CORS for all routes
CORS(app)

# Register blueprints
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(data_rooms_bp, url_prefix='/api')
app.register_blueprint(oauth_bp, url_prefix='/api')
app.register_blueprint(workflows_bp, url_prefix='/api')

# Database configuration
db.init_app(app)

# Initialize connectors
from src.connectors import *

with app.app_context():
    db.create_all()

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
            return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
