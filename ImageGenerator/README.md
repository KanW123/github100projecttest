# ImageGenerator

画像生成・管理ツール（NanoBanana Pro API使用）

## セットアップ

1. `.env.example` を `.env` にコピー
2. APIキーを設定

```bash
cp .env.example .env
# .env を編集してAPIキーを設定
```

## 使い方

### 画像生成

```bash
cd ImageGenerator/scripts
./generate.sh "かわいい猫のイラスト"
./generate.sh "風景画" "landscape.png"
```

### 画像リサイズ

```bash
python resize.py ../generated/2025-01-04/img_001.png 512x512
```

### プロジェクト紐付け

```bash
./link_to_project.sh ../generated/2025-01-04/img_001.png project-005
```

## フォルダ構成

```
ImageGenerator/
├── .env                # APIキー（gitignore済み）
├── .env.example        # 設定テンプレート
├── config.json         # 設定ファイル
├── index.json          # 全画像のインデックス
├── scripts/            # スクリプト群
│   ├── generate.sh     # 画像生成
│   ├── resize.py       # リサイズ
│   └── link_to_project.sh  # プロジェクト紐付け
├── generated/          # 生成物（日付別）
│   └── YYYY-MM-DD/
│       ├── img_001.png
│       └── img_001_meta.json
└── processed/          # 加工物（日付別）
    └── YYYY-MM-DD/
```

## メタデータ形式

各画像に `_meta.json` が作成されます：

```json
{
  "prompt": "生成プロンプト",
  "created": "2025-01-04T10:30:00Z",
  "file": "img_001.png",
  "size": "1024x1024",
  "usedIn": ["project-005", "project-012"]
}
```
