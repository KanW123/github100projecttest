# VIDEO_GENERATION_GUIDE.md - 動画生成ガイド

## 概要

fal.ai APIを使用した動画生成のガイド。
主にKling 2.6 Pro（音声なし）でのStart-End動画生成を想定。

---

## 推奨モデル

### Start-End（2枚画像間の移動動画）

| モデル | 料金/秒 | 5秒 | 備考 |
|--------|--------|-----|------|
| **Kling 2.6 Pro (音声なし)** | $0.07 | $0.35 | **推奨** |
| Kling O1 | $0.084 | $0.42 | Start-End専用 |
| Kling 1.6 Pro | $0.095 | $0.475 | 違和感ある動き |
| Vidu Q1 | $0.10 | $0.50 | |

---

## fal.ai API 使用方法

### 環境変数
```bash
source /Users/kanwatanabe/Desktop/github100projecttest/ImageGenerator/.env
# FAL_KEY が設定される
```

### Kling 2.6 Pro Start-End 生成

```bash
curl -s -H "Authorization: Key $FAL_KEY" \
  "https://fal.run/fal-ai/kling-video/v2.6/pro/image-to-video" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "First-person camera in games, handheld camera, walking through the open doorway into the hallway",
    "image_url": "https://example.com/start.png",
    "end_image_url": "https://example.com/end.png",
    "duration": "5",
    "aspect_ratio": "16:9",
    "generate_audio": false
  }'
```

### パラメータ

| パラメータ | 説明 |
|-----------|------|
| `prompt` | 動作・カメラワークの説明 |
| `image_url` | 開始画像URL |
| `end_image_url` | 終了画像URL（**2.6では`end_image_url`**） |
| `duration` | 動画長（秒）: "5" or "10" |
| `aspect_ratio` | アスペクト比: "16:9", "9:16", "1:1" |
| `generate_audio` | **false必須**（trueだとend_image_url使用不可） |

### 注意事項

- **バージョン別パラメータ名**:
  - v1.6, v2.1, v2.5: `tail_image_url`
  - v2.6: `end_image_url`
- **音声生成とEnd画像は併用不可**: `generate_audio: false` が必須

---

## モデル別エンドポイント・パラメータ比較

### Start-End対応状況

| モデル | エンドポイント | Start-End対応 | End画像パラメータ |
|--------|---------------|---------------|-------------------|
| **Kling 2.6 Pro** | `/kling-video/v2.6/pro/image-to-video` | ✅ 同一エンドポイント | `end_image_url` |
| Kling 1.6/2.1/2.5 | `/kling-video/vX.X/pro/image-to-video` | ✅ 同一エンドポイント | `tail_image_url` |
| Kling O1 | `/kling-video/o1/image-to-video` | ✅ Start-End専用 | `end_image_url` |
| **Vidu Q1** | `/vidu/q1/start-end-to-video` | ✅ **別エンドポイント必須** | `end_image_url` |
| Vidu Q1 (単一画像) | `/vidu/q1/image-to-video` | ❌ Start画像のみ | - |

### Vidu Q1 Start-End 生成

**重要**: Viduは `/image-to-video` ではStart-End非対応。**`/start-end-to-video`** を使用すること。

```bash
curl -s -H "Authorization: Key $FAL_KEY" \
  "https://fal.run/fal-ai/vidu/q1/start-end-to-video" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "動作の説明",
    "start_image_url": "https://example.com/start.png",
    "end_image_url": "https://example.com/end.png",
    "aspect_ratio": "16:9"
  }'
```

| パラメータ | 説明 |
|-----------|------|
| `prompt` | 動作の説明（任意） |
| `start_image_url` | 開始画像URL（**`image_url`ではない**） |
| `end_image_url` | 終了画像URL |
| `aspect_ratio` | アスペクト比 |
| `movement_amplitude` | 動きの大きさ: "auto", "small", "medium", "large" |

### Viduの制限事項

- **コンテンツポリシー**: 生魚など食品画像がブロックされる場合あり
- **duration指定なし**: 動画長は自動（約4秒）

### Kling O1 Start-End 生成

**注意**: Kling O1は `image_url` ではなく **`start_image_url`** を使用。

```bash
curl -s -H "Authorization: Key $FAL_KEY" \
  "https://fal.run/fal-ai/kling-video/o1/image-to-video" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "@Image1 smoothly transitions to @Image2",
    "start_image_url": "https://example.com/start.png",
    "end_image_url": "https://example.com/end.png",
    "duration": 5
  }'
```

| パラメータ | 説明 |
|-----------|------|
| `prompt` | 動作説明。`@Image1`(Start), `@Image2`(End)で参照可能 |
| `start_image_url` | 開始画像URL（**`image_url`ではない**） |
| `end_image_url` | 終了画像URL |
| `duration` | 動画長: 5 or 10（**数値、文字列ではない**） |

### Kling O1の特徴

- **料金**: $0.112/秒（Kling 2.6の約1.6倍）
- **Start-End専用設計**: Dual-Keyframe Controlで高品質な遷移
- **@Image参照**: プロンプトで開始・終了画像を明示的に参照可能
- **aspect_ratio指定不可**: 入力画像のアスペクト比に依存

---

## プロンプト事例

### 移動動画テンプレート
```
First-person camera in games, handheld camera , [動作の説明]
```

### 成功事例

| 移動 | プロンプト | 備考 |
|------|-----------|------|
| 廊下→バー | `First-person camera in games, handheld camera, turning left to face a doorway, then walking through the open doorway into the bar, no hands visible` | 左回転 |
| バー→廊下 | `First-person camera in games, handheld camera, turning around 180 degrees, then walking through the open doorway into the corridor, no hands visible` | 振り返り |
| 廊下→階段下 | `First-person camera in games, handheld camera, turning right to face a staircase, then walking towards the stairs, no hands visible` | 右回転 |
| 階段下→階段上 | `First-person camera in games, handheld camera, looking up at the stairs then climbing up the staircase step by step, no hands visible` | 直進OK |
| 廊下→魚屋 | `First-person camera in games, handheld camera, turning right to face a fish shop entrance, then walking through the open doorway into the shop, no hands visible` | 右回転 |
| 魚屋→廊下 | `First-person camera in games, handheld camera, turning around 180 degrees, then walking through the open doorway into the corridor, no hands visible` | 振り返り |

---

## 動画チェック方法

### 1. 動画生成結果のチェック

**目的**: 生成された動画がStart-Endを正しくつないでいるか確認

**方法**: 1秒ごとにフレーム切り出し

```bash
# 例: 5秒動画の場合（開始+1秒ごと+終了 = 6枚）
ffmpeg -i output.mp4 -vf "select='eq(n\,0)+eq(n\,30)+eq(n\,60)+eq(n\,90)+eq(n\,120)+eq(n\,149)'" -vsync vfr frame_%02d.png
```

または簡易版:
```bash
# 1秒ごとに切り出し
ffmpeg -i output.mp4 -vf fps=1 frame_%02d.png
```

**チェックポイント**:
- frame_01: Start画像と一致するか
- frame_最後: End画像と一致するか
- 中間: 自然な遷移になっているか

### 2. プログラムデバッグ時のチェック

**目的**: ゲーム内で動画が正しく再生されているか確認

**方法**: ピクセル変化量が大きいフレームを抽出

```bash
# フレーム間の差分が大きい箇所を検出
ffmpeg -i output.mp4 -vf "select='gt(scene,0.3)',showinfo" -vsync vfr change_%02d.png 2>&1 | grep showinfo
```

**用途**:
- 動画の切り替わりポイント確認
- 不自然なジャンプの検出
- ループ再生時の継ぎ目チェック

---

## 生成時間の目安

| モデル | 5秒動画 |
|--------|--------|
| Kling 2.6 Pro | 5〜30分 |
| Kling 1.6 Pro | 4〜6分 |

※ fal.aiは有料APIなので公式無料版より高速

---

## 出力先

生成された動画は以下に保存:
```
VideoGenerator/generated/YYYY-MM-DD/
```

---

## 関連ドキュメント

- 画像生成: `ImageGenerator/GENERATION_GUIDE.md`
- プロジェクト素材: `project-007/ASSETS.md`

## 大量生成時の知見

### 移動パターンのバリエーション

複数の移動動画を生成する際、**同じパターンばかりだと違和感が出る**。
以下のバリエーションを意識して、動画ごとに変化をつける。

#### 回転方向
| パターン | プロンプト例 |
|----------|-------------|
| 右回り | `turning right to face...` |
| 左回り | `turning left into...` |
| 振り返り | `turning around 180 degrees...` |

#### 小道・経路のバリエーション
| パターン | プロンプト例 |
|----------|-------------|
| 横の小道 | `turning into a narrow side passage` |
| 影のある路地 | `turning left into a shadowy alley` |
| 半地下への階段 | `descending into a semi-basement corridor` |
| アーチ越し | `walking through an arched doorway` |

#### 移動ペース
| パターン | プロンプト例 |
|----------|-------------|
| ゆっくり歩く | `slowly walking at a relaxed pace` |
| 普通に歩く | `walking through` |
| 駆け足 | `quickly walking` |

**注意**: 5秒動画で「まっすぐ進む」だけだと、すごい勢いで前進してしまう。
内容が少ない移動は `slowly` や `at a relaxed pace` を追加推奨。

### 生成前チェックリスト（大量生成時）

- [ ] 右回り/左回りが偏っていないか
- [ ] 全部同じ「まっすぐ進む」になっていないか
- [ ] 実際の空間構造と合っているか（左に何もないのに左回りは不自然）
- [ ] 歩行ペースの指示が必要か（階段など内容が少ない場合）

---

## プロジェクト固有ルール

各プロジェクトには固有の動画生成ルールがある場合がある。
生成前に該当プロジェクトの `ASSETS.md` を確認すること。

例: `project-007/ASSETS.md` の「動画生成ルール」セクション
- ドアの扱い（開いている前提 / 自動ドア）
- 手が映らないようにする指示
- 世界観に合ったプロンプト表現
