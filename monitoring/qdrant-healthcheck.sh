#!/bin/sh

# Simple health check for Qdrant service
# Check if service is responding on HTTP endpoint

# Try HTTP health check
if wget -q --spider http://localhost:6333/healthz; then
    echo "Health check passed"
    exit 0
else
    echo "Health check failed - service not responding on HTTP endpoint"
    exit 1
fi