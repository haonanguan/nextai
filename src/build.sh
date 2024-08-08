#!/bin/bash

# Install dependencies and build the frontend
npm install
npm run build

# Navigate to the backend directory and install dependencies
cd server
npm install

# Return to the root directory
cd ..