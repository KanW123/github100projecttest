# Project-007: 九龍城探索 ADVムービーゲーム

## 概要

KowloonMovieTestの進化版プロジェクト。
元プロジェクトの素材・構成を把握し、さらに発展させる。

---

## コンセプト

### 世界観

**スチームパンク九龍城**
- 夜の九龍城砦をベースにしたスチームパンク世界
- 歯車、蒸気管、ネオン管が入り混じる混沌とした雰囲気
- 狭い路地、階段、迷路のような構造

### キャラクター設計方針

#### 命名ルール

**避けるべき命名**:
- 機能をそのまま名前にしたもの（例: カセ屋ムギ、蓄音坊主）
- 日本語＋英語の安易なミックス
- 「世界観の説明」感が出る名前
- 厨二感、気取った感じが出る名前

**目指す命名**:
- 香港・九龍城の住人が自然に持っていそうな名前
- 通り名・あだ名スタイル（阿強、老陳、肥仔、阿婆）
- その場所で長年暮らしてきた人間の名前
- キャラの見た目や職業からの安直な命名を避ける

#### 命名バランス

| キャラ種別 | 命名方針 | 例 |
|-----------|---------|-----|
| **メイン（2-3人）** | 中国語名OK | 阿婆 |
| **サブ・レギュラー** | 役職風の呼び名 | 時計屋、医者、郵便屋 |
| **モブ** | 名前なし | 店員、通行人 |

**中国語名が多いと覚えられない** → メインキャラでも少数に限定

#### 役職名とギャップ

**普通の役職名 × 異常な実態/ビジュアル**

スチームパンクに振り切らず、「普通の役職」と呼ばれてるのに実態が異常、というギャップでインパクトを出す。

| 呼び名 | 想像する「普通」 | 実際 |
|--------|----------------|------|
| 時計屋 | 時計を売ってる | 時計なんか売ってない。「時間」を扱ってる |
| 医者 | 白衣の先生 | 機械の体。人間も機械も直す |
| 郵便屋 | 手紙を届ける | 届けるのは「記憶」や「約束」 |
| 灯り番 | 街灯をつける | 灯りじゃなくて「何か」を見張ってる |
| 管理人 | 建物の管理 | 何を管理してるのか誰も知らない |

「え、それで〇〇屋なの？」という違和感。

#### ビジュアルと名前の関係

**重要な原則**: Midjourneyプロンプト（ビジュアル）と、キャラクター名は必ずしも一致しなくて良い

| 要素 | 説明 |
|------|------|
| **ビジュアル** | Midjourneyで生成。見た目の雰囲気重視 |
| **キャラ名** | 世界観に合った自然な名前。ビジュアルの直接的説明ではない |
| **キャラ設定** | ビジュアルから連想しつつも、名前とは独立して構築 |

**例**:
- ❌ トゲトゲした見た目 → 「トゲ丸」「棘の民」
- ✅ トゲトゲした見た目 → 「老陳」（実は優しい古株のバーテンダー）

#### スチームパンク感の出し方

**原則: 名前は普通 × ビジュアルは異常**

名前にスチームパンク要素を入れると「かっこつけ」になる。
代わりに、普通の名前と異常なビジュアルのギャップで世界観を表現する。

| 名前 | ビジュアル例 |
|------|-------------|
| 老陳 | 歯車の義眼、首に蒸気管 |
| 魚檔阿叔 | 機械の腕で魚を捌く |
| 三樓婆婆 | 背中から蒸気パイプ |

**狙い**:
- 住人にとっては「普通」だから名前で言及しない
- プレイヤーだけが「え、それスルー？」となる
- 「蒸気仕掛けの賢者」より「普通に老陳と呼ばれてる明らかに人間じゃないおっさん」の方が不気味

### シナリオ方針

旧プロジェクト（ClaudeSteam2「九龍城の時間商人」）の骨格は活かしつつ、キャラクターは全面的にリワーク予定。

---

## 元プロジェクト情報

| 項目 | 内容 |
|------|------|
| **タイトル** | 九龍城探索 |
| **開発** | たぬたぬげーむ開発 |
| **公開URL** | https://kowloonmovietest.netlify.app/ |
| **GitHub** | https://github.com/KanW123/KowloonMovieTest |
| **ホスティング** | Netlify + Cloudflare R2 |
| **R2バケット** | `pub-526fddcc834c4712a4972139bb3be070.r2.dev` |

## 共通スタイル

### Midjourney プロファイル
- Profile ID: `jprhyi7`（Global V7 Profile）
- アスペクト比: `16:9`

### プロンプトテンプレート
```
[場所の説明] in strange steampunk world, Nighttime Kowloon Walled City, photo, [視点/追加要素]

--ar 16:9
--profile jprhyi7
```

## 素材一覧

### 背景画像

| ファイル名 | 生成手法 | プロンプト | Midjourney Job ID | 備考 |
|-----------|---------|-----------|-------------------|------|
| 魚屋.png | Midjourney | `local fish market shop in strange steampunk world, Nighttime Kowloon Walled City, photo, cannon` | `15590033-83fa-465d-b26c-9f84df61e6c7` | index=1 |
| バー.png | Midjourney | `fish shop in strange steampunk world` | `cd71ecb9-5f48-46e1-a8eb-6f9de871043c` | index=1, 水槽+トゲトゲキャラ+バーテンダー |
| 廊下.png | Midjourney | `local corridor in strange steampunk world, Nighttime Kowloon Walled City, photo, First Person View` | `45476402-34e4-41b6-8b9f-9e1e09225a03` | index=3, スタート地点 |
| 階段下.png | Midjourney | `local Staircase landing in strange steampunk world, Nighttime Kowloon Walled City, photo, First Person View` | `dad7d9ac-418c-4c76-af79-2b7ce75b9bac` | index=0, 階段を見上げる構図 |
| 階段上.png | Midjourney | `local Staircase landing in strange steampunk world, Nighttime Kowloon Walled City, photo, First Person View` | `7ce1ff07-ef14-4018-91c0-67a27940af27` | index=1, 階段を見下ろす構図 |

### R2ホスト URL

| 素材 | URL |
|------|-----|
| 廊下.png | `https://pub-526fddcc834c4712a4972139bb3be070.r2.dev/廊下.png` |
| バー.png | `https://pub-526fddcc834c4712a4972139bb3be070.r2.dev/バー.png` |
| 魚屋.png | `https://pub-526fddcc834c4712a4972139bb3be070.r2.dev/魚屋.png` |
| 階段下.png | `https://pub-526fddcc834c4712a4972139bb3be070.r2.dev/階段下.png` |
| 階段上.png | `https://pub-526fddcc834c4712a4972139bb3be070.r2.dev/階段上.png` |

### 移動動画

| ファイル名 | 内容 |
|-----------|------|
| 廊下→バー.mp4 | 廊下からバーへの移動 |
| バー→廊下.mp4 | バーから廊下への移動 |
| 廊下→階段下.mp4 | 廊下から階段下への移動 |
| 階段下→階段上.mp4 | 階段下から階段上への移動 |
| 階段上→廊下.mp4 | 階段上から廊下への移動 |
| 廊下→魚屋.mp4 | 廊下から魚屋への移動 |
| 魚屋→廊下.mp4 | 魚屋から廊下への移動 |

### 会話動画

| ファイル名 | 内容 |
|-----------|------|
| バー会話.mp4 | バーでの会話シーン |
| 魚屋会話.mp4 | 魚屋での会話シーン |

## ゲームシステム

### 場所遷移
```
廊下（スタート）
 ├── バー（会話可能）
 ├── 階段下 → 階段上
 └── 魚屋（会話可能）
```

### シナリオ形式
- CSV形式
- カラム: テキスト, 選択肢1, 選択肢1ジャンプ, 選択肢2, 選択肢2ジャンプ, シナリオ終了後の移動先, 獲得アイテム, 獲得フラグ

### アイテム条件付き選択肢
- `requireItem`: 必要アイテム
- `visibleIfMissing: true` → グレーアウト表示
- `visibleIfMissing: false` → 非表示

## ローカルファイル

### project-007内（作業用）
```
project-007/assets/
├── images/
│   ├── 廊下.png
│   ├── バー.png
│   ├── 魚屋.png
│   ├── 階段下.png
│   └── 階段上.png
└── videos/
    ├── 廊下→バー.mp4
    ├── バー→廊下.mp4
    ├── 廊下→階段下.mp4
    ├── 階段下→階段上.mp4
    ├── 階段上→廊下.mp4
    ├── 廊下→魚屋.mp4
    └── 魚屋→廊下.mp4
```

### 元素材リポジトリ
- `/Users/kanwatanabe/Documents/GitHub/KowlooMovieLocalAssets/`

### 参照用コピー
- `/Users/kanwatanabe/Desktop/ADVゲーム作成検討/code/projects/ClockworkKowloon/images/reference/background/`

### 関連リポジトリ
- メイン: `/Users/kanwatanabe/Documents/GitHub/KowloonMovieTest`
- Webサイト用: `/Users/kanwatanabe/Documents/GitHub/KowloonMovieTestのWebサイト用`

## 関連プロジェクト

| プロジェクト | パス | 内容 |
|-------------|------|------|
| ClockworkKowloon | `Desktop/ADVゲーム作成検討/code/projects/ClockworkKowloon` | 蒸気仕掛け九龍城ADV |
| Neon_Kowloon | `Desktop/脱出ゲーム作成検討/code/projects/Neon_Kowloon` | 脱出ゲーム版 |
| MovieGameCreator | `Desktop/old/MovieGameCreator` | React製ムービーゲームエンジン |
| plot-manager | `Desktop/old/NewKowloonProject/plot-manager` | シナリオ視覚化ツール |

## 動画生成ルール（project-007固有）

### 推奨モデル

| 優先度 | モデル | 用途 | 理由 |
|--------|--------|------|------|
| **1st** | Vidu Q1 | ベース | この絵柄（スチームパンク九龍城）との相性が良い |
| **2nd** | Kling 2.6 Pro | フォールバック | Viduで微妙な時、コンテンツポリシー回避 |

**注意事項:**
- Viduは生魚などの画像がコンテンツポリシーでブロックされる場合あり
- その場合は Kling 2.6 Pro を使用
- 料金: Vidu $0.10/秒 > Kling 2.6 $0.07/秒（少し高いが品質優先）

### ドアの扱い

| 状況 | ルール |
|------|--------|
| **通常の移動** | ドアは最初から開いている前提 |
| **ドアが開くシーンが必要** | 自動ドアとして表現 |

**理由**: 一人称視点でドアを開けると手が映ってしまうため

### プロンプトでの表現

```
# ドアが開いている場合（推奨）
walking through the open doorway, no hands visible

# 自動ドアの場合（ドアが開くシーンが必要な時）
the automatic door opens, walking through
```

---

## 動画生成プロンプト事例

### 成功事例: バー→廊下

| 項目 | 内容 |
|------|------|
| **モデル** | Kling 2.6 Pro (音声なし) |
| **Start画像** | バー.png |
| **End画像** | 廊下.png |
| **プロンプト** | `First-person camera in games, handheld camera, walking through the open doorway into the hallway, no hands visible` |
| **API** | fal.ai (`end_image_url`, `generate_audio: false`) |
| **結果** | 良好（手が映らない） |

### プロンプトのポイント
- `First-person camera in games` - ゲーム的な一人称視点
- `handheld camera` - 手持ちカメラの揺れ感
- `open doorway` - ドアが最初から開いている
- `no hands visible` - 手を映さない明示的指示

### 移動動画プロンプトテンプレート
```
First-person camera in games, handheld camera, [動作の説明], no hands visible
```

## ビジュアル方向性（参考プロンプト）

### 通常パート向け

シーン背景や、穏やかな雰囲気の場所。ただし不気味さは残す。

**人体パーツ店**
```
local dummy human body parts and eyes market shop in strange steampunk world, Nighttime Kowloon Walled City, photo, cannon
```

**モニター顔の少女**
```
a surreal upper body of a girl suspended in front of a metal wall by dozens of thin surgical tubes and black wires, her torso semi-transparent with visible slow-rotating gears and flickering lights inside, her face replaced with a small analog monitor displaying cryptic symbols, arms posed as if frozen mid-speech, surrounded by decayed cables and faded red talismans, photorealistic, garage kit aesthetic, eerie and sacred
```

### 激しいシーン向け

シナリオの山場、衝撃シーン、クライマックス用。

**水中時計機構**
```
Infinite reflective water surface, massive underwater clockwork mechanism visible beneath, steampunk aesthetic, countless humanoid figures with identical faces submerged underwater, dark teal and copper color palette, distant glowing lights, ethereal atmosphere, impossible architecture fragments floating in space, mist hovering over water, dramatic lighting, hyper-detailed, cinematic, surreal, 8k
```

**壁埋め込み人型（祭壇）**
```
a disturbing upper body of a humanoid figure embedded in a wall, with mechanical cables spreading out from the shoulders like flower petals, the head partially open showing exposed glowing circuits, arms raised in a ritualistic pose, chest replaced with a rotating lens, surrounded by rusted plaques, kanji inscriptions, and candles, photorealistic, surreal industrial altar, Giger x steampunk
```

### ビジュアル方針まとめ

| カテゴリ | 特徴 | 用途 |
|---------|------|------|
| **通常パート** | 九龍城スチームパンク基調、不気味だが日常 | 探索中の背景、NPC会話 |
| **激しいシーン** | 超常現象、大規模機構、Giger風 | クライマックス、真実の開示 |

---

## TODO

- [x] 階段上・階段下のMidjourney Job IDを確認
- [ ] 動画生成の詳細を確認（どのツールで生成したか）
- [ ] 会話シナリオの詳細を整理
- [ ] 新規素材の追加方針を決定
