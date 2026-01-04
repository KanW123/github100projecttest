#!/bin/bash
# 画像をプロジェクトに紐付けるスクリプト
# 使い方: ./link_to_project.sh <画像パス> <プロジェクト名>
#
# 例:
#   ./link_to_project.sh ../generated/2025-01-04/img_001.png project-005

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

if [ -z "$1" ] || [ -z "$2" ]; then
    echo "エラー: 引数が不足しています"
    echo "使い方: ./link_to_project.sh <画像パス> <プロジェクト名>"
    exit 1
fi

IMAGE_PATH="$1"
PROJECT_NAME="$2"

# 画像が存在するか確認
if [ ! -f "$IMAGE_PATH" ]; then
    echo "エラー: 画像が見つかりません: $IMAGE_PATH"
    exit 1
fi

# メタデータファイルを更新
META_PATH="${IMAGE_PATH%.png}_meta.json"
if [ -f "$META_PATH" ]; then
    if command -v jq &> /dev/null; then
        TMP_FILE=$(mktemp)
        jq --arg project "$PROJECT_NAME" \
           '.usedIn += [$project] | .usedIn |= unique' \
           "$META_PATH" > "$TMP_FILE"
        mv "$TMP_FILE" "$META_PATH"
        echo "メタデータを更新しました: $META_PATH"
    else
        echo "注意: jqがインストールされていないため、メタデータは手動で更新してください"
    fi
else
    echo "警告: メタデータファイルが見つかりません: $META_PATH"
fi

# index.jsonも更新
INDEX_FILE="$ROOT_DIR/index.json"
if [ -f "$INDEX_FILE" ] && command -v jq &> /dev/null; then
    # 相対パスに変換
    REL_PATH=$(echo "$IMAGE_PATH" | sed "s|$ROOT_DIR/||")

    TMP_FILE=$(mktemp)
    jq --arg file "$REL_PATH" \
       --arg project "$PROJECT_NAME" \
       '(.images[] | select(.file == $file) | .usedIn) += [$project] |
        .images |= map(if .file == $file then .usedIn |= unique else . end)' \
       "$INDEX_FILE" > "$TMP_FILE"
    mv "$TMP_FILE" "$INDEX_FILE"
    echo "index.json を更新しました"
fi

echo "画像 $IMAGE_PATH を $PROJECT_NAME に紐付けました"
