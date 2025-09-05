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
    && rm -rf /var/lib/apt/lists/*

# Set environment variables
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1
ENV OPENCV_VIDEOIO_PRIORITY_MSMF=0
ENV DISPLAY=:99

# Copy all project files into the container
COPY . .

# Install Python dependencies from the api_server directory
RUN pip install --no-cache-dir -r ./api_server/requirements.txt

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Run the application
CMD ["uvicorn", "api_server.src.main:app", "--host", "0.0.0.0", "--port", "5000"]