# CLAUDE.md - プロジェクト開発ガイド

## ⚠️ 最初に確認: 今どの環境にいる？

このプロジェクトは **2つの実行環境** がある。作業開始時に必ず確認すること。

### 環境の判別方法
```bash
# これを実行して判別
pwd && whoami && echo $GITHUB_ACTIONS
```

| 環境 | 判別結果 | APIキーの場所 |
|------|----------|---------------|
| **ローカル (Mac)** | `/Users/kanwatanabe/...`, `GITHUB_ACTIONS`が空 | `ImageGenerator/.env` |
| **Claude Code Web** | `/home/user/...`, `gh`コマンドなし | GitHub Token経由 |
| **GitHub Actions** | `/home/runner/...`, `GITHUB_ACTIONS=true` | `${{ secrets.XXX }}` |

### 環境別の注意点

#### ローカル環境
- APIキー読み込み: `source ImageGenerator/.env`
- 直接curlでAPI叩ける
- ファイル保存先: `~/Downloads/` など自由

#### Claude Code Web環境
- `gh`コマンドは**使えない**（インストールされていない）
- GitHub Secretsには直接アクセス不可
- **GitHub Token (PAT)** があれば、curlでワークフローをトリガー可能
- 生成された画像は `git pull` で取得
- 画像ファイルはReadツールで表示可能（ただし環境による）

#### GitHub Actions環境
- APIキー読み込み: ワークフローで `env:` に設定
- 生成物はArtifactとしてアップロードするか、リポジトリにコミット
- 一時ファイルは `/tmp/` を使用

---

## プロジェクト概要
100 Projects Hub - 100個のWebプロジェクトを管理するハブサイト

---

## 素材生成（画像・動画）

### 🚀 Claude Code Web から生成する場合

**重要**: Claude Code Web環境では `gh` コマンドが使えない。代わりに **curl + GitHub Token** を使う。

#### 前提: GitHub Token (PAT) の準備

1. GitHub → Settings → Developer settings → Personal access tokens → **Tokens (classic)**
2. "Generate new token (classic)" をクリック
3. スコープで以下にチェック:
   - ✅ `repo` (Full control)
   - ✅ `workflow` (Update GitHub Action workflows)
4. トークンをコピーして、チャットで渡す

#### 画像生成 (curl版)
```bash
curl -X POST \
  -H "Authorization: token YOUR_GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/KanW123/github100projecttest/actions/workflows/generate-image.yml/dispatches \
  -d '{"ref":"main","inputs":{"prompt":"プロンプトをここに","provider":"openai"}}'
```

#### 動画生成 (curl版)
```bash
curl -X POST \
  -H "Authorization: token YOUR_GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/KanW123/github100projecttest/actions/workflows/generate-video.yml/dispatches \
  -d '{"ref":"main","inputs":{"prompt":"プロンプトをここに"}}'
```

#### 実行状況確認 (curl版)
```bash
curl -s -H "Authorization: token YOUR_GITHUB_TOKEN" \
  "https://api.github.com/repos/KanW123/github100projecttest/actions/runs?per_page=1" | \
  grep -E '"status"|"conclusion"'
```

#### 生成完了後
```bash
git pull origin main  # 生成されたファイルを取得
ls ImageGenerator/generated/$(date +%Y-%m-%d)/  # 確認
```

#### 画像の確認方法
- **この環境で見る**: Claudeに「画像を表示して」と頼む（Readツールで画像表示可能）
- **GitHub で見る**: リポジトリの画像ファイルをブラウザで開く

---

### ローカル / gh コマンドが使える環境から生成する場合

```bash
# 画像生成
gh workflow run "Generate Image" \
  -f prompt="プロンプトをここに" \
  -f provider="openai"

# 動画生成
gh workflow run "Generate Video (SORA)" \
  -f prompt="プロンプトをここに"

# 実行状況確認
gh run list --workflow="Generate Image" --limit 1
```

### ローカルから直接API呼び出しする場合
詳細なAPIドキュメントは以下を参照:
→ **[ImageGenerator/GENERATION_GUIDE.md](./ImageGenerator/GENERATION_GUIDE.md)**

**クイックリファレンス:**
- 通常画像: OpenAI `gpt-image-1.5` (Medium)
- 4x4モーション: Gemini
- 動画: SORA `sora-2`
- 画像参照パラメータ: `input_reference`（※`image`ではない）

---

## 技術スタック
- フロントエンド: Vanilla JavaScript
- ホスティング: Cloudflare Pages
- CI/CD: GitHub Actions（claude系ブランチ自動マージ）

---

## APIキー管理

### ローカル
```bash
cd ImageGenerator
source .env
echo $OPENAI_API_KEY  # 確認
```

### GitHub Actions
```yaml
env:
  OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
  GOOGLE_API_KEY: ${{ secrets.GOOGLE_API_KEY }}
```

### 登録済みSecrets
| Secret名 | 用途 |
|----------|------|
| `OPENAI_API_KEY` | OpenAI (GPT Image / SORA) |
| `GOOGLE_API_KEY` | Google Gemini / Imagen |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Pages |

---

## 知見の蓄積場所

| カテゴリ | ファイル |
|----------|----------|
| 画像・動画生成 | `ImageGenerator/GENERATION_GUIDE.md` |
| プロジェクト全体 | この `CLAUDE.md` |

新しい知見を得たら、該当ファイルに追記していくこと。
