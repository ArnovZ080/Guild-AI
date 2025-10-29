"""
Visual Workflow Builder - Main Interface

This module provides the main interface for building and managing workflows.
It integrates the WorkflowCanvas, WorkflowExecutionEngine, and provides
high-level workflow management capabilities.
"""

import uuid
import logging
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime

from .workflow_canvas import WorkflowCanvas, WorkflowNode, WorkflowConnection
from .workflow_engine import WorkflowExecutionEngine
from .node_types import create_node, BaseNode

logger = logging.getLogger(__name__)


class VisualWorkflowBuilder:
    """
    Main interface for building and managing visual workflows.
    
    This class provides a high-level API for:
    - Creating and managing workflows
    - Adding different types of nodes
    - Connecting nodes to build workflows
    - Executing workflows
    - Monitoring execution progress
    """
    
    def __init__(self):
        """Initialize the workflow builder."""
        self.canvas = WorkflowCanvas()
        self.execution_engine = WorkflowExecutionEngine(self.canvas)
        
        # Available node templates
        self.node_templates = self._initialize_node_templates()
        
        logger.info("VisualWorkflowBuilder initialized successfully")
    
    def _initialize_node_templates(self) -> Dict[str, Dict[str, Any]]:
        """Initialize available node templates."""
        return {
            # AI Agent Templates
            "content_strategist": {
                "type": "agent",
                "name": "Content Strategist",
                "description": "AI agent that creates content strategies",
                "config": {"agent_type": "content_strategist"},
                "category": "AI Agents"
            },
            "copywriter": {
                "type": "agent",
                "name": "Copywriter",
                "description": "AI agent that writes compelling copy",
                "config": {"agent_type": "copywriter"},
                "category": "AI Agents"
            },
            "judge": {
                "type": "agent",
                "name": "Judge Agent",
                "description": "AI agent that evaluates quality and generates rubrics",
                "config": {"agent_type": "judge"},
                "category": "AI Agents"
            },
            "onboarding": {
                "type": "agent",
                "name": "Onboarding Agent",
                "description": "AI agent that handles user onboarding",
                "config": {"agent_type": "onboarding"},
                "category": "AI Agents"
            },
            
            # Visual Skill Templates
            "email_navigation": {
                "type": "visual_skill",
                "name": "Email Navigation",
                "description": "Navigate to specific email account and compose",
                "config": {
                    "skill_pattern": {
                        "steps": [
                            {"action_type": "click", "target_element": "email_app_icon"},
                            {"action_type": "wait", "duration": 2},
                            {"action_type": "click", "target_element": "compose_button"}
                        ],
                        "estimated_duration": 30
                    }
                },
                "category": "Visual Skills"
            },
            "form_filling": {
                "type": "visual_skill",
                "name": "Form Filling",
                "description": "Fill out forms automatically",
                "config": {
                    "skill_pattern": {
                        "steps": [
                            {"action_type": "click", "target_element": "form_field"},
                            {"action_type": "type", "target_element": "input_field", "action_data": {"text": "{form_data}"}},
                            {"action_type": "click", "target_element": "submit_button"}
                        ],
                        "estimated_duration": 45
                    }
                },
                "category": "Visual Skills"
            },
            
            # Social Media Skills
            "instagram_post": {
                "type": "visual_skill",
                "name": "Instagram Post",
                "description": "Create and post Instagram content",
                "config": {
                    "skill_pattern": {
                        "steps": [
                            {"action_type": "click", "target_element": "plus_button"},
                            {"action_type": "click", "target_element": "post_option"},
                            {"action_type": "click", "target_element": "select_photos"},
                            {"action_type": "wait", "duration": 2},
                            {"action_type": "click", "target_element": "next_button"},
                            {"action_type": "type", "target_element": "caption_field", "action_data": {"text": "{caption}"}},
                            {"action_type": "click", "target_element": "share_button"}
                        ],
                        "estimated_duration": 60
                    }
                },
                "category": "Social Media"
            },
            "twitter_post": {
                "type": "visual_skill",
                "name": "Twitter Post",
                "description": "Compose and post Twitter content",
                "config": {
                    "skill_pattern": {
                        "steps": [
                            {"action_type": "click", "target_element": "tweet_button"},
                            {"action_type": "type", "target_element": "tweet_input", "action_data": {"text": "{tweet_text}"}},
                            {"action_type": "click", "target_element": "add_media"},
                            {"action_type": "wait", "duration": 2},
                            {"action_type": "click", "target_element": "post_tweet"}
                        ],
                        "estimated_duration": 45
                    }
                },
                "category": "Social Media"
            },
            "linkedin_post": {
                "type": "visual_skill",
                "name": "LinkedIn Post",
                "description": "Create professional LinkedIn posts",
                "config": {
                    "skill_pattern": {
                        "steps": [
                            {"action_type": "click", "target_element": "start_post"},
                            {"action_type": "type", "target_element": "post_content", "action_data": {"text": "{post_content}"}},
                            {"action_type": "type", "target_element": "hashtag_input", "action_data": {"text": "{hashtags}"}},
                            {"action_type": "click", "target_element": "post_button"}
                        ],
                        "estimated_duration": 60
                    }
                },
                "category": "Social Media"
            },
            "facebook_post": {
                "type": "visual_skill",
                "name": "Facebook Post",
                "description": "Post content to Facebook pages",
                "config": {
                    "skill_pattern": {
                        "steps": [
                            {"action_type": "click", "target_element": "create_post"},
                            {"action_type": "type", "target_element": "post_text", "action_data": {"text": "{post_text}"}},
                            {"action_type": "click", "target_element": "add_photo"},
                            {"action_type": "wait", "duration": 2},
                            {"action_type": "click", "target_element": "post_now"}
                        ],
                        "estimated_duration": 45
                    }
                },
                "category": "Social Media"
            },
            
            # Content Creation Skills
            "canva_design": {
                "type": "visual_skill",
                "name": "Canva Design",
                "description": "Create social media graphics in Canva",
                "config": {
                    "skill_pattern": {
                        "steps": [
                            {"action_type": "navigate", "url": "canva.com"},
                            {"action_type": "wait", "duration": 3},
                            {"action_type": "click", "target_element": "create_design"},
                            {"action_type": "click", "target_element": "social_media_template"},
                            {"action_type": "click", "target_element": "instagram_post"},
                            {"action_type": "type", "target_element": "text_editor", "action_data": {"text": "{design_text}"}},
                            {"action_type": "click", "target_element": "download_button"}
                        ],
                        "estimated_duration": 120
                    }
                },
                "category": "Content Creation"
            },
            "video_editing_capcut": {
                "type": "visual_skill",
                "name": "CapCut Video Editing",
                "description": "Basic video editing in CapCut",
                "config": {
                    "skill_pattern": {
                        "steps": [
                            {"action_type": "click", "target_element": "new_project"},
                            {"action_type": "click", "target_element": "import_media"},
                            {"action_type": "wait", "duration": 3},
                            {"action_type": "drag", "target_element": "media_clip", "action_data": {"target": "timeline"}},
                            {"action_type": "click", "target_element": "text_tool"},
                            {"action_type": "type", "target_element": "text_input", "action_data": {"text": "{video_text}"}},
                            {"action_type": "click", "target_element": "export_button"}
                        ],
                        "estimated_duration": 180
                    }
                },
                "category": "Content Creation"
            },
            "video_editing_davinci": {
                "type": "visual_skill",
                "name": "DaVinci Resolve Editing",
                "description": "Professional video editing in DaVinci Resolve",
                "config": {
                    "skill_pattern": {
                        "steps": [
                            {"action_type": "click", "target_element": "new_project"},
                            {"action_type": "click", "target_element": "import_media"},
                            {"action_type": "wait", "duration": 5},
                            {"action_type": "drag", "target_element": "media_clip", "action_data": {"target": "timeline"}},
                            {"action_type": "click", "target_element": "color_correction"},
                            {"action_type": "adjust_slider", "target_element": "exposure", "action_data": {"value": "{exposure_value}"}},
                            {"action_type": "click", "target_element": "export_button"}
                        ],
                        "estimated_duration": 300
                    }
                },
                "category": "Content Creation"
            },
            "youtube_upload": {
                "type": "visual_skill",
                "name": "YouTube Upload",
                "description": "Upload and configure YouTube videos",
                "config": {
                    "skill_pattern": {
                        "steps": [
                            {"action_type": "navigate", "url": "studio.youtube.com"},
                            {"action_type": "wait", "duration": 3},
                            {"action_type": "click", "target_element": "create_button"},
                            {"action_type": "click", "target_element": "upload_video"},
                            {"action_type": "wait", "duration": 5},
                            {"action_type": "type", "target_element": "title_field", "action_data": {"text": "{video_title}"}},
                            {"action_type": "type", "target_element": "description_field", "action_data": {"text": "{video_description}"}},
                            {"action_type": "click", "target_element": "publish_button"}
                        ],
                        "estimated_duration": 240
                    }
                },
                "category": "Content Creation"
            },
            "tiktok_upload": {
                "type": "visual_skill",
                "name": "TikTok Upload",
                "description": "Upload and configure TikTok videos",
                "config": {
                    "skill_pattern": {
                        "steps": [
                            {"action_type": "navigate", "url": "tiktok.com/upload"},
                            {"action_type": "wait", "duration": 3},
                            {"action_type": "click", "target_element": "upload_video"},
                            {"action_type": "wait", "duration": 5},
                            {"action_type": "type", "target_element": "caption_field", "action_data": {"text": "{tiktok_caption}"}},
                            {"action_type": "click", "target_element": "add_hashtags"},
                            {"action_type": "type", "target_element": "hashtag_input", "action_data": {"text": "{hashtags}"}},
                            {"action_type": "click", "target_element": "post_button"}
                        ],
                        "estimated_duration": 180
                    }
                },
                "category": "Content Creation"
            },
            "podcast_editing": {
                "type": "visual_skill",
                "name": "Podcast Editing",
                "description": "Basic podcast editing in Audacity",
                "config": {
                    "skill_pattern": {
                        "steps": [
                            {"action_type": "click", "target_element": "file_open"},
                            {"action_type": "wait", "duration": 3},
                            {"action_type": "click", "target_element": "select_audio"},
                            {"action_type": "click", "target_element": "noise_reduction"},
                            {"action_type": "click", "target_element": "normalize_audio"},
                            {"action_type": "click", "target_element": "export_audio"}
                        ],
                        "estimated_duration": 120
                    }
                },
                "category": "Content Creation"
            },
            
            # Business Operations Skills
            "invoice_creation": {
                "type": "visual_skill",
                "name": "Invoice Creation",
                "description": "Create invoices in accounting software",
                "config": {
                    "skill_pattern": {
                        "steps": [
                            {"action_type": "click", "target_element": "new_invoice"},
                            {"action_type": "type", "target_element": "client_field", "action_data": {"text": "{client_name}"}},
                            {"action_type": "type", "target_element": "amount_field", "action_data": {"text": "{amount}"}},
                            {"action_type": "type", "target_element": "description_field", "action_data": {"text": "{description}"}},
                            {"action_type": "click", "target_element": "save_button"}
                        ],
                        "estimated_duration": 90
                    }
                },
                "category": "Business Operations"
            },
            "calendar_scheduling": {
                "type": "visual_skill",
                "name": "Calendar Scheduling",
                "description": "Schedule meetings and appointments",
                "config": {
                    "skill_pattern": {
                        "steps": [
                            {"action_type": "click", "target_element": "new_event"},
                            {"action_type": "type", "target_element": "title_field", "action_data": {"text": "{event_title}"}},
                            {"action_type": "type", "target_element": "date_field", "action_data": {"text": "{date}"}},
                            {"action_type": "type", "target_element": "time_field", "action_data": {"text": "{time}"}},
                            {"action_type": "click", "target_element": "save_button"}
                        ],
                        "estimated_duration": 60
                    }
                },
                "category": "Business Operations"
            },
            
            # Marketing & Analytics Skills
            "google_analytics_report": {
                "type": "visual_skill",
                "name": "Google Analytics Report",
                "description": "Generate and export analytics reports",
                "config": {
                    "skill_pattern": {
                        "steps": [
                            {"action_type": "navigate", "url": "analytics.google.com"},
                            {"action_type": "wait", "duration": 3},
                            {"action_type": "click", "target_element": "date_range"},
                            {"action_type": "click", "target_element": "last_30_days"},
                            {"action_type": "click", "target_element": "export_button"},
                            {"action_type": "click", "target_element": "csv_format"}
                        ],
                        "estimated_duration": 90
                    }
                },
                "category": "Marketing & Analytics"
            },
            "facebook_ads_creation": {
                "type": "visual_skill",
                "name": "Facebook Ads Creation",
                "description": "Create Facebook advertising campaigns",
                "config": {
                    "skill_pattern": {
                        "steps": [
                            {"action_type": "navigate", "url": "adsmanager.facebook.com"},
                            {"action_type": "wait", "duration": 3},
                            {"action_type": "click", "target_element": "create_campaign"},
                            {"action_type": "click", "target_element": "awareness_objective"},
                            {"action_type": "type", "target_element": "campaign_name", "action_data": {"text": "{campaign_name}"}},
                            {"action_type": "click", "target_element": "continue_button"}
                        ],
                        "estimated_duration": 120
                    }
                },
                "category": "Marketing & Analytics"
            },
            "google_ads_creation": {
                "type": "visual_skill",
                "name": "Google Ads Creation",
                "description": "Create Google advertising campaigns",
                "config": {
                    "skill_pattern": {
                        "steps": [
                            {"action_type": "navigate", "url": "ads.google.com"},
                            {"action_type": "wait", "duration": 3},
                            {"action_type": "click", "target_element": "new_campaign"},
                            {"action_type": "click", "target_element": "search_campaign"},
                            {"action_type": "type", "target_element": "campaign_name", "action_data": {"text": "{campaign_name}"}},
                            {"action_type": "click", "target_element": "continue_button"}
                        ],
                        "estimated_duration": 120
                    }
                },
                "category": "Marketing & Analytics"
            },
            "email_campaign_setup": {
                "type": "visual_skill",
                "name": "Email Campaign Setup",
                "description": "Set up email marketing campaigns",
                "config": {
                    "skill_pattern": {
                        "steps": [
                            {"action_type": "navigate", "url": "mailchimp.com"},
                            {"action_type": "wait", "duration": 3},
                            {"action_type": "click", "target_element": "create_campaign"},
                            {"action_type": "click", "target_element": "email_campaign"},
                            {"action_type": "type", "target_element": "campaign_name", "action_data": {"text": "{campaign_name}"}},
                            {"action_type": "click", "target_element": "design_email"}
                        ],
                        "estimated_duration": 90
                    }
                },
                "category": "Marketing & Analytics"
            },
            
            # Accounting & Bookkeeping Skills
            "excel_expense_tracking": {
                "type": "visual_skill",
                "name": "Excel Expense Tracking",
                "description": "Automate expense categorization and tracking in Excel",
                "config": {
                    "skill_pattern": {
                        "steps": [
                            {"action_type": "navigate", "url": "excel_file"},
                            {"action_type": "wait", "duration": 2},
                            {"action_type": "click", "target_element": "expense_sheet"},
                            {"action_type": "click", "target_element": "new_expense_row"},
                            {"action_type": "type", "target_element": "date_field", "action_data": {"text": "{expense_date}"}},
                            {"action_type": "type", "target_element": "amount_field", "action_data": {"text": "{expense_amount}"}},
                            {"action_type": "type", "target_element": "category_field", "action_data": {"text": "{expense_category}"}},
                            {"action_type": "type", "target_element": "description_field", "action_data": {"text": "{expense_description}"}},
                            {"action_type": "press_key", "key": "enter"}
                        ],
                        "estimated_duration": 30
                    }
                },
                "category": "Accounting & Finance"
            },
            "xero_invoice_creation": {
                "type": "visual_skill",
                "name": "Xero Invoice Creation",
                "description": "Automate invoice creation in Xero accounting software",
                "config": {
                    "skill_pattern": {
                        "steps": [
                            {"action_type": "navigate", "url": "xero.com"},
                            {"action_type": "wait", "duration": 3},
                            {"action_type": "click", "target_element": "login_button"},
                            {"action_type": "type", "target_element": "email_field", "action_data": {"text": "{email}"}},
                            {"action_type": "type", "target_element": "password_field", "action_data": {"text": "{password}"}},
                            {"action_type": "click", "target_element": "sign_in"},
                            {"action_type": "wait", "duration": 3},
                            {"action_type": "click", "target_element": "invoices_menu"},
                            {"action_type": "click", "target_element": "new_invoice"},
                            {"action_type": "type", "target_element": "client_field", "action_data": {"text": "{client_name}"}},
                            {"action_type": "type", "target_element": "item_description", "action_data": {"text": "{item_description}"}},
                            {"action_type": "type", "target_element": "quantity_field", "action_data": {"text": "{quantity}"}},
                            {"action_type": "type", "target_element": "unit_price", "action_data": {"text": "{unit_price}"}},
                            {"action_type": "click", "target_element": "save_invoice"}
                        ],
                        "estimated_duration": 120
                    }
                },
                "category": "Accounting & Finance"
            },
            "xero_expense_categorization": {
                "type": "visual_skill",
                "name": "Xero Expense Categorization",
                "description": "Automate expense categorization and bank reconciliation",
                "config": {
                    "skill_pattern": {
                        "steps": [
                            {"action_type": "navigate", "url": "xero.com/bank-accounts"},
                            {"action_type": "wait", "duration": 3},
                            {"action_type": "click", "target_element": "bank_account"},
                            {"action_type": "click", "target_element": "unreconciled_transactions"},
                            {"action_type": "click", "target_element": "transaction"},
                            {"action_type": "click", "target_element": "categorize_button"},
                            {"action_type": "click", "target_element": "expense_category"},
                            {"action_type": "type", "target_element": "description_field", "action_data": {"text": "{expense_description}"}},
                            {"action_type": "click", "target_element": "save_categorization"}
                        ],
                        "estimated_duration": 45
                    }
                },
                "category": "Accounting & Finance"
            },
            "cashflow_analysis_excel": {
                "type": "visual_skill",
                "name": "Cash Flow Analysis Excel",
                "description": "Automate cash flow analysis and reporting in Excel",
                "config": {
                    "skill_pattern": {
                        "steps": [
                            {"action_type": "navigate", "url": "excel_file"},
                            {"action_type": "wait", "duration": 2},
                            {"action_type": "click", "target_element": "cashflow_sheet"},
                            {"action_type": "click", "target_element": "data_range"},
                            {"action_type": "press_key", "key": "ctrl+a"},
                            {"action_type": "click", "target_element": "pivot_table"},
                            {"action_type": "click", "target_element": "cashflow_analysis"},
                            {"action_type": "click", "target_element": "create_chart"},
                            {"action_type": "click", "target_element": "save_analysis"}
                        ],
                        "estimated_duration": 60
                    }
                },
                "category": "Accounting & Finance"
            },
            "cost_analysis_reporting": {
                "type": "visual_skill",
                "name": "Cost Analysis Reporting",
                "description": "Automate cost of sales vs income analysis and reporting",
                "config": {
                    "skill_pattern": {
                        "steps": [
                            {"action_type": "navigate", "url": "excel_file"},
                            {"action_type": "wait", "duration": 2},
                            {"action_type": "click", "target_element": "cost_analysis_sheet"},
                            {"action_type": "click", "target_element": "raw_materials_tab"},
                            {"action_type": "click", "target_element": "calculate_totals"},
                            {"action_type": "click", "target_element": "income_tab"},
                            {"action_type": "click", "target_element": "profit_margin_calc"},
                            {"action_type": "click", "target_element": "create_summary_chart"},
                            {"action_type": "click", "target_element": "export_report"}
                        ],
                        "estimated_duration": 90
                    }
                },
                "category": "Accounting & Finance"
            },
            
            # Sales Funnel Builder Skills
            "landing_page_creation": {
                "type": "visual_skill",
                "name": "Landing Page Creation",
                "description": "Automate landing page creation with drag-and-drop builders",
                "config": {
                    "skill_pattern": {
                        "steps": [
                            {"action_type": "navigate", "url": "landing_page_builder"},
                            {"action_type": "wait", "duration": 3},
                            {"action_type": "click", "target_element": "new_page"},
                            {"action_type": "click", "target_element": "template_gallery"},
                            {"action_type": "click", "target_element": "sales_page_template"},
                            {"action_type": "click", "target_element": "use_template"},
                            {"action_type": "type", "target_element": "headline_field", "action_data": {"text": "{page_headline}"}},
                            {"action_type": "type", "target_element": "subheadline_field", "action_data": {"text": "{page_subheadline}"}},
                            {"action_type": "click", "target_element": "save_page"}
                        ],
                        "estimated_duration": 180
                    }
                },
                "category": "Sales Funnel Builder"
            },
            "upsell_sequence_setup": {
                "type": "visual_skill",
                "name": "Upsell Sequence Setup",
                "description": "Automate upsell and cross-sell sequence creation",
                "config": {
                    "skill_pattern": {
                        "steps": [
                            {"action_type": "navigate", "url": "funnel_builder"},
                            {"action_type": "wait", "duration": 3},
                            {"action_type": "click", "target_element": "create_sequence"},
                            {"action_type": "click", "target_element": "upsell_template"},
                            {"action_type": "type", "target_element": "sequence_name", "action_data": {"text": "{sequence_name}"}},
                            {"action_type": "click", "target_element": "add_upsell_page"},
                            {"action_type": "type", "target_element": "upsell_offer", "action_data": {"text": "{upsell_offer}"}},
                            {"action_type": "click", "target_element": "add_cross_sell"},
                            {"action_type": "click", "target_element": "save_sequence"}
                        ],
                        "estimated_duration": 120
                    }
                },
                "category": "Sales Funnel Builder"
            },
            "payment_provider_integration": {
                "type": "visual_skill",
                "name": "Payment Provider Integration",
                "description": "Automate Stripe, PayPal, and other payment integrations",
                "config": {
                    "skill_pattern": {
                        "steps": [
                            {"action_type": "navigate", "url": "payment_settings"},
                            {"action_type": "wait", "duration": 3},
                            {"action_type": "click", "target_element": "add_payment_method"},
                            {"action_type": "click", "target_element": "stripe_integration"},
                            {"action_type": "type", "target_element": "api_key_field", "action_data": {"text": "{stripe_api_key}"}},
                            {"action_type": "type", "target_element": "webhook_url", "action_data": {"text": "{webhook_url}"}},
                            {"action_type": "click", "target_element": "test_connection"},
                            {"action_type": "click", "target_element": "save_integration"}
                        ],
                        "estimated_duration": 90
                    }
                },
                "category": "Sales Funnel Builder"
            },
            "thank_you_page_setup": {
                "type": "visual_skill",
                "name": "Thank You Page Setup",
                "description": "Automate post-purchase thank you page and sequence creation",
                "config": {
                    "skill_pattern": {
                        "steps": [
                            {"action_type": "navigate", "url": "thank_you_page_builder"},
                            {"action_type": "wait", "duration": 3},
                            {"action_type": "click", "target_element": "new_thank_you_page"},
                            {"action_type": "type", "target_element": "page_title", "action_data": {"text": "Thank You for Your Purchase!"}},
                            {"action_type": "click", "target_element": "add_gratitude_message"},
                            {"action_type": "type", "target_element": "message_content", "action_data": {"text": "{gratitude_message}"}},
                            {"action_type": "click", "target_element": "add_next_steps"},
                            {"action_type": "click", "target_element": "add_email_sequence"},
                            {"action_type": "click", "target_element": "save_page"}
                        ],
                        "estimated_duration": 75
                    }
                },
                "category": "Sales Funnel Builder"
            },
            
            # Lead Magnet & CRM Automation Skills
            "lead_magnet_creation": {
                "type": "visual_skill",
                "name": "Lead Magnet Creation",
                "description": "Automate lead magnet creation (PDFs, videos, checklists)",
                "config": {
                    "skill_pattern": {
                        "steps": [
                            {"action_type": "navigate", "url": "content_creation_tool"},
                            {"action_type": "wait", "duration": 3},
                            {"action_type": "click", "target_element": "new_lead_magnet"},
                            {"action_type": "click", "target_element": "template_gallery"},
                            {"action_type": "click", "target_element": "pdf_template"},
                            {"action_type": "type", "target_element": "title_field", "action_data": {"text": "{lead_magnet_title}"}},
                            {"action_type": "type", "target_element": "content_field", "action_data": {"text": "{lead_magnet_content}"}},
                            {"action_type": "click", "target_element": "add_branding"},
                            {"action_type": "click", "target_element": "export_pdf"}
                        ],
                        "estimated_duration": 150
                    }
                },
                "category": "Lead Magnet & CRM"
            },
            "email_collection_funnel": {
                "type": "visual_skill",
                "name": "Email Collection Funnel",
                "description": "Automate email capture funnel creation and setup",
                "config": {
                    "skill_pattern": {
                        "steps": [
                            {"action_type": "navigate", "url": "funnel_builder"},
                            {"action_type": "wait", "duration": 3},
                            {"action_type": "click", "target_element": "new_funnel"},
                            {"action_type": "click", "target_element": "email_capture_template"},
                            {"action_type": "type", "target_element": "funnel_name", "action_data": {"text": "{funnel_name}"}},
                            {"action_type": "click", "target_element": "add_optin_page"},
                            {"action_type": "type", "target_element": "optin_copy", "action_data": {"text": "{optin_copy}"}},
                            {"action_type": "click", "target_element": "add_thank_you_page"},
                            {"action_type": "click", "target_element": "save_funnel"}
                        ],
                        "estimated_duration": 90
                    }
                },
                "category": "Lead Magnet & CRM"
            },
            "crm_lead_management": {
                "type": "visual_skill",
                "name": "CRM Lead Management",
                "description": "Automate lead addition and follow-up sequence setup",
                "config": {
                    "skill_pattern": {
                        "steps": [
                            {"action_type": "navigate", "url": "crm_dashboard"},
                            {"action_type": "wait", "duration": 3},
                            {"action_type": "click", "target_element": "add_new_lead"},
                            {"action_type": "type", "target_element": "lead_name", "action_data": {"text": "{lead_name}"}},
                            {"action_type": "type", "target_element": "lead_email", "action_data": {"text": "{lead_email}"}},
                            {"action_type": "type", "target_element": "lead_source", "action_data": {"text": "{lead_source}"}},
                            {"action_type": "click", "target_element": "assign_follow_up"},
                            {"action_type": "click", "target_element": "create_sequence"},
                            {"action_type": "click", "target_element": "save_lead"}
                        ],
                        "estimated_duration": 60
                    }
                },
                "category": "Lead Magnet & CRM"
            },
            "audience_analysis_ai": {
                "type": "visual_skill",
                "name": "Audience Analysis AI",
                "description": "AI-powered lead magnet recommendations for target audience",
                "config": {
                    "skill_pattern": {
                        "steps": [
                            {"action_type": "navigate", "url": "ai_analysis_tool"},
                            {"action_type": "wait", "duration": 3},
                            {"action_type": "click", "target_element": "audience_analysis"},
                            {"action_type": "type", "target_element": "target_audience", "action_data": {"text": "{target_audience}"}},
                            {"action_type": "type", "target_element": "business_type", "action_data": {"text": "{business_type}"}},
                            {"action_type": "click", "target_element": "analyze_pain_points"},
                            {"action_type": "click", "target_element": "generate_recommendations"},
                            {"action_type": "click", "target_element": "export_analysis"}
                        ],
                        "estimated_duration": 120
                    }
                },
                "category": "Lead Magnet & CRM"
            },
            
            # Business Operations Skills
            "inventory_management": {
                "type": "visual_skill",
                "name": "Inventory Management",
                "description": "Automate inventory tracking and reorder point management",
                "config": {
                    "skill_pattern": {
                        "steps": [
                            {"action_type": "navigate", "url": "inventory_system"},
                            {"action_type": "wait", "duration": 3},
                            {"action_type": "click", "target_element": "inventory_dashboard"},
                            {"action_type": "click", "target_element": "add_new_item"},
                            {"action_type": "type", "target_element": "item_name", "action_data": {"text": "{item_name}"}},
                            {"action_type": "type", "target_element": "current_stock", "action_data": {"text": "{current_stock}"}},
                            {"action_type": "type", "target_element": "reorder_point", "action_data": {"text": "{reorder_point}"}},
                            {"action_type": "click", "target_element": "set_alerts"},
                            {"action_type": "click", "target_element": "save_item"}
                        ],
                        "estimated_duration": 60
                    }
                },
                "category": "Business Operations"
            },
            "customer_support_automation": {
                "type": "visual_skill",
                "name": "Customer Support Automation",
                "description": "Automate ticket creation and response systems",
                "config": {
                    "skill_pattern": {
                        "steps": [
                            {"action_type": "navigate", "url": "support_system"},
                            {"action_type": "wait", "duration": 3},
                            {"action_type": "click", "target_element": "new_ticket"},
                            {"action_type": "type", "target_element": "customer_email", "action_data": {"text": "{customer_email}"}},
                            {"action_type": "type", "target_element": "issue_description", "action_data": {"text": "{issue_description}"}},
                            {"action_type": "click", "target_element": "assign_priority"},
                            {"action_type": "click", "target_element": "auto_response"},
                            {"action_type": "click", "target_element": "create_ticket"}
                        ],
                        "estimated_duration": 45
                    }
                },
                "category": "Business Operations"
            },
            "project_management_setup": {
                "type": "visual_skill",
                "name": "Project Management Setup",
                "description": "Automate project creation and task management",
                "config": {
                    "skill_pattern": {
                        "steps": [
                            {"action_type": "navigate", "url": "project_management_tool"},
                            {"action_type": "wait", "duration": 3},
                            {"action_type": "click", "target_element": "new_project"},
                            {"action_type": "type", "target_element": "project_name", "action_data": {"text": "{project_name}"}},
                            {"action_type": "type", "target_element": "project_description", "action_data": {"text": "{project_description}"}},
                            {"action_type": "click", "target_element": "add_team_members"},
                            {"action_type": "click", "target_element": "create_tasks"},
                            {"action_type": "click", "target_element": "set_deadlines"},
                            {"action_type": "click", "target_element": "save_project"}
                        ],
                        "estimated_duration": 75
                    }
                },
                "category": "Business Operations"
            },
            "reporting_automation": {
                "type": "visual_skill",
                "name": "Reporting Automation",
                "description": "Automate scheduled report generation and distribution",
                "config": {
                    "skill_pattern": {
                        "steps": [
                            {"action_type": "navigate", "url": "reporting_dashboard"},
                            {"action_type": "wait", "duration": 3},
                            {"action_type": "click", "target_element": "create_report"},
                            {"action_type": "click", "target_element": "select_data_source"},
                            {"action_type": "click", "target_element": "choose_metrics"},
                            {"action_type": "click", "target_element": "set_schedule"},
                            {"action_type": "type", "target_element": "recipient_emails", "action_data": {"text": "{recipient_emails}"}},
                            {"action_type": "click", "target_element": "save_automation"}
                        ],
                        "estimated_duration": 90
                    }
                },
                "category": "Business Operations"
            },
            
            # Logic Templates
            "if_else": {
                "type": "logic",
                "name": "If/Else Condition",
                "description": "Conditional branching based on data",
                "config": {
                    "logic_type": "if_else",
                    "condition": "data_quality > 0.8",
                    "if_branch": "high_quality_path",
                    "else_branch": "review_path"
                },
                "category": "Logic & Control"
            },
            "loop": {
                "type": "logic",
                "name": "Loop",
                "description": "Repeat actions multiple times",
                "config": {
                    "logic_type": "loop",
                    "loop_type": "for",
                    "iterations": 5
                },
                "category": "Logic & Control"
            },
            "delay": {
                "type": "logic",
                "name": "Delay",
                "description": "Wait for specified time",
                "config": {
                    "logic_type": "delay",
                    "delay_seconds": 5
                },
                "category": "Logic & Control"
            },
            
            # Input/Output Templates
            "text_input": {
                "type": "input",
                "name": "Text Input",
                "description": "Accept text input from user",
                "config": {"input_type": "text", "default_value": ""},
                "category": "Input/Output"
            },
            "data_output": {
                "type": "output",
                "name": "Data Output",
                "description": "Collect and format final results",
                "config": {"output_type": "json"},
                "category": "Input/Output"
            }
        }
    
    def get_available_templates(self) -> Dict[str, List[Dict[str, Any]]]:
        """Get available node templates organized by category."""
        templates_by_category = {}
        
        for template_id, template in self.node_templates.items():
            category = template["category"]
            if category not in templates_by_category:
                templates_by_category[category] = []
            
            templates_by_category[category].append({
                "template_id": template_id,
                **template
            })
        
        return templates_by_category
    
    def create_workflow(self, name: str, description: str = "") -> str:
        """
        Create a new workflow.
        
        Args:
            name: Name of the workflow
            description: Description of the workflow
            
        Returns:
            Workflow ID
        """
        return self.canvas.create_workflow(name, description)
    
    def add_node_from_template(self, workflow_id: str, template_id: str, position: Tuple[int, int] = (0, 0), custom_config: Dict[str, Any] = None) -> Optional[str]:
        """
        Add a node to a workflow using a template.
        
        Args:
            workflow_id: ID of the workflow
            template_id: ID of the template to use
            position: Position of the node on the canvas
            custom_config: Custom configuration to override template defaults
            
        Returns:
            Node ID if successful, None otherwise
        """
        if template_id not in self.node_templates:
            logger.error(f"Template {template_id} not found")
            return None
        
        template = self.node_templates[template_id]
        
        # Merge template config with custom config
        config = template["config"].copy()
        if custom_config:
            config.update(custom_config)
        
        # Remove name from config to avoid conflicts
        config.pop("name", None)
        
        # Create node
        node = create_node(
            node_type=template["type"],
            node_id=str(uuid.uuid4()),
            name=template["name"],
            **config
        )
        
        # Set position
        node.position = position
        
        # Add to workflow
        if self.canvas.add_node(workflow_id, node):
            logger.info(f"Added node {node.name} to workflow {workflow_id}")
            return node.node_id
        else:
            logger.error(f"Failed to add node {node.name} to workflow {workflow_id}")
            return None
    
    def add_custom_node(self, workflow_id: str, node_type: str, name: str, config: Dict[str, Any], position: Tuple[int, int] = (0, 0)) -> Optional[str]:
        """
        Add a custom node to a workflow.
        
        Args:
            workflow_id: ID of the workflow
            node_type: Type of the node
            name: Name of the node
            config: Node configuration
            position: Position of the node on the canvas
            
        Returns:
            Node ID if successful, None otherwise
        """
        try:
            node = create_node(
                node_type=node_type,
                node_id=str(uuid.uuid4()),
                name=name,
                **config
            )
            
            node.position = position
            
            if self.canvas.add_node(workflow_id, node):
                logger.info(f"Added custom node {name} to workflow {workflow_id}")
                return node.node_id
            else:
                logger.error(f"Failed to add custom node {name} to workflow {workflow_id}")
                return None
                
        except Exception as e:
            logger.error(f"Error creating custom node: {e}")
            return None
    
    def connect_nodes(self, workflow_id: str, source_node_id: str, target_node_id: str, source_port: str = "output", target_port: str = "input", data_type: str = "any", condition: str = None) -> bool:
        """
        Connect two nodes in a workflow.
        
        Args:
            workflow_id: ID of the workflow
            source_node_id: ID of the source node
            target_node_id: ID of the target node
            source_port: Port on source node
            target_port: Port on target node
            data_type: Type of data being passed
            condition: Optional condition for the connection
            
        Returns:
            True if successful
        """
        connection = WorkflowConnection(
            connection_id=str(uuid.uuid4()),
            source_node_id=source_node_id,
            target_node_id=target_node_id,
            source_port=source_port,
            target_port=target_port,
            data_type=data_type,
            condition=condition
        )
        
        return self.canvas.add_connection(workflow_id, connection)
    
    def disconnect_nodes(self, workflow_id: str, source_node_id: str, target_node_id: str) -> bool:
        """
        Disconnect two nodes in a workflow.
        
        Args:
            workflow_id: ID of the workflow
            source_node_id: ID of the source node
            target_node_id: ID of the target node
            
        Returns:
            True if successful
        """
        connections = self.canvas.get_workflow_connections(workflow_id)
        
        for connection in connections:
            if (connection.source_node_id == source_node_id and 
                connection.target_node_id == target_node_id):
                return self.canvas.remove_connection(workflow_id, connection.connection_id)
        
        return False
    
    def remove_node(self, workflow_id: str, node_id: str) -> bool:
        """
        Remove a node from a workflow.
        
        Args:
            workflow_id: ID of the workflow
            node_id: ID of the node to remove
            
        Returns:
            True if successful
        """
        return self.canvas.remove_node(workflow_id, node_id)
    
    def update_node_config(self, workflow_id: str, node_id: str, new_config: Dict[str, Any]) -> bool:
        """
        Update configuration of a node.
        
        Args:
            workflow_id: ID of the workflow
            node_id: ID of the node
            new_config: New configuration
            
        Returns:
            True if successful
        """
        workflow = self.canvas.get_workflow(workflow_id)
        if not workflow or node_id not in workflow["nodes"]:
            return False
        
        node = workflow["nodes"][node_id]
        
        # Update node configuration
        for key, value in new_config.items():
            if hasattr(node, key):
                setattr(node, key, value)
        
        workflow["modified_at"] = datetime.now()
        logger.info(f"Updated node {node_id} configuration")
        return True
    
    def move_node(self, workflow_id: str, node_id: str, new_position: Tuple[int, int]) -> bool:
        """
        Move a node to a new position on the canvas.
        
        Args:
            workflow_id: ID of the workflow
            node_id: ID of the node
            new_position: New position (x, y)
            
        Returns:
            True if successful
        """
        workflow = self.canvas.get_workflow(workflow_id)
        if not workflow or node_id not in workflow["nodes"]:
            return False
        
        node = workflow["nodes"][node_id]
        node.position = new_position
        workflow["modified_at"] = datetime.now()
        
        logger.info(f"Moved node {node_id} to position {new_position}")
        return True
    
    def validate_workflow(self, workflow_id: str) -> Dict[str, Any]:
        """
        Validate a workflow for execution.
        
        Args:
            workflow_id: ID of the workflow
            
        Returns:
            Validation result
        """
        return self.canvas.validate_workflow(workflow_id)
    
    def execute_workflow(self, workflow_id: str, inputs: Dict[str, Any] = None) -> str:
        """
        Execute a workflow.
        
        Args:
            workflow_id: ID of the workflow
            inputs: Input data for the workflow
            
        Returns:
            Execution ID
        """
        return self.execution_engine.execute_workflow(workflow_id, inputs)
    
    def get_execution_status(self, execution_id: str) -> Optional[Dict[str, Any]]:
        """
        Get status of a workflow execution.
        
        Args:
            execution_id: ID of the execution
            
        Returns:
            Execution status
        """
        return self.execution_engine.get_execution_status(execution_id)
    
    def pause_execution(self, execution_id: str) -> bool:
        """Pause a workflow execution."""
        return self.execution_engine.pause_execution(execution_id)
    
    def resume_execution(self, execution_id: str) -> bool:
        """Resume a paused workflow execution."""
        return self.execution_engine.resume_execution(execution_id)
    
    def cancel_execution(self, execution_id: str) -> bool:
        """Cancel a workflow execution."""
        return self.execution_engine.cancel_execution(execution_id)
    
    def wait_for_completion(self, execution_id: str, timeout: float = None) -> Dict[str, Any]:
        """
        Wait for a workflow execution to complete.
        
        Args:
            execution_id: ID of the execution
            timeout: Maximum time to wait in seconds
            
        Returns:
            Final execution status
        """
        return self.execution_engine.wait_for_completion(execution_id, timeout)
    
    def get_workflow(self, workflow_id: str) -> Optional[Dict[str, Any]]:
        """Get workflow by ID."""
        return self.canvas.get_workflow(workflow_id)
    
    def get_workflow_nodes(self, workflow_id: str) -> List[WorkflowNode]:
        """Get all nodes in a workflow."""
        return self.canvas.get_workflow_nodes(workflow_id)
    
    def get_workflow_connections(self, workflow_id: str) -> List[WorkflowConnection]:
        """Get all connections in a workflow."""
        return self.canvas.get_workflow_connections(workflow_id)
    
    def export_workflow(self, workflow_id: str) -> Dict[str, Any]:
        """Export workflow to JSON format."""
        return self.canvas.export_workflow(workflow_id)
    
    def import_workflow(self, workflow_data: Dict[str, Any]) -> str:
        """Import workflow from JSON format."""
        return self.canvas.import_workflow(workflow_data)
    
    def duplicate_workflow(self, workflow_id: str, new_name: str = None) -> str:
        """
        Duplicate an existing workflow.
        
        Args:
            workflow_id: ID of the workflow to duplicate
            new_name: Name for the new workflow
            
        Returns:
            ID of the new workflow
        """
        workflow_data = self.export_workflow(workflow_id)
        
        if new_name:
            workflow_data["name"] = f"{new_name} (Copy)"
        else:
            workflow_data["name"] = f"{workflow_data['name']} (Copy)"
        
        # Generate new IDs for all nodes and connections
        old_to_new_ids = {}
        
        # Update node IDs
        for old_node_id, node_data in workflow_data["nodes"].items():
            new_node_id = str(uuid.uuid4())
            old_to_new_ids[old_node_id] = new_node_id
            node_data["node_id"] = new_node_id
        
        # Update connection IDs and references
        for connection in workflow_data["connections"]:
            connection["connection_id"] = str(uuid.uuid4())
            connection["source_node_id"] = old_to_new_ids[connection["source_node_id"]]
            connection["target_node_id"] = old_to_new_ids[connection["target_node_id"]]
        
        # Import the duplicated workflow
        new_workflow_id = self.import_workflow(workflow_data)
        
        logger.info(f"Duplicated workflow {workflow_id} as {new_workflow_id}")
        return new_workflow_id
    
    def get_workflow_statistics(self, workflow_id: str) -> Dict[str, Any]:
        """
        Get statistics about a workflow.
        
        Args:
            workflow_id: ID of the workflow
            
        Returns:
            Workflow statistics
        """
        workflow = self.get_workflow(workflow_id)
        if not workflow:
            return {}
        
        nodes = workflow["nodes"]
        connections = workflow["connections"]
        
        # Count nodes by type
        node_type_counts = {}
        for node in nodes.values():
            node_type = node.node_type
            node_type_counts[node_type] = node_type_counts.get(node_type, 0) + 1
        
        # Calculate estimated duration
        total_estimated_duration = sum(
            node.estimated_duration for node in nodes.values()
        )
        
        # Get execution history
        executions = [
            exec_data for exec_data in self.execution_engine.get_all_executions()
            if exec_data["workflow_id"] == workflow_id
        ]
        
        execution_stats = {
            "total_executions": len(executions),
            "successful_executions": len([e for e in executions if e["status"] == "completed"]),
            "failed_executions": len([e for e in executions if e["status"] == "failed"]),
            "average_execution_time": None
        }
        
        # Calculate average execution time
        completed_executions = [e for e in executions if e["status"] == "completed"]
        if completed_executions:
            total_time = sum(
                (e["end_time"] - e["start_time"]).total_seconds()
                for e in completed_executions
                if e["end_time"] and e["start_time"]
            )
            execution_stats["average_execution_time"] = total_time / len(completed_executions)
        
        return {
            "workflow_id": workflow_id,
            "name": workflow["name"],
            "node_count": len(nodes),
            "connection_count": len(connections),
            "node_type_distribution": node_type_counts,
            "estimated_duration": total_estimated_duration,
            "execution_statistics": execution_stats,
            "created_at": workflow["created_at"],
            "modified_at": workflow["modified_at"],
            "status": workflow["status"]
        }
    
    def cleanup_old_executions(self, max_age_hours: int = 24):
        """Clean up old completed executions."""
        self.execution_engine.cleanup_completed_executions(max_age_hours)
    
    def get_all_workflows(self) -> List[Dict[str, Any]]:
        """Get list of all workflows with basic information."""
        workflows = []
        
        for workflow_id, workflow_data in self.canvas.workflows.items():
            workflows.append({
                "workflow_id": workflow_id,
                "name": workflow_data["name"],
                "description": workflow_data["description"],
                "node_count": len(workflow_data["nodes"]),
                "connection_count": len(workflow_data["connections"]),
                "status": workflow_data["status"],
                "created_at": workflow_data["created_at"],
                "modified_at": workflow_data["modified_at"]
            })
        
        return workflows
