#!/bin/bash

echo "=========================================="
echo "Starting JANTEC ERP Development Server"
echo "=========================================="
echo ""

# Check if dev server is running
if ! pgrep -f "vite.*--port 3000" > /dev/null; then
    echo "Starting Vite dev server..."
    npm run dev -- --host 0.0.0.0 --port 3000 > /tmp/vite.log 2>&1 &
    sleep 3
fi

echo "✅ Dev server running on http://localhost:3000"
echo ""
echo "Creating public URL..."
echo ""

# Use localtunnel
lt --port 3000 2>&1 | tee /tmp/tunnel-output.log

