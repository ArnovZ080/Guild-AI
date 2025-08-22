from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from src.models.user import db

class DataRoom(db.Model):
    __tablename__ = 'data_rooms'
    
    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    provider = db.Column(db.String(50), nullable=False)  # workspace, gdrive, notion, onedrive, dropbox
    config = db.Column(db.JSON, default={})  # provider-specific config
    read_only = db.Column(db.Boolean, default=True)
    last_sync_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'provider': self.provider,
            'config': self.config,
            'read_only': self.read_only,
            'last_sync_at': self.last_sync_at.isoformat() if self.last_sync_at else None,
            'created_at': self.created_at.isoformat()
        }

class ConnectorCredential(db.Model):
    __tablename__ = 'connector_credentials'
    
    id = db.Column(db.Integer, primary_key=True)
    provider = db.Column(db.String(50), nullable=False)
    account_id = db.Column(db.String(200), nullable=False)
    access_token = db.Column(db.Text, nullable=False)  # encrypted at rest
    refresh_token = db.Column(db.Text, nullable=True)
    expires_at = db.Column(db.DateTime, nullable=True)
    scopes = db.Column(db.JSON, default=[])
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'provider': self.provider,
            'account_id': self.account_id,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'scopes': self.scopes,
            'created_at': self.created_at.isoformat()
        }

class DocumentMeta(db.Model):
    __tablename__ = 'document_meta'
    
    id = db.Column(db.Integer, primary_key=True)
    source_id = db.Column(db.String(200), nullable=False)
    data_room_id = db.Column(db.String(50), db.ForeignKey('data_rooms.id'), nullable=False)
    provider = db.Column(db.String(50), nullable=False)
    path = db.Column(db.String(500), nullable=False)
    mime = db.Column(db.String(100), nullable=True)
    updated_at = db.Column(db.DateTime, nullable=False)
    hash = db.Column(db.String(64), nullable=False)
    status = db.Column(db.String(20), default='stale')  # indexed, stale, error
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    data_room = db.relationship('DataRoom', backref='documents')
    
    def to_dict(self):
        return {
            'id': self.id,
            'source_id': self.source_id,
            'data_room_id': self.data_room_id,
            'provider': self.provider,
            'path': self.path,
            'mime': self.mime,
            'updated_at': self.updated_at.isoformat(),
            'hash': self.hash,
            'status': self.status,
            'created_at': self.created_at.isoformat()
        }

