#!/bin/bash

# Deploy script for Armbian server
echo "🚀 Starting deployment..."

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install Node.js if not installed
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    apt install nodejs -y
fi

# Install PostgreSQL if not installed
if ! command -v psql &> /dev/null; then
    echo "📦 Installing PostgreSQL..."
    apt install postgresql postgresql-contrib -y
    systemctl start postgresql
    systemctl enable postgresql
fi

# Install PM2 if not installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
fi

# Install Nginx if not installed
if ! command -v nginx &> /dev/null; then
    echo "📦 Installing Nginx..."
    apt install nginx -y
    systemctl start nginx
    systemctl enable nginx
fi

# Create project directory
echo "📁 Creating project directory..."
mkdir -p /var/www/banhang-web
cd /var/www/banhang-web

# Clone or update project
if [ -d ".git" ]; then
    echo "🔄 Updating project..."
    git pull origin main
else
    echo "📥 Cloning project..."
    # Replace with your actual Git repository URL
    git clone [YOUR-GIT-REPO] .
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment file
echo "⚙️ Setting up environment..."
cp env.production .env.local

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗄️ Running database migrations..."
npx prisma db push

# Build the application
echo "🏗️ Building application..."
npm run build

# Setup PM2
echo "🔄 Setting up PM2..."
pm2 delete banhang-web 2>/dev/null || true
pm2 start npm --name "banhang-web" -- start
pm2 save
pm2 startup

echo "✅ Deployment completed!"
echo "🌐 Your app should be running on http://[ARMBIAN-IP]:3000"
