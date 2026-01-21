# 画像・動画生成 API ガイド

## 目次
1. [環境別セットアップ](#環境別セットアップ)
2. [OpenAI 画像生成 (GPT Image)](#openai-画像生成-gpt-image)
3. [OpenAI 動画生成 (SORA)](#openai-動画生成-sora)
4. [Google Gemini 画像生成](#google-gemini-画像生成)
5. [運用ルール](#運用ルール)

---

## 環境別セットアップ

### ローカル環境 (Mac)

```bash
# 1. APIキー読み込み
cd /Users/kanwatanabe/Desktop/github100projecttest/ImageGenerator
source .env

# 2. 確認
echo $OPENAI_API_KEY | head -c 20  # 先頭20文字だけ表示

# 3. 画像リサイズ（Mac標準コマンド）
sips -z 720 1280 input.png --out resized.png

# 4. 生成物の保存先
# → ~/Downloads/ や ImageGenerator/generated/ など自由
```

### GitHub Actions環境

```yaml
# ワークフローファイル (.github/workflows/xxx.yml)
jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Generate image
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          GOOGLE_API_KEY: ${{ secrets.GOOGLE_API_KEY }}
        run: |
          # APIキーは自動で環境変数に入る
          curl -X POST "https://api.openai.com/v1/images/generations" \
            -H "Authorization: Bearer $OPENAI_API_KEY" \
            ...

      # 画像リサイズ（ImageMagick使用、sipsはMac専用）
      - name: Resize image
        run: |
          sudo apt-get install -y imagemagick
          convert input.png -resize 1280x720! resized.png

      # 生成物をArtifactとして保存
      - uses: actions/upload-artifact@v4
        with:
          name: generated-media
          path: ./generated/
```

### 環境差異まとめ

| 項目 | ローカル (Mac) | GitHub Actions |
|------|---------------|----------------|
| APIキー読み込み | `source .env` | `${{ secrets.XXX }}` |
| 画像リサイズ | `sips` | `convert` (ImageMagick) |
| jq | 要インストール (`brew install jq`) | プリインストール済み |
| 生成物保存 | ローカルファイル | Artifact or コミット |
| 実行時間制限 | なし | 6時間/ジョブ |

---

## OpenAI 画像生成 (GPT Image)

### モデル一覧（2025年12月時点）
| モデル | 特徴 | 価格/枚 |
|--------|------|---------|
| `gpt-image-1.5` | 最新・4倍高速・推奨 | Low:$0.02 / Med:$0.07 / High:$0.19 |
| `gpt-image-1-mini` | コスト重視（80%安い） | $0.005〜 |
| `gpt-image-1` | 初代GPT Image | $0.02〜 |
| `dall-e-3` | 旧世代（2026/5廃止予定） | $0.04〜0.12 |

### エンドポイント
```
POST https://api.openai.com/v1/images/generations
```

### curlサンプル
```bash
curl -X POST "https://api.openai.com/v1/images/generations" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-image-1.5",
    "prompt": "プロンプト",
    "size": "1024x1024",
    "quality": "medium"
  }'
```

### 品質オプション
- `low` - 高速・低コスト
- `medium` - バランス（**デフォルト推奨**）
- `high` - 高品質・高コスト

---

## 画像参照生成（Image-to-Image）

既存の画像を参照して、新しい画像を生成する方法。

### エンドポイント
```
POST https://api.openai.com/v1/images/edits
```

### GitHub Actionsワークフローで使う場合

#### ローカル / ghコマンドが使える環境
```bash
gh workflow run "Generate Image" \
  -f prompt="同じスタイルで別のキャラクター" \
  -f provider="openai" \
  -f reference_image="ImageGenerator/generated/2026-01-21/img_xxx.png" \
  -f input_fidelity="high"
```

#### Claude Code Web（curl版）
```bash
curl -X POST \
  -H "Authorization: token YOUR_GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/KanW123/github100projecttest/actions/workflows/generate-image.yml/dispatches \
  -d '{
    "ref": "main",
    "inputs": {
      "prompt": "同じスタイルで別のキャラクター",
      "provider": "openai",
      "reference_image": "ImageGenerator/generated/2026-01-21/img_xxx.png",
      "input_fidelity": "high"
    }
  }'
```

### パラメータ
| パラメータ | 必須 | 説明 |
|------------|------|------|
| `prompt` | ✅ | 生成プロンプト |
| `provider` | ✅ | `openai` |
| `reference_image` | ❌ | リポジトリ内の参照画像パス |
| `input_fidelity` | ❌ | `high`（特徴維持）/ `low`（自由度高） |

### 参照画像パスの確認方法
```bash
# 最新の生成画像を確認
ls -la ImageGenerator/generated/$(date +%Y-%m-%d)/
```

### 使い分け
| モード | reference_image | 用途 |
|--------|----------------|------|
| テキストのみ | 空 | 新規画像生成 |
| 画像参照 | パス指定 | スタイル維持・バリエーション生成 |

### 注意点
- 参照画像は**リポジトリ内に存在する**必要あり
- パスは`ImageGenerator/generated/YYYY-MM-DD/xxx.png`形式
- `input_fidelity=high`で元画像の特徴をより強く維持

### ローカル環境での直接API呼び出し

GitHub Actionsを経由せず、ローカルから直接APIを叩く方法。

```bash
# 1. 参照画像を/tmpにコピー（パス問題回避）
cp project-004/assets/characters/char1_idle.png /tmp/ref.png

# 2. API呼び出し（APIキーは直接埋め込む）
curl -s -X POST "https://api.openai.com/v1/images/edits" \
  -H "Authorization: Bearer YOUR_OPENAI_API_KEY" \
  -F "model=gpt-image-1" \
  -F "image[]=@/tmp/ref.png" \
  -F "prompt=This character doing a straight punch, same outfit and style" \
  -F "size=1024x1024" > /tmp/result.json

# 3. base64デコードして保存
cat /tmp/result.json | python3 -c "
import json,sys,base64
d=json.load(sys.stdin)
open('/tmp/output.png','wb').write(base64.b64decode(d['data'][0]['b64_json']))
"
```

### モデル選択

| 用途 | モデル | エンドポイント |
|------|--------|----------------|
| **参照画像生成** | `gpt-image-1` | `/v1/images/edits` |
| 通常のテキスト生成 | `gpt-image-1.5` | `/v1/images/generations` |

⚠️ 参照画像生成（edits）では `gpt-image-1` を使う。`gpt-image-1.5` は edits エンドポイント非対応。

### トラブルシューティング（実際に遭遇したエラー）

#### エラー1: `permission denied`
```
(eval):1: permission denied:
```
**原因**: `source .env && curl ...` の形式がClaude Code環境で動かない
**解決**: 環境変数を使わず、APIキーを直接コマンドに埋め込む

#### エラー2: `blank argument where content is expected`
```
curl: option : blank argument where content is expected
```
**原因**: 環境変数 `$OPENAI_API_KEY` が展開されていない（空文字）
**解決**: 同上、APIキーを直接埋め込む

#### エラー3: `invalid_api_key`
```json
{
  "error": {
    "message": "Incorrect API key provided: ''.",
    "type": "invalid_request_error",
    "code": "invalid_api_key"
  }
}
```
**原因**: `OPENAI_API_KEY=xxx curl ...` の形式でも変数が渡らない
**解決**: `-H "Authorization: Bearer sk-proj-xxxxx..."` のように直接書く

#### 成功パターン（これをコピペすればOK）
```bash
# 1. 参照画像を/tmpにコピー
cp 元画像.png /tmp/ref.png

# 2. APIキーを直接埋め込んでcurl実行
curl -s -X POST "https://api.openai.com/v1/images/edits" \
  -H "Authorization: Bearer sk-proj-ここにAPIキーを直接貼る" \
  -F "model=gpt-image-1" \
  -F "image[]=@/tmp/ref.png" \
  -F "prompt=This character doing a straight punch, same outfit and style" \
  -F "size=1024x1024" > /tmp/result.json

# 3. 結果確認（エラーチェック）
cat /tmp/result.json | head -c 500

# 4. 成功していればbase64デコード
cat /tmp/result.json | python3 -c "
import json,sys,base64
d=json.load(sys.stdin)
open('/tmp/output.png','wb').write(base64.b64decode(d['data'][0]['b64_json']))
"

# 5. 画像確認
ls -la /tmp/output.png
```

#### なぜ /tmp にコピーするのか
- 長いパス（`/Users/xxx/Desktop/github100projecttest/...`）だと問題が起きることがある
- `/tmp/ref.png` のような短いパスなら確実

### プロンプトのコツ

キャラクターの一貫性を保つためのプロンプト例：

```
✅ 良い例:
"This character in a powerful straight punch pose, same outfit and style, fighting game sprite, transparent background"

"This character doing a high kick, same costume colors and design"

❌ 悪い例:
"A girl punching"  ← キャラクター特徴の指定がない
"Red hair fighter" ← 曖昧すぎる
```

**ポイント:**
- `This character` で参照画像のキャラを指す
- `same outfit and style` で服装維持を明示
- 具体的なポーズを指定
- `transparent background` で背景透過（ゲーム素材用）

### 成功事例

**格ゲーキャラのポーズ生成** (2026-01-21)
- 参照: `char1_idle.png`（赤道着+白帯+赤ズボン）
- プロンプト: `This character doing a straight punch, same outfit style`
- 結果: 服装の色・デザインが維持されたパンチポーズ

参照なしで生成した場合は白ズボン+黒帯になっていたが、参照画像ありで赤ズボン+白帯を維持できた。

### 制限事項

- **実在の人物の写真**は編集不可（OpenAIポリシー）
- イラスト・キャラクターは問題なし
- 顔の特徴は `input_fidelity="high"` で維持されやすい

---

## OpenAI 動画生成 (SORA)

### モデル一覧
| モデル | 特徴 |
|--------|------|
| `sora-2` | 高速・実験向け（デフォルト） |
| `sora-2-pro` | 高品質・本番向け（高コスト） |

### エンドポイント
| 操作 | メソッド | URL |
|------|----------|-----|
| 動画生成開始 | POST | `/v1/videos` |
| ステータス確認 | GET | `/v1/videos/{video_id}` |
| 動画ダウンロード | GET | `/v1/videos/{video_id}/content` |

### 解像度オプション
- `1280x720` - 横長（16:9）
- `720x1280` - 縦長（9:16）
- `1792x1024` - ワイド横長
- `1024x1792` - ワイド縦長

### 長さオプション
- `4` 秒（デフォルト）
- `8` 秒
- `12` 秒

### 画像参照（Image-to-Video）
**パラメータ: `input_reference`**

画像を渡すと、その画像が**最初のフレームとして作用**し、見た目をガイドできる。

⚠️ **重要**: 画像の解像度は出力動画の`size`と一致させる必要あり

### curlサンプル（テキストのみ）
```bash
curl -X POST "https://api.openai.com/v1/videos" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F "model=sora-2" \
  -F "prompt=プロンプト" \
  -F "size=1280x720"
```

### curlサンプル（画像参照付き）
```bash
# 画像を動画解像度にリサイズ
sips -z 720 1280 input.png --out resized.png

# 動画生成リクエスト
curl -X POST "https://api.openai.com/v1/videos" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F "model=sora-2" \
  -F "prompt=プロンプト" \
  -F "input_reference=@resized.png" \
  -F "size=1280x720"
```

### レスポンス例（生成開始）
```json
{
  "id": "video_xxxxx",
  "status": "queued",
  "progress": 0
}
```

### ステータス遷移
`queued` → `in_progress` → `completed` / `failed`

### 処理時間目安
- 4秒動画: 約1〜2分
- 8秒動画: 約2〜3分
- 12秒動画: 約3〜5分

### 完全フロー（シェルスクリプト）
```bash
#!/bin/bash
# SORA動画生成 → 待機 → ダウンロード

# 1. 生成開始
RESPONSE=$(curl -s -X POST "https://api.openai.com/v1/videos" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F "model=sora-2" \
  -F "prompt=$1" \
  -F "size=1280x720")

VIDEO_ID=$(echo "$RESPONSE" | jq -r '.id')
echo "Video ID: $VIDEO_ID"

# 2. ステータス監視
while true; do
  STATUS=$(curl -s "https://api.openai.com/v1/videos/$VIDEO_ID" \
    -H "Authorization: Bearer $OPENAI_API_KEY" | jq -r '.status')
  echo "Status: $STATUS"

  if [ "$STATUS" = "completed" ]; then break; fi
  if [ "$STATUS" = "failed" ]; then echo "Failed!"; exit 1; fi
  sleep 10
done

# 3. ダウンロード
curl -s "https://api.openai.com/v1/videos/$VIDEO_ID/content" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -o "output_$VIDEO_ID.mp4"

echo "Downloaded: output_$VIDEO_ID.mp4"
```

---

## Google Gemini 画像生成

### モデル一覧
| モデル | 特徴 |
|--------|------|
| `gemini-2.5-flash-image` | 高速・低コスト（1024px） |
| `gemini-3-pro-image` | 高品質・4Kまで対応 |
| `imagen-4-fast` | 速度重視 |
| `imagen-4-ultra` | 最高品質 |

### エンドポイント
```
POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent
```

### 認証
```
?key=$GOOGLE_API_KEY
```

---

## 運用ルール

### デフォルト設定（config.json）
- **通常の画像生成**: OpenAI `gpt-image-1.5` (Medium品質)
- **4x4分割モーション画像**: Gemini使用（高速生成が適している）

### APIキー
| 用途 | 環境変数 |
|------|----------|
| OpenAI (画像+SORA) | `OPENAI_API_KEY` |
| Google (Gemini/Imagen) | `GOOGLE_API_KEY` |

### ローカル実行
```bash
cd ImageGenerator
source .env
```

### GitHub Actions ワークフロー

**Claude Code Web / モバイルから使う場合はこちら**

#### 利用可能なワークフロー
| ワークフロー | 用途 | 実行時間目安 |
|--------------|------|--------------|
| `Generate Image` | 画像生成 | 〜30秒 |
| `Generate Video (SORA)` | 動画生成 | 1〜5分 |

#### 画像生成
```bash
gh workflow run "Generate Image" \
  -f prompt="A cute robot in pixel art style" \
  -f provider="openai"
```

**パラメータ:**
- `prompt` (必須): 画像生成プロンプト
- `provider`: `openai` (デフォルト) / `gemini`

#### 動画生成 (SORA)
```bash
gh workflow run "Generate Video (SORA)" \
  -f prompt="A robot walking in cyberpunk city" \
  -f size="1280x720" \
  -f model="sora-2"
```

**パラメータ:**
- `prompt` (必須): 動画生成プロンプト
- `size`: `1280x720` / `720x1280` / `1792x1024` / `1024x1792`
- `model`: `sora-2` (高速) / `sora-2-pro` (高品質)

#### 実行状況確認
```bash
# 最新の実行状況
gh run list --workflow="Generate Image" --limit 1
gh run list --workflow="Generate Video (SORA)" --limit 1

# 詳細ログ
gh run view <run_id> --log
```

#### 生成物の取得
```bash
git pull
ls ImageGenerator/generated/$(date +%Y-%m-%d)/
```

生成されたファイルは自動的にリポジトリにコミットされる。

---

## トラブルシューティング

### SORA: Unknown parameter エラー
- ❌ `image` → ⭕ `input_reference`
- ❌ `duration` → ⭕ パラメータなし（デフォルト4秒）
- ❌ `/v1/videos/generations` → ⭕ `/v1/videos`
- ❌ `/v1/videos/{id}/download` → ⭕ `/v1/videos/{id}/content`

### 画像参照が効かない
- 画像解像度が`size`と一致しているか確認
- 対応フォーマット: `jpeg`, `png`, `webp`

### ステータスがqueuedのまま
- 混雑時は数分待つ
- 5分以上変化なければAPIの問題の可能性
