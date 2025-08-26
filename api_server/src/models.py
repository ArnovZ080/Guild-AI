from sqlalchemy import Column, String, Text, JSON, DateTime, Float, Integer, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from .database import Base

class OutcomeContract(Base):
    __tablename__ = 'outcome_contracts'

    id = Column(String(50), primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    objective = Column(Text, nullable=False)
    deliverables = Column(JSON, default=[])
    data_rooms = Column(JSON, default=[])
    rubric = Column(JSON, default={})
    status = Column(String(20), default='draft', index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    workflows = relationship('Workflow', back_populates='contract')


class Workflow(Base):
    __tablename__ = 'workflows'

    id = Column(String(50), primary_key=True, index=True)
    contract_id = Column(String(50), ForeignKey('outcome_contracts.id'), nullable=False)
    dag_definition = Column(JSON, nullable=False)
    status = Column(String(20), default='pending', index=True)
    progress = Column(Float, default=0.0)
    current_agent = Column(String(100), nullable=True)
    estimated_duration = Column(String(50), nullable=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    contract = relationship('OutcomeContract', back_populates='workflows')
    agent_executions = relationship('AgentExecution', back_populates='workflow')
    deliverables = relationship('Deliverable', back_populates='workflow')


class AgentExecution(Base):
    __tablename__ = 'agent_executions'

    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(String(50), ForeignKey('workflows.id'), nullable=False)
    node_id = Column(String(100), nullable=False) # From the DAG definition
    agent_name = Column(String(100), nullable=False)
    status = Column(String(20), default='pending')
    input_data = Column(JSON, default={})
    output_data = Column(JSON, default={})
    error_message = Column(Text, nullable=True)
    execution_time = Column(Float, nullable=True)

    workflow = relationship('Workflow', back_populates='agent_executions')


class Deliverable(Base):
    __tablename__ = 'deliverables'

    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(String(50), ForeignKey('workflows.id'), nullable=False)
    type = Column(String(50), nullable=False)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=True)
    file_path = Column(String(500), nullable=True)
    status = Column(String(20), default='draft')

    workflow = relationship('Workflow', back_populates='deliverables')
