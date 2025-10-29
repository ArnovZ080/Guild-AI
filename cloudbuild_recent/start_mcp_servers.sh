#!/bin/bash

# Start MCP Servers for Guild-AI
echo "🚀 Starting All 20 Guild-AI MCP Servers..."
echo "=========================================="

cd api_server/src/mcp

# Original 10 MCP Servers
echo "📱 Starting Social Media MCP Server..."
python social_media_mcp_server.py &
SOCIAL_PID=$!

echo "👥 Starting CRM MCP Server..."
python crm_mcp_server.py &
CRM_PID=$!

echo "💰 Starting Accounting MCP Server..."
python accounting_mcp_server.py &
ACCOUNTING_PID=$!

echo "📅 Starting Calendar MCP Server..."
python calendar_mcp_server.py &
CALENDAR_PID=$!

echo "🛒 Starting E-commerce MCP Server..."
python ecommerce_mcp_server.py &
ECOMMERCE_PID=$!

echo "📊 Starting Analytics MCP Server..."
python analytics_mcp_server.py &
ANALYTICS_PID=$!

echo "📋 Starting Project Management MCP Server..."
python project_management_mcp_server.py &
PROJECT_PID=$!

echo "💳 Starting Payments MCP Server..."
python payments_mcp_server.py &
PAYMENTS_PID=$!

echo "💬 Starting Communication MCP Server..."
python communication_mcp_server.py &
COMMUNICATION_PID=$!

echo "📧 Starting Email Marketing MCP Server..."
python email_marketing_mcp_server.py &
EMAIL_PID=$!

# Additional 10 MCP Servers (Categories 11-20)
echo "🎯 Starting Ad Platforms MCP Server..."
python ad_platforms_mcp_server.py &
AD_PID=$!

echo "🎧 Starting Support MCP Server..."
python support_mcp_server.py &
SUPPORT_PID=$!

echo "☁️ Starting Cloud Infrastructure MCP Server..."
python cloud_infrastructure_mcp_server.py &
CLOUD_PID=$!

echo "🤖 Starting AI Analytics MCP Server..."
python ai_analytics_mcp_server.py &
AI_PID=$!

echo "🧘 Starting Human-OS MCP Server..."
python human_os_mcp_server.py &
HUMAN_PID=$!

echo "🎨 Starting Design Media MCP Server..."
python design_media_mcp_server.py &
DESIGN_PID=$!

echo "🔍 Starting Intelligence MCP Server..."
python intelligence_mcp_server.py &
INTEL_PID=$!

echo "👔 Starting Recruitment MCP Server..."
python recruitment_mcp_server.py &
RECRUIT_PID=$!

echo "🔎 Starting SEO Tools MCP Server..."
python seo_tools_mcp_server.py &
SEO_PID=$!

echo "⚡ Starting Productivity MCP Server..."
python productivity_mcp_server.py &
PROD_PID=$!

echo ""
echo "✅ All 20 MCP Servers started:"
echo "   Social Media MCP: PID $SOCIAL_PID (Port 8001)"
echo "   CRM MCP: PID $CRM_PID (Port 8002)"
echo "   Accounting MCP: PID $ACCOUNTING_PID (Port 8003)"
echo "   Calendar MCP: PID $CALENDAR_PID (Port 8004)"
echo "   E-commerce MCP: PID $ECOMMERCE_PID (Port 8005)"
echo "   Analytics MCP: PID $ANALYTICS_PID (Port 8006)"
echo "   Project Management MCP: PID $PROJECT_PID (Port 8007)"
echo "   Payments MCP: PID $PAYMENTS_PID (Port 8008)"
echo "   Communication MCP: PID $COMMUNICATION_PID (Port 8009)"
echo "   Email Marketing MCP: PID $EMAIL_PID (Port 8010)"
echo "   Ad Platforms MCP: PID $AD_PID (Port 8011)"
echo "   Support MCP: PID $SUPPORT_PID (Port 8012)"
echo "   Cloud Infrastructure MCP: PID $CLOUD_PID (Port 8013)"
echo "   AI Analytics MCP: PID $AI_PID (Port 8014)"
echo "   Human-OS MCP: PID $HUMAN_PID (Port 8015)"
echo "   Design Media MCP: PID $DESIGN_PID (Port 8016)"
echo "   Intelligence MCP: PID $INTEL_PID (Port 8017)"
echo "   Recruitment MCP: PID $RECRUIT_PID (Port 8018)"
echo "   SEO Tools MCP: PID $SEO_PID (Port 8019)"
echo "   Productivity MCP: PID $PROD_PID (Port 8020)"

echo ""
echo "🔗 MCP Server URLs:"
echo "   Social Media: http://localhost:8001/mcp/tools"
echo "   CRM: http://localhost:8002/mcp/tools"
echo "   Accounting: http://localhost:8003/mcp/tools"
echo "   Calendar: http://localhost:8004/mcp/tools"
echo "   E-commerce: http://localhost:8005/mcp/tools"
echo "   Analytics: http://localhost:8006/mcp/tools"
echo "   Project Management: http://localhost:8007/mcp/tools"
echo "   Payments: http://localhost:8008/mcp/tools"
echo "   Communication: http://localhost:8009/mcp/tools"
echo "   Email Marketing: http://localhost:8010/mcp/tools"
echo "   Ad Platforms: http://localhost:8011/mcp/tools"
echo "   Support: http://localhost:8012/mcp/tools"
echo "   Cloud Infrastructure: http://localhost:8013/mcp/tools"
echo "   AI Analytics: http://localhost:8014/mcp/tools"
echo "   Human-OS: http://localhost:8015/mcp/tools"
echo "   Design Media: http://localhost:8016/mcp/tools"
echo "   Intelligence: http://localhost:8017/mcp/tools"
echo "   Recruitment: http://localhost:8018/mcp/tools"
echo "   SEO Tools: http://localhost:8019/mcp/tools"
echo "   Productivity: http://localhost:8020/mcp/tools"

echo ""
echo "🛑 To stop all servers, run:"
echo "   kill $SOCIAL_PID $CRM_PID $ACCOUNTING_PID $CALENDAR_PID $ECOMMERCE_PID $ANALYTICS_PID $PROJECT_PID $PAYMENTS_PID $COMMUNICATION_PID $EMAIL_PID $AD_PID $SUPPORT_PID $CLOUD_PID $AI_PID $HUMAN_PID $DESIGN_PID $INTEL_PID $RECRUIT_PID $SEO_PID $PROD_PID"

# Keep script running
wait