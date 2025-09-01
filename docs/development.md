# Development Guide

This guide covers the development setup, coding standards, and best practices for contributing to the Hybrid Storage Workflow System.

## Development Environment Setup

### Prerequisites

- Python 3.11+
- Node.js 20+
- pnpm (for frontend package management)
- Git
- Docker and Docker Compose (optional, for full stack development)

### Local Development Setup

1. **Clone the Repository**
```bash
git clone <repository-url>
cd web-app
```

2. **Backend Setup**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. **Frontend Setup**
```bash
cd frontend
pnpm install
```

4. **Environment Configuration**
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. **Database Setup**
```bash
cd backend
source venv/bin/activate
python -c "from src.main import app, db; app.app_context().push(); db.create_all()"
```

### Running in Development Mode

#### Option 1: Manual Setup

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
python src/main.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
pnpm run dev
```

#### Option 2: Docker Compose (Recommended)

```bash
# Start all services
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down
```

### Development Tools

#### Code Formatting and Linting

**Backend (Python):**
```bash
# Install development dependencies
pip install black flake8 isort mypy pytest

# Format code
black src/
isort src/

# Lint code
flake8 src/
mypy src/
```

**Frontend (JavaScript/React):**
```bash
# Lint and format
pnpm run lint
pnpm run format

# Type checking
pnpm run type-check
```

#### Pre-commit Hooks

Install pre-commit hooks to ensure code quality:

```bash
pip install pre-commit
pre-commit install
```

Create `.pre-commit-config.yaml`:
```yaml
repos:
  - repo: https://github.com/psf/black
    rev: 23.1.0
    hooks:
      - id: black
        language_version: python3.11

  - repo: https://github.com/pycqa/isort
    rev: 5.12.0
    hooks:
      - id: isort

  - repo: https://github.com/pycqa/flake8
    rev: 6.0.0
    hooks:
      - id: flake8

  - repo: https://github.com/pre-commit/mirrors-eslint
    rev: v8.36.0
    hooks:
      - id: eslint
        files: \.(js|jsx|ts|tsx)$
        types: [file]
```

## Project Structure

```
web-app/
├── backend/                 # Flask backend application
│   ├── src/
│   │   ├── connectors/     # Data source connectors
│   │   ├── core/           # Core business logic
│   │   ├── models/         # Database models
│   │   ├── routes/         # API endpoints
│   │   ├── config.py       # Configuration management
│   │   └── main.py         # Application entry point
│   ├── tests/              # Backend tests
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile         # Backend container config
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   ├── App.jsx         # Main App component
│   │   └── main.jsx        # Application entry point
│   ├── public/             # Static assets
│   ├── package.json        # Node.js dependencies
│   └── Dockerfile         # Frontend container config
├── docs/                   # Documentation
├── monitoring/             # Monitoring configuration
├── docker-compose.yml      # Production deployment
├── docker-compose.dev.yml  # Development deployment
└── README.md              # Project documentation
```

## Coding Standards

### Python (Backend)

#### Style Guide
- Follow PEP 8 style guidelines
- Use Black for code formatting
- Use isort for import sorting
- Maximum line length: 88 characters (Black default)

#### Naming Conventions
- **Classes**: PascalCase (`DataRoom`, `WorkflowOrchestrator`)
- **Functions/Methods**: snake_case (`create_data_room`, `execute_workflow`)
- **Variables**: snake_case (`data_room_id`, `workflow_status`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_ITERATIONS`, `DEFAULT_TIMEOUT`)

#### Documentation
```python
def create_data_room(name: str, provider: str, config: dict) -> DataRoom:
    """
    Create a new data room with the specified configuration.
    
    Args:
        name: Human-readable name for the data room
        provider: Data source provider (gdrive, notion, etc.)
        config: Provider-specific configuration parameters
        
    Returns:
        DataRoom: The created data room instance
        
    Raises:
        ValidationError: If the configuration is invalid
        ProviderError: If the provider is not supported
    """
    pass
```

#### Error Handling
```python
# Use specific exception types
try:
    result = risky_operation()
except ProviderConnectionError as e:
    logger.error(f"Provider connection failed: {e}")
    raise WorkflowExecutionError("Unable to connect to data source")
except ValidationError as e:
    logger.warning(f"Invalid input: {e}")
    raise
```

#### Database Models
```python
class DataRoom(db.Model):
    __tablename__ = 'data_rooms'
    
    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    provider = db.Column(db.String(50), nullable=False)
    
    def to_dict(self) -> dict:
        """Convert model to dictionary representation."""
        return {
            'id': self.id,
            'name': self.name,
            'provider': self.provider
        }
```

### JavaScript/React (Frontend)

#### Style Guide
- Use ESLint with Airbnb configuration
- Use Prettier for code formatting
- Prefer functional components with hooks
- Use TypeScript for type safety (when applicable)

#### Naming Conventions
- **Components**: PascalCase (`DataRoomCard`, `WorkflowInterface`)
- **Functions**: camelCase (`createDataRoom`, `executeWorkflow`)
- **Variables**: camelCase (`dataRoomId`, `workflowStatus`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRIES`, `API_BASE_URL`)

#### Component Structure
```jsx
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import './App.css'

export function DataRoomCard({ dataRoom, onSync, onEdit, onDelete }) {
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    // Component initialization
  }, [])
  
  const handleSync = async () => {
    setLoading(true)
    try {
      await onSync(dataRoom.id)
    } catch (error) {
      console.error('Sync failed:', error)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{dataRoom.name}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Component content */}
      </CardContent>
    </Card>
  )
}
```

#### API Integration
```javascript
// Use a consistent API client
class WorkflowAPI {
  constructor(baseUrl, apiKey) {
    this.baseUrl = baseUrl
    this.headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  }

  async createDataRoom(data) {
    const response = await fetch(`${this.baseUrl}/data-rooms`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
    
    return response.json()
  }
}
```

## Testing

### Backend Testing

#### Unit Tests
```python
import pytest
from src.models.data_room import DataRoom
from src.core.sync import sync_data_room

class TestDataRoom:
    def test_create_data_room(self):
        """Test data room creation."""
        room = DataRoom(
            id='test-id',
            name='Test Room',
            provider='workspace'
        )
        assert room.name == 'Test Room'
        assert room.provider == 'workspace'
    
    def test_sync_data_room(self, mock_connector):
        """Test data room synchronization."""
        result = sync_data_room('test-room-id')
        assert result['status'] == 'completed'
        assert result['new_documents'] >= 0
```

#### Integration Tests
```python
import pytest
from src.main import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_create_data_room_api(client):
    """Test data room creation API."""
    response = client.post('/api/data-rooms', json={
        'name': 'Test Room',
        'provider': 'workspace',
        'config': {}
    })
    assert response.status_code == 201
    data = response.get_json()
    assert data['name'] == 'Test Room'
```

#### Running Tests
```bash
cd backend
source venv/bin/activate

# Run all tests
pytest

# Run with coverage
pytest --cov=src

# Run specific test file
pytest tests/test_data_rooms.py

# Run with verbose output
pytest -v
```

### Frontend Testing

#### Component Tests
```jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { DataRoomCard } from '../components/DataRoomCard'

describe('DataRoomCard', () => {
  const mockDataRoom = {
    id: 'test-id',
    name: 'Test Room',
    provider: 'workspace'
  }
  
  test('renders data room information', () => {
    render(<DataRoomCard dataRoom={mockDataRoom} />)
    expect(screen.getByText('Test Room')).toBeInTheDocument()
    expect(screen.getByText('Workspace')).toBeInTheDocument()
  })
  
  test('calls onSync when sync button is clicked', () => {
    const mockOnSync = jest.fn()
    render(<DataRoomCard dataRoom={mockDataRoom} onSync={mockOnSync} />)
    
    fireEvent.click(screen.getByText('Sync'))
    expect(mockOnSync).toHaveBeenCalledWith('test-id')
  })
})
```

#### Running Tests
```bash
cd frontend

# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm test DataRoomCard.test.jsx
```

## Database Management

### Migrations

#### Creating Migrations
```python
# Create a new migration
from flask_migrate import Migrate, init, migrate, upgrade

# Initialize migration repository (first time only)
flask db init

# Create a new migration
flask db migrate -m "Add workflow models"

# Apply migrations
flask db upgrade
```

#### Migration Best Practices
- Always review generated migrations before applying
- Test migrations on a copy of production data
- Include both upgrade and downgrade methods
- Use descriptive migration messages

### Database Seeding

Create seed data for development:

```python
# src/seeds.py
from src.models import db, User, DataRoom

def seed_database():
    """Seed the database with initial data."""
    # Create test users
    test_user = User(
        username='testuser',
        email='test@example.com'
    )
    db.session.add(test_user)
    
    # Create test data rooms
    test_room = DataRoom(
        id='test-room-1',
        name='Test Marketing Assets',
        provider='workspace',
        config={}
    )
    db.session.add(test_room)
    
    db.session.commit()
    print("Database seeded successfully!")

if __name__ == '__main__':
    seed_database()
```

## API Development

### Adding New Endpoints

1. **Create the route handler**:
```python
# src/routes/new_feature.py
from flask import Blueprint, jsonify, request
from src.models.new_model import NewModel, db

new_feature_bp = Blueprint('new_feature', __name__)

@new_feature_bp.route('/new-endpoint', methods=['GET'])
def get_new_data():
    """Get new data."""
    data = NewModel.query.all()
    return jsonify([item.to_dict() for item in data])

@new_feature_bp.route('/new-endpoint', methods=['POST'])
def create_new_data():
    """Create new data."""
    data = request.json
    new_item = NewModel(**data)
    db.session.add(new_item)
    db.session.commit()
    return jsonify(new_item.to_dict()), 201
```

2. **Register the blueprint**:
```python
# src/main.py
from src.routes.new_feature import new_feature_bp

app.register_blueprint(new_feature_bp, url_prefix='/api')
```

3. **Add tests**:
```python
# tests/test_new_feature.py
def test_get_new_data(client):
    response = client.get('/api/new-endpoint')
    assert response.status_code == 200
```

4. **Update documentation**:
```markdown
### New Endpoint

#### GET /api/new-endpoint
Description of the endpoint...
```

### Error Handling

Implement consistent error handling:

```python
# src/utils/errors.py
from flask import jsonify

class APIError(Exception):
    """Base API error class."""
    status_code = 500
    message = "Internal server error"
    
    def __init__(self, message=None, status_code=None):
        if message:
            self.message = message
        if status_code:
            self.status_code = status_code

class ValidationError(APIError):
    status_code = 400
    message = "Validation error"

class NotFoundError(APIError):
    status_code = 404
    message = "Resource not found"

@app.errorhandler(APIError)
def handle_api_error(error):
    response = {
        'success': False,
        'error': {
            'code': error.__class__.__name__.upper(),
            'message': error.message
        },
        'timestamp': datetime.utcnow().isoformat()
    }
    return jsonify(response), error.status_code
```

## Frontend Development

### Component Development

#### Creating New Components

1. **Create the component file**:
```jsx
// src/components/NewComponent.jsx
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import './App.css'

export function NewComponent({ prop1, prop2, onAction }) {
  const [state, setState] = useState(null)
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>New Component</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Component content */}
      </CardContent>
    </Card>
  )
}
```

2. **Add to exports**:
```jsx
// src/components/index.js
export { NewComponent } from './NewComponent'
```

3. **Create tests**:
```jsx
// src/components/__tests__/NewComponent.test.jsx
import { render, screen } from '@testing-library/react'
import { NewComponent } from '../NewComponent'

describe('NewComponent', () => {
  test('renders correctly', () => {
    render(<NewComponent />)
    expect(screen.getByText('New Component')).toBeInTheDocument()
  })
})
```

### State Management

Use React hooks for local state and context for global state:

```jsx
// src/contexts/WorkflowContext.jsx
import { createContext, useContext, useReducer } from 'react'

const WorkflowContext = createContext()

const workflowReducer = (state, action) => {
  switch (action.type) {
    case 'SET_WORKFLOWS':
      return { ...state, workflows: action.payload }
    case 'ADD_WORKFLOW':
      return { ...state, workflows: [...state.workflows, action.payload] }
    default:
      return state
  }
}

export function WorkflowProvider({ children }) {
  const [state, dispatch] = useReducer(workflowReducer, {
    workflows: [],
    loading: false
  })
  
  return (
    <WorkflowContext.Provider value={{ state, dispatch }}>
      {children}
    </WorkflowContext.Provider>
  )
}

export const useWorkflow = () => {
  const context = useContext(WorkflowContext)
  if (!context) {
    throw new Error('useWorkflow must be used within WorkflowProvider')
  }
  return context
}
```

## Debugging

### Backend Debugging

#### Using Python Debugger
```python
import pdb

def problematic_function():
    data = get_data()
    pdb.set_trace()  # Debugger will stop here
    processed = process_data(data)
    return processed
```

#### Logging
```python
import logging

# Configure logging
logging.basicConfig(
    level=logging.WARNING,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def sync_data_room(room_id):
    logger.info(f"Starting sync for room {room_id}")
    try:
        result = perform_sync(room_id)
        logger.info(f"Sync completed successfully: {result}")
        return result
    except Exception as e:
        logger.error(f"Sync failed: {e}", exc_info=True)
        raise
```

### Frontend Debugging

#### Browser DevTools
- Use React Developer Tools extension
- Check Network tab for API calls
- Use Console for JavaScript errors
- Use Sources tab for breakpoints

#### Debug Logging
```jsx
const DEBUG = process.env.NODE_ENV === 'development'

const debugLog = (message, data) => {
  if (DEBUG) {
    console.log(`[DEBUG] ${message}`, data)
  }
}

export function DataRoomManager() {
  const [dataRooms, setDataRooms] = useState([])
  
  const fetchDataRooms = async () => {
    debugLog('Fetching data rooms...')
    try {
      const response = await api.getDataRooms()
      debugLog('Data rooms fetched:', response.data)
      setDataRooms(response.data)
    } catch (error) {
      console.error('Failed to fetch data rooms:', error)
    }
  }
  
  return (
    // Component JSX
  )
}
```

## Performance Optimization

### Backend Performance

#### Database Optimization
```python
# Use database indexes
class DataRoom(db.Model):
    __tablename__ = 'data_rooms'
    
    id = db.Column(db.String(50), primary_key=True)
    provider = db.Column(db.String(50), nullable=False, index=True)
    last_sync_at = db.Column(db.DateTime, index=True)

# Use query optimization
def get_recent_syncs():
    return DataRoom.query.filter(
        DataRoom.last_sync_at > datetime.utcnow() - timedelta(hours=24)
    ).options(
        db.joinedload(DataRoom.documents)
    ).all()
```

#### Caching
```python
from flask_caching import Cache

cache = Cache(app, config={'CACHE_TYPE': 'redis'})

@cache.memoize(timeout=300)
def get_data_room_stats(room_id):
    """Cache expensive calculations."""
    return calculate_stats(room_id)
```

### Frontend Performance

#### Code Splitting
```jsx
import { lazy, Suspense } from 'react'

const WorkflowInterface = lazy(() => import('./components/WorkflowInterface'))

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WorkflowInterface />
    </Suspense>
  )
}
```

#### Memoization
```jsx
import { memo, useMemo, useCallback } from 'react'

export const DataRoomCard = memo(({ dataRoom, onSync }) => {
  const formattedDate = useMemo(() => {
    return dataRoom.last_sync_at 
      ? new Date(dataRoom.last_sync_at).toLocaleDateString()
      : 'Never'
  }, [dataRoom.last_sync_at])
  
  const handleSync = useCallback(() => {
    onSync(dataRoom.id)
  }, [dataRoom.id, onSync])
  
  return (
    // Component JSX
  )
})
```

## Deployment

### Development Deployment

Use Docker Compose for consistent development environments:

```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  backend:
    build: ./backend
    volumes:
      - ./backend:/app
    environment:
      - FLASK_ENV=development
    ports:
      - "5000:5000"
    
  frontend:
    build: ./frontend
    volumes:
      - ./frontend:/app
      - /app/node_modules
    ports:
      - "3000:3000"
```

### Production Deployment

See the [Deployment Guide](deployment.md) for detailed production deployment instructions.

## Contributing

### Pull Request Process

1. **Create a feature branch**:
```bash
git checkout -b feature/new-feature
```

2. **Make your changes**:
- Follow coding standards
- Add tests for new functionality
- Update documentation

3. **Test your changes**:
```bash
# Backend tests
cd backend && pytest

# Frontend tests
cd frontend && pnpm test

# Integration tests
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```

4. **Submit pull request**:
- Use descriptive title and description
- Reference related issues
- Request review from maintainers

### Code Review Guidelines

#### For Reviewers
- Check code quality and standards compliance
- Verify test coverage
- Test functionality manually if needed
- Provide constructive feedback

#### For Contributors
- Respond to feedback promptly
- Make requested changes
- Update tests and documentation as needed
- Rebase and squash commits before merging

## Troubleshooting

### Common Development Issues

#### Backend Issues

**Import Errors**:
```bash
# Ensure PYTHONPATH is set correctly
export PYTHONPATH=/path/to/web-app/backend:$PYTHONPATH
```

**Database Connection Issues**:
```python
# Check database URL format
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

**OAuth Integration Issues**:
- Verify redirect URIs match exactly
- Check client ID and secret configuration
- Ensure proper scopes are requested

#### Frontend Issues

**Module Resolution Errors**:
```javascript
// Check vite.config.js alias configuration
export default {
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
}
```

**CORS Issues**:
- Verify backend CORS configuration
- Check API endpoint URLs
- Ensure proper headers are sent

### Getting Help

1. **Check Documentation**: Review relevant documentation sections
2. **Search Issues**: Look for similar issues in the repository
3. **Create Issue**: If problem persists, create a detailed issue report
4. **Community Support**: Join our development community for help

## Resources

### Documentation
- [API Reference](api.md)
- [Deployment Guide](deployment.md)
- [Agent System](../AGENTS.md)

### External Resources
- [Flask Documentation](https://flask.palletsprojects.com/)
- [React Documentation](https://react.dev/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Development Tools
- [Visual Studio Code](https://code.visualstudio.com/)
- [PyCharm](https://www.jetbrains.com/pycharm/)
- [Postman](https://www.postman.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)

