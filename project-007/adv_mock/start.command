#!/bin/bash
cd "$(dirname "$0")"
lsof -ti:8009 | xargs kill -9 2>/dev/null
echo "シナリオモック: http://localhost:8009"
python3 -m http.server 8009 &
sleep 1
open http://localhost:8009
echo "Enterで停止..."
read
lsof -ti:8009 | xargs kill -9 2>/dev/null
