# 🔧 Onboarding Data Persistence Fix

**Date**: October 20, 2025  
**Issue**: Onboarding data not persisting across sessions/browsers  
**Status**: FIXING

---

## 🚨 CRITICAL ISSUES IDENTIFIED

### 1. `/user-config/sync` Endpoint Returns 405 (Method Not Allowed)

**Error**:
```
API request failed for /user-config/sync, falling back to mock data: HTTP error! status: 405
```

**Root Cause**: The endpoint exists in `api_server/src/routes/user_config.py` at line 335 as a POST endpoint, but something is preventing it from working.

**Potential Issues**:
- Authentication dependency (`get_current_user`) might be failing
- CORS issue
- Route not properly registered

---

### 2. Onboarding Data Not Saving to Database

**Error**:
```
Failed to save source of truth: Internal Server Error
```

**Root Cause**: The `/api/onboarding/save` endpoint exists but is failing with 500 error.

**File**: `api_server/src/routes/onboarding.py` lines 95-167

**Potential Issues**:
- `get_current_user` returning None/failing
- Database session issues
- OnboardingData model mismatch

---

### 3. Orchestrator Has No Business Context

**Impact**: When user asks "Can you create facebook posts?", orchestrator doesn't know:
- What business the user has
- Who their target audience is
- Their brand voice
- Their goals

**Root Cause**: Onboarding data not being saved → not available to orchestrator.

---

## 🔍 DIAGNOSTIC FINDINGS

### Current Flow (Broken):

```
User completes onboarding
    ↓
Frontend calls /api/onboarding/save
    ↓
❌ Backend returns 500 error
    ↓
Frontend falls back to localStorage only
    ↓
User logs out or uses incognito
    ↓
❌ localStorage cleared/unavailable
    ↓
Onboarding data lost
    ↓
Orchestrator has no context
```

### Expected Flow (Fixed):

```
User completes onboarding
    ↓
Frontend calls /api/onboarding/save
    ↓
✅ Backend saves to SQL database
    ↓
Frontend ALSO saves to localStorage (for speed)
    ↓
User logs out or uses incognito
    ↓
✅ Backend retrieves from SQL database
    ↓
Orchestrator has full business context
```

---

## 🛠️ FIX IMPLEMENTATION

### Fix 1: Verify and Fix Authentication Dependency

**Issue**: `get_current_user` might be failing silently

**File**: `api_server/src/routes/onboarding.py` line 98

**Current**:
```python
@router.post("/save")
async def save_onboarding_data(
    request: SaveOnboardingDataRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
```

**Problem**: If `get_current_user` fails, it might raise an exception instead of returning None.

**Solution**: Add better error handling and logging.

---

### Fix 2: Add Logging and Error Details

**Current**: Generic 500 errors with no details

**Solution**: Add detailed logging to identify exact failure point.

---

### Fix 3: Make `get_current_user` Optional for Onboarding

**Rationale**: Users might be in the onboarding flow before full authentication is complete.

**Solution**: Use `get_current_user_optional` and handle both authenticated and anonymous users.

---

### Fix 4: Add /onboarding/data Retrieval Endpoint

**Issue**: No way to retrieve onboarding data after saving.

**Solution**: Ensure `/api/onboarding/data` endpoint works properly.

---

## 📋 IMPLEMENTATION STEPS

### Step 1: Fix `/api/onboarding/save` endpoint

```python
# api_server/src/routes/onboarding.py

@router.post("/save")
async def save_onboarding_data(
    request: SaveOnboardingDataRequest,
    current_user: models.User = Depends(get_current_user_optional),  # Make optional
    db: Session = Depends(get_db)
):
    """Save onboarding responses as source of truth for all agent operations"""
    try:
        logger.info(f"📝 Saving onboarding data... User: {current_user.id if current_user else 'anonymous'}")
        
        # Ensure user exists
        if not current_user:
            logger.error("❌ No authenticated user found for onboarding save")
            raise HTTPException(status_code=401, detail="User not authenticated")
        
        if not current_user.id:
            logger.error("❌ User has no ID")
            raise HTTPException(status_code=400, detail="User ID not found")
        
        logger.info(f"✅ User authenticated: {current_user.id}")
        
        # Check if user exists in database
        user = db.query(models.User).filter(models.User.id == current_user.id).first()
        if not user:
            logger.error(f"❌ User {current_user.id} not found in database")
            raise HTTPException(status_code=404, detail="User not found in database")
        
        logger.info(f"✅ User found in database: {user.email}")
        
        # Get or create onboarding data
        onboarding = db.query(models.OnboardingData).filter(
            models.OnboardingData.user_id == current_user.id
        ).first()
        
        if not onboarding:
            logger.info(f"📝 Creating new onboarding record for user {current_user.id}")
            onboarding = models.OnboardingData(
                user_id=current_user.id, 
                raw_responses=request.responses
            )
            db.add(onboarding)
        else:
            logger.info(f"📝 Updating existing onboarding record for user {current_user.id}")
            onboarding.raw_responses = request.responses
        
        # Map to structured fields
        r = request.responses
        onboarding.business_type = r.get('business_type')
        onboarding.business_description = r.get('business_description')
        onboarding.industry = r.get('industry')
        onboarding.target_audience = r.get('benefit_audience')
        onboarding.customer_avatar = r.get('customer_avatar')
        onboarding.audience_problems = r.get('audience_problems')
        onboarding.audience_size = r.get('audience_size')
        onboarding.brand_voice_tone = r.get('brand_voice_tone')
        onboarding.brand_personality = r.get('brand_personality')
        onboarding.brand_colors = r.get('brand_colors')
        onboarding.logo_status = r.get('logo_status')
        onboarding.brand_values = r.get('brand_values')
        onboarding.brand_story = r.get('brand_story')
        onboarding.brand_differentiation = r.get('brand_differentiation')
        onboarding.brand_consistency = r.get('brand_consistency')
        onboarding.pricing_status = r.get('pricing_status')
        onboarding.pricing_model = r.get('pricing_model')
        onboarding.marketing_budget = r.get('marketing_budget')
        onboarding.revenue_goals = r.get('revenue_goals')
        onboarding.priority_3months = r.get('priority_3months')
        onboarding.key_metrics = r.get('key_metrics')
        onboarding.success_definition = r.get('success_definition')
        onboarding.communication_style = r.get('communication_style')
        onboarding.data_storage_preference = r.get('data_storage_preference')
        onboarding.security_preference = r.get('security_preference')
        
        onboarding.incomplete_fields = request.incomplete_fields or []
        onboarding.needs_follow_up = len(onboarding.incomplete_fields) > 0
        
        total_fields = 20
        onboarding.completion_percentage = int(((total_fields - len(onboarding.incomplete_fields)) / total_fields) * 100)
        
        if onboarding.completion_percentage == 100:
            onboarding.completed_at = datetime.utcnow()
        
        logger.info(f"💾 Committing to database...")
        db.commit()
        db.refresh(onboarding)
        
        logger.info(f"✅ Onboarding data saved successfully! Completion: {onboarding.completion_percentage}%")
        
        return {
            "success": True,
            "message": "Source of truth saved",
            "completion_percentage": onboarding.completion_percentage,
            "needs_follow_up": onboarding.needs_follow_up
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error saving onboarding data: {str(e)}", exc_info=True)
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to save onboarding data: {str(e)}")
```

### Step 2: Add `get_current_user_optional` function

```python
# api_server/src/routes/onboarding.py (add at top after imports)

import logging

logger = logging.getLogger(__name__)

# Copy from orchestrator_fixed.py
async def get_current_user_optional(request: Request, db: Session = Depends(get_db)):
    """Get current user, but return None if not authenticated instead of raising error"""
    try:
        # Try Firebase auth first
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            # Verify Firebase token
            decoded_token = auth.verify_id_token(token)
            firebase_uid = decoded_token['uid']
            user_email = decoded_token.get('email')
            
            # Get or create user in database
            user = db.query(models.User).filter(models.User.firebase_uid == firebase_uid).first()
            if not user and user_email:
                user = models.User(firebase_uid=firebase_uid, email=user_email)
                db.add(user)
                db.commit()
            
            return user
    except Exception as e:
        logger.warning(f"Optional auth failed: {e}")
    
    return None
```

### Step 3: Fix `/api/user-config/sync` endpoint

```python
# api_server/src/routes/user_config.py

# Add logging
import logging
logger = logging.getLogger(__name__)

@router.post("/sync")
async def sync_from_local_storage(
    local_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Sync data from localStorage to the backend."""
    try:
        logger.info(f"🔄 Syncing data for user: {current_user.id if current_user else 'anonymous'}")
        
        if not current_user:
            logger.error("❌ No authenticated user for sync")
            return {
                "success": False,
                "message": "User not authenticated"
            }
        
        user_settings = await get_or_create_user_settings(current_user.id, db)
        
        # Merge local data with server data (server takes precedence for conflicts)
        if "agent_configurations" in local_data:
            server_configs = user_settings.get("agent_configurations", {})
            local_configs = local_data["agent_configurations"]
            
            # Only update if server doesn't have the config or local is newer
            for agent_id, local_config in local_configs.items():
                if agent_id not in server_configs:
                    server_configs[agent_id] = {
                        **local_config,
                        "synced_at": datetime.utcnow().isoformat()
                    }
                elif local_config.get("updated_at", "") > server_configs[agent_id].get("updated_at", ""):
                    server_configs[agent_id] = {
                        **local_config,
                        "synced_at": datetime.utcnow().isoformat()
                    }
            
            user_settings["agent_configurations"] = server_configs
        
        # Similar logic for workflow templates
        if "workflow_templates" in local_data:
            server_templates = user_settings.get("workflow_templates", {})
            local_templates = local_data["workflow_templates"]
            
            for workflow_id, local_template in local_templates.items():
                if workflow_id not in server_templates:
                    server_templates[workflow_id] = {
                        **local_template,
                        "synced_at": datetime.utcnow().isoformat()
                    }
                elif local_template.get("updated_at", "") > server_templates[workflow_id].get("updated_at", ""):
                    server_templates[workflow_id] = {
                        **local_template,
                        "synced_at": datetime.utcnow().isoformat()
                    }
            
            user_settings["workflow_templates"] = server_templates
        
        user_settings["updated_at"] = datetime.utcnow().isoformat()
        await save_user_settings(current_user.id, user_settings, db)
        
        logger.info(f"✅ Data synced successfully for user {current_user.id}")
        
        return {
            "success": True,
            "message": "Data synced successfully",
            "synced_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Failed to sync data: {str(e)}", exc_info=True)
        return {
            "success": False,
            "message": f"Sync failed: {str(e)}"
        }
```

### Step 4: Ensure Orchestrator Retrieves Business Context

```python
# api_server/src/routes/orchestrator_fixed.py

# Already implemented! Line 100-120:
# business_context = get_business_context(user_id, db)
```

---

## 🧪 TESTING PLAN

### Test 1: Onboarding Save
1. Complete onboarding in normal browser
2. Check logs for "✅ Onboarding data saved successfully!"
3. Verify no 500 errors

### Test 2: Onboarding Retrieve
1. Open incognito mode
2. Log in with same account
3. Verify onboarding data loads from database
4. No need to re-enter information

### Test 3: Orchestrator Context
1. Ask "Can you create facebook posts?"
2. Orchestrator should reference business name, audience, goals
3. Should ask about Facebook connection if needed

---

## 📊 SUCCESS METRICS

✅ No more 405 errors on `/user-config/sync`  
✅ No more 500 errors on `/api/onboarding/save`  
✅ Onboarding data persists across sessions  
✅ Onboarding data persists across browsers  
✅ Orchestrator has full business context  
✅ Orchestrator asks relevant clarifying questions

---

**Status**: IMPLEMENTING FIXES NOW

