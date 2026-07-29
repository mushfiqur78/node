#!/bin/bash

# Quick Vercel Deployment Script
# This script helps you deploy to Vercel quickly

echo "🚀 Real Estate API - Vercel Deployment"
echo "======================================="
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null
then
    echo "❌ Vercel CLI is not installed."
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
    echo "✅ Vercel CLI installed successfully!"
fi

# Run configuration test
echo ""
echo "🔍 Running pre-deployment checks..."
node test-vercel.js

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Pre-deployment checks failed. Please fix errors before deploying."
    exit 1
fi

echo ""
echo "✅ All checks passed!"
echo ""

# Ask user if they want to deploy
read -p "Do you want to deploy to Vercel now? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo ""
    echo "🚀 Starting deployment..."
    echo ""
    
    # Check if user wants production deployment
    read -p "Deploy to production? (y/n) " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]
    then
        echo "📦 Deploying to production..."
        vercel --prod
    else
        echo "📦 Deploying to preview..."
        vercel
    fi
    
    echo ""
    echo "✅ Deployment complete!"
    echo ""
    echo "📝 Don't forget to:"
    echo "   1. Set environment variables in Vercel dashboard"
    echo "   2. Update FRONTEND_URL and ALLOWED_ORIGINS"
    echo "   3. Test your API endpoints"
    echo ""
else
    echo ""
    echo "👍 Deployment cancelled."
    echo ""
    echo "When you're ready to deploy, run:"
    echo "   vercel          # for preview"
    echo "   vercel --prod   # for production"
    echo ""
fi
