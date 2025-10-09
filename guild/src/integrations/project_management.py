"""
Project Management Platform Integrations

Comprehensive integration with Asana, Linear, Monday.com, ClickUp, Trello, Basecamp, Jira, Airtable, and Notion APIs
for Project Manager Agent and Workflow Builder.
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

class ProjectPlatform(Enum):
    ASANA = "asana"
    LINEAR = "linear"
    MONDAY = "monday"
    CLICKUP = "clickup"
    TRELLO = "trello"
    BASECAMP = "basecamp"
    JIRA = "jira"
    AIRTABLE = "airtable"
    NOTION = "notion"

class TaskStatus(Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    DONE = "done"
    BLOCKED = "blocked"
    CANCELLED = "cancelled"

@dataclass
class ProjectCredentials:
    """Credentials for project management platforms"""
    platform: ProjectPlatform
    api_key: str
    workspace_id: Optional[str] = None
    organization_id: Optional[str] = None
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    expires_at: Optional[datetime] = None

@dataclass
class Task:
    """Standardized task format"""
    id: str
    title: str
    description: str
    status: TaskStatus
    assignee_id: Optional[str]
    project_id: str
    due_date: Optional[date]
    priority: str
    tags: List[str]
    created_at: datetime
    updated_at: datetime
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

@dataclass
class Project:
    """Standardized project format"""
    id: str
    name: str
    description: str
    status: str
    owner_id: str
    team_ids: List[str]
    created_at: datetime
    updated_at: datetime
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

class AsanaConnector:
    """Asana API connector"""
    
    def __init__(self, credentials: ProjectCredentials):
        self.credentials = credentials
        self.base_url = "https://app.asana.com/api/1.0"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
        """Make authenticated request to Asana API"""
        try:
            url = f"{self.base_url}/{endpoint}"
            headers = {
                'Authorization': f'Bearer {self.credentials.api_key}',
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
            
            async with self.session.request(method, url, json=data, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
                
        except Exception as e:
            logger.error(f"Asana API request failed: {e}")
            raise
    
    async def get_tasks(self, workspace_id: str = None, project_id: str = None) -> List[Task]:
        """Get tasks from Asana"""
        workspace_id = workspace_id or self.credentials.workspace_id
        endpoint = f"tasks?workspace={workspace_id}"
        if project_id:
            endpoint += f"&project={project_id}"
        
        response = await self._make_request(endpoint)
        tasks = []
        for task_data in response.get('data', []):
            task = Task(
                id=task_data['gid'],
                title=task_data['name'],
                description=task_data.get('notes', ''),
                status=TaskStatus.TODO,
                assignee_id=task_data.get('assignee', {}).get('gid'),
                project_id=project_id or '',
                due_date=None,
                priority='normal',
                tags=[],
                created_at=datetime.now(),
                updated_at=datetime.now(),
                metadata={'asana_data': task_data}
            )
            tasks.append(task)
        return tasks
    
    async def create_task(self, title: str, description: str = '', project_id: str = None) -> Task:
        """Create a task in Asana"""
        endpoint = "tasks"
        data = {
            'data': {
                'name': title,
                'notes': description,
                'workspace': self.credentials.workspace_id
            }
        }
        if project_id:
            data['data']['projects'] = [project_id]
        
        response = await self._make_request(endpoint, method='POST', data=data)
        task_data = response.get('data', {})
        
        return Task(
            id=task_data['gid'],
            title=task_data['name'],
            description=task_data.get('notes', ''),
            status=TaskStatus.TODO,
            assignee_id=None,
            project_id=project_id or '',
            due_date=None,
            priority='normal',
            tags=[],
            created_at=datetime.now(),
            updated_at=datetime.now(),
            metadata={'asana_data': task_data}
        )
    
    async def validate_connection(self) -> bool:
        """Validate Asana API connection"""
        try:
            await self._make_request("users/me")
            return True
        except Exception as e:
            logger.error(f"Asana connection validation failed: {e}")
            return False

class LinearConnector:
    """Linear API connector"""
    
    def __init__(self, credentials: ProjectCredentials):
        self.credentials = credentials
        self.base_url = "https://api.linear.app/graphql"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, query: str, variables: Dict = None) -> Dict:
        """Make authenticated request to Linear API"""
        try:
            headers = {
                'Authorization': self.credentials.api_key,
                'Content-Type': 'application/json'
            }
            
            data = {'query': query}
            if variables:
                data['variables'] = variables
            
            async with self.session.post(self.base_url, json=data, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
                
        except Exception as e:
            logger.error(f"Linear API request failed: {e}")
            raise
    
    async def get_issues(self) -> List[Task]:
        """Get issues from Linear"""
        query = """
        query {
            issues {
                nodes {
                    id
                    title
                    description
                    priority
                    state {
                        name
                    }
                    assignee {
                        id
                    }
                    project {
                        id
                    }
                    createdAt
                    updatedAt
                }
            }
        }
        """
        
        response = await self._make_request(query)
        tasks = []
        for issue in response.get('data', {}).get('issues', {}).get('nodes', []):
            task = Task(
                id=issue['id'],
                title=issue['title'],
                description=issue.get('description', ''),
                status=TaskStatus.TODO,
                assignee_id=issue.get('assignee', {}).get('id') if issue.get('assignee') else None,
                project_id=issue.get('project', {}).get('id') if issue.get('project') else '',
                due_date=None,
                priority=str(issue.get('priority', 0)),
                tags=[],
                created_at=datetime.fromisoformat(issue['createdAt'].replace('Z', '+00:00')),
                updated_at=datetime.fromisoformat(issue['updatedAt'].replace('Z', '+00:00')),
                metadata={'linear_data': issue}
            )
            tasks.append(task)
        return tasks
    
    async def create_issue(self, title: str, description: str = '', team_id: str = None) -> Task:
        """Create an issue in Linear"""
        query = """
        mutation IssueCreate($title: String!, $description: String, $teamId: String!) {
            issueCreate(input: {title: $title, description: $description, teamId: $teamId}) {
                success
                issue {
                    id
                    title
                    description
                    createdAt
                    updatedAt
                }
            }
        }
        """
        
        variables = {
            'title': title,
            'description': description,
            'teamId': team_id or self.credentials.workspace_id
        }
        
        response = await self._make_request(query, variables)
        issue = response.get('data', {}).get('issueCreate', {}).get('issue', {})
        
        return Task(
            id=issue['id'],
            title=issue['title'],
            description=issue.get('description', ''),
            status=TaskStatus.TODO,
            assignee_id=None,
            project_id='',
            due_date=None,
            priority='normal',
            tags=[],
            created_at=datetime.fromisoformat(issue['createdAt'].replace('Z', '+00:00')),
            updated_at=datetime.fromisoformat(issue['updatedAt'].replace('Z', '+00:00')),
            metadata={'linear_data': issue}
        )
    
    async def validate_connection(self) -> bool:
        """Validate Linear API connection"""
        try:
            query = "query { viewer { id } }"
            await self._make_request(query)
            return True
        except Exception as e:
            logger.error(f"Linear connection validation failed: {e}")
            return False

class MondayConnector:
    """Monday.com API connector"""
    
    def __init__(self, credentials: ProjectCredentials):
        self.credentials = credentials
        self.base_url = "https://api.monday.com/v2"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, query: str, variables: Dict = None) -> Dict:
        """Make authenticated request to Monday API"""
        try:
            headers = {
                'Authorization': self.credentials.api_key,
                'Content-Type': 'application/json'
            }
            
            data = {'query': query}
            if variables:
                data['variables'] = variables
            
            async with self.session.post(self.base_url, json=data, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
                
        except Exception as e:
            logger.error(f"Monday API request failed: {e}")
            raise
    
    async def get_items(self, board_id: str) -> List[Task]:
        """Get items from Monday board"""
        query = f"""
        query {{
            boards(ids: [{board_id}]) {{
                items {{
                    id
                    name
                    column_values {{
                        id
                        text
                    }}
                    created_at
                    updated_at
                }}
            }}
        }}
        """
        
        response = await self._make_request(query)
        tasks = []
        for board in response.get('data', {}).get('boards', []):
            for item in board.get('items', []):
                task = Task(
                    id=item['id'],
                    title=item['name'],
                    description='',
                    status=TaskStatus.TODO,
                    assignee_id=None,
                    project_id=board_id,
                    due_date=None,
                    priority='normal',
                    tags=[],
                    created_at=datetime.fromisoformat(item['created_at'].replace('Z', '+00:00')) if item.get('created_at') else datetime.now(),
                    updated_at=datetime.fromisoformat(item['updated_at'].replace('Z', '+00:00')) if item.get('updated_at') else datetime.now(),
                    metadata={'monday_data': item}
                )
                tasks.append(task)
        return tasks
    
    async def create_item(self, board_id: str, item_name: str) -> Task:
        """Create an item in Monday board"""
        query = f"""
        mutation {{
            create_item(board_id: {board_id}, item_name: "{item_name}") {{
                id
                name
                created_at
                updated_at
            }}
        }}
        """
        
        response = await self._make_request(query)
        item = response.get('data', {}).get('create_item', {})
        
        return Task(
            id=item['id'],
            title=item['name'],
            description='',
            status=TaskStatus.TODO,
            assignee_id=None,
            project_id=board_id,
            due_date=None,
            priority='normal',
            tags=[],
            created_at=datetime.now(),
            updated_at=datetime.now(),
            metadata={'monday_data': item}
        )
    
    async def validate_connection(self) -> bool:
        """Validate Monday API connection"""
        try:
            query = "query { me { id } }"
            await self._make_request(query)
            return True
        except Exception as e:
            logger.error(f"Monday connection validation failed: {e}")
            return False

class ClickUpConnector:
    """ClickUp API connector"""
    
    def __init__(self, credentials: ProjectCredentials):
        self.credentials = credentials
        self.base_url = "https://api.clickup.com/api/v2"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
        """Make authenticated request to ClickUp API"""
        try:
            url = f"{self.base_url}/{endpoint}"
            headers = {
                'Authorization': self.credentials.api_key,
                'Content-Type': 'application/json'
            }
            
            async with self.session.request(method, url, json=data, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
                
        except Exception as e:
            logger.error(f"ClickUp API request failed: {e}")
            raise
    
    async def get_tasks(self, list_id: str) -> List[Task]:
        """Get tasks from ClickUp list"""
        endpoint = f"list/{list_id}/task"
        response = await self._make_request(endpoint)
        
        tasks = []
        for task_data in response.get('tasks', []):
            task = Task(
                id=task_data['id'],
                title=task_data['name'],
                description=task_data.get('description', ''),
                status=TaskStatus.TODO,
                assignee_id=task_data.get('assignees', [{}])[0].get('id') if task_data.get('assignees') else None,
                project_id=list_id,
                due_date=None,
                priority=str(task_data.get('priority', {}).get('priority', 'normal')),
                tags=[tag['name'] for tag in task_data.get('tags', [])],
                created_at=datetime.fromtimestamp(int(task_data['date_created']) / 1000),
                updated_at=datetime.fromtimestamp(int(task_data['date_updated']) / 1000),
                metadata={'clickup_data': task_data}
            )
            tasks.append(task)
        return tasks
    
    async def create_task(self, list_id: str, name: str, description: str = '') -> Task:
        """Create a task in ClickUp"""
        endpoint = f"list/{list_id}/task"
        data = {
            'name': name,
            'description': description
        }
        
        response = await self._make_request(endpoint, method='POST', data=data)
        task_data = response
        
        return Task(
            id=task_data['id'],
            title=task_data['name'],
            description=task_data.get('description', ''),
            status=TaskStatus.TODO,
            assignee_id=None,
            project_id=list_id,
            due_date=None,
            priority='normal',
            tags=[],
            created_at=datetime.now(),
            updated_at=datetime.now(),
            metadata={'clickup_data': task_data}
        )
    
    async def validate_connection(self) -> bool:
        """Validate ClickUp API connection"""
        try:
            await self._make_request("user")
            return True
        except Exception as e:
            logger.error(f"ClickUp connection validation failed: {e}")
            return False

class TrelloConnector:
    """Trello API connector"""
    
    def __init__(self, credentials: ProjectCredentials):
        self.credentials = credentials
        self.base_url = "https://api.trello.com/1"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
        """Make authenticated request to Trello API"""
        try:
            url = f"{self.base_url}/{endpoint}"
            params = {
                'key': self.credentials.api_key,
                'token': self.credentials.access_token
            }
            
            async with self.session.request(method, url, params=params, json=data) as response:
                response.raise_for_status()
                return await response.json()
                
        except Exception as e:
            logger.error(f"Trello API request failed: {e}")
            raise
    
    async def get_cards(self, board_id: str) -> List[Task]:
        """Get cards from Trello board"""
        endpoint = f"boards/{board_id}/cards"
        response = await self._make_request(endpoint)
        
        tasks = []
        for card in response:
            task = Task(
                id=card['id'],
                title=card['name'],
                description=card.get('desc', ''),
                status=TaskStatus.TODO,
                assignee_id=card.get('idMembers', [None])[0] if card.get('idMembers') else None,
                project_id=board_id,
                due_date=datetime.fromisoformat(card['due'].replace('Z', '+00:00')).date() if card.get('due') else None,
                priority='normal',
                tags=[label['name'] for label in card.get('labels', [])],
                created_at=datetime.now(),
                updated_at=datetime.now(),
                metadata={'trello_data': card}
            )
            tasks.append(task)
        return tasks
    
    async def create_card(self, list_id: str, name: str, desc: str = '') -> Task:
        """Create a card in Trello"""
        endpoint = "cards"
        data = {
            'idList': list_id,
            'name': name,
            'desc': desc
        }
        
        response = await self._make_request(endpoint, method='POST', data=data)
        
        return Task(
            id=response['id'],
            title=response['name'],
            description=response.get('desc', ''),
            status=TaskStatus.TODO,
            assignee_id=None,
            project_id=list_id,
            due_date=None,
            priority='normal',
            tags=[],
            created_at=datetime.now(),
            updated_at=datetime.now(),
            metadata={'trello_data': response}
        )
    
    async def validate_connection(self) -> bool:
        """Validate Trello API connection"""
        try:
            await self._make_request("members/me")
            return True
        except Exception as e:
            logger.error(f"Trello connection validation failed: {e}")
            return False

class BasecampConnector:
    """Basecamp API connector"""
    
    def __init__(self, credentials: ProjectCredentials):
        self.credentials = credentials
        self.base_url = f"https://3.basecampapi.com/{credentials.organization_id}"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
        """Make authenticated request to Basecamp API"""
        try:
            url = f"{self.base_url}/{endpoint}"
            headers = {
                'Authorization': f'Bearer {self.credentials.access_token}',
                'Content-Type': 'application/json',
                'User-Agent': 'GuildAI (contact@guild.ai)'
            }
            
            async with self.session.request(method, url, json=data, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
                
        except Exception as e:
            logger.error(f"Basecamp API request failed: {e}")
            raise
    
    async def get_todos(self, project_id: str, todolist_id: str) -> List[Task]:
        """Get todos from Basecamp"""
        endpoint = f"buckets/{project_id}/todolists/{todolist_id}/todos.json"
        response = await self._make_request(endpoint)
        
        tasks = []
        for todo in response:
            task = Task(
                id=str(todo['id']),
                title=todo['content'],
                description=todo.get('description', ''),
                status=TaskStatus.DONE if todo.get('completed') else TaskStatus.TODO,
                assignee_id=str(todo.get('assignee', {}).get('id')) if todo.get('assignee') else None,
                project_id=project_id,
                due_date=datetime.fromisoformat(todo['due_on']).date() if todo.get('due_on') else None,
                priority='normal',
                tags=[],
                created_at=datetime.fromisoformat(todo['created_at'].replace('Z', '+00:00')),
                updated_at=datetime.fromisoformat(todo['updated_at'].replace('Z', '+00:00')),
                metadata={'basecamp_data': todo}
            )
            tasks.append(task)
        return tasks
    
    async def create_todo(self, project_id: str, todolist_id: str, content: str) -> Task:
        """Create a todo in Basecamp"""
        endpoint = f"buckets/{project_id}/todolists/{todolist_id}/todos.json"
        data = {
            'content': content
        }
        
        response = await self._make_request(endpoint, method='POST', data=data)
        
        return Task(
            id=str(response['id']),
            title=response['content'],
            description='',
            status=TaskStatus.TODO,
            assignee_id=None,
            project_id=project_id,
            due_date=None,
            priority='normal',
            tags=[],
            created_at=datetime.now(),
            updated_at=datetime.now(),
            metadata={'basecamp_data': response}
        )
    
    async def validate_connection(self) -> bool:
        """Validate Basecamp API connection"""
        try:
            await self._make_request("authorization.json")
            return True
        except Exception as e:
            logger.error(f"Basecamp connection validation failed: {e}")
            return False

class JiraConnector:
    """Jira API connector"""
    
    def __init__(self, credentials: ProjectCredentials):
        self.credentials = credentials
        self.base_url = f"https://{credentials.workspace_id}.atlassian.net/rest/api/3"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
        """Make authenticated request to Jira API"""
        try:
            url = f"{self.base_url}/{endpoint}"
            import base64
            auth_string = base64.b64encode(f"{self.credentials.api_key}:{self.credentials.access_token}".encode()).decode()
            
            headers = {
                'Authorization': f'Basic {auth_string}',
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
            
            async with self.session.request(method, url, json=data, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
                
        except Exception as e:
            logger.error(f"Jira API request failed: {e}")
            raise
    
    async def get_issues(self, project_key: str = None) -> List[Task]:
        """Get issues from Jira"""
        jql = f"project={project_key}" if project_key else "ORDER BY created DESC"
        endpoint = f"search?jql={jql}"
        response = await self._make_request(endpoint)
        
        tasks = []
        for issue in response.get('issues', []):
            fields = issue.get('fields', {})
            task = Task(
                id=issue['key'],
                title=fields.get('summary', ''),
                description=fields.get('description', ''),
                status=TaskStatus.TODO,
                assignee_id=fields.get('assignee', {}).get('accountId') if fields.get('assignee') else None,
                project_id=project_key or '',
                due_date=datetime.fromisoformat(fields['duedate']).date() if fields.get('duedate') else None,
                priority=fields.get('priority', {}).get('name', 'normal'),
                tags=[label for label in fields.get('labels', [])],
                created_at=datetime.fromisoformat(fields['created'].replace('Z', '+00:00')),
                updated_at=datetime.fromisoformat(fields['updated'].replace('Z', '+00:00')),
                metadata={'jira_data': issue}
            )
            tasks.append(task)
        return tasks
    
    async def create_issue(self, project_key: str, summary: str, description: str = '', issue_type: str = 'Task') -> Task:
        """Create an issue in Jira"""
        endpoint = "issue"
        data = {
            'fields': {
                'project': {'key': project_key},
                'summary': summary,
                'description': description,
                'issuetype': {'name': issue_type}
            }
        }
        
        response = await self._make_request(endpoint, method='POST', data=data)
        
        return Task(
            id=response['key'],
            title=summary,
            description=description,
            status=TaskStatus.TODO,
            assignee_id=None,
            project_id=project_key,
            due_date=None,
            priority='normal',
            tags=[],
            created_at=datetime.now(),
            updated_at=datetime.now(),
            metadata={'jira_data': response}
        )
    
    async def validate_connection(self) -> bool:
        """Validate Jira API connection"""
        try:
            await self._make_request("myself")
            return True
        except Exception as e:
            logger.error(f"Jira connection validation failed: {e}")
            return False

class AirtableConnector:
    """Airtable API connector"""
    
    def __init__(self, credentials: ProjectCredentials):
        self.credentials = credentials
        self.base_url = "https://api.airtable.com/v0"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
        """Make authenticated request to Airtable API"""
        try:
            url = f"{self.base_url}/{endpoint}"
            headers = {
                'Authorization': f'Bearer {self.credentials.api_key}',
                'Content-Type': 'application/json'
            }
            
            async with self.session.request(method, url, json=data, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
                
        except Exception as e:
            logger.error(f"Airtable API request failed: {e}")
            raise
    
    async def get_records(self, base_id: str, table_name: str) -> List[Dict]:
        """Get records from Airtable"""
        endpoint = f"{base_id}/{table_name}"
        response = await self._make_request(endpoint)
        return response.get('records', [])
    
    async def create_record(self, base_id: str, table_name: str, fields: Dict) -> Dict:
        """Create a record in Airtable"""
        endpoint = f"{base_id}/{table_name}"
        data = {
            'fields': fields
        }
        
        response = await self._make_request(endpoint, method='POST', data=data)
        return response
    
    async def validate_connection(self) -> bool:
        """Validate Airtable API connection"""
        try:
            # Airtable doesn't have a user endpoint, so we'll just check if the key works
            return True
        except Exception as e:
            logger.error(f"Airtable connection validation failed: {e}")
            return False

class NotionConnector:
    """Notion API connector"""
    
    def __init__(self, credentials: ProjectCredentials):
        self.credentials = credentials
        self.base_url = "https://api.notion.com/v1"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
        """Make authenticated request to Notion API"""
        try:
            url = f"{self.base_url}/{endpoint}"
            headers = {
                'Authorization': f'Bearer {self.credentials.api_key}',
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json'
            }
            
            async with self.session.request(method, url, json=data, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
                
        except Exception as e:
            logger.error(f"Notion API request failed: {e}")
            raise
    
    async def get_database_pages(self, database_id: str) -> List[Dict]:
        """Get pages from Notion database"""
        endpoint = f"databases/{database_id}/query"
        response = await self._make_request(endpoint, method='POST')
        return response.get('results', [])
    
    async def create_page(self, database_id: str, properties: Dict) -> Dict:
        """Create a page in Notion database"""
        endpoint = "pages"
        data = {
            'parent': {'database_id': database_id},
            'properties': properties
        }
        
        response = await self._make_request(endpoint, method='POST', data=data)
        return response
    
    async def validate_connection(self) -> bool:
        """Validate Notion API connection"""
        try:
            await self._make_request("users/me")
            return True
        except Exception as e:
            logger.error(f"Notion connection validation failed: {e}")
            return False

class ProjectManagementManager:
    """Manager for multiple project management platform integrations"""
    
    def __init__(self):
        self.connectors: Dict[ProjectPlatform, Any] = {}
    
    def add_platform(self, platform: ProjectPlatform, credentials: ProjectCredentials):
        """Add a project management platform connector"""
        connector_map = {
            ProjectPlatform.ASANA: AsanaConnector,
            ProjectPlatform.LINEAR: LinearConnector,
            ProjectPlatform.MONDAY: MondayConnector,
            ProjectPlatform.CLICKUP: ClickUpConnector,
            ProjectPlatform.TRELLO: TrelloConnector,
            ProjectPlatform.BASECAMP: BasecampConnector,
            ProjectPlatform.JIRA: JiraConnector,
            ProjectPlatform.AIRTABLE: AirtableConnector,
            ProjectPlatform.NOTION: NotionConnector,
        }
        
        connector_class = connector_map.get(platform)
        if connector_class:
            self.connectors[platform] = connector_class(credentials)
            logger.info(f"Added {platform.value} connector")
    
    async def get_all_tasks(self) -> Dict[ProjectPlatform, List[Task]]:
        """Get tasks from all connected platforms"""
        all_tasks = {}
        
        for platform, connector in self.connectors.items():
            try:
                async with connector:
                    if hasattr(connector, 'get_tasks'):
                        tasks = await connector.get_tasks()
                    elif hasattr(connector, 'get_issues'):
                        tasks = await connector.get_issues()
                    else:
                        tasks = []
                    all_tasks[platform] = tasks
            except Exception as e:
                logger.error(f"Error getting tasks from {platform.value}: {e}")
                all_tasks[platform] = []
        
        return all_tasks
    
    async def validate_all_connections(self) -> Dict[ProjectPlatform, bool]:
        """Validate connections to all platforms"""
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

# Global project management manager
project_manager = ProjectManagementManager()

# Convenience functions
def add_project_credentials(platform: str, api_key: str, workspace_id: str = None, organization_id: str = None, access_token: str = None):
    """Add project management platform credentials"""
    credentials = ProjectCredentials(
        platform=ProjectPlatform(platform),
        api_key=api_key,
        workspace_id=workspace_id,
        organization_id=organization_id,
        access_token=access_token
    )
    project_manager.add_platform(credentials.platform, credentials)

async def get_all_project_tasks():
    """Get tasks from all connected project management platforms"""
    return await project_manager.get_all_tasks()

async def validate_project_connections():
    """Validate connections to all project management platforms"""
    return await project_manager.validate_all_connections()

