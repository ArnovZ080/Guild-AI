"""
Django Settings for Celery Beat Integration

This module provides Django settings needed for django-celery-beat
to manage scheduled tasks and periodic workflows.
"""

import os
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'django-insecure-development-key-change-in-production')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DJANGO_DEBUG', 'True').lower() == 'true'

ALLOWED_HOSTS = ['*']  # Configure appropriately for production

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django_celery_beat',
    'django_rq',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'api_server.src.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'api_server.src.wsgi.application'

# Database
# Database Configuration
# Check for Cloud SQL (Cloud Run) or local development

CLOUDSQL_CONNECTION_NAME = os.getenv('CLOUDSQL_CONNECTION_NAME')

if CLOUDSQL_CONNECTION_NAME:
    # Cloud Run / Cloud SQL configuration
    # Use Unix socket for Cloud SQL Proxy
    
    # For Cloud Run, password comes from Secret Manager via the service account
    # The actual password retrieval is handled by the Cloud SQL Auth Proxy
    # We can use a placeholder or fetch from Secret Manager if needed
    db_password = os.getenv('POSTGRES_PASSWORD', 'placeholder')
    
    # Try to get from Secret Manager if available
    try:
        from google.cloud import secretmanager
        client = secretmanager.SecretManagerServiceClient()
        secret_name = os.getenv('DB_SECRET_NAME', 'db-root-password')
        project_id = os.getenv('GOOGLE_CLOUD_PROJECT')
        if project_id and secret_name:
            name = f"projects/{project_id}/secrets/{secret_name}/versions/latest"
            response = client.access_secret_version(request={"name": name})
            db_password = response.payload.data.decode("UTF-8")
    except Exception as e:
        # If Secret Manager access fails, use environment variable
        pass
    
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'HOST': f'/cloudsql/{CLOUDSQL_CONNECTION_NAME}',
            'NAME': os.getenv('POSTGRES_DB', 'workflow_db'),
            'USER': os.getenv('POSTGRES_USER', 'postgres'),
            'PASSWORD': db_password,
            'PORT': '5432',
        }
    }
else:
    # Local development configuration
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.getenv('POSTGRES_DB', 'workflow_db'),
            'USER': os.getenv('POSTGRES_USER', 'postgres'),
            'PASSWORD': os.getenv('POSTGRES_PASSWORD', 'password'),
            'HOST': os.getenv('POSTGRES_HOST', 'db'),
            'PORT': os.getenv('POSTGRES_PORT', '5432'),
        }
    }

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Celery Configuration
CELERY_BROKER_URL = os.getenv('REDIS_URL', 'redis://redis:6379/0')
CELERY_RESULT_BACKEND = os.getenv('REDIS_URL', 'redis://redis:6379/0')

# Celery Beat Configuration
CELERY_BEAT_SCHEDULER = 'django_celery_beat.schedulers:DatabaseScheduler'

# Celery Task Configuration
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TIMEZONE = TIME_ZONE
CELERY_ENABLE_UTC = True

# Celery Beat Schedule (Default schedules)
CELERY_BEAT_SCHEDULE = {
    # These will be overridden by database-stored schedules
    'test-hello': {
        'task': 'api_server.src.celery_app.hello',
        'schedule': 60.0,  # Every minute for testing
    },
}

# Django RQ Configuration
import json

# Get RQ_QUEUES from environment variable or use default
rq_queues_env = os.getenv('RQ_QUEUES')
if rq_queues_env:
    try:
        RQ_QUEUES = json.loads(rq_queues_env)
    except json.JSONDecodeError:
        # Fallback to default if JSON parsing fails
        RQ_QUEUES = {
            'default': {
                'HOST': os.getenv('REDIS_HOST', 'redis'),
                'PORT': int(os.getenv('REDIS_PORT', 6379)),
                'DB': 0,
            }
        }
else:
    # Default configuration
    RQ_QUEUES = {
        'default': {
            'HOST': os.getenv('REDIS_HOST', 'redis'),
            'PORT': int(os.getenv('REDIS_PORT', 6379)),
            'DB': 0,
        }
    }
