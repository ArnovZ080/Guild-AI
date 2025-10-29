#!/usr/bin/env python3
"""
Database Initialization Script
Creates database tables and initial data for Guild-AI Backend
"""

import asyncio
import logging
import sys
import os

# Add the src directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from services.database_service import db_service
from models.database import create_tables, drop_tables

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def initialize_database():
    """Initialize the database with tables and initial data"""
    try:
        logger.info("Initializing Guild-AI database...")
        
        # Create tables
        await db_service.create_tables()
        logger.info("✅ Database tables created successfully")
        
        # Test database connection
        session = db_service.get_session()
        try:
            # Test query
            result = session.execute("SELECT 1").fetchone()
            if result:
                logger.info("✅ Database connection test successful")
            else:
                logger.error("❌ Database connection test failed")
                return False
        except Exception as e:
            logger.error(f"❌ Database connection test failed: {e}")
            return False
        finally:
            session.close()
        
        logger.info("🎉 Database initialization completed successfully!")
        return True
        
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")
        return False

async def reset_database():
    """Reset the database by dropping and recreating all tables"""
    try:
        logger.info("Resetting Guild-AI database...")
        
        # Drop tables
        drop_tables(db_service.engine)
        logger.info("✅ Database tables dropped")
        
        # Recreate tables
        await db_service.create_tables()
        logger.info("✅ Database tables recreated")
        
        logger.info("🎉 Database reset completed successfully!")
        return True
        
    except Exception as e:
        logger.error(f"❌ Database reset failed: {e}")
        return False

async def create_sample_data():
    """Create sample data for testing"""
    try:
        logger.info("Creating sample data...")
        
        # Create sample user
        user = await db_service.create_user(
            email="test@example.com",
            name="Test User"
        )
        logger.info(f"✅ Created sample user: {user.email}")
        
        # Create sample onboarding data
        sample_onboarding_data = {
            'business_answers': {
                'business_type': 'consulting',
                'business_stage': 'established'
            },
            'audience_answers': {
                'benefit_audience': 'I\'m not sure who benefits most',
                'customer_avatar': 'I don\'t have one yet'
            },
            'brand_answers': {
                'brand_voice_tone': 'I\'m not sure yet',
                'brand_colors': 'I don\'t have established colors'
            },
            'financial_answers': {
                'pricing_strategy': 'I have clear pricing set'
            },
            'goals_answers': {
                'priority_3months': 'Grow my revenue'
            },
            'psychological_profile': {
                'userType': 'solopreneur',
                'confidenceLevel': 'medium'
            }
        }
        
        onboarding_data = await db_service.save_onboarding_data(
            str(user.id),
            sample_onboarding_data
        )
        logger.info(f"✅ Created sample onboarding data for user: {user.email}")
        
        logger.info("🎉 Sample data creation completed successfully!")
        return True
        
    except Exception as e:
        logger.error(f"❌ Sample data creation failed: {e}")
        return False

async def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Guild-AI Database Initialization")
    parser.add_argument("--reset", action="store_true", help="Reset database (drop and recreate tables)")
    parser.add_argument("--sample", action="store_true", help="Create sample data")
    
    args = parser.parse_args()
    
    if args.reset:
        success = await reset_database()
    else:
        success = await initialize_database()
    
    if args.sample and success:
        await create_sample_data()
    
    if success:
        logger.info("✅ All operations completed successfully!")
        sys.exit(0)
    else:
        logger.error("❌ Operations failed!")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
