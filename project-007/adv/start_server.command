#!/bin/bash
cd "$(dirname "$0")"

# 既存のサーバーを終了
lsof -ti:8008 | xargs kill -9 2>/dev/null

echo "================================================"
echo "  九龍城の時間商人 - ADVゲームサーバー"
echo "  http://localhost:8008"
echo "================================================"

# サーバー起動
python3 -m http.server 8008 &
sleep 1

# ブラウザで開く
open http://localhost:8008

echo ""
echo "Enterキーでサーバーを停止..."
read

# 終了時にサーバーを止める
lsof -ti:8008 | xargs kill -9 2>/dev/null
echo "サーバーを停止しました。"
