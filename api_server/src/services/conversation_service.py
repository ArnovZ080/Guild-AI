"""
Conversation Service
Handles conversation persistence and retrieval for the chat interface
"""

import logging
from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import desc

from .. import models

logger = logging.getLogger(__name__)

class ConversationService:
    """Service for managing conversations and messages"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_conversation(self, user_id: str, title: Optional[str] = None) -> models.Conversation:
        """Create a new conversation"""
        try:
            conversation = models.Conversation(
                user_id=user_id,
                title=title or f"Chat {datetime.utcnow().strftime('%Y-%m-%d %H:%M')}",
                status="active"
            )
            self.db.add(conversation)
            self.db.commit()
            self.db.refresh(conversation)
            logger.info(f"Created conversation {conversation.id} for user {user_id}")
            return conversation
        except Exception as e:
            logger.error(f"Failed to create conversation: {e}")
            self.db.rollback()
            raise
    
    def get_user_conversations(self, user_id: str, limit: int = 50) -> List[models.Conversation]:
        """Get all conversations for a user"""
        try:
            conversations = self.db.query(models.Conversation)\
                .filter(models.Conversation.user_id == user_id)\
                .order_by(desc(models.Conversation.updated_at))\
                .limit(limit)\
                .all()
            return conversations
        except Exception as e:
            logger.error(f"Failed to get user conversations: {e}")
            return []
    
    def get_conversation(self, conversation_id: str, user_id: str) -> Optional[models.Conversation]:
        """Get a specific conversation"""
        try:
            conversation = self.db.query(models.Conversation)\
                .filter(
                    models.Conversation.id == conversation_id,
                    models.Conversation.user_id == user_id
                )\
                .first()
            return conversation
        except Exception as e:
            logger.error(f"Failed to get conversation {conversation_id}: {e}")
            return None
    
    def get_or_create_active_conversation(self, user_id: str) -> models.Conversation:
        """Get the most recent active conversation or create a new one"""
        try:
            # Try to get the most recent active conversation
            conversation = self.db.query(models.Conversation)\
                .filter(
                    models.Conversation.user_id == user_id,
                    models.Conversation.status == "active"
                )\
                .order_by(desc(models.Conversation.updated_at))\
                .first()
            
            if not conversation:
                # Create a new conversation
                conversation = self.create_conversation(user_id)
            
            return conversation
        except Exception as e:
            logger.error(f"Failed to get or create active conversation: {e}")
            # Fallback: create a new conversation
            return self.create_conversation(user_id)
    
    def add_message(self, conversation_id: str, user_id: str, message_type: str, content: str) -> models.ConversationMessage:
        """Add a message to a conversation"""
        try:
            message = models.ConversationMessage(
                conversation_id=conversation_id,
                user_id=user_id,
                message_type=message_type,  # user, assistant, system
                content=content
            )
            self.db.add(message)
            
            # Update conversation timestamp
            conversation = self.db.query(models.Conversation)\
                .filter(models.Conversation.id == conversation_id)\
                .first()
            if conversation:
                conversation.updated_at = datetime.utcnow()
            
            self.db.commit()
            self.db.refresh(message)
            logger.info(f"Added {message_type} message to conversation {conversation_id}")
            return message
        except Exception as e:
            logger.error(f"Failed to add message: {e}")
            self.db.rollback()
            raise
    
    def get_conversation_messages(self, conversation_id: str, user_id: str, limit: int = 100) -> List[models.ConversationMessage]:
        """Get messages for a conversation"""
        try:
            messages = self.db.query(models.ConversationMessage)\
                .join(models.Conversation)\
                .filter(
                    models.ConversationMessage.conversation_id == conversation_id,
                    models.Conversation.user_id == user_id
                )\
                .order_by(models.ConversationMessage.timestamp)\
                .limit(limit)\
                .all()
            return messages
        except Exception as e:
            logger.error(f"Failed to get conversation messages: {e}")
            return []
    
    def update_conversation_title(self, conversation_id: str, user_id: str, title: str) -> bool:
        """Update conversation title"""
        try:
            conversation = self.db.query(models.Conversation)\
                .filter(
                    models.Conversation.id == conversation_id,
                    models.Conversation.user_id == user_id
                )\
                .first()
            
            if conversation:
                conversation.title = title
                conversation.updated_at = datetime.utcnow()
                self.db.commit()
                return True
            return False
        except Exception as e:
            logger.error(f"Failed to update conversation title: {e}")
            self.db.rollback()
            return False
    
    def archive_conversation(self, conversation_id: str, user_id: str) -> bool:
        """Archive a conversation"""
        try:
            conversation = self.db.query(models.Conversation)\
                .filter(
                    models.Conversation.id == conversation_id,
                    models.Conversation.user_id == user_id
                )\
                .first()
            
            if conversation:
                conversation.status = "archived"
                conversation.updated_at = datetime.utcnow()
                self.db.commit()
                return True
            return False
        except Exception as e:
            logger.error(f"Failed to archive conversation: {e}")
            self.db.rollback()
            return False
    
    def delete_conversation(self, conversation_id: str, user_id: str) -> bool:
        """Delete a conversation and all its messages"""
        try:
            conversation = self.db.query(models.Conversation)\
                .filter(
                    models.Conversation.id == conversation_id,
                    models.Conversation.user_id == user_id
                )\
                .first()
            
            if conversation:
                # Delete all messages first (cascade should handle this, but being explicit)
                self.db.query(models.ConversationMessage)\
                    .filter(models.ConversationMessage.conversation_id == conversation_id)\
                    .delete()
                
                # Delete the conversation
                self.db.delete(conversation)
                self.db.commit()
                return True
            return False
        except Exception as e:
            logger.error(f"Failed to delete conversation: {e}")
            self.db.rollback()
            return False
    
    def get_conversation_summary(self, conversation_id: str, user_id: str) -> Dict[str, Any]:
        """Get a summary of a conversation"""
        try:
            conversation = self.get_conversation(conversation_id, user_id)
            if not conversation:
                return {}
            
            messages = self.get_conversation_messages(conversation_id, user_id)
            
            return {
                "id": conversation.id,
                "title": conversation.title,
                "status": conversation.status,
                "created_at": conversation.created_at.isoformat(),
                "updated_at": conversation.updated_at.isoformat(),
                "message_count": len(messages),
                "last_message": messages[-1].content if messages else None,
                "last_message_time": messages[-1].timestamp.isoformat() if messages else None
            }
        except Exception as e:
            logger.error(f"Failed to get conversation summary: {e}")
            return {}
