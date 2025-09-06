"""
Hiring/HR Agent - Creates job descriptions, screens CVs, and builds onboarding plans
"""

from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime

@dataclass
class JobDescription:
    job_id: str
    title: str
    department: str
    responsibilities: List[str]
    requirements: List[str]
    qualifications: List[str]
    compensation: Dict[str, Any]

@dataclass
class CandidateProfile:
    candidate_id: str
    name: str
    email: str
    cv_data: Dict[str, Any]
    match_score: float
    interview_notes: List[str]

class HiringHRAgent:
    """Hiring/HR Agent - Creates job descriptions, screens CVs, and builds onboarding plans"""
    
    def __init__(self, name: str = "Hiring/HR Agent"):
        self.name = name
        self.role = "Human Resources Specialist"
        self.expertise = [
            "Job Description Creation",
            "CV Screening",
            "Interview Planning",
            "Onboarding Design",
            "HR Compliance",
            "Talent Acquisition"
        ]
    
    def create_job_description(self, 
                             role_title: str,
                             department: str,
                             business_needs: Dict[str, Any],
                             company_culture: Dict[str, Any]) -> JobDescription:
        """Create comprehensive job description for a role"""
        
        # Analyze business needs
        role_analysis = self._analyze_role_requirements(role_title, business_needs)
        
        # Generate responsibilities
        responsibilities = self._generate_responsibilities(role_title, role_analysis)
        
        # Define requirements
        requirements = self._define_requirements(role_title, role_analysis)
        
        # Set qualifications
        qualifications = self._set_qualifications(role_title, role_analysis)
        
        # Determine compensation
        compensation = self._determine_compensation(role_title, role_analysis, business_needs)
        
        # Generate job ID
        job_id = f"job_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        return JobDescription(
            job_id=job_id,
            title=role_title,
            department=department,
            responsibilities=responsibilities,
            requirements=requirements,
            qualifications=qualifications,
            compensation=compensation
        )
    
    def _analyze_role_requirements(self, role_title: str, business_needs: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze role requirements based on business needs"""
        
        role_lower = role_title.lower()
        
        if "developer" in role_lower or "engineer" in role_lower:
            return {
                "role_type": "technical",
                "experience_level": "mid_senior",
                "skills_focus": ["programming", "problem_solving", "collaboration"],
                "industry_knowledge": business_needs.get("industry", "technology")
            }
        elif "marketing" in role_lower:
            return {
                "role_type": "marketing",
                "experience_level": "mid_level",
                "skills_focus": ["digital_marketing", "analytics", "creativity"],
                "industry_knowledge": business_needs.get("industry", "general")
            }
        elif "sales" in role_lower:
            return {
                "role_type": "sales",
                "experience_level": "entry_mid",
                "skills_focus": ["communication", "persuasion", "relationship_building"],
                "industry_knowledge": business_needs.get("industry", "general")
            }
        else:
            return {
                "role_type": "general",
                "experience_level": "mid_level",
                "skills_focus": ["communication", "organization", "problem_solving"],
                "industry_knowledge": business_needs.get("industry", "general")
            }
    
    def _generate_responsibilities(self, role_title: str, role_analysis: Dict[str, Any]) -> List[str]:
        """Generate role-specific responsibilities"""
        
        role_type = role_analysis["role_type"]
        
        if role_type == "technical":
            return [
                "Develop and maintain software applications and systems",
                "Collaborate with cross-functional teams to deliver high-quality solutions",
                "Write clean, efficient, and well-documented code",
                "Participate in code reviews and technical discussions",
                "Troubleshoot and debug applications",
                "Stay updated with latest technologies and best practices"
            ]
        elif role_type == "marketing":
            return [
                "Develop and execute marketing campaigns across multiple channels",
                "Create engaging content for digital and traditional media",
                "Analyze campaign performance and optimize for better results",
                "Manage social media presence and community engagement",
                "Collaborate with sales team to generate qualified leads",
                "Monitor industry trends and competitive landscape"
            ]
        elif role_type == "sales":
            return [
                "Identify and qualify potential customers and prospects",
                "Build and maintain relationships with clients",
                "Present products/services and negotiate contracts",
                "Meet and exceed sales targets and quotas",
                "Maintain accurate records of sales activities",
                "Collaborate with marketing team on lead generation"
            ]
        else:
            return [
                "Support day-to-day operations and administrative tasks",
                "Collaborate with team members on various projects",
                "Maintain accurate records and documentation",
                "Provide excellent customer service and support",
                "Contribute to process improvements and efficiency",
                "Participate in team meetings and training sessions"
            ]
    
    def _define_requirements(self, role_title: str, role_analysis: Dict[str, Any]) -> List[str]:
        """Define role requirements"""
        
        role_type = role_analysis["role_type"]
        experience_level = role_analysis["experience_level"]
        
        base_requirements = [
            "Excellent communication and interpersonal skills",
            "Strong problem-solving and analytical abilities",
            "Ability to work independently and as part of a team",
            "Proficiency in relevant software and tools"
        ]
        
        if role_type == "technical":
            base_requirements.extend([
                f"{self._get_experience_years(experience_level)}+ years of software development experience",
                "Proficiency in programming languages (Python, JavaScript, etc.)",
                "Experience with version control systems (Git)",
                "Knowledge of software development methodologies"
            ])
        elif role_type == "marketing":
            base_requirements.extend([
                f"{self._get_experience_years(experience_level)}+ years of marketing experience",
                "Experience with digital marketing tools and platforms",
                "Strong analytical and data interpretation skills",
                "Creative thinking and content creation abilities"
            ])
        elif role_type == "sales":
            base_requirements.extend([
                f"{self._get_experience_years(experience_level)}+ years of sales experience",
                "Proven track record of meeting sales targets",
                "Strong negotiation and closing skills",
                "Experience with CRM systems"
            ])
        
        return base_requirements
    
    def _get_experience_years(self, experience_level: str) -> int:
        """Get years of experience based on level"""
        
        experience_mapping = {
            "entry": 0,
            "entry_mid": 1,
            "mid_level": 3,
            "mid_senior": 5,
            "senior": 7
        }
        
        return experience_mapping.get(experience_level, 3)
    
    def _set_qualifications(self, role_title: str, role_analysis: Dict[str, Any]) -> List[str]:
        """Set preferred qualifications"""
        
        role_type = role_analysis["role_type"]
        
        base_qualifications = [
            "Bachelor's degree in relevant field or equivalent experience",
            "Strong work ethic and attention to detail",
            "Adaptability and willingness to learn new skills"
        ]
        
        if role_type == "technical":
            base_qualifications.extend([
                "Computer Science or related technical degree preferred",
                "Experience with cloud platforms (AWS, Azure, GCP)",
                "Knowledge of database systems and SQL",
                "Experience with agile development methodologies"
            ])
        elif role_type == "marketing":
            base_qualifications.extend([
                "Marketing, Communications, or related degree preferred",
                "Experience with marketing automation tools",
                "Graphic design skills and creative portfolio",
                "Certification in digital marketing platforms"
            ])
        elif role_type == "sales":
            base_qualifications.extend([
                "Business, Sales, or related degree preferred",
                "Industry-specific sales experience",
                "Professional sales certifications",
                "Experience with B2B sales processes"
            ])
        
        return base_qualifications
    
    def _determine_compensation(self, 
                              role_title: str,
                              role_analysis: Dict[str, Any],
                              business_needs: Dict[str, Any]) -> Dict[str, Any]:
        """Determine compensation package"""
        
        role_type = role_analysis["role_type"]
        experience_level = role_analysis["experience_level"]
        
        # Base salary ranges (mock data)
        salary_ranges = {
            "technical": {
                "entry": (60000, 80000),
                "mid_level": (80000, 120000),
                "senior": (120000, 180000)
            },
            "marketing": {
                "entry": (45000, 65000),
                "mid_level": (65000, 95000),
                "senior": (95000, 140000)
            },
            "sales": {
                "entry": (40000, 60000),
                "mid_level": (60000, 90000),
                "senior": (90000, 130000)
            }
        }
        
        salary_range = salary_ranges.get(role_type, {"mid_level": (50000, 75000)}).get(experience_level, (50000, 75000))
        
        return {
            "salary_range": f"${salary_range[0]:,} - ${salary_range[1]:,}",
            "benefits": [
                "Health insurance",
                "Dental and vision coverage",
                "401(k) retirement plan",
                "Paid time off",
                "Professional development opportunities"
            ],
            "additional_perks": [
                "Flexible work arrangements",
                "Remote work options",
                "Company equipment",
                "Team building activities"
            ]
        }
    
    def screen_cv(self, 
                 cv_data: Dict[str, Any],
                 job_description: JobDescription) -> CandidateProfile:
        """Screen CV against job description and score candidate"""
        
        # Extract candidate information
        candidate_info = self._extract_candidate_info(cv_data)
        
        # Score candidate against job requirements
        match_score = self._calculate_match_score(candidate_info, job_description)
        
        # Generate candidate ID
        candidate_id = f"candidate_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        return CandidateProfile(
            candidate_id=candidate_id,
            name=candidate_info.get("name", "Unknown"),
            email=candidate_info.get("email", ""),
            cv_data=cv_data,
            match_score=match_score,
            interview_notes=[]
        )
    
    def _extract_candidate_info(self, cv_data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract relevant information from CV data"""
        
        return {
            "name": cv_data.get("name", ""),
            "email": cv_data.get("email", ""),
            "experience_years": cv_data.get("experience_years", 0),
            "education": cv_data.get("education", []),
            "skills": cv_data.get("skills", []),
            "previous_roles": cv_data.get("previous_roles", []),
            "certifications": cv_data.get("certifications", [])
        }
    
    def _calculate_match_score(self, 
                             candidate_info: Dict[str, Any],
                             job_description: JobDescription) -> float:
        """Calculate match score between candidate and job requirements"""
        
        score = 0.0
        total_weight = 0.0
        
        # Experience match (30% weight)
        experience_weight = 0.3
        total_weight += experience_weight
        
        required_experience = self._extract_experience_requirement(job_description.requirements)
        candidate_experience = candidate_info.get("experience_years", 0)
        
        if candidate_experience >= required_experience:
            score += experience_weight
        elif candidate_experience >= required_experience * 0.7:
            score += experience_weight * 0.7
        else:
            score += experience_weight * 0.3
        
        # Skills match (40% weight)
        skills_weight = 0.4
        total_weight += skills_weight
        
        required_skills = self._extract_skills_from_requirements(job_description.requirements)
        candidate_skills = candidate_info.get("skills", [])
        
        skills_match = self._calculate_skills_match(candidate_skills, required_skills)
        score += skills_weight * skills_match
        
        # Education match (20% weight)
        education_weight = 0.2
        total_weight += education_weight
        
        education_match = self._calculate_education_match(candidate_info.get("education", []), job_description.qualifications)
        score += education_weight * education_match
        
        # Previous roles relevance (10% weight)
        roles_weight = 0.1
        total_weight += roles_weight
        
        roles_match = self._calculate_roles_match(candidate_info.get("previous_roles", []), job_description.title)
        score += roles_weight * roles_match
        
        return (score / total_weight) * 100 if total_weight > 0 else 0
    
    def _extract_experience_requirement(self, requirements: List[str]) -> int:
        """Extract experience requirement from job requirements"""
        
        for requirement in requirements:
            if "years" in requirement.lower() and "experience" in requirement.lower():
                # Extract number from requirement
                import re
                numbers = re.findall(r'\d+', requirement)
                if numbers:
                    return int(numbers[0])
        
        return 3  # Default to 3 years
    
    def _extract_skills_from_requirements(self, requirements: List[str]) -> List[str]:
        """Extract skills from job requirements"""
        
        skills = []
        skill_keywords = ["proficiency", "experience", "knowledge", "skills", "ability"]
        
        for requirement in requirements:
            requirement_lower = requirement.lower()
            if any(keyword in requirement_lower for keyword in skill_keywords):
                # Extract skill-related terms
                if "programming" in requirement_lower:
                    skills.append("programming")
                if "marketing" in requirement_lower:
                    skills.append("marketing")
                if "sales" in requirement_lower:
                    skills.append("sales")
                if "communication" in requirement_lower:
                    skills.append("communication")
                if "analytical" in requirement_lower:
                    skills.append("analytical")
        
        return skills
    
    def _calculate_skills_match(self, candidate_skills: List[str], required_skills: List[str]) -> float:
        """Calculate skills match percentage"""
        
        if not required_skills:
            return 1.0
        
        candidate_skills_lower = [skill.lower() for skill in candidate_skills]
        required_skills_lower = [skill.lower() for skill in required_skills]
        
        matches = sum(1 for skill in required_skills_lower if any(skill in cs for cs in candidate_skills_lower))
        
        return matches / len(required_skills)
    
    def _calculate_education_match(self, candidate_education: List[str], qualifications: List[str]) -> float:
        """Calculate education match percentage"""
        
        if not qualifications:
            return 1.0
        
        # Check if candidate has relevant degree
        for qualification in qualifications:
            if "degree" in qualification.lower():
                for education in candidate_education:
                    if any(word in education.lower() for word in ["bachelor", "master", "degree", "diploma"]):
                        return 1.0
        
        return 0.5  # Partial match if no specific degree found
    
    def _calculate_roles_match(self, previous_roles: List[str], job_title: str) -> float:
        """Calculate previous roles relevance"""
        
        if not previous_roles:
            return 0.5
        
        job_title_lower = job_title.lower()
        relevant_roles = 0
        
        for role in previous_roles:
            role_lower = role.lower()
            # Check for keyword matches
            if any(word in role_lower for word in job_title_lower.split()):
                relevant_roles += 1
        
        return min(1.0, relevant_roles / len(previous_roles))
    
    def create_onboarding_plan(self, 
                             candidate_profile: CandidateProfile,
                             job_description: JobDescription,
                             company_policies: Dict[str, Any]) -> Dict[str, Any]:
        """Create comprehensive onboarding plan for new hire"""
        
        # Determine onboarding duration
        onboarding_duration = self._determine_onboarding_duration(job_description.title)
        
        # Create onboarding phases
        onboarding_phases = self._create_onboarding_phases(job_description, company_policies)
        
        # Generate learning objectives
        learning_objectives = self._generate_learning_objectives(job_description, candidate_profile)
        
        # Create milestone schedule
        milestone_schedule = self._create_milestone_schedule(onboarding_duration, onboarding_phases)
        
        return {
            "candidate_id": candidate_profile.candidate_id,
            "job_title": job_description.title,
            "onboarding_duration_weeks": onboarding_duration,
            "phases": onboarding_phases,
            "learning_objectives": learning_objectives,
            "milestone_schedule": milestone_schedule,
            "success_metrics": self._define_success_metrics(job_description)
        }
    
    def _determine_onboarding_duration(self, job_title: str) -> int:
        """Determine appropriate onboarding duration"""
        
        job_lower = job_title.lower()
        
        if "senior" in job_lower or "lead" in job_lower:
            return 4  # 4 weeks for senior roles
        elif "junior" in job_lower or "entry" in job_lower:
            return 6  # 6 weeks for junior roles
        else:
            return 5  # 5 weeks for mid-level roles
    
    def _create_onboarding_phases(self, 
                                job_description: JobDescription,
                                company_policies: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Create onboarding phases"""
        
        return [
            {
                "phase": "Week 1: Welcome & Orientation",
                "duration": "1 week",
                "activities": [
                    "Company orientation and culture introduction",
                    "HR paperwork and benefits enrollment",
                    "IT setup and system access",
                    "Meet team members and key stakeholders",
                    "Review company policies and procedures"
                ],
                "deliverables": [
                    "Complete all HR documentation",
                    "Set up work environment",
                    "Attend orientation sessions"
                ]
            },
            {
                "phase": "Week 2-3: Role-Specific Training",
                "duration": "2 weeks",
                "activities": [
                    "Job-specific training and shadowing",
                    "Tool and system training",
                    "Process and workflow training",
                    "Initial project assignments",
                    "Regular check-ins with manager"
                ],
                "deliverables": [
                    "Complete role-specific training modules",
                    "Shadow experienced team members",
                    "Complete first small project"
                ]
            },
            {
                "phase": "Week 4-5: Integration & Independence",
                "duration": "2 weeks",
                "activities": [
                    "Take on independent projects",
                    "Participate in team meetings",
                    "Build relationships with colleagues",
                    "Receive feedback and coaching",
                    "Plan for ongoing development"
                ],
                "deliverables": [
                    "Complete independent project",
                    "Participate actively in team activities",
                    "Develop 30-60-90 day goals"
                ]
            }
        ]
    
    def _generate_learning_objectives(self, 
                                    job_description: JobDescription,
                                    candidate_profile: CandidateProfile) -> List[str]:
        """Generate learning objectives for onboarding"""
        
        objectives = [
            "Understand company culture, values, and mission",
            "Learn role-specific responsibilities and expectations",
            "Master essential tools and systems",
            "Build relationships with team members and stakeholders"
        ]
        
        # Add role-specific objectives
        if "developer" in job_description.title.lower() or "engineer" in job_description.title.lower():
            objectives.extend([
                "Understand codebase architecture and development processes",
                "Learn coding standards and best practices",
                "Complete first code contribution"
            ])
        elif "marketing" in job_description.title.lower():
            objectives.extend([
                "Understand brand guidelines and marketing strategy",
                "Learn marketing tools and platforms",
                "Create first marketing campaign"
            ])
        elif "sales" in job_description.title.lower():
            objectives.extend([
                "Understand product offerings and value propositions",
                "Learn sales processes and CRM system",
                "Complete first sales call or meeting"
            ])
        
        return objectives
    
    def _create_milestone_schedule(self, 
                                 duration: int,
                                 phases: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Create milestone schedule for onboarding"""
        
        milestones = []
        current_week = 1
        
        for phase in phases:
            phase_duration = int(phase["duration"].split()[0])
            
            milestones.append({
                "week": current_week,
                "milestone": f"Complete {phase['phase']}",
                "success_criteria": phase["deliverables"],
                "review_date": f"Week {current_week + phase_duration - 1}"
            })
            
            current_week += phase_duration
        
        return milestones
    
    def _define_success_metrics(self, job_description: JobDescription) -> List[str]:
        """Define success metrics for onboarding"""
        
        return [
            "Completion of all onboarding activities within timeline",
            "Positive feedback from manager and team members",
            "Demonstration of role-specific competencies",
            "Integration into team culture and workflows",
            "Setting and achieving initial performance goals"
        ]
    
    def get_agent_info(self) -> Dict[str, Any]:
        """Get agent information and capabilities"""
        
        return {
            "name": self.name,
            "role": self.role,
            "expertise": self.expertise,
            "capabilities": [
                "Job description creation and optimization",
                "CV screening and candidate evaluation",
                "Interview planning and coordination",
                "Onboarding plan development",
                "HR compliance and policy management",
                "Talent acquisition strategy"
            ]
        }
