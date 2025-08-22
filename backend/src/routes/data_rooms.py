from flask import Blueprint, jsonify, request
from src.models.data_room import DataRoom, DocumentMeta, db
from src.connectors.registry import get_connector
import uuid
from datetime import datetime

data_rooms_bp = Blueprint('data_rooms', __name__)

@data_rooms_bp.route('/data-rooms', methods=['GET'])
def get_data_rooms():
    """Get all data rooms"""
    data_rooms = DataRoom.query.all()
    return jsonify([room.to_dict() for room in data_rooms])

@data_rooms_bp.route('/data-rooms', methods=['POST'])
def create_data_room():
    """Create a new data room"""
    data = request.json
    
    data_room = DataRoom(
        id=str(uuid.uuid4()),
        name=data['name'],
        provider=data['provider'],
        config=data.get('config', {}),
        read_only=data.get('read_only', True)
    )
    
    db.session.add(data_room)
    db.session.commit()
    
    return jsonify(data_room.to_dict()), 201

@data_rooms_bp.route('/data-rooms/<room_id>', methods=['GET'])
def get_data_room(room_id):
    """Get a specific data room"""
    data_room = DataRoom.query.get_or_404(room_id)
    return jsonify(data_room.to_dict())

@data_rooms_bp.route('/data-rooms/<room_id>', methods=['PUT'])
def update_data_room(room_id):
    """Update a data room"""
    data_room = DataRoom.query.get_or_404(room_id)
    data = request.json
    
    data_room.name = data.get('name', data_room.name)
    data_room.config = data.get('config', data_room.config)
    data_room.read_only = data.get('read_only', data_room.read_only)
    
    db.session.commit()
    return jsonify(data_room.to_dict())

@data_rooms_bp.route('/data-rooms/<room_id>', methods=['DELETE'])
def delete_data_room(room_id):
    """Delete a data room"""
    data_room = DataRoom.query.get_or_404(room_id)
    db.session.delete(data_room)
    db.session.commit()
    return '', 204

@data_rooms_bp.route('/data-rooms/<room_id>/sync', methods=['POST'])
def sync_data_room(room_id):
    """Sync a data room with its provider"""
    data_room = DataRoom.query.get_or_404(room_id)
    
    try:
        connector = get_connector(data_room.provider)
        if not connector:
            return jsonify({'error': f'Connector for {data_room.provider} not found'}), 400
        
        # TODO: Implement actual sync logic
        # For now, just update the last_sync_at timestamp
        data_room.last_sync_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': f'Data room {room_id} sync initiated',
            'last_sync_at': data_room.last_sync_at.isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@data_rooms_bp.route('/data-rooms/<room_id>/documents', methods=['GET'])
def get_data_room_documents(room_id):
    """Get documents in a data room"""
    data_room = DataRoom.query.get_or_404(room_id)
    documents = DocumentMeta.query.filter_by(data_room_id=room_id).all()
    return jsonify([doc.to_dict() for doc in documents])

@data_rooms_bp.route('/providers', methods=['GET'])
def get_providers():
    """Get available providers"""
    providers = [
        {'id': 'workspace', 'name': 'Workspace', 'oauth_required': False},
        {'id': 'gdrive', 'name': 'Google Drive', 'oauth_required': True},
        {'id': 'notion', 'name': 'Notion', 'oauth_required': True},
        {'id': 'onedrive', 'name': 'OneDrive', 'oauth_required': True},
        {'id': 'dropbox', 'name': 'Dropbox', 'oauth_required': True}
    ]
    return jsonify(providers)

