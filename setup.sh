#!/bin/bash

# EtutAI by HercAI Setup Script
echo "Setting up EtutAI by HercAI..."

# Check if .env.local exists, if not create it from example
if [ ! -f .env.local ]; then
  if [ -f .env.example ]; then
    cp .env.example .env.local
    echo "Created .env.local from .env.example"
    echo "Please edit .env.local to add your OpenAI API key"
  else
    echo "Error: .env.example not found"
    exit 1
  fi
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the application
echo "Building the application..."
npm run build

echo "Setup complete! You can now run the application with:"
echo "npm start"
echo ""
echo "Or for development:"
echo "npm run dev" 