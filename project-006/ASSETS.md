# Project 006: Mystic Tarot - 素材管理

## 共通スタイル

### タロットカード共通プロンプト
```
Tarot card [カード番号] [カード名], French Art Nouveau style by Alphonse Mucha,
ornate golden borders, [カード固有の描写],
vintage mystical illustration, decorative frame
```

**生成設定:**
- 手法: Midjourney
- アスペクト比: 縦長（portrait）
- 生成日: 2026-01-23

---

## 素材一覧

### タロットカード（22枚）

| ファイル名 | カード名 | プロンプト（カード固有部分） | 備考 |
|-----------|---------|---------------------------|------|
| `cards/the_fool.png` | 0 愚者 | young traveler with small dog at cliff edge, bag on stick, ethereal pastel colors | gitログから復元 |
| `cards/the_magician.png` | I 魔術師 | robed figure with wand pointing to sky, infinity symbol above head, roses and lilies, table with cup sword pentacle wand, ethereal lighting | gitログから復元 |
| `cards/the_high_priestess.png` | II 女教皇 | mysterious woman seated between two pillars with crescent moon crown, flowing blue robes, pomegranates and water lilies, ethereal moonlight | gitログから復元 |
| `cards/the_empress.png` | III 女帝 | regal woman on throne in garden, wheat and pomegranates, Venus symbol, flowing robes | 推定（標準構図） |
| `cards/the_emperor.png` | IV 皇帝 | powerful ruler on stone throne, ram heads, mountains, red robes, scepter | 推定（標準構図） |
| `cards/the_hierophant.png` | V 教皇 | religious figure between pillars, two acolytes, triple crown, crossed keys | 推定（標準構図） |
| `cards/the_lovers.png` | VI 恋人 | man and woman beneath angel, garden of Eden, tree of knowledge, divine blessing | 推定（標準構図） |
| `cards/the_chariot.png` | VII 戦車 | warrior in chariot, two sphinxes, city behind, starry canopy, victorious | 推定（標準構図） |
| `cards/strength.png` | VIII 力 | woman gently closing lion's mouth, infinity symbol, flowers, peaceful strength | 推定（標準構図） |
| `cards/the_hermit.png` | IX 隠者 | old sage with lantern on mountain, staff, grey robes, seeking wisdom | 推定（標準構図） |
| `cards/wheel_of_fortune.png` | X 運命の輪 | great wheel with sphinx snake anubis, Hebrew letters, clouds | gitログから復元 |
| `cards/justice.png` | XI 正義 | seated figure with sword and scales, between pillars, red robes, balanced | 推定（標準構図） |
| `cards/the_hanged_man.png` | XII 吊るされた男 | man hanging upside down from tree, halo, serene expression, crossed legs | 推定（標準構図） |
| `cards/death.png` | XIII 死神 | skeleton on white horse, fallen figures, rising sun, transformation | 推定（標準構図） |
| `cards/temperance.png` | XIV 節制 | angel pouring water between cups, one foot in water, wings, path to sun | 推定（標準構図） |
| `cards/the_devil.png` | XV 悪魔 | baphomet on pedestal, chained figures, inverted pentagram, dark power | 推定（標準構図） |
| `cards/the_tower.png` | XVI 塔 | tower struck by lightning, figures falling, crown, flames, sudden change | 推定（標準構図） |
| `cards/the_star.png` | XVII 星 | nude woman by water, pouring from two vessels, eight stars, hope | 推定（標準構図） |
| `cards/the_moon.png` | XVIII 月 | moon with face, two towers, wolf and dog, crayfish, path, dreams | 推定（標準構図） |
| `cards/the_sun.png` | XIX 太陽 | child on white horse, sunflowers, bright sun, joy, success | 推定（標準構図） |
| `cards/judgement.png` | XX 審判 | angel with trumpet, rising dead, mountains, resurrection, calling | 推定（標準構図） |
| `cards/the_world.png` | XXI 世界 | dancing figure in oval wreath, four corners angel eagle bull lion, completion fulfillment | gitログから復元 |

### カード裏面

| ファイル名 | プロンプト | 備考 |
|-----------|-----------|------|
| `cards/card_back.png` | Tarot card back design, Art Nouveau style, ornate golden frame, mystical purple pattern, celestial symbols | 推定 |

### 背景

| ファイル名 | 生成手法 | プロンプト | 備考 |
|-----------|---------|-----------|------|
| `backgrounds/bg1.png` | Midjourney | Cosmic nebula background, deep purple and gold, mystical starfield | 推定 |
| `backgrounds/bg2.png` | Midjourney | Cosmic nebula background variant, ethereal purple mist | 推定 |
| `backgrounds/bg_loop1.mp4` | 不明 | 動画背景ループ | |
| `backgrounds/bg_loop2.mp4` | 不明 | 動画背景ループ | |

### バナー画像

| ファイル名 | 用途 | 生成手法 | プロンプト |
|-----------|------|---------|-----------|
| `banners/daily.png` | 今日の運勢 | Midjourney | Tarot mode banner, golden sun with mystical rays | 推定 |
| `banners/love.png` | 恋愛占い | Midjourney | Tarot mode banner, two glowing hearts with roses | 推定 |
| `banners/time.png` | 過去・現在・未来 | Midjourney | Tarot mode banner, hourglass with flowing sand | 推定 |
| `banners/career.png` | 仕事運 | Midjourney | Tarot mode banner, golden crown with laurel | 推定 |

### 音声

| ファイル名 | 用途 | 出典 |
|-----------|------|------|
| `audio/bgm.ogg` | BGM | 外部素材（要確認） |

---

## 追加生成時のテンプレート

新しいカードやバリエーションを作る場合：

```
Tarot card [番号] [名前], French Art Nouveau style by Alphonse Mucha,
ornate golden borders, [カード固有の描写],
vintage mystical illustration, decorative frame --ar 2:3
```

**Midjourneyの推奨設定:**
- Version: v6.1 以降
- Style: Default または Raw
- Aspect Ratio: 2:3（縦長）

---

## 注意事項

- 「推定」と記載されているプロンプトは、gitログに記録がなく、共通スタイルから推定したもの
- 追加生成時は、既存カードとスタイルを合わせるため、同じ共通プロンプトを使用すること
- Midjourneyのジョブ履歴からも確認可能（アカウントにログインが必要）
