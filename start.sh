#!/bin/bash

# HRMS Backend Startup Script

echo "🚀 Starting HRMS UK Payroll PoC Backend..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo " Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if pip is installed
if ! command -v pip &> /dev/null; then
    echo "pip is not installed. Please install pip first."
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo " Installing dependencies..."
pip install -r requirements.txt

# Create necessary directories
echo " Creating necessary directories..."
mkdir -p uploads/documents
mkdir -p exports/bacs

# Check if database exists, if not seed demo data
if [ ! -f "backend/hrms_poc.db" ]; then
    echo " Seeding demo data..."
    python scripts/seed_demo.py
else
    echo " Database already exists"
fi

# Start the application
echo " Starting FastAPI server..."
echo " API Documentation will be available at: http://localhost:8000/docs"
echo " Health check: http://localhost:8000/health"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

cd backend
python main.py 