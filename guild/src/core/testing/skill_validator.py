"""
Skill Validation Framework

This module provides a robust framework for testing and validating visual skills
without getting stuck in infinite loops or hanging processes.
"""

import time
import logging
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from pathlib import Path
import asyncio
import threading
from concurrent.futures import ThreadPoolExecutor, TimeoutError

logger = logging.getLogger(__name__)

@dataclass
class ValidationResult:
    skill_id: str
    skill_name: str
    status: str  # "passed", "failed", "timeout", "error"
    duration: float
    errors: List[str]
    warnings: List[str]
    validation_score: float  # 0.0 to 1.0
    details: Dict[str, Any]

@dataclass
class TestCase:
    test_id: str
    name: str
    description: str
    test_function: callable
    timeout: int = 30
    required: bool = True

class SkillValidator:
    """
    Comprehensive skill validation framework with timeout protection
    """
    
    def __init__(self, timeout_seconds: int = 30):
        self.timeout_seconds = timeout_seconds
        self.validation_results: List[ValidationResult] = []
        self.test_cases: List[TestCase] = []
        
    def add_test_case(self, test_case: TestCase):
        """Add a test case to the validation suite"""
        self.test_cases.append(test_case)
        
    def validate_skill_template(self, skill_id: str, skill_data: Dict[str, Any]) -> ValidationResult:
        """
        Validate a single skill template with timeout protection
        """
        start_time = time.time()
        errors = []
        warnings = []
        details = {}
        
        try:
            # Basic structure validation
            if not self._validate_basic_structure(skill_data, errors):
                return ValidationResult(
                    skill_id=skill_id,
                    skill_name=skill_data.get('name', 'Unknown'),
                    status="failed",
                    duration=time.time() - start_time,
                    errors=errors,
                    warnings=warnings,
                    validation_score=0.0,
                    details=details
                )
            
            # Pattern validation
            if not self._validate_skill_pattern(skill_data, errors, warnings):
                return ValidationResult(
                    skill_id=skill_id,
                    skill_name=skill_data.get('name', 'Unknown'),
                    status="failed",
                    duration=time.time() - start_time,
                    errors=errors,
                    warnings=warnings,
                    validation_score=0.3,
                    details=details
                )
            
            # Action validation
            if not self._validate_actions(skill_data, errors, warnings):
                return ValidationResult(
                    skill_id=skill_id,
                    skill_name=skill_data.get('name', 'Unknown'),
                    status="failed",
                    duration=time.time() - start_time,
                    errors=errors,
                    warnings=warnings,
                    validation_score=0.5,
                    details=details
                )
            
            # Configuration validation
            if not self._validate_configuration(skill_data, errors, warnings):
                return ValidationResult(
                    skill_id=skill_id,
                    skill_name=skill_data.get('name', 'Unknown'),
                    status="failed",
                    duration=time.time() - start_time,
                    errors=errors,
                    warnings=warnings,
                    validation_score=0.7,
                    details=details
                )
            
            # Calculate final score
            validation_score = self._calculate_validation_score(errors, warnings)
            
            return ValidationResult(
                skill_id=skill_id,
                skill_name=skill_data.get('name', 'Unknown'),
                status="passed",
                duration=time.time() - start_time,
                errors=errors,
                warnings=warnings,
                validation_score=validation_score,
                details=details
            )
            
        except Exception as e:
            errors.append(f"Validation error: {str(e)}")
            return ValidationResult(
                skill_id=skill_id,
                skill_name=skill_data.get('name', 'Unknown'),
                status="error",
                duration=time.time() - start_time,
                errors=errors,
                warnings=warnings,
                validation_score=0.0,
                details=details
            )
    
    def _validate_basic_structure(self, skill_data: Dict[str, Any], errors: List[str]) -> bool:
        """Validate basic skill structure"""
        required_fields = ['type', 'name', 'description', 'config']
        
        for field in required_fields:
            if field not in skill_data:
                errors.append(f"Missing required field: {field}")
                return False
        
        if skill_data['type'] != 'visual_skill':
            errors.append(f"Invalid skill type: {skill_data['type']}")
            return False
            
        return True
    
    def _validate_skill_pattern(self, skill_data: Dict[str, Any], errors: List[str], warnings: List[str]) -> bool:
        """Validate skill pattern configuration"""
        config = skill_data.get('config', {})
        pattern = config.get('skill_pattern', {})
        
        if not pattern:
            errors.append("Missing skill_pattern in config")
            return False
        
        required_pattern_fields = ['steps', 'estimated_duration']
        for field in required_pattern_fields:
            if field not in pattern:
                errors.append(f"Missing required pattern field: {field}")
                return False
        
        steps = pattern.get('steps', [])
        if not steps:
            errors.append("Skill pattern has no steps")
            return False
        
        if len(steps) < 2:
            warnings.append("Skill pattern has very few steps")
        
        duration = pattern.get('estimated_duration', 0)
        if duration <= 0:
            warnings.append("Estimated duration should be positive")
        elif duration > 600:  # 10 minutes
            warnings.append("Estimated duration seems very long")
            
        return True
    
    def _validate_actions(self, skill_data: Dict[str, Any], errors: List[str], warnings: List[str]) -> bool:
        """Validate action steps in the skill pattern"""
        config = skill_data.get('config', {})
        pattern = config.get('skill_pattern', {})
        steps = pattern.get('steps', [])
        
        valid_action_types = [
            'navigate', 'click', 'type', 'wait', 'press_key', 'scroll',
            'drag', 'drop', 'hover', 'double_click', 'right_click'
        ]
        
        for i, step in enumerate(steps):
            action_type = step.get('action_type')
            if not action_type:
                errors.append(f"Step {i+1}: Missing action_type")
                continue
                
            if action_type not in valid_action_types:
                warnings.append(f"Step {i+1}: Unknown action_type '{action_type}'")
            
            # Validate action-specific requirements
            if action_type == 'navigate':
                if 'url' not in step:
                    errors.append(f"Step {i+1}: Navigate action missing URL")
            elif action_type == 'type':
                if 'target_element' not in step:
                    errors.append(f"Step {i+1}: Type action missing target_element")
            elif action_type == 'wait':
                if 'duration' not in step:
                    warnings.append(f"Step {i+1}: Wait action missing duration")
        
        return len(errors) == 0
    
    def _validate_configuration(self, skill_data: Dict[str, Any], errors: List[str], warnings: List[str]) -> bool:
        """Validate skill configuration and metadata"""
        # Check for category
        if 'category' not in skill_data:
            warnings.append("Skill missing category classification")
        
        # Check for reasonable name length
        name = skill_data.get('name', '')
        if len(name) < 3:
            errors.append("Skill name too short")
        elif len(name) > 100:
            warnings.append("Skill name very long")
        
        # Check description
        description = skill_data.get('description', '')
        if len(description) < 10:
            warnings.append("Skill description very short")
        
        return True
    
    def _calculate_validation_score(self, errors: List[str], warnings: List[str]) -> float:
        """Calculate validation score based on errors and warnings"""
        base_score = 1.0
        
        # Deduct for errors (more severe)
        error_penalty = len(errors) * 0.3
        base_score -= error_penalty
        
        # Deduct for warnings (less severe)
        warning_penalty = len(warnings) * 0.1
        base_score -= warning_penalty
        
        return max(0.0, min(1.0, base_score))
    
    def run_validation_suite(self, skill_templates: Dict[str, Any]) -> Dict[str, ValidationResult]:
        """
        Run the complete validation suite on all skill templates
        """
        results = {}
        
        print(f"🧪 Starting validation of {len(skill_templates)} skills...")
        
        for skill_id, skill_data in skill_templates.items():
            print(f"  🔍 Validating {skill_id}...")
            
            # Run validation with timeout protection
            with ThreadPoolExecutor(max_workers=1) as executor:
                future = executor.submit(self.validate_skill_template, skill_id, skill_data)
                
                try:
                    result = future.result(timeout=self.timeout_seconds)
                    results[skill_id] = result
                    
                    status_emoji = "✅" if result.status == "passed" else "❌"
                    print(f"    {status_emoji} {result.status} (Score: {result.validation_score:.2f})")
                    
                except TimeoutError:
                    print(f"    ⏰ Timeout after {self.timeout_seconds}s")
                    results[skill_id] = ValidationResult(
                        skill_id=skill_id,
                        skill_name=skill_data.get('name', 'Unknown'),
                        status="timeout",
                        duration=self.timeout_seconds,
                        errors=["Validation timed out"],
                        warnings=[],
                        validation_score=0.0,
                        details={}
                    )
        
        return results
    
    def generate_validation_report(self, results: Dict[str, ValidationResult]) -> str:
        """Generate a comprehensive validation report"""
        report = []
        report.append("📊 SKILL VALIDATION REPORT")
        report.append("=" * 50)
        
        # Summary statistics
        total_skills = len(results)
        passed = sum(1 for r in results.values() if r.status == "passed")
        failed = sum(1 for r in results.values() if r.status == "failed")
        errors = sum(1 for r in results.values() if r.status == "error")
        timeouts = sum(1 for r in results.values() if r.status == "timeout")
        
        report.append(f"Total Skills: {total_skills}")
        report.append(f"✅ Passed: {passed}")
        report.append(f"❌ Failed: {failed}")
        report.append(f"💥 Errors: {errors}")
        report.append(f"⏰ Timeouts: {timeouts}")
        report.append("")
        
        # Detailed results by category
        categories = {}
        for result in results.values():
            category = result.details.get('category', 'Uncategorized')
            if category not in categories:
                categories[category] = []
            categories[category].append(result)
        
        for category, category_results in categories.items():
            report.append(f"📁 {category}")
            report.append("-" * 30)
            
            for result in category_results:
                status_emoji = {
                    "passed": "✅",
                    "failed": "❌", 
                    "error": "💥",
                    "timeout": "⏰"
                }.get(result.status, "❓")
                
                report.append(f"  {status_emoji} {result.skill_name}")
                report.append(f"    Score: {result.validation_score:.2f}")
                
                if result.errors:
                    for error in result.errors:
                        report.append(f"    ❌ {error}")
                
                if result.warnings:
                    for warning in result.warnings:
                        report.append(f"    ⚠️ {warning}")
                
                report.append("")
        
        return "\n".join(report)
