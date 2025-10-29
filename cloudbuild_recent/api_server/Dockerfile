FROM python:3.11-slim

# Set working directory inside the container
WORKDIR /app

# Install minimal system dependencies for computer vision
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    curl \
    tesseract-ocr \
    tesseract-ocr-eng \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    libgomp1 \
    libgthread-2.0-0 \
    libgtk-3-0 \
    libavcodec-dev \
    libavformat-dev \
    libswscale-dev \
    libv4l-dev \
    libxvidcore-dev \
    libx264-dev \
    libjpeg-dev \
    libpng-dev \
    libtiff-dev \
    wget \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1
ENV OPENCV_VIDEOIO_PRIORITY_MSMF=0
ENV DISPLAY=:99

# Copy all project files into the container
COPY . .

# List contents to debug build context
RUN echo "Build context contents:" && ls -la /app

# Check if api_server directory exists and list its contents
RUN echo "Checking api_server directory:" && \
    if [ -d "./api_server" ]; then \
        echo "✅ api_server directory found"; \
        ls -la ./api_server; \
    else \
        echo "❌ api_server directory not found"; \
        echo "📁 Root directory contents:"; \
        ls -la /app; \
        echo "📁 Looking for entrypoint.sh in subdirectories:"; \
        find /app -name "entrypoint.sh" -type f 2>/dev/null || echo "No entrypoint.sh found"; \
        exit 1; \
    fi

# Create entrypoint script if it doesn't exist (fallback)
RUN if [ ! -f ./api_server/entrypoint.sh ]; then \
        echo "Creating fallback entrypoint script..."; \
        mkdir -p ./api_server; \
        echo '#!/bin/bash' > ./api_server/entrypoint.sh; \
        echo '# Fallback entrypoint script' >> ./api_server/entrypoint.sh; \
        echo 'echo "🚀 Guild-AI API Server - Starting..."' >> ./api_server/entrypoint.sh; \
        echo 'echo "📡 Server will start on port 5000"' >> ./api_server/entrypoint.sh; \
        echo 'echo "🌐 API will be available at http://0.0.0.0:5000"' >> ./api_server/entrypoint.sh; \
        echo 'exec uvicorn api_server.src.main:app --host 0.0.0.0 --port 5000 --workers 1 --timeout-keep-alive 30' >> ./api_server/entrypoint.sh; \
        chmod +x ./api_server/entrypoint.sh; \
        echo "✅ Fallback entrypoint created"; \
    fi

# Verify and set executable bit on entrypoint
RUN if [ -f ./api_server/entrypoint.sh ]; then \
        chmod +x ./api_server/entrypoint.sh && \
        echo "✅ Entrypoint found and made executable"; \
    else \
        echo "❌ Entrypoint not found at ./api_server/entrypoint.sh"; \
        echo "📁 Contents of api_server directory:"; \
        ls -la ./api_server; \
        echo "📁 Looking for entrypoint.sh in subdirectories:"; \
        find /app -name "entrypoint.sh" -type f 2>/dev/null || echo "No entrypoint.sh found"; \
        exit 1; \
    fi

# Install Python dependencies from the api_server directory
RUN pip install --no-cache-dir -r ./api_server/requirements.txt

# Copy frontend dist directory if it exists
RUN echo "🔍 Looking for frontend files..."; \
    echo "📁 Current directory contents:"; \
    ls -la .; \
    echo "📁 Looking for frontend directory:"; \
    find . -name "frontend" -type d 2>/dev/null || echo "No frontend directory found"; \
    echo "📁 Looking for dist directory:"; \
    find . -name "dist" -type d 2>/dev/null || echo "No dist directory found"; \
    if [ -d "./frontend/dist" ]; then \
        echo "✅ Frontend dist directory found, copying to container"; \
        mkdir -p /app/frontend/dist; \
        cp -r ./frontend/dist/* /app/frontend/dist/; \
        echo "📁 Frontend files copied:"; \
        ls -la /app/frontend/dist/; \
        echo "📁 Checking for index.html:"; \
        ls -la /app/frontend/dist/index.html || echo "index.html not found"; \
    elif [ -d "./dist" ]; then \
        echo "✅ Dist directory found in root, copying to container"; \
        mkdir -p /app/frontend/dist; \
        cp -r ./dist/* /app/frontend/dist/; \
        echo "📁 Frontend files copied:"; \
        ls -la /app/frontend/dist/; \
        echo "📁 Checking for index.html:"; \
        ls -la /app/frontend/dist/index.html || echo "index.html not found"; \
    else \
        echo "⚠️ No frontend dist directory found, will serve API only"; \
        echo "📁 Available directories:"; \
        ls -la ./; \
    fi

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Use entrypoint script to wait for dependencies
ENTRYPOINT ["./api_server/entrypoint.sh"]