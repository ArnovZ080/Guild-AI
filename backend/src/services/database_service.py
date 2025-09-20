"""
Database Service for Guild-AI Backend
Handles all database operations for onboarding, follow-ups, and user management
"""

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.exc import SQLAlchemyError
from typing import Dict, List, Optional, Any, Tuple
import logging
from datetime import datetime
import uuid

from ..models.database import (
    Base, User, OnboardingData, FollowUpSession, 
    FollowUpQuestion, OrchestratorAction, UserSession,
    get_database_url
)

logger = logging.getLogger(__name__)

class DatabaseService:
    """Service class for database operations"""
    
    def __init__(self, database_url: str = None):
        self.database_url = database_url or get_database_url()
        self.engine = create_engine(self.database_url, echo=False)
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        
    def get_session(self) -> Session:
        """Get database session"""
        return self.SessionLocal()
    
    async def create_tables(self):
        """Create all database tables"""
        try:
            Base.metadata.create_all(bind=self.engine)
            logger.info("Database tables created successfully")
        except Exception as e:
            logger.error(f"Error creating database tables: {e}")
            raise
    
    # User Management
    async def create_user(self, email: str, name: str = None) -> User:
        """Create a new user"""
        session = self.get_session()
        try:
            user = User(email=email, name=name)
            session.add(user)
            session.commit()
            session.refresh(user)
            logger.info(f"Created user: {user.id}")
            return user
        except SQLAlchemyError as e:
            session.rollback()
            logger.error(f"Error creating user: {e}")
            raise
        finally:
            session.close()
    
    async def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        session = self.get_session()
        try:
            return session.query(User).filter(User.email == email).first()
        except SQLAlchemyError as e:
            logger.error(f"Error getting user by email: {e}")
            raise
        finally:
            session.close()
    
    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID"""
        session = self.get_session()
        try:
            return session.query(User).filter(User.id == user_id).first()
        except SQLAlchemyError as e:
            logger.error(f"Error getting user by ID: {e}")
            raise
        finally:
            session.close()
    
    # Onboarding Data Management
    async def save_onboarding_data(self, user_id: str, onboarding_data: Dict[str, Any]) -> OnboardingData:
        """Save onboarding questionnaire responses"""
        session = self.get_session()
        try:
            # Check if onboarding data already exists
            existing = session.query(OnboardingData).filter(OnboardingData.user_id == user_id).first()
            
            if existing:
                # Update existing data
                existing.business_answers = onboarding_data.get('business_answers')
                existing.audience_answers = onboarding_data.get('audience_answers')
                existing.brand_answers = onboarding_data.get('brand_answers')
                existing.financial_answers = onboarding_data.get('financial_answers')
                existing.goals_answers = onboarding_data.get('goals_answers')
                existing.preferences_answers = onboarding_data.get('preferences_answers')
                existing.integrations_answers = onboarding_data.get('integrations_answers')
                existing.psychological_profile = onboarding_data.get('psychological_profile')
                existing.completed_at = datetime.utcnow()
                existing.has_pending_followups = onboarding_data.get('has_pending_followups', False)
                existing.followup_count = onboarding_data.get('followup_count', 0)
                existing.updated_at = datetime.utcnow()
                
                session.commit()
                session.refresh(existing)
                logger.info(f"Updated onboarding data for user: {user_id}")
                return existing
            else:
                # Create new onboarding data
                new_data = OnboardingData(
                    user_id=user_id,
                    business_answers=onboarding_data.get('business_answers'),
                    audience_answers=onboarding_data.get('audience_answers'),
                    brand_answers=onboarding_data.get('brand_answers'),
                    financial_answers=onboarding_data.get('financial_answers'),
                    goals_answers=onboarding_data.get('goals_answers'),
                    preferences_answers=onboarding_data.get('preferences_answers'),
                    integrations_answers=onboarding_data.get('integrations_answers'),
                    psychological_profile=onboarding_data.get('psychological_profile'),
                    completed_at=datetime.utcnow(),
                    has_pending_followups=onboarding_data.get('has_pending_followups', False),
                    followup_count=onboarding_data.get('followup_count', 0)
                )
                
                session.add(new_data)
                session.commit()
                session.refresh(new_data)
                logger.info(f"Created onboarding data for user: {user_id}")
                return new_data
                
        except SQLAlchemyError as e:
            session.rollback()
            logger.error(f"Error saving onboarding data: {e}")
            raise
        finally:
            session.close()
    
    async def get_onboarding_data(self, user_id: str) -> Optional[OnboardingData]:
        """Get onboarding data for a user"""
        session = self.get_session()
        try:
            return session.query(OnboardingData).filter(OnboardingData.user_id == user_id).first()
        except SQLAlchemyError as e:
            logger.error(f"Error getting onboarding data: {e}")
            raise
        finally:
            session.close()
    
    # Follow-Up Session Management
    async def create_follow_up_session(self, user_id: str, session_type: str, 
                                     pending_questions: List[Dict[str, Any]]) -> FollowUpSession:
        """Create a new follow-up session"""
        session = self.get_session()
        try:
            follow_up_session = FollowUpSession(
                user_id=user_id,
                session_type=session_type,
                pending_questions=pending_questions,
                total_questions=len(pending_questions),
                completed_count=0,
                priority_score=self._calculate_priority_score(pending_questions)
            )
            
            session.add(follow_up_session)
            session.commit()
            session.refresh(follow_up_session)
            
            # Create individual follow-up questions
            for question_data in pending_questions:
                follow_up_question = FollowUpQuestion(
                    session_id=follow_up_session.id,
                    original_question_id=question_data['original_question_id'],
                    original_question_text=question_data['original_question_text'],
                    original_answer=question_data['original_answer'],
                    follow_up_question=question_data['follow_up_question'],
                    action_type=question_data['action']['type'],
                    action_data=question_data['action'],
                    priority=question_data['priority']
                )
                session.add(follow_up_question)
            
            session.commit()
            logger.info(f"Created follow-up session for user: {user_id}")
            return follow_up_session
            
        except SQLAlchemyError as e:
            session.rollback()
            logger.error(f"Error creating follow-up session: {e}")
            raise
        finally:
            session.close()
    
    async def get_pending_follow_up_questions(self, user_id: str) -> List[FollowUpQuestion]:
        """Get pending follow-up questions for a user"""
        session = self.get_session()
        try:
            return session.query(FollowUpQuestion).join(FollowUpSession).filter(
                FollowUpSession.user_id == user_id,
                FollowUpQuestion.status == 'pending'
            ).order_by(
                FollowUpQuestion.priority.desc(),
                FollowUpQuestion.created_at.asc()
            ).all()
        except SQLAlchemyError as e:
            logger.error(f"Error getting pending follow-up questions: {e}")
            raise
        finally:
            session.close()
    
    async def complete_follow_up_question(self, question_id: str, answer: str) -> FollowUpQuestion:
        """Mark a follow-up question as completed"""
        session = self.get_session()
        try:
            question = session.query(FollowUpQuestion).filter(
                FollowUpQuestion.id == question_id
            ).first()
            
            if question:
                question.follow_up_answer = answer
                question.status = 'completed'
                question.answered_at = datetime.utcnow()
                question.completed_at = datetime.utcnow()
                
                # Update session completion count
                session_obj = session.query(FollowUpSession).filter(
                    FollowUpSession.id == question.session_id
                ).first()
                if session_obj:
                    session_obj.completed_count += 1
                    session_obj.updated_at = datetime.utcnow()
                    
                    # Mark session as completed if all questions are done
                    if session_obj.completed_count >= session_obj.total_questions:
                        session_obj.status = 'completed'
                        session_obj.completed_at = datetime.utcnow()
                
                session.commit()
                session.refresh(question)
                logger.info(f"Completed follow-up question: {question_id}")
                return question
            else:
                raise ValueError(f"Follow-up question not found: {question_id}")
                
        except SQLAlchemyError as e:
            session.rollback()
            logger.error(f"Error completing follow-up question: {e}")
            raise
        finally:
            session.close()
    
    # Orchestrator Action Management
    async def create_orchestrator_action(self, user_id: str, follow_up_question_id: str,
                                       action_data: Dict[str, Any]) -> OrchestratorAction:
        """Create a new orchestrator action"""
        session = self.get_session()
        try:
            action = OrchestratorAction(
                user_id=user_id,
                follow_up_question_id=follow_up_question_id,
                action_type=action_data.get('task', 'unknown'),
                task_description=action_data.get('description', ''),
                assigned_agents=action_data.get('agents', []),
                status='initiated'
            )
            
            session.add(action)
            session.commit()
            session.refresh(action)
            
            # Update follow-up question
            question = session.query(FollowUpQuestion).filter(
                FollowUpQuestion.id == follow_up_question_id
            ).first()
            if question:
                question.orchestrator_task_id = str(action.id)
                question.action_initiated_at = datetime.utcnow()
                question.status = 'in_progress'
                session.commit()
            
            logger.info(f"Created orchestrator action: {action.id}")
            return action
            
        except SQLAlchemyError as e:
            session.rollback()
            logger.error(f"Error creating orchestrator action: {e}")
            raise
        finally:
            session.close()
    
    async def update_orchestrator_action_status(self, action_id: str, status: str, 
                                              progress_percentage: int = None,
                                              result_data: Dict[str, Any] = None,
                                              error_message: str = None) -> OrchestratorAction:
        """Update orchestrator action status"""
        session = self.get_session()
        try:
            action = session.query(OrchestratorAction).filter(
                OrchestratorAction.id == action_id
            ).first()
            
            if action:
                action.status = status
                if progress_percentage is not None:
                    action.progress_percentage = progress_percentage
                if result_data is not None:
                    action.result_data = result_data
                if error_message is not None:
                    action.error_message = error_message
                
                if status == 'in_progress' and not action.started_at:
                    action.started_at = datetime.utcnow()
                elif status in ['completed', 'failed']:
                    action.completed_at = datetime.utcnow()
                
                session.commit()
                session.refresh(action)
                logger.info(f"Updated orchestrator action status: {action_id} -> {status}")
                return action
            else:
                raise ValueError(f"Orchestrator action not found: {action_id}")
                
        except SQLAlchemyError as e:
            session.rollback()
            logger.error(f"Error updating orchestrator action: {e}")
            raise
        finally:
            session.close()
    
    async def get_user_orchestrator_actions(self, user_id: str, status: str = None) -> List[OrchestratorAction]:
        """Get orchestrator actions for a user"""
        session = self.get_session()
        try:
            query = session.query(OrchestratorAction).filter(OrchestratorAction.user_id == user_id)
            if status:
                query = query.filter(OrchestratorAction.status == status)
            return query.order_by(OrchestratorAction.initiated_at.desc()).all()
        except SQLAlchemyError as e:
            logger.error(f"Error getting orchestrator actions: {e}")
            raise
        finally:
            session.close()
    
    # User Session Management
    async def create_user_session(self, user_id: str, session_type: str, 
                                session_name: str = None, context_data: Dict[str, Any] = None) -> UserSession:
        """Create a new user session"""
        session = self.get_session()
        try:
            user_session = UserSession(
                user_id=user_id,
                session_type=session_type,
                session_name=session_name,
                context_data=context_data
            )
            
            session.add(user_session)
            session.commit()
            session.refresh(user_session)
            logger.info(f"Created user session: {user_session.id}")
            return user_session
            
        except SQLAlchemyError as e:
            session.rollback()
            logger.error(f"Error creating user session: {e}")
            raise
        finally:
            session.close()
    
    async def update_user_session(self, session_id: str, messages: List[Dict[str, Any]] = None,
                                metadata: Dict[str, Any] = None, status: str = None) -> UserSession:
        """Update user session"""
        session = self.get_session()
        try:
            user_session = session.query(UserSession).filter(
                UserSession.id == session_id
            ).first()
            
            if user_session:
                if messages is not None:
                    user_session.messages = messages
                if metadata is not None:
                    user_session.metadata = metadata
                if status is not None:
                    user_session.status = status
                
                user_session.last_activity_at = datetime.utcnow()
                user_session.updated_at = datetime.utcnow()
                
                if status == 'completed':
                    user_session.completed_at = datetime.utcnow()
                
                session.commit()
                session.refresh(user_session)
                logger.info(f"Updated user session: {session_id}")
                return user_session
            else:
                raise ValueError(f"User session not found: {session_id}")
                
        except SQLAlchemyError as e:
            session.rollback()
            logger.error(f"Error updating user session: {e}")
            raise
        finally:
            session.close()
    
    # Helper Methods
    def _calculate_priority_score(self, questions: List[Dict[str, Any]]) -> int:
        """Calculate priority score for follow-up session"""
        priority_weights = {'high': 3, 'medium': 2, 'low': 1}
        total_score = 0
        
        for question in questions:
            priority = question.get('priority', 'medium')
            total_score += priority_weights.get(priority, 2)
        
        return total_score
    
    async def get_user_analytics(self, user_id: str) -> Dict[str, Any]:
        """Get analytics data for a user"""
        session = self.get_session()
        try:
            # Get user data
            user = await self.get_user_by_id(user_id)
            onboarding_data = await self.get_onboarding_data(user_id)
            
            # Get follow-up statistics
            follow_up_sessions = session.query(FollowUpSession).filter(
                FollowUpSession.user_id == user_id
            ).all()
            
            total_follow_up_questions = session.query(FollowUpQuestion).join(FollowUpSession).filter(
                FollowUpSession.user_id == user_id
            ).count()
            
            completed_follow_up_questions = session.query(FollowUpQuestion).join(FollowUpSession).filter(
                FollowUpSession.user_id == user_id,
                FollowUpQuestion.status == 'completed'
            ).count()
            
            # Get orchestrator actions
            orchestrator_actions = session.query(OrchestratorAction).filter(
                OrchestratorAction.user_id == user_id
            ).all()
            
            return {
                'user': {
                    'id': str(user.id) if user else None,
                    'email': user.email if user else None,
                    'name': user.name if user else None,
                    'created_at': user.created_at.isoformat() if user else None
                },
                'onboarding': {
                    'completed': onboarding_data.completed_at is not None if onboarding_data else False,
                    'has_pending_followups': onboarding_data.has_pending_followups if onboarding_data else False,
                    'followup_count': onboarding_data.followup_count if onboarding_data else 0,
                    'completed_at': onboarding_data.completed_at.isoformat() if onboarding_data and onboarding_data.completed_at else None
                },
                'follow_ups': {
                    'total_sessions': len(follow_up_sessions),
                    'total_questions': total_follow_up_questions,
                    'completed_questions': completed_follow_up_questions,
                    'completion_rate': (completed_follow_up_questions / total_follow_up_questions * 100) if total_follow_up_questions > 0 else 0
                },
                'orchestrator_actions': {
                    'total_actions': len(orchestrator_actions),
                    'completed_actions': len([a for a in orchestrator_actions if a.status == 'completed']),
                    'in_progress_actions': len([a for a in orchestrator_actions if a.status == 'in_progress'])
                }
            }
            
        except SQLAlchemyError as e:
            logger.error(f"Error getting user analytics: {e}")
            raise
        finally:
            session.close()

# Global database service instance
db_service = DatabaseService()
