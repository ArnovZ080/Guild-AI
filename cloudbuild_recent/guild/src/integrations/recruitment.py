"""
Recruitment Platform Integrations

Comprehensive integration with LinkedIn Talent Solutions, Workable, Indeed, 
Fiverr, and Upwork APIs for Hiring and HR Agent integration.
"""

import asyncio
import aiohttp
import json
from typing import Dict, Any, List, Optional, Union
from datetime import datetime, date, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
from guild.src.core.config import settings
from guild.src.utils.logging_utils import get_logger

logger = get_logger(__name__)

class RecruitmentPlatform(Enum):
    LINKEDIN_TALENT = "linkedin_talent"
    WORKABLE = "workable"
    INDEED = "indeed"
    FIVERR = "fiverr"
    UPWORK = "upwork"

class ApplicationStatus(Enum):
    APPLIED = "applied"
    SCREENING = "screening"
    INTERVIEW = "interview"
    OFFER = "offer"
    HIRED = "hired"
    REJECTED = "rejected"

class JobStatus(Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    CLOSED = "closed"
    ARCHIVED = "archived"

@dataclass
class RecruitmentCredentials:
    """Credentials for recruitment platforms"""
    platform: RecruitmentPlatform
    api_key: str
    api_secret: Optional[str] = None
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    client_id: Optional[str] = None
    client_secret: Optional[str] = None
    expires_at: Optional[datetime] = None

@dataclass
class Job:
    """Standardized job format"""
    id: str
    title: str
    description: str
    requirements: List[str]
    responsibilities: List[str]
    location: str
    remote: bool
    employment_type: str  # full-time, part-time, contract, etc.
    salary_min: Optional[float]
    salary_max: Optional[float]
    currency: str
    company_name: str
    department: str
    status: JobStatus
    created_at: datetime
    updated_at: datetime
    applications_count: int
    views_count: int
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

@dataclass
class Candidate:
    """Standardized candidate format"""
    id: str
    first_name: str
    last_name: str
    email: str
    phone: Optional[str]
    location: str
    experience_years: int
    skills: List[str]
    education: List[Dict[str, Any]]
    work_experience: List[Dict[str, Any]]
    resume_url: Optional[str]
    linkedin_url: Optional[str]
    portfolio_url: Optional[str]
    availability: str
    expected_salary: Optional[float]
    currency: str
    created_at: datetime
    updated_at: datetime
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

@dataclass
class Application:
    """Standardized application format"""
    id: str
    job_id: str
    candidate_id: str
    status: ApplicationStatus
    applied_at: datetime
    cover_letter: str
    resume_url: str
    portfolio_url: Optional[str]
    screening_notes: str
    interview_notes: List[Dict[str, Any]]
    rating: Optional[float]
    tags: List[str]
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

class LinkedInTalentConnector:
    """LinkedIn Talent Solutions API connector"""
    
    def __init__(self, credentials: RecruitmentCredentials):
        self.credentials = credentials
        self.base_url = "https://api.linkedin.com/v2"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None, params: Dict = None) -> Dict:
        """Make authenticated request to LinkedIn API"""
        try:
            url = f"{self.base_url}{endpoint}"
            headers = {
                'Authorization': f'Bearer {self.credentials.access_token}',
                'Content-Type': 'application/json'
            }
            
            if params is None:
                params = {}
            
            async with self.session.request(method, url, json=data, params=params, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
                
        except Exception as e:
            logger.error(f"LinkedIn Talent API request failed: {e}")
            raise
    
    async def search_candidates(self, 
                              keywords: List[str],
                              location: str = None,
                              experience_level: str = None,
                              limit: int = 100) -> List[Candidate]:
        """Search for candidates"""
        endpoint = "/talentSearch"
        
        # LinkedIn Talent Solutions has specific search parameters
        search_params = {
            'keywords': ', '.join(keywords),
            'limit': limit
        }
        
        if location:
            search_params['location'] = location
        if experience_level:
            search_params['experience_level'] = experience_level
        
        response = await self._make_request(endpoint, params=search_params)
        
        candidates = []
        for candidate_data in response.get('elements', []):
            candidate = Candidate(
                id=candidate_data.get('id', ''),
                first_name=candidate_data.get('firstName', ''),
                last_name=candidate_data.get('lastName', ''),
                email=candidate_data.get('emailAddress', ''),
                phone=candidate_data.get('phoneNumber'),
                location=candidate_data.get('location', {}).get('name', ''),
                experience_years=candidate_data.get('experience', 0),
                skills=[skill.get('name', '') for skill in candidate_data.get('skills', [])],
                education=candidate_data.get('education', []),
                work_experience=candidate_data.get('workExperience', []),
                resume_url=candidate_data.get('resumeUrl'),
                linkedin_url=candidate_data.get('profileUrl'),
                portfolio_url=candidate_data.get('portfolioUrl'),
                availability=candidate_data.get('availability', ''),
                expected_salary=candidate_data.get('expectedSalary'),
                currency=candidate_data.get('currency', 'USD'),
                created_at=datetime.now(),
                updated_at=datetime.now(),
                metadata={"raw_data": candidate_data}
            )
            candidates.append(candidate)
        
        return candidates
    
    async def get_job_posts(self, limit: int = 100) -> List[Job]:
        """Get job posts"""
        endpoint = "/jobPostings"
        params = {'limit': limit}
        
        response = await self._make_request(endpoint, params=params)
        
        jobs = []
        for job_data in response.get('elements', []):
            job = Job(
                id=job_data.get('id', ''),
                title=job_data.get('title', ''),
                description=job_data.get('description', ''),
                requirements=job_data.get('requirements', []),
                responsibilities=job_data.get('responsibilities', []),
                location=job_data.get('location', {}).get('name', ''),
                remote=job_data.get('remote', False),
                employment_type=job_data.get('employmentType', 'full-time'),
                salary_min=job_data.get('salaryRange', {}).get('min'),
                salary_max=job_data.get('salaryRange', {}).get('max'),
                currency=job_data.get('salaryRange', {}).get('currency', 'USD'),
                company_name=job_data.get('company', {}).get('name', ''),
                department=job_data.get('department', ''),
                status=JobStatus.PUBLISHED if job_data.get('status') == 'active' else JobStatus.CLOSED,
                created_at=datetime.fromisoformat(job_data.get('createdAt', datetime.now().isoformat()).replace('Z', '+00:00')),
                updated_at=datetime.fromisoformat(job_data.get('updatedAt', datetime.now().isoformat()).replace('Z', '+00:00')),
                applications_count=job_data.get('applicationsCount', 0),
                views_count=job_data.get('viewsCount', 0),
                metadata={"raw_data": job_data}
            )
            jobs.append(job)
        
        return jobs
    
    async def validate_connection(self) -> bool:
        """Validate LinkedIn Talent API connection"""
        try:
            await self._make_request("/people/~")
            return True
        except Exception as e:
            logger.error(f"LinkedIn Talent connection validation failed: {e}")
            return False

class IndeedConnector:
    """Indeed API connector"""
    
    def __init__(self, credentials: RecruitmentCredentials):
        self.credentials = credentials
        self.base_url = "https://ads.indeed.com/jobroll/xmlfeed"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None, params: Dict = None) -> Dict:
        """Make authenticated request to Indeed API"""
        try:
            url = f"{self.base_url}{endpoint}"
            
            if params is None:
                params = {}
            params['publisher'] = self.credentials.api_key
            
            async with self.session.get(url, params=params) as response:
                response.raise_for_status()
                # Indeed returns XML, need to parse it
                xml_content = await response.text()
                return self._parse_xml_response(xml_content)
                
        except Exception as e:
            logger.error(f"Indeed API request failed: {e}")
            raise
    
    def _parse_xml_response(self, xml_content: str) -> Dict[str, Any]:
        """Parse Indeed XML response"""
        # Simplified XML parsing - would need proper XML parser in production
        import re
        
        jobs = []
        job_pattern = r'<job>(.*?)</job>'
        job_matches = re.findall(job_pattern, xml_content, re.DOTALL)
        
        for job_match in job_matches:
            job_data = {}
            
            # Extract job details using regex
            title_match = re.search(r'<jobtitle>(.*?)</jobtitle>', job_match)
            if title_match:
                job_data['title'] = title_match.group(1)
            
            company_match = re.search(r'<company>(.*?)</company>', job_match)
            if company_match:
                job_data['company'] = company_match.group(1)
            
            location_match = re.search(r'<city>(.*?)</city>', job_match)
            if location_match:
                job_data['location'] = location_match.group(1)
            
            description_match = re.search(r'<snippet>(.*?)</snippet>', job_match)
            if description_match:
                job_data['description'] = description_match.group(1)
            
            url_match = re.search(r'<url>(.*?)</url>', job_match)
            if url_match:
                job_data['url'] = url_match.group(1)
            
            jobs.append(job_data)
        
        return {'jobs': jobs}
    
    async def post_job(self, 
                      title: str,
                      description: str,
                      location: str,
                      company_name: str,
                      salary: str = None) -> Dict[str, Any]:
        """Post a job to Indeed"""
        endpoint = "/post"
        
        data = {
            'title': title,
            'description': description,
            'location': location,
            'company': company_name,
            'salary': salary
        }
        
        response = await self._make_request(endpoint, method='POST', data=data)
        return response
    
    async def get_applications(self, job_id: str) -> List[Application]:
        """Get applications for a job"""
        endpoint = f"/applications/{job_id}"
        response = await self._make_request(endpoint)
        
        applications = []
        for app_data in response.get('applications', []):
            application = Application(
                id=app_data.get('id', ''),
                job_id=job_id,
                candidate_id=app_data.get('candidateId', ''),
                status=ApplicationStatus(app_data.get('status', 'applied')),
                applied_at=datetime.fromisoformat(app_data.get('appliedAt', datetime.now().isoformat()).replace('Z', '+00:00')),
                cover_letter=app_data.get('coverLetter', ''),
                resume_url=app_data.get('resumeUrl', ''),
                portfolio_url=app_data.get('portfolioUrl'),
                screening_notes=app_data.get('screeningNotes', ''),
                interview_notes=app_data.get('interviewNotes', []),
                rating=app_data.get('rating'),
                tags=app_data.get('tags', []),
                metadata={"raw_data": app_data}
            )
            applications.append(application)
        
        return applications
    
    async def validate_connection(self) -> bool:
        """Validate Indeed API connection"""
        try:
            # Test with a simple search
            await self._make_request("/search", {'q': 'test', 'l': 'test'})
            return True
        except Exception as e:
            logger.error(f"Indeed connection validation failed: {e}")
            return False

class UpworkConnector:
    """Upwork API connector"""
    
    def __init__(self, credentials: RecruitmentCredentials):
        self.credentials = credentials
        self.base_url = "https://api.upwork.com/api/v3"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None, params: Dict = None) -> Dict:
        """Make authenticated request to Upwork API"""
        try:
            url = f"{self.base_url}{endpoint}"
            headers = {
                'Authorization': f'Bearer {self.credentials.access_token}',
                'Content-Type': 'application/json'
            }
            
            if params is None:
                params = {}
            
            async with self.session.request(method, url, json=data, params=params, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
                
        except Exception as e:
            logger.error(f"Upwork API request failed: {e}")
            raise
    
    async def search_freelancers(self, 
                               skills: List[str],
                               hourly_rate_max: float = None,
                               availability: str = None,
                               limit: int = 100) -> List[Candidate]:
        """Search for freelancers"""
        endpoint = "/profiles/v2/providers/search"
        
        params = {
            'q': ', '.join(skills),
            'limit': limit
        }
        
        if hourly_rate_max:
            params['rate'] = f"0-{hourly_rate_max}"
        if availability:
            params['availability'] = availability
        
        response = await self._make_request(endpoint, params=params)
        
        candidates = []
        for profile_data in response.get('providers', []):
            candidate = Candidate(
                id=profile_data.get('id', ''),
                first_name=profile_data.get('first_name', ''),
                last_name=profile_data.get('last_name', ''),
                email=profile_data.get('email', ''),
                phone=None,  # Not available in Upwork API
                location=profile_data.get('location', ''),
                experience_years=profile_data.get('experience', 0),
                skills=[skill.get('name', '') for skill in profile_data.get('skills', [])],
                education=profile_data.get('education', []),
                work_experience=profile_data.get('work_experience', []),
                resume_url=profile_data.get('portfolio_url'),
                linkedin_url=profile_data.get('linkedin_url'),
                portfolio_url=profile_data.get('portfolio_url'),
                availability=profile_data.get('availability', ''),
                expected_salary=profile_data.get('hourly_rate'),
                currency='USD',
                created_at=datetime.now(),
                updated_at=datetime.now(),
                metadata={"raw_data": profile_data}
            )
            candidates.append(candidate)
        
        return candidates
    
    async def get_jobs(self, limit: int = 100) -> List[Job]:
        """Get job postings"""
        endpoint = "/jobs/v2/jobs/search"
        params = {'limit': limit}
        
        response = await self._make_request(endpoint, params=params)
        
        jobs = []
        for job_data in response.get('jobs', []):
            job = Job(
                id=job_data.get('id', ''),
                title=job_data.get('title', ''),
                description=job_data.get('description', ''),
                requirements=job_data.get('requirements', []),
                responsibilities=job_data.get('responsibilities', []),
                location=job_data.get('location', ''),
                remote=job_data.get('remote', False),
                employment_type=job_data.get('job_type', 'contract'),
                salary_min=job_data.get('budget', {}).get('min'),
                salary_max=job_data.get('budget', {}).get('max'),
                currency=job_data.get('budget', {}).get('currency', 'USD'),
                company_name=job_data.get('client', {}).get('name', ''),
                department='',
                status=JobStatus.PUBLISHED if job_data.get('status') == 'active' else JobStatus.CLOSED,
                created_at=datetime.fromisoformat(job_data.get('created_at', datetime.now().isoformat()).replace('Z', '+00:00')),
                updated_at=datetime.fromisoformat(job_data.get('updated_at', datetime.now().isoformat()).replace('Z', '+00:00')),
                applications_count=job_data.get('proposals_count', 0),
                views_count=job_data.get('views_count', 0),
                metadata={"raw_data": job_data}
            )
            jobs.append(job)
        
        return jobs
    
    async def validate_connection(self) -> bool:
        """Validate Upwork API connection"""
        try:
            await self._make_request("/profiles/v2/me")
            return True
        except Exception as e:
            logger.error(f"Upwork connection validation failed: {e}")
            return False

class RecruitmentManager:
    """Manager for multiple recruitment platform integrations"""
    
    def __init__(self):
        self.connectors: Dict[RecruitmentPlatform, Any] = {}
    
    def add_platform(self, platform: RecruitmentPlatform, credentials: RecruitmentCredentials):
        """Add a recruitment platform connector"""
        if platform == RecruitmentPlatform.LINKEDIN_TALENT:
            self.connectors[platform] = LinkedInTalentConnector(credentials)
        elif platform == RecruitmentPlatform.INDEED:
            self.connectors[platform] = IndeedConnector(credentials)
        elif platform == RecruitmentPlatform.UPWORK:
            self.connectors[platform] = UpworkConnector(credentials)
        
        logger.info(f"Added {platform.value} connector")
    
    async def search_candidates_across_platforms(self, 
                                               platforms: List[RecruitmentPlatform],
                                               search_criteria: Dict[str, Any]) -> Dict[str, List[Candidate]]:
        """Search candidates across multiple platforms"""
        results = {}
        
        for platform in platforms:
            if platform in self.connectors:
                try:
                    connector = self.connectors[platform]
                    
                    async with connector:
                        if platform == RecruitmentPlatform.LINKEDIN_TALENT:
                            candidates = await connector.search_candidates(
                                keywords=search_criteria.get('keywords', []),
                                location=search_criteria.get('location'),
                                experience_level=search_criteria.get('experience_level'),
                                limit=search_criteria.get('limit', 100)
                            )
                        elif platform == RecruitmentPlatform.UPWORK:
                            candidates = await connector.search_freelancers(
                                skills=search_criteria.get('keywords', []),
                                hourly_rate_max=search_criteria.get('hourly_rate_max'),
                                availability=search_criteria.get('availability'),
                                limit=search_criteria.get('limit', 100)
                            )
                        else:
                            candidates = []
                        
                        results[platform.value] = candidates
                        
                except Exception as e:
                    logger.error(f"Error searching candidates on {platform.value}: {e}")
                    results[platform.value] = []
        
        return results
    
    async def get_unified_jobs(self, platforms: List[RecruitmentPlatform]) -> Dict[str, List[Job]]:
        """Get jobs from multiple platforms"""
        results = {}
        
        for platform in platforms:
            if platform in self.connectors:
                try:
                    connector = self.connectors[platform]
                    
                    async with connector:
                        if platform == RecruitmentPlatform.LINKEDIN_TALENT:
                            jobs = await connector.get_job_posts()
                        elif platform == RecruitmentPlatform.UPWORK:
                            jobs = await connector.get_jobs()
                        else:
                            jobs = []
                        
                        results[platform.value] = jobs
                        
                except Exception as e:
                    logger.error(f"Error getting jobs from {platform.value}: {e}")
                    results[platform.value] = []
        
        return results
    
    async def validate_all_connections(self) -> Dict[RecruitmentPlatform, bool]:
        """Validate connections to all recruitment platforms"""
        results = {}
        
        for platform, connector in self.connectors.items():
            try:
                async with connector:
                    is_valid = await connector.validate_connection()
                    results[platform] = is_valid
            except Exception as e:
                logger.error(f"Error validating {platform.value} connection: {e}")
                results[platform] = False
        
        return results

# Global recruitment manager
recruitment_manager = RecruitmentManager()

# Convenience functions
def add_recruitment_credentials(platform: str, 
                               api_key: str,
                               access_token: str = None,
                               api_secret: str = None,
                               client_id: str = None,
                               client_secret: str = None):
    """Add recruitment platform credentials"""
    credentials = RecruitmentCredentials(
        platform=RecruitmentPlatform(platform),
        api_key=api_key,
        access_token=access_token,
        api_secret=api_secret,
        client_id=client_id,
        client_secret=client_secret
    )
    recruitment_manager.add_platform(credentials.platform, credentials)

async def search_candidates(platforms: List[str], search_criteria: Dict[str, Any]):
    """Search candidates across multiple recruitment platforms"""
    platform_enums = [RecruitmentPlatform(platform) for platform in platforms]
    return await recruitment_manager.search_candidates_across_platforms(platform_enums, search_criteria)

async def get_jobs(platforms: List[str]):
    """Get jobs from multiple recruitment platforms"""
    platform_enums = [RecruitmentPlatform(platform) for platform in platforms]
    return await recruitment_manager.get_unified_jobs(platform_enums)
