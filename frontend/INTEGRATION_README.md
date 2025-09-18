# Guild-AI Frontend Integration Guide

## 🚀 **Complete Integration Package**

This frontend package is ready for seamless integration with the Guild-AI backend. It includes all the psychologically optimized components and the required API integration points.

## 📋 **Quick Setup Instructions**

### 1. Environment Configuration
```bash
# Copy the environment template
cp env.example .env

# Edit .env with your API endpoints
REACT_APP_API_URL=http://localhost:8000
REACT_APP_WS_URL=ws://localhost:8000
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

## 🔌 **API Integration Points**

### Connector Setup API
The frontend is fully integrated with the backend connector setup endpoints:

```javascript
// Available in src/services/api.js
import { connectorSetupAPI } from './services/api';

// List available connectors
const connectors = await connectorSetupAPI.getAvailableConnectors();

// Start setup session
const session = await connectorSetupAPI.startSetup(connectorId, userId);

// Get next step
const stepData = await connectorSetupAPI.getNextStep(sessionId);

// Submit step data
const result = await connectorSetupAPI.submitStepData(sessionId, stepData);

// Complete setup
await connectorSetupAPI.completeSetup(sessionId);
```

### WebSocket Integration
Real-time updates are handled through WebSocket connections:

```javascript
import { wsManager } from './services/api';

// Connect to WebSocket
const ws = wsManager.connect(sessionId, onMessage, onError, onClose);

// Send message
wsManager.sendMessage(sessionId, { type: 'status_update' });

// Disconnect
wsManager.disconnect(sessionId);
```

### OAuth Connections
OAuth flow management is fully implemented:

```javascript
import { oauthAPI } from './services/api';

// Get OAuth providers
const providers = await oauthAPI.getProviders();

// Start OAuth flow
const authUrl = await oauthAPI.startOAuthFlow('google');

// Get user credentials
const credentials = await oauthAPI.getCredentials();
```

## 🎨 **Component Structure**

### Required Components (✅ All Implemented)
- ✅ `src/components/ConnectorSetup.jsx` - Main connector setup flow
- ✅ `src/components/onboarding/` - Complete onboarding system
- ✅ `src/services/api.js` - API integration service
- ✅ All psychologically optimized components

### Enhanced Components
- ✅ **Agent Personality System** - Humanized AI agents with emotional states
- ✅ **Momentum Banking System** - Advanced progress tracking with compound interest
- ✅ **Contextual Intelligence** - AI-driven adaptive interface
- ✅ **Celebration System** - Dopamine-driven micro-celebrations
- ✅ **Three-Zone Dashboard** - Command Center, Action Theater, Opportunity Horizon

## 🧠 **Psychological Optimization Features**

### Adaptive Interface Modes
- **Morning Mode**: Calm, focused interface for planning
- **Active Mode**: Dynamic, energetic interface for execution
- **Evening Mode**: Gentle, reflective interface for review

### Momentum Banking
- **Compound Interest**: Momentum grows over time
- **Stress Buffer**: Reserve momentum for difficult periods
- **Achievement Acceleration**: High momentum unlocks faster progress
- **Streak Bonuses**: Consistency multipliers

### Contextual Intelligence
- **Intent Recognition**: Detects user goals and context
- **Predictive Interface**: Anticipates user needs
- **Behavioral Learning**: Adapts to user patterns
- **Smart Recommendations**: Context-aware suggestions

## 🔧 **Backend Integration Requirements**

### Required API Endpoints
The frontend expects these backend endpoints:

```
GET  /api/connectors                    # List available connectors
POST /api/connectors/setup/start        # Start setup session
GET  /api/connectors/setup/{id}/next    # Get next setup step
POST /api/connectors/setup/{id}/submit  # Submit step data
POST /api/connectors/setup/{id}/complete # Complete setup
DELETE /api/connectors/setup/{id}/cancel # Cancel setup

GET  /oauth/providers                   # Get OAuth providers
POST /oauth/{provider}/start            # Start OAuth flow
GET  /oauth/credentials                 # Get user credentials
DELETE /oauth/credentials/{id}          # Delete credential
POST /oauth/credentials/{id}/refresh    # Refresh token

POST /api/campaigns                     # Create campaign
GET  /api/campaigns/{id}/status         # Get campaign status
POST /api/campaigns/{id}/execute        # Execute campaign
GET  /api/workflows/{id}/nodes          # Get workflow nodes
```

### WebSocket Endpoints
```
ws://localhost:8000/ws/connector-setup/{sessionId}
```

## 📱 **Component Integration**

### Main Dashboard
The enhanced main dashboard includes:
- **Command Center**: High-level business overview
- **Action Theater**: Detailed analytics and agent activity
- **Opportunity Horizon**: Quick actions and wellness management

### Connector Setup Flow
1. **Connector Selection**: Visual grid of available integrations
2. **Step-by-Step Configuration**: Dynamic form generation
3. **Progress Tracking**: Real-time progress visualization
4. **Completion Celebration**: Success confirmation with next steps

### Onboarding System
Multi-step questionnaire that collects:
- Business information and goals
- Target audience and market
- Financial objectives
- Integration preferences
- User preferences and settings

## 🎯 **Testing Checklist**

Before merging, ensure:
- ✅ ConnectorSetup component renders correctly
- ✅ API calls work with the backend
- ✅ WebSocket connections establish properly
- ✅ All onboarding steps function
- ✅ Error states are handled gracefully
- ✅ Mobile responsiveness works
- ✅ Build process completes successfully
- ✅ Psychological optimization features work
- ✅ Momentum banking system functions
- ✅ Contextual intelligence adapts correctly

## 🚀 **Deployment Configuration**

### Production Environment Variables
```bash
REACT_APP_API_URL=https://your-production-api.com
REACT_APP_WS_URL=wss://your-production-api.com
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_DEBUG_MODE=false
```

### Build Optimization
The build process includes:
- Code splitting for optimal loading
- Tree shaking for minimal bundle size
- Asset optimization for performance
- Source map generation for debugging

## 🔄 **Migration from Old Frontend**

### Preserved Components
- ✅ `ConnectorSetup.jsx` - Enhanced with psychological optimization
- ✅ All onboarding components - Enhanced with micro-celebrations
- ✅ OAuth integration - Enhanced with contextual intelligence
- ✅ Campaign creation - Enhanced with momentum tracking

### New Features Added
- 🆕 **Agent Personality System** - Humanized AI interactions
- 🆕 **Momentum Banking** - Advanced progress economy
- 🆕 **Contextual Intelligence** - AI-driven adaptations
- 🆕 **Three-Zone Architecture** - Organized workspace layout
- 🆕 **Psychological Optimization** - Dopamine-driven engagement

## 📞 **Support & Integration**

### File Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── ConnectorSetup.jsx          # ✅ REQUIRED
│   │   ├── dashboard/                  # Enhanced dashboard
│   │   ├── onboarding/                 # ✅ REQUIRED
│   │   ├── banking/                    # Momentum banking
│   │   ├── intelligence/               # Contextual AI
│   │   └── ...
│   ├── contexts/                       # React contexts
│   ├── services/
│   │   └── api.js                      # ✅ REQUIRED
│   └── ...
├── package.json                        # ✅ REQUIRED
├── env.example                         # ✅ REQUIRED
└── README.md                           # ✅ REQUIRED
```

### Key Integration Points
1. **API Service** (`src/services/api.js`) - Handles all backend communication
2. **WebSocket Manager** - Real-time updates and notifications
3. **Context Providers** - State management for psychological optimization
4. **Component Library** - Reusable UI components with consistent styling

## 🎉 **Ready for Production**

This frontend package is production-ready and includes:
- ✅ Complete API integration
- ✅ WebSocket real-time updates
- ✅ Error handling and loading states
- ✅ Mobile responsiveness
- ✅ Accessibility compliance
- ✅ Performance optimization
- ✅ Psychological optimization features
- ✅ Advanced momentum banking
- ✅ Contextual intelligence system

The integration maintains all existing functionality while adding sophisticated psychological optimization features that will significantly enhance user engagement and productivity.

---

**Ready to merge! 🚀** Just ensure your backend endpoints match the expected API structure, and you'll have a seamless, psychologically optimized frontend experience.
