#!/bin/bash

# BudgetPal Backend - Render Deployment Script
# This script helps you deploy your backend to Render

echo "🚀 BudgetPal Backend - Render Deployment Helper"
echo "=============================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    exit 1
fi

# Check if changes are committed
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  You have uncommitted changes. Please commit them first:"
    echo "   git add ."
    echo "   git commit -m 'Prepare for Render deployment'"
    echo ""
    read -p "Do you want to continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "✅ Git repository is ready"

# Check if render.yaml exists
if [ ! -f "render.yaml" ]; then
    echo "❌ render.yaml not found. Please make sure it exists in the root directory."
    exit 1
fi

echo "✅ render.yaml found"

# Check if backend directory exists
if [ ! -d "backend" ]; then
    echo "❌ backend directory not found. Please make sure your backend code is in the 'backend' folder."
    exit 1
fi

echo "✅ backend directory found"

# Check if package.json exists in backend
if [ ! -f "backend/package.json" ]; then
    echo "❌ backend/package.json not found."
    exit 1
fi

echo "✅ backend/package.json found"

echo ""
echo "🎯 Next Steps for Render Deployment:"
echo "===================================="
echo ""
echo "1. Push your code to GitHub:"
echo "   git remote add origin https://github.com/yourusername/yourrepo.git"
echo "   git push -u origin main"
echo ""
echo "2. Go to Render Dashboard:"
echo "   https://render.com/dashboard"
echo ""
echo "3. Create PostgreSQL Database:"
echo "   - Click 'New +' → 'PostgreSQL'"
echo "   - Choose 'Free' plan"
echo "   - Name: 'budgetpal-database'"
echo "   - Copy the DATABASE_URL"
echo ""
echo "4. Create Web Service:"
echo "   - Click 'New +' → 'Web Service'"
echo "   - Connect your GitHub repository"
echo "   - Choose your repository"
echo "   - Name: 'budgetpal-backend'"
echo "   - Environment: 'Node'"
echo "   - Build Command: 'cd backend && npm install'"
echo "   - Start Command: 'cd backend && npm start'"
echo "   - Plan: 'Free'"
echo ""
echo "5. Set Environment Variables:"
echo "   - NODE_ENV: production"
echo "   - DATABASE_URL: (paste from step 3)"
echo "   - JWT_SECRET: (generate a strong secret)"
echo "   - CORS_ORIGIN: (your frontend URL)"
echo ""
echo "6. Deploy:"
echo "   - Click 'Create Web Service'"
echo "   - Wait for deployment to complete"
echo ""
echo "7. Test your deployment:"
echo "   - Visit: https://your-app-name.onrender.com"
echo "   - Update test.rest with your Render URL"
echo ""
echo "📚 For detailed instructions, see RENDER_DEPLOYMENT.md"
echo ""
echo "🎉 Happy deploying!"
