# AI画像生成 知見まとめ

## 概要
Claude Code Web環境からAI画像生成を行う際の知見。

---

## 生成方法

### Claude Code Web からの生成フロー
```
1. GitHub Token (PAT) を準備
2. curl で GitHub Actions ワークフローをトリガー
3. git pull で生成画像を取得
4. Pillow/numpy で後処理（透過、合成など）
```

### ワークフロートリガー
```bash
curl -X POST \
  -H "Authorization: token YOUR_GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/OWNER/REPO/actions/workflows/generate-image.yml/dispatches \
  -d '{"ref":"main","inputs":{"prompt":"プロンプト","provider":"openai"}}'
```

### 実行状況確認
```bash
curl -s -H "Authorization: token YOUR_TOKEN" \
  "https://api.github.com/repos/OWNER/REPO/actions/runs?per_page=3" | \
  python3 -c "import json,sys;[print(r['name'],'|',r['status'],'|',r['conclusion'] or 'running') for r in json.load(sys.stdin)['workflow_runs']]"
```

---

## タイル素材生成のベストプラクティス

### 問題: AI生成タイルの位置ズレ
AI画像生成では、参照画像を入れても **ダイヤモンドベースの位置が揃わない**。

### 解決策: コンポジット方式

**ベースタイル**（草、道路、水など）と**オブジェクト**（家、木など）を分離生成し、Pythonで合成する。

```
ベースタイル（位置統一）
├── grass_tile.png   ← AI生成、白背景透過処理
├── road_tile.png
└── water_tile.png

オブジェクト（透明背景）
├── house_object.png ← AI生成（ベースなし）
└── tree_object.png
```

### オブジェクト生成プロンプト例
```
isometric cute small cottage house with red roof, chimney with smoke,
cozy style, NO ground NO base NO grass, floating object only,
transparent background, white background behind object
```

ポイント:
- `NO ground NO base NO grass` - ベースを生成させない
- `floating object only` - オブジェクトのみ
- `transparent/white background` - 背景を白に

---

## 後処理（Python）

### 必要ライブラリ
```bash
pip3 install Pillow numpy --quiet
```

### 白背景の透明化
```python
from PIL import Image
import numpy as np

img = Image.open("image.png").convert("RGBA")
data = np.array(img)

# 白（RGB > 250）を透明に
white_mask = (data[:,:,0] > 250) & (data[:,:,1] > 250) & (data[:,:,2] > 250)
data[white_mask, 3] = 0

result = Image.fromarray(data)
result.save("transparent.png")
```

### 既に透過済み画像のコンテンツ検出
```python
# alpha > 10 のピクセルを検出
non_transparent = data[:,:,3] > 10
rows = np.any(non_transparent, axis=1)
cols = np.any(non_transparent, axis=0)
rmin, rmax = np.where(rows)[0][[0, -1]]
cmin, cmax = np.where(cols)[0][[0, -1]]

# クロップ
cropped = Image.fromarray(data[rmin:rmax+1, cmin:cmax+1])
```

### オブジェクトをベースに合成
```python
# ベースタイル読み込み
base = Image.open("grass_tile.png").convert("RGBA")

# オブジェクト読み込み・クロップ・スケール
obj = Image.open("house_object.png").convert("RGBA")
obj_scaled = obj.resize((new_w, new_h), Image.Resampling.LANCZOS)

# 合成（位置計算は後述）
composite = base.copy()
composite.paste(obj_scaled, (x, y), obj_scaled)  # 第3引数=マスク
composite.save("house_tile.png")
```

---

## トラブルシューティング

### ワークフロー失敗（Commit and push エラー）
- **原因**: claudeブランチとmainの同時更新による競合
- **対処**: もう一度トリガーすれば大抵成功する

### 403エラー（Resource not accessible）
- **原因**: トークンの権限不足
- **対処**: GitHub Token に `repo` と `workflow` スコープが必要

### 画像の白背景が残る
- **原因**: 透過処理の閾値が合っていない
- **対処**: `> 245` や `> 250` など閾値を調整

---

## コスト参考
- OpenAI `gpt-image-1.5` Medium: 約 $0.04/枚
