# アイソメトリック タイルゲーム 知見まとめ

## 概要
アイソメトリック（2:1ダイヤモンド）視点のタイルベース経営シミュレーションゲームの作り方。

---

## 基本概念

### アイソメトリック座標系
```
      (0,0)
        /\
       /  \
      /    \
   (1,0)  (0,1)
      \    /
       \  /
        \/
      (1,1)
```

- タイルは **ダイヤモンド形状**（2:1比率）
- グリッド座標 (row, col) → スクリーン座標 (x, y) に変換が必要

### 座標変換公式
```javascript
// グリッド → スクリーン
const tileWidth = 64;
const tileHeight = 32;

function gridToScreen(row, col) {
    const x = (col - row) * (tileWidth / 2) + offsetX;
    const y = (col + row) * (tileHeight / 2) + offsetY;
    return { x, y };
}

// スクリーン → グリッド（クリック判定用）
function screenToGrid(screenX, screenY) {
    const x = screenX - offsetX;
    const y = screenY - offsetY;
    const col = (x / (tileWidth / 2) + y / (tileHeight / 2)) / 2;
    const row = (y / (tileHeight / 2) - x / (tileWidth / 2)) / 2;
    return { row: Math.floor(row), col: Math.floor(col) };
}
```

---

## タイル素材の構成

### 2層構造（推奨）
```
レイヤー1: ベースタイル（地面）
├── grass_tile.png    # 草
├── water_tile.png    # 水
├── road_tile.png     # 道路
└── dirt_tile.png     # 土

レイヤー2: オブジェクト（建物・自然物）
├── house_tile.png    # 家（草ベース + 家オブジェクト合成済み）
├── tree_tile.png     # 木（草ベース + 木オブジェクト合成済み）
└── shop_tile.png     # 店
```

### なぜコンポジット（合成済み）にするか
- AI生成ではベース位置が揃わない
- 草タイルを基準にオブジェクトを合成すれば、全タイルのベース位置が統一される
- グリッド配置時にズレない

---

## オブジェクト配置の計算

### 問題
オブジェクト（家、木）をベースタイルのどこに配置するか？

### 解決策: 重心〜底辺の中間に配置

```python
# ベースタイルの範囲
grass_top_y = 251      # コンテンツ上端
grass_bottom_y = 747   # コンテンツ下端
grass_center_y = (grass_top_y + grass_bottom_y) // 2  # 重心

# ターゲット位置 = 重心と底辺の中間
target_bottom_y = (grass_center_y + grass_bottom_y) // 2

# オブジェクト配置
obj_y = target_bottom_y - obj_height  # オブジェクト底辺をターゲットに合わせる
obj_x = grass_center_x - obj_width // 2  # X方向は中央揃え
```

### 配置ルール
```
✓ オブジェクト底辺 = パネル重心〜底辺の中間
✓ オブジェクトは上にはみ出してOK
✗ オブジェクトは下にはみ出さない
```

これにより：
- オブジェクトがタイルの上に自然に「乗っている」見た目になる
- パネルの余白が適度に残る
- 下にはみ出さないので隣接タイルと干渉しない

---

## 描画順序（Z-Index）

### 基本ルール
後ろのタイルを先に描画、手前のタイルを後に描画。

```javascript
// row + col が小さいほど奥 → 先に描画
for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
        tile.style.zIndex = col + row;  // 手前ほど大きい値
    }
}
```

### 建物が高い場合の注意
建物が隣のタイルにかぶる場合、同じ row+col でも描画順が問題になることがある。
→ より細かい制御が必要な場合は y 座標も加味する。

---

## HTMLでの実装例

```html
<div class="grid-container" id="grid"></div>

<style>
.grid-container {
    position: relative;
    width: 100%;
    height: 400px;
}
.tile {
    position: absolute;
    width: 130px;
    height: 130px;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center bottom; /* 底辺基準 */
}
</style>

<script>
const layout = [
    ['grass', 'grass', 'tree',  'water'],
    ['grass', 'house', 'grass', 'water'],
    ['road',  'road',  'road',  'grass'],
];

const tileImages = {
    grass: 'assets/grass_tile.png',
    water: 'assets/water_tile.png',
    road: 'assets/road_tile.png',
    house: 'assets/house_tile_composite.png',
    tree: 'assets/tree_tile_composite.png'
};

const tileWidth = 110, tileHeight = 55;
const offsetX = grid.offsetWidth / 2;

for (let row = 0; row < layout.length; row++) {
    for (let col = 0; col < layout[row].length; col++) {
        const tile = document.createElement('div');
        tile.className = 'tile';

        const x = (col - row) * (tileWidth / 2) + offsetX - tileWidth / 2;
        const y = (col + row) * (tileHeight / 2);

        tile.style.left = x + 'px';
        tile.style.top = y + 'px';
        tile.style.zIndex = col + row;
        tile.style.backgroundImage = `url('${tileImages[layout[row][col]]}')`;

        grid.appendChild(tile);
    }
}
</script>
```

---

## タイルサイズの設計

### 推奨サイズ
| 用途 | 元画像サイズ | 表示サイズ |
|------|-------------|-----------|
| AI生成用 | 1024x1024 | - |
| ベースタイル | 1024x1024 | 64x32 〜 130x65 |
| オブジェクト | 可変 | ベースの50-80% |

### タイル比率
アイソメトリックは **幅:高さ = 2:1** が基本。
- 64x32, 128x64, 130x65 など

---

## ゲームシステム例

### 経営シミュレーション要素
```javascript
const tileTypes = {
    grass: { cost: 0, income: 0 },
    house: { cost: 100, income: 10 },  // 人口+収入
    shop:  { cost: 200, income: 25 },  // 商業
    tree:  { cost: 50, income: 0 },    // 装飾
    road:  { cost: 30, income: 0 },    // インフラ
    water: { cost: 0, income: 0 },     // 配置不可
};

let money = 1000;

function placeTile(row, col, type) {
    const tile = tileTypes[type];
    if (money >= tile.cost) {
        money -= tile.cost;
        layout[row][col] = type;
        render();
    }
}
```

---

## スマホ対応

### タッチ操作
```javascript
canvas.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    const { row, col } = screenToGrid(x, y);
    // タイル選択処理
});
```

### レスポンシブ
```css
.grid-container {
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
}
```

---

## 参考: project-002 (Tiny Town)

このプロジェクトの `project-002/` に実装例あり。
- `index.html` - メインゲーム
- `tile_test.html` - タイル配置テスト
- `assets/` - AI生成 + 合成済みタイル素材
