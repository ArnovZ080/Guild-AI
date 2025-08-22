from flask import Blueprint, jsonify, request
from src.models.workflow import OutcomeContract, Workflow, AgentExecution, Deliverable, EvaluationResult, db
import uuid
from datetime import datetime

workflows_bp = Blueprint('workflows', __name__)

@workflows_bp.route('/contracts', methods=['GET'])
def get_contracts():
    """Get all outcome contracts"""
    contracts = OutcomeContract.query.all()
    return jsonify([contract.to_dict() for contract in contracts])

@workflows_bp.route('/contracts', methods=['POST'])
def create_contract():
    """Create a new outcome contract"""
    data = request.json
    
    contract = OutcomeContract(
        id=str(uuid.uuid4()),
        title=data['title'],
        objective=data['objective'],
        deliverables=data.get('deliverables', []),
        data_rooms=data.get('data_rooms', []),
        rubric=data.get('rubric', {})
    )
    
    db.session.add(contract)
    db.session.commit()
    
    return jsonify(contract.to_dict()), 201

@workflows_bp.route('/contracts/<contract_id>', methods=['GET'])
def get_contract(contract_id):
    """Get a specific contract"""
    contract = OutcomeContract.query.get_or_404(contract_id)
    return jsonify(contract.to_dict())

@workflows_bp.route('/contracts/<contract_id>', methods=['PUT'])
def update_contract(contract_id):
    """Update a contract"""
    contract = OutcomeContract.query.get_or_404(contract_id)
    data = request.json
    
    contract.title = data.get('title', contract.title)
    contract.objective = data.get('objective', contract.objective)
    contract.deliverables = data.get('deliverables', contract.deliverables)
    contract.data_rooms = data.get('data_rooms', contract.data_rooms)
    contract.rubric = data.get('rubric', contract.rubric)
    contract.status = data.get('status', contract.status)
    contract.updated_at = datetime.utcnow()
    
    db.session.commit()
    return jsonify(contract.to_dict())

@workflows_bp.route('/contracts/<contract_id>/compile', methods=['POST'])
def compile_workflow(contract_id):
    """Compile a contract into an executable workflow"""
    contract = OutcomeContract.query.get_or_404(contract_id)
    
    # TODO: Implement actual workflow compilation logic
    # For now, create a mock DAG structure
    dag_definition = {
        'nodes': [
            {'id': 'research', 'type': 'agent', 'name': 'Research Agent', 'dependencies': []},
            {'id': 'content', 'type': 'agent', 'name': 'Content Creator', 'dependencies': ['research']},
            {'id': 'fact_check', 'type': 'evaluator', 'name': 'Fact Checker', 'dependencies': ['content']},
            {'id': 'brand_check', 'type': 'evaluator', 'name': 'Brand Checker', 'dependencies': ['content']},
            {'id': 'final', 'type': 'orchestrator', 'name': 'Final Review', 'dependencies': ['fact_check', 'brand_check']}
        ]
    }
    
    workflow = Workflow(
        id=str(uuid.uuid4()),
        contract_id=contract_id,
        dag_definition=dag_definition,
        estimated_duration='15-30 minutes'
    )
    
    db.session.add(workflow)
    contract.status = 'approved'
    db.session.commit()
    
    return jsonify(workflow.to_dict()), 201

@workflows_bp.route('/workflows/<workflow_id>', methods=['GET'])
def get_workflow(workflow_id):
    """Get workflow details"""
    workflow = Workflow.query.get_or_404(workflow_id)
    return jsonify(workflow.to_dict())

@workflows_bp.route('/workflows/<workflow_id>/execute', methods=['POST'])
def execute_workflow(workflow_id):
    """Start workflow execution"""
    workflow = Workflow.query.get_or_404(workflow_id)
    
    if workflow.status != 'pending':
        return jsonify({'error': 'Workflow is not in pending state'}), 400
    
    workflow.status = 'running'
    workflow.started_at = datetime.utcnow()
    workflow.progress = 0.0
    workflow.current_agent = 'Research Agent'
    
    db.session.commit()
    
    # TODO: Implement actual workflow execution with CrewAI + Prefect
    # For now, return success response
    
    return jsonify({
        'message': 'Workflow execution started',
        'workflow_id': workflow_id,
        'status': workflow.status
    })

@workflows_bp.route('/workflows/<workflow_id>/pause', methods=['POST'])
def pause_workflow(workflow_id):
    """Pause workflow execution"""
    workflow = Workflow.query.get_or_404(workflow_id)
    
    if workflow.status != 'running':
        return jsonify({'error': 'Workflow is not running'}), 400
    
    workflow.status = 'paused'
    db.session.commit()
    
    return jsonify({'message': 'Workflow paused', 'status': workflow.status})

@workflows_bp.route('/workflows/<workflow_id>/resume', methods=['POST'])
def resume_workflow(workflow_id):
    """Resume workflow execution"""
    workflow = Workflow.query.get_or_404(workflow_id)
    
    if workflow.status != 'paused':
        return jsonify({'error': 'Workflow is not paused'}), 400
    
    workflow.status = 'running'
    db.session.commit()
    
    return jsonify({'message': 'Workflow resumed', 'status': workflow.status})

@workflows_bp.route('/workflows/<workflow_id>/stop', methods=['POST'])
def stop_workflow(workflow_id):
    """Stop workflow execution"""
    workflow = Workflow.query.get_or_404(workflow_id)
    
    workflow.status = 'failed'
    workflow.completed_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify({'message': 'Workflow stopped', 'status': workflow.status})

@workflows_bp.route('/workflows/<workflow_id>/deliverables', methods=['GET'])
def get_workflow_deliverables(workflow_id):
    """Get deliverables for a workflow"""
    workflow = Workflow.query.get_or_404(workflow_id)
    deliverables = Deliverable.query.filter_by(workflow_id=workflow_id).all()
    return jsonify([deliverable.to_dict() for deliverable in deliverables])

@workflows_bp.route('/deliverables/<int:deliverable_id>', methods=['GET'])
def get_deliverable(deliverable_id):
    """Get a specific deliverable"""
    deliverable = Deliverable.query.get_or_404(deliverable_id)
    return jsonify(deliverable.to_dict())

@workflows_bp.route('/deliverables/<int:deliverable_id>/evaluate', methods=['POST'])
def evaluate_deliverable(deliverable_id):
    """Evaluate a deliverable"""
    deliverable = Deliverable.query.get_or_404(deliverable_id)
    data = request.json
    
    evaluation = EvaluationResult(
        deliverable_id=deliverable_id,
        evaluator_type=data['evaluator_type'],
        score=data['score'],
        feedback=data.get('feedback'),
        criteria=data.get('criteria', {}),
        source_citations=data.get('source_citations', [])
    )
    
    db.session.add(evaluation)
    
    # Update deliverable quality score (average of all evaluations)
    evaluations = EvaluationResult.query.filter_by(deliverable_id=deliverable_id).all()
    if evaluations:
        avg_score = sum(eval.score for eval in evaluations) / len(evaluations)
        deliverable.quality_score = avg_score
    
    db.session.commit()
    
    return jsonify(evaluation.to_dict()), 201

@workflows_bp.route('/deliverables/<int:deliverable_id>/approve', methods=['POST'])
def approve_deliverable(deliverable_id):
    """Approve a deliverable"""
    deliverable = Deliverable.query.get_or_404(deliverable_id)
    deliverable.status = 'approved'
    db.session.commit()
    
    return jsonify({'message': 'Deliverable approved', 'status': deliverable.status})

@workflows_bp.route('/deliverables/<int:deliverable_id>/reject', methods=['POST'])
def reject_deliverable(deliverable_id):
    """Reject a deliverable"""
    deliverable = Deliverable.query.get_or_404(deliverable_id)
    data = request.json
    
    deliverable.status = 'rejected'
    # TODO: Add rejection reason and trigger regeneration
    db.session.commit()
    
    return jsonify({'message': 'Deliverable rejected', 'status': deliverable.status})

