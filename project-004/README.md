# Project 004: P2P Fighting Game

## 概要
Cloudflare Workers + WebRTC を使ったP2P対戦格闘ゲーム

## URL
- **プレイ**: https://github100projecttest.pages.dev/project-004/
- **シグナリングサーバー**: https://p2p-signaling.ailovedirector.workers.dev

---

## 技術スタック

| 技術 | 用途 |
|------|------|
| Cloudflare Workers | シグナリングサーバー |
| Durable Objects | ルーム管理・WebSocket |
| WebRTC DataChannel | P2P通信（低レイテンシ） |
| Canvas API | ゲーム描画 |

---

## ディレクトリ構成

```
project-004/
├── index.html          # メインHTML
├── style.css           # スタイル
├── game.js             # ゲームロジック
├── README.md           # このファイル
├── assets/             # キャラ画像等
│   └── characters/
└── workers/
    └── signaling/      # Cloudflare Workers
        ├── wrangler.toml
        └── src/index.ts
```

---

## キャラクター素材

### 仕様
- **向き**: 完全右向き（左向きは反転で対応）
- **サイズ**: 512x512 推奨
- **背景**: 透明（白背景から透過処理）
- **フォーマット**: PNG

### 必要なポーズ
| ポーズ | ファイル名 | 用途 |
|--------|-----------|------|
| 構え | `idle.png` | 待機状態 |
| パンチ | `punch.png` | 攻撃 |
| キック | `kick.png` | 攻撃 |
| 防御 | `block.png` | ガード |
| やられ | `hurt.png` | 被ダメージ |
| 勝利 | `win.png` | 勝利演出 |

### 生成プロンプト例
```
anime style fighting game character, young female warrior,
side view facing right, fighting stance pose,
full body, transparent background, white background,
2D sprite style, clean lineart
```

---

## 操作方法

### キーボード
| キー | アクション |
|------|-----------|
| ← → | 移動 |
| ↑ / W | ジャンプ |
| Space / F | 攻撃（現在は射撃） |

### モバイル
画面下部のタッチボタンで操作

---

## 開発メモ

### P2P同期の仕組み
1. WebSocket経由でシグナリング（offer/answer/ICE）
2. WebRTC DataChannelが確立されればP2P直接通信
3. P2P失敗時はWebSocket経由でフォールバック

### バージョン履歴
| バージョン | 変更内容 |
|-----------|---------|
| v1.0.0 | 初期リリース（シューティング） |
| v1.1.0 | Space→射撃専用、バージョン表示追加 |
| v1.2.0 | syncRemotePlayer追加、接続状態表示 |

---

## 今後の予定
- [ ] 格闘ゲーム化（近接攻撃）
- [ ] キャラクター画像実装
- [ ] アニメーション（スプライト切り替え）
- [ ] 必殺技
- [ ] サウンド
