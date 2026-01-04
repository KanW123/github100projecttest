#!/bin/bash
# 画像生成スクリプト
# 使い方: ./generate.sh "プロンプト" [出力ファイル名]
#
# 例:
#   ./generate.sh "かわいい猫のイラスト"
#   ./generate.sh "風景画" "landscape.png"

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# .envファイルを読み込み
if [ -f "$ROOT_DIR/.env" ]; then
    export $(cat "$ROOT_DIR/.env" | grep -v '^#' | xargs)
fi

# 引数チェック
if [ -z "$1" ]; then
    echo "エラー: プロンプトを指定してください"
    echo "使い方: ./generate.sh \"プロンプト\" [出力ファイル名]"
    exit 1
fi

PROMPT="$1"
TODAY=$(date +%Y-%m-%d)
TIMESTAMP=$(date +%H%M%S)

# 出力ディレクトリを作成
OUTPUT_DIR="$ROOT_DIR/generated/$TODAY"
mkdir -p "$OUTPUT_DIR"

# ファイル名を決定
if [ -z "$2" ]; then
    FILENAME="img_${TIMESTAMP}.png"
else
    FILENAME="$2"
fi

OUTPUT_PATH="$OUTPUT_DIR/$FILENAME"

# API呼び出し（NanoBanana Pro）
echo "画像を生成中: $PROMPT"

curl -s -X POST "https://api.nanobanana.pro/v1/generate" \
    -H "Authorization: Bearer $NANOBANA_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"prompt\": \"$PROMPT\", \"size\": \"1024x1024\"}" \
    -o "$OUTPUT_PATH"

# メタデータを保存
META_PATH="${OUTPUT_PATH%.png}_meta.json"
cat > "$META_PATH" << EOF
{
  "prompt": "$PROMPT",
  "created": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "file": "$FILENAME",
  "size": "1024x1024",
  "usedIn": []
}
EOF

echo "生成完了: $OUTPUT_PATH"
echo "メタデータ: $META_PATH"

# index.jsonを更新
INDEX_FILE="$ROOT_DIR/index.json"
if [ -f "$INDEX_FILE" ]; then
    # jqがあれば使う、なければ手動で追加を促す
    if command -v jq &> /dev/null; then
        TMP_FILE=$(mktemp)
        jq --arg file "generated/$TODAY/$FILENAME" \
           --arg prompt "$PROMPT" \
           --arg created "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
           '.images += [{"file": $file, "prompt": $prompt, "created": $created, "processed": [], "usedIn": []}] | .lastUpdated = $created' \
           "$INDEX_FILE" > "$TMP_FILE"
        mv "$TMP_FILE" "$INDEX_FILE"
        echo "index.json を更新しました"
    else
        echo "注意: jqがインストールされていないため、index.jsonは手動で更新してください"
    fi
fi
