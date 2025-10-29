#!/bin/bash

# Quick Security Deployment for Guild AI
# Run this script to deploy security features immediately

echo "🛡️  Quick Security Deployment"
echo "============================="

# Make the main deployment script executable and run it
chmod +x deploy_security.sh
./deploy_security.sh

echo ""
echo "🎯 Next Steps:"
echo "=============="
echo "1. Start your secure backend:"
echo "   ./start_secure_backend.sh"
echo ""
echo "2. Start your secure frontend:"
echo "   ./start_secure_frontend.sh"
echo ""
echo "3. Monitor security:"
echo "   ./monitor_security.sh"
echo ""
echo "4. Check security alerts:"
echo "   ./security_alerts.sh"
echo ""
echo "🛡️  Your Guild AI system is now secure!"
