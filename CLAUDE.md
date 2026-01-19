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
| **GitHub Actions** | `/home/runner/...`, `GITHUB_ACTIONS=true` | `${{ secrets.XXX }}` |

### 環境別の注意点

#### ローカル環境
- APIキー読み込み: `source ImageGenerator/.env`
- 直接curlでAPI叩ける
- ファイル保存先: `~/Downloads/` など自由

#### GitHub Actions環境
- APIキー読み込み: ワークフローで `env:` に設定
- 生成物はArtifactとしてアップロードするか、リポジトリにコミット
- 一時ファイルは `/tmp/` を使用

---

## プロジェクト概要
100 Projects Hub - 100個のWebプロジェクトを管理するハブサイト

---

## 素材生成（画像・動画）
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
