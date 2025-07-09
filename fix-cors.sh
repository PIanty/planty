#!/bin/bash

# Check if the .env.development.local file exists
if [ -f apps/backend/.env.development.local ]; then
  # Replace https://localhost:8082 with http://localhost:8082 in the ORIGIN setting
  sed -i '' 's/ORIGIN=https:\/\/localhost:8082/ORIGIN=http:\/\/localhost:8082/g' apps/backend/.env.development.local
  echo "Updated ORIGIN in .env.development.local to use http instead of https"
else
  # Create the file if it doesn't exist
  echo "Creating new .env.development.local file..."
  cat > apps/backend/.env.development.local << EOF
NODE_ENV=development
PORT=3000
ORIGIN=http://localhost:8082
CREDENTIALS=true
LOG_FORMAT=dev
LOG_DIR=../logs
# Add your other environment variables below
# OPENAI_API_KEY=your_key_here
EOF
  echo "Created new .env.development.local file with correct ORIGIN setting"
fi

# Restart the backend server
echo "Now restart your backend server to apply the changes" 