from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from src.models.user import db
import json

class OutcomeContract(db.Model):
    __tablename__ = 'outcome_contracts'
    
    id = db.Column(db.String(50), primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    objective = db.Column(db.Text, nullable=False)
    deliverables = db.Column(db.JSON, default=[])  # List of deliverable types
    data_rooms = db.Column(db.JSON, default=[])   # List of data room IDs
    rubric = db.Column(db.JSON, default={})       # Quality rubric configuration
    status = db.Column(db.String(20), default='draft')  # draft, approved, executing, completed, failed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    workflows = db.relationship('Workflow', backref='contract', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'objective': self.objective,
            'deliverables': self.deliverables,
            'data_rooms': self.data_rooms,
            'rubric': self.rubric,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Workflow(db.Model):
    __tablename__ = 'workflows'
    
    id = db.Column(db.String(50), primary_key=True)
    contract_id = db.Column(db.String(50), db.ForeignKey('outcome_contracts.id'), nullable=False)
    dag_definition = db.Column(db.JSON, nullable=False)  # DAG structure and dependencies
    status = db.Column(db.String(20), default='pending')  # pending, running, paused, completed, failed
    progress = db.Column(db.Float, default=0.0)  # 0.0 to 1.0
    current_agent = db.Column(db.String(100), nullable=True)
    estimated_duration = db.Column(db.String(50), nullable=True)
    started_at = db.Column(db.DateTime, nullable=True)
    completed_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    executions = db.relationship('AgentExecution', backref='workflow', lazy=True)
    deliverables = db.relationship('Deliverable', backref='workflow', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'contract_id': self.contract_id,
            'dag_definition': self.dag_definition,
            'status': self.status,
            'progress': self.progress,
            'current_agent': self.current_agent,
            'estimated_duration': self.estimated_duration,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'created_at': self.created_at.isoformat()
        }

class AgentExecution(db.Model):
    __tablename__ = 'agent_executions'
    
    id = db.Column(db.Integer, primary_key=True)
    workflow_id = db.Column(db.String(50), db.ForeignKey('workflows.id'), nullable=False)
    agent_type = db.Column(db.String(50), nullable=False)  # workforce, evaluator, orchestrator
    agent_name = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, running, completed, failed
    input_data = db.Column(db.JSON, default={})
    output_data = db.Column(db.JSON, default={})
    error_message = db.Column(db.Text, nullable=True)
    execution_time = db.Column(db.Float, nullable=True)  # seconds
    quality_score = db.Column(db.Float, nullable=True)  # 0.0 to 1.0
    started_at = db.Column(db.DateTime, nullable=True)
    completed_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'workflow_id': self.workflow_id,
            'agent_type': self.agent_type,
            'agent_name': self.agent_name,
            'status': self.status,
            'input_data': self.input_data,
            'output_data': self.output_data,
            'error_message': self.error_message,
            'execution_time': self.execution_time,
            'quality_score': self.quality_score,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'created_at': self.created_at.isoformat()
        }

class Deliverable(db.Model):
    __tablename__ = 'deliverables'
    
    id = db.Column(db.Integer, primary_key=True)
    workflow_id = db.Column(db.String(50), db.ForeignKey('workflows.id'), nullable=False)
    type = db.Column(db.String(50), nullable=False)  # brief, ads, calendar, listing, seo
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=True)
    meta_data = db.Column(db.JSON, default={})  # Renamed from metadata to avoid conflict
    quality_score = db.Column(db.Float, nullable=True)
    status = db.Column(db.String(20), default='draft')  # draft, approved, rejected
    file_path = db.Column(db.String(500), nullable=True)  # Path to generated file
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'workflow_id': self.workflow_id,
            'type': self.type,
            'title': self.title,
            'content': self.content,
            'meta_data': self.meta_data,
            'quality_score': self.quality_score,
            'status': self.status,
            'file_path': self.file_path,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class EvaluationResult(db.Model):
    __tablename__ = 'evaluation_results'
    
    id = db.Column(db.Integer, primary_key=True)
    deliverable_id = db.Column(db.Integer, db.ForeignKey('deliverables.id'), nullable=False)
    evaluator_type = db.Column(db.String(50), nullable=False)  # fact_checker, brand_checker, seo_evaluator
    score = db.Column(db.Float, nullable=False)  # 0.0 to 1.0
    feedback = db.Column(db.Text, nullable=True)
    criteria = db.Column(db.JSON, default={})  # Detailed scoring breakdown
    source_citations = db.Column(db.JSON, default=[])  # Source provenance
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    deliverable = db.relationship('Deliverable', backref='evaluations')
    
    def to_dict(self):
        return {
            'id': self.id,
            'deliverable_id': self.deliverable_id,
            'evaluator_type': self.evaluator_type,
            'score': self.score,
            'feedback': self.feedback,
            'criteria': self.criteria,
            'source_citations': self.source_citations,
            'created_at': self.created_at.isoformat()
        }

