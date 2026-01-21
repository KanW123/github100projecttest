/**
 * 手相占いアプリ - Palm Reading App
 * MediaPipe Hands + エッジ検出で手相の線を識別
 */

// DOM要素
const video = document.getElementById('video');
const captureBtn = document.getElementById('capture-btn');
const fileInput = document.getElementById('file-input');
const retryBtn = document.getElementById('retry-btn');
const photoCanvas = document.getElementById('photo-canvas');
const overlayCanvas = document.getElementById('overlay-canvas');
const resultCanvas = document.getElementById('result-canvas');
const progressFill = document.querySelector('.progress-fill');
const fortuneResult = document.getElementById('fortune-result');
const legend = document.getElementById('palm-lines-legend');

const cameraSection = document.getElementById('camera-section');
const analysisSection = document.getElementById('analysis-section');
const resultSection = document.getElementById('result-section');

// MediaPipe Hands インスタンス
let hands = null;
let handsReady = false;

// 手相の線の定義
const PALM_LINES = {
    lifeLine: { name: '生命線', color: '#ff6b6b', description: '健康運・生命力' },
    headLine: { name: '頭脳線', color: '#4ecdc4', description: '知性・思考力' },
    heartLine: { name: '感情線', color: '#ffe66d', description: '愛情運・感情' },
    fateLine: { name: '運命線', color: '#a855f7', description: '仕事運・人生の方向性' }
};

// 占い結果データ
const FORTUNES = {
    lifeLine: {
        strong: ['生命力に溢れ、健康運は抜群です。長寿の相があります。', '体力があり、困難を乗り越える力を持っています。'],
        medium: ['バランスの取れた健康運です。規則正しい生活を心がけましょう。', '適度な運動と休息で、より良い健康を維持できます。'],
        weak: ['少し疲れが溜まりやすいかも。休息を大切にしましょう。', '健康管理に意識を向けることで運気アップ。']
    },
    headLine: {
        strong: ['優れた判断力と深い思考力を持っています。', '論理的思考が得意で、難しい問題も解決できます。'],
        medium: ['バランスの取れた思考力があります。直感と論理を使い分けられます。', '学びへの意欲が高く、成長し続けられます。'],
        weak: ['感覚的な判断が得意です。直感を信じましょう。', '周りの意見も取り入れながら進むと吉。']
    },
    heartLine: {
        strong: ['愛情深く、人を惹きつける魅力があります。', '恋愛運が高く、素敵な出会いが期待できます。'],
        medium: ['誠実な愛情を持っています。信頼関係を大切にしましょう。', '穏やかな愛情運。焦らず自然体でいきましょう。'],
        weak: ['繊細な心を持っています。自分を大切にしましょう。', '心を開くことで、新しい縁が生まれます。']
    },
    fateLine: {
        strong: ['強い意志で目標を達成できます。仕事運は絶好調！', 'リーダーシップがあり、大きな成功を収める相です。'],
        medium: ['着実に前進できる運勢です。努力が報われます。', 'チャンスを逃さず、一歩一歩進みましょう。'],
        weak: ['自由な発想が活きる時期。型にはまらない道もあり。', '新しい挑戦が運気を開きます。']
    }
};

// MediaPipe Hands 初期化
async function initMediaPipe() {
    try {
        hands = new Hands({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        handsReady = true;
        console.log('MediaPipe Hands initialized');
    } catch (err) {
        console.error('MediaPipe init error:', err);
        alert('手の認識機能の初期化に失敗しました');
    }
}

// カメラ初期化
async function initCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        video.srcObject = stream;
        captureBtn.disabled = false;
    } catch (err) {
        console.error('Camera error:', err);
        alert('カメラにアクセスできません。カメラの許可を確認してください。');
    }
}

// 手全体の領域を計算（指を含む）
function getPalmRegion(landmarks, width, height) {
    // 全21ランドマークから境界を計算
    let minX = 1, maxX = 0, minY = 1, maxY = 0;
    for (const p of landmarks) {
        minX = Math.min(minX, p.x);
        maxX = Math.max(maxX, p.x);
        minY = Math.min(minY, p.y);
        maxY = Math.max(maxY, p.y);
    }

    // 少し余裕を持たせる
    const padding = 0.03;
    minX = Math.max(0, minX - padding);
    maxX = Math.min(1, maxX + padding);
    minY = Math.max(0, minY - padding);
    maxY = Math.min(1, maxY + padding);

    // ピクセル座標に変換
    return {
        left: Math.floor(minX * width),
        right: Math.floor(maxX * width),
        top: Math.floor(minY * height),
        bottom: Math.floor(maxY * height),
        width: Math.floor((maxX - minX) * width),
        height: Math.floor((maxY - minY) * height),
        landmarks: landmarks,
        // 手の中心
        centerX: Math.floor(landmarks[9].x * width),
        centerY: Math.floor((landmarks[0].y + landmarks[9].y) / 2 * height)
    };
}

// 手のひらエリアのマスクを作成（指の付け根を結んだポリゴン、両サイド広めに、小指側はカーブ）
function createPalmMask(palm, width, height, landmarks) {
    const mask = new Uint8Array(width * height);

    // ランドマークをピクセル座標に変換
    const pts = landmarks.map(p => ({
        x: p.x * width,
        y: p.y * height
    }));

    const wrist = pts[0];
    const thumbBase = pts[1];
    const thumbTip = pts[4];
    const indexBase = pts[5];
    const middleBase = pts[9];
    const ringBase = pts[13];
    const pinkyBase = pts[17];

    // 手のひらの幅を計算
    const palmWidth = Math.abs(pinkyBase.x - thumbBase.x);
    const expandPinky = palmWidth * 0.3;  // 小指側を30%広げる
    const expandThumb = palmWidth * 0.15; // 親指/人差し指側も15%広げる

    // 左右どちらに手があるか判定
    const pinkyIsRight = pinkyBase.x > thumbBase.x;
    const dirPinky = pinkyIsRight ? 1 : -1;
    const dirThumb = pinkyIsRight ? -1 : 1;

    // 親指側を少し広げる
    const thumbExpanded = {
        x: thumbBase.x + dirThumb * expandThumb,
        y: thumbBase.y
    };

    // 人差し指付け根を少し広げる
    const indexExpanded = {
        x: indexBase.x + dirThumb * expandThumb * 0.5,
        y: indexBase.y
    };

    // 小指付け根を外側に広げる
    const pinkyExpanded = {
        x: pinkyBase.x + dirPinky * expandPinky,
        y: pinkyBase.y
    };

    // 小指〜手首間をカーブで結ぶ（中間点を追加）
    const curve1 = {
        x: pinkyBase.x + dirPinky * expandPinky * 1.1,
        y: pinkyBase.y + (wrist.y - pinkyBase.y) * 0.33
    };
    const curve2 = {
        x: pinkyBase.x + dirPinky * expandPinky * 0.9,
        y: pinkyBase.y + (wrist.y - pinkyBase.y) * 0.66
    };
    const wristPinkySide = {
        x: wrist.x + dirPinky * expandPinky * 0.5,
        y: wrist.y
    };

    // ポリゴンの頂点
    const polygon = [
        { x: Math.floor(thumbExpanded.x), y: Math.floor(thumbExpanded.y) },
        { x: Math.floor(indexExpanded.x), y: Math.floor(indexExpanded.y) },
        { x: Math.floor(middleBase.x), y: Math.floor(middleBase.y) },
        { x: Math.floor(ringBase.x), y: Math.floor(ringBase.y) },
        { x: Math.floor(pinkyExpanded.x), y: Math.floor(pinkyExpanded.y) },
        { x: Math.floor(curve1.x), y: Math.floor(curve1.y) },
        { x: Math.floor(curve2.x), y: Math.floor(curve2.y) },
        { x: Math.floor(wristPinkySide.x), y: Math.floor(wristPinkySide.y) },
        { x: Math.floor(wrist.x), y: Math.floor(wrist.y) }
    ];

    // バウンディングボックスを計算
    let minX = width, maxX = 0, minY = height, maxY = 0;
    for (const p of polygon) {
        minX = Math.min(minX, p.x);
        maxX = Math.max(maxX, p.x);
        minY = Math.min(minY, p.y);
        maxY = Math.max(maxY, p.y);
    }

    // パディング
    const pad = 5;
    minX = Math.max(0, minX - pad);
    maxX = Math.min(width - 1, maxX + pad);
    minY = Math.max(0, minY - pad);
    maxY = Math.min(height - 1, maxY + pad);

    // ポリゴン内部を塗りつぶし
    for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
            if (isPointInPolygon(x, y, polygon)) {
                mask[y * width + x] = 255;
            }
        }
    }

    return mask;
}

// 点がポリゴン内部にあるかチェック
function isPointInPolygon(x, y, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].x, yi = polygon[i].y;
        const xj = polygon[j].x, yj = polygon[j].y;

        if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
            inside = !inside;
        }
    }
    return inside;
}

// Sobelエッジ検出 + 細線化（Non-Maximum Suppression）
function detectEdges(imageData, mask, palm) {
    const { data, width, height } = imageData;
    const edges = new Float32Array(width * height);
    const directions = new Float32Array(width * height);

    // グレースケール変換
    const gray = new Uint8Array(width * height);
    for (let i = 0; i < data.length; i += 4) {
        const idx = i / 4;
        gray[idx] = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) | 0;
    }

    // Sobelフィルタ
    const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

    for (let y = palm.top + 1; y < palm.bottom - 1; y++) {
        for (let x = palm.left + 1; x < palm.right - 1; x++) {
            const idx = y * width + x;

            // マスク領域のみ処理
            if (mask[idx] === 0) continue;

            let gx = 0, gy = 0;
            for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                    const kidx = (y + ky) * width + (x + kx);
                    const ki = (ky + 1) * 3 + (kx + 1);
                    gx += gray[kidx] * sobelX[ki];
                    gy += gray[kidx] * sobelY[ki];
                }
            }
            edges[idx] = Math.sqrt(gx * gx + gy * gy);
            directions[idx] = Math.atan2(gy, gx);
        }
    }

    // Non-Maximum Suppression（細線化）
    const thinned = new Float32Array(width * height);
    for (let y = palm.top + 2; y < palm.bottom - 2; y++) {
        for (let x = palm.left + 2; x < palm.right - 2; x++) {
            const idx = y * width + x;
            if (edges[idx] === 0) continue;

            const angle = directions[idx];
            let dx = 0, dy = 0;

            // 勾配方向に沿って隣接ピクセルを取得
            if (angle >= -Math.PI/8 && angle < Math.PI/8) {
                dx = 1; dy = 0;
            } else if (angle >= Math.PI/8 && angle < 3*Math.PI/8) {
                dx = 1; dy = 1;
            } else if (angle >= 3*Math.PI/8 || angle < -3*Math.PI/8) {
                dx = 0; dy = 1;
            } else {
                dx = 1; dy = -1;
            }

            const idx1 = (y + dy) * width + (x + dx);
            const idx2 = (y - dy) * width + (x - dx);

            // 勾配方向の両隣より大きい場合のみ残す
            if (edges[idx] >= edges[idx1] && edges[idx] >= edges[idx2]) {
                thinned[idx] = edges[idx];
            }
        }
    }

    // 正規化
    let max = 0;
    for (let i = 0; i < thinned.length; i++) {
        if (thinned[i] > max) max = thinned[i];
    }
    if (max > 0) {
        for (let i = 0; i < thinned.length; i++) {
            thinned[i] = (thinned[i] / max) * 255;
        }
    }

    return thinned;
}

// 手相の線を分類（ランドマーク基準）
function classifyPalmLines(edges, width, height, mask, palm) {
    const lines = {
        lifeLine: [],
        headLine: [],
        heartLine: [],
        fateLine: []
    };

    const landmarks = palm.landmarks;

    // 重要なランドマーク座標（ピクセル）
    const wrist = { x: landmarks[0].x * width, y: landmarks[0].y * height };
    const thumbBase = { x: landmarks[1].x * width, y: landmarks[1].y * height };
    const indexBase = { x: landmarks[5].x * width, y: landmarks[5].y * height };
    const middleBase = { x: landmarks[9].x * width, y: landmarks[9].y * height };
    const pinkyBase = { x: landmarks[17].x * width, y: landmarks[17].y * height };

    // 手のひらの中心線
    const palmCenterX = (thumbBase.x + pinkyBase.x) / 2;

    // 閾値を高めに設定（強い線だけを検出）
    const threshold = 60;

    for (let y = palm.top; y <= palm.bottom; y++) {
        for (let x = palm.left; x <= palm.right; x++) {
            const idx = y * width + x;
            if (edges[idx] < threshold || mask[idx] === 0) continue;

            // 各ランドマークからの相対位置で分類
            const relY = (y - wrist.y) / (indexBase.y - wrist.y); // 0=手首, 1=指の付け根
            const relX = (x - thumbBase.x) / (pinkyBase.x - thumbBase.x); // 0=親指側, 1=小指側

            // 感情線: 指の付け根のすぐ下（relY: 0.7-0.9）
            if (relY > 0.7 && relY < 0.95 && relX > 0.2 && relX < 0.95) {
                lines.heartLine.push({ x, y, strength: edges[idx] });
            }
            // 頭脳線: 手のひら中央横（relY: 0.5-0.75）
            else if (relY > 0.5 && relY < 0.75 && relX > 0.1 && relX < 0.9) {
                lines.headLine.push({ x, y, strength: edges[idx] });
            }
            // 生命線: 親指側カーブ（relX < 0.4）
            else if (relX > 0 && relX < 0.4 && relY > 0.3 && relY < 0.95) {
                lines.lifeLine.push({ x, y, strength: edges[idx] });
            }
            // 運命線: 中央縦線
            else if (relX > 0.35 && relX < 0.65 && relY > 0.2 && relY < 0.7) {
                lines.fateLine.push({ x, y, strength: edges[idx] });
            }
        }
    }

    return lines;
}

// 手相の強さを評価
function evaluateLineStrength(points) {
    if (points.length < 20) return 'weak';
    if (points.length < 100) return 'medium';
    return 'strong';
}

// 結果画像を描画（エッジを単色で表示）
function drawResult(ctx, imageData, edges, mask, palm, width, height) {
    // 元画像を描画
    ctx.putImageData(imageData, 0, 0);

    // 検出エリアを薄くハイライト
    ctx.fillStyle = 'rgba(0, 255, 200, 0.1)';
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (mask[y * width + x] > 0) {
                ctx.fillRect(x, y, 1, 1);
            }
        }
    }

    // 検出したエッジを描画（閾値を低めに設定して細かく検出）
    const threshold = 25;
    ctx.fillStyle = 'rgba(0, 255, 200, 0.9)';

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = y * width + x;
            if (edges[idx] > threshold && mask[idx] > 0) {
                ctx.fillRect(x, y, 1, 1);
            }
        }
    }

    // ランドマークを描画（指の付け根のみ大きく）
    if (palm.landmarks) {
        const keyPoints = [0, 1, 5, 9, 13, 17]; // 手首、親指付け根、各指付け根

        // キーポイントを強調
        ctx.fillStyle = 'rgba(0, 255, 100, 0.8)';
        for (const i of keyPoints) {
            const lm = palm.landmarks[i];
            ctx.beginPath();
            ctx.arc(lm.x * width, lm.y * height, 6, 0, Math.PI * 2);
            ctx.fill();
        }

        // 手のスケルトン（薄く）
        ctx.strokeStyle = 'rgba(0, 255, 100, 0.3)';
        ctx.lineWidth = 1;
        const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4],
            [0, 5], [5, 6], [6, 7], [7, 8],
            [0, 9], [9, 10], [10, 11], [11, 12],
            [0, 13], [13, 14], [14, 15], [15, 16],
            [0, 17], [17, 18], [18, 19], [19, 20],
            [5, 9], [9, 13], [13, 17]
        ];
        for (const [i, j] of connections) {
            ctx.beginPath();
            ctx.moveTo(palm.landmarks[i].x * width, palm.landmarks[i].y * height);
            ctx.lineTo(palm.landmarks[j].x * width, palm.landmarks[j].y * height);
            ctx.stroke();
        }
    }
}

// 凡例を生成
function createLegend(lines) {
    legend.innerHTML = '';
    for (const [lineType, info] of Object.entries(PALM_LINES)) {
        const points = lines[lineType] || [];
        if (points.length < 5) continue;

        const item = document.createElement('div');
        item.className = 'legend-item';
        item.innerHTML = `
            <span class="legend-color" style="background: ${info.color}"></span>
            <span>${info.name}</span>
        `;
        legend.appendChild(item);
    }
}

// 占い結果を生成
function generateFortune(lines) {
    const results = [];

    for (const [lineType, info] of Object.entries(PALM_LINES)) {
        const points = lines[lineType] || [];
        const strength = evaluateLineStrength(points);
        const fortunes = FORTUNES[lineType][strength];
        const fortune = fortunes[Math.floor(Math.random() * fortunes.length)];

        results.push({
            name: info.name,
            description: info.description,
            color: info.color,
            fortune,
            strength
        });
    }

    return results;
}

// 占い結果を表示
function displayFortune(results) {
    let html = '<h2>あなたの手相鑑定結果</h2>';

    for (const result of results) {
        html += `
            <div class="fortune-section">
                <h3><span style="color: ${result.color}">■</span> ${result.name}（${result.description}）</h3>
                <p>${result.fortune}</p>
            </div>
        `;
    }

    fortuneResult.innerHTML = html;
}

// プログレス更新
function updateProgress(percent) {
    progressFill.style.width = `${percent}%`;
}

// セクション切り替え
function showSection(section) {
    cameraSection.classList.remove('active');
    analysisSection.classList.remove('active');
    resultSection.classList.remove('active');
    section.classList.add('active');
}

// MediaPipeで手を検出
async function detectHand(imageElement) {
    return new Promise((resolve) => {
        hands.onResults((results) => {
            if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
                resolve(results.multiHandLandmarks[0]);
            } else {
                resolve(null);
            }
        });

        hands.send({ image: imageElement });
    });
}

// 手全体をスキャンするアニメーション
async function showScanAnimation(ctx, landmarks, width, height) {
    // 手の全ランドマークから境界を計算（少し大きめに）
    let minX = 1, maxX = 0, minY = 1, maxY = 0;
    for (const lm of landmarks) {
        minX = Math.min(minX, lm.x);
        maxX = Math.max(maxX, lm.x);
        minY = Math.min(minY, lm.y);
        maxY = Math.max(maxY, lm.y);
    }

    // 少し余裕を持たせる
    const padding = 0.05;
    minX = Math.max(0, minX - padding);
    maxX = Math.min(1, maxX + padding);
    minY = Math.max(0, minY - padding);
    maxY = Math.min(1, maxY + padding);

    const left = Math.floor(minX * width);
    const right = Math.floor(maxX * width);
    const top = Math.floor(minY * height);
    const bottom = Math.floor(maxY * height);
    const scanWidth = right - left;
    const scanHeight = bottom - top;

    // スキャンアニメーション（上から下へ）
    const steps = 30;
    for (let i = 0; i <= steps; i++) {
        ctx.clearRect(0, 0, width, height);

        // 手の領域全体を薄くハイライト
        ctx.fillStyle = 'rgba(0, 255, 200, 0.1)';
        ctx.fillRect(left, top, scanWidth, scanHeight);

        // スキャンライン
        const scanY = top + (scanHeight * i / steps);
        ctx.strokeStyle = 'rgba(0, 255, 200, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(left, scanY);
        ctx.lineTo(right, scanY);
        ctx.stroke();

        // スキャン済みエリアのグリッド
        ctx.strokeStyle = 'rgba(0, 255, 200, 0.3)';
        ctx.lineWidth = 1;
        const gridSize = 20;
        for (let gx = left; gx <= right; gx += gridSize) {
            ctx.beginPath();
            ctx.moveTo(gx, top);
            ctx.lineTo(gx, Math.min(scanY, bottom));
            ctx.stroke();
        }
        for (let gy = top; gy <= scanY && gy <= bottom; gy += gridSize) {
            ctx.beginPath();
            ctx.moveTo(left, gy);
            ctx.lineTo(right, gy);
            ctx.stroke();
        }

        // ランドマークを点で表示
        ctx.fillStyle = 'rgba(0, 255, 100, 0.7)';
        for (const lm of landmarks) {
            const lx = lm.x * width;
            const ly = lm.y * height;
            if (ly <= scanY) {
                ctx.beginPath();
                ctx.arc(lx, ly, 4, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // 枠線
        ctx.strokeStyle = 'rgba(0, 255, 200, 0.5)';
        ctx.lineWidth = 2;
        ctx.strokeRect(left, top, scanWidth, scanHeight);

        // コーナーマーク
        const cornerSize = 15;
        ctx.strokeStyle = 'rgba(0, 255, 200, 0.9)';
        ctx.lineWidth = 3;
        // 左上
        ctx.beginPath();
        ctx.moveTo(left, top + cornerSize);
        ctx.lineTo(left, top);
        ctx.lineTo(left + cornerSize, top);
        ctx.stroke();
        // 右上
        ctx.beginPath();
        ctx.moveTo(right - cornerSize, top);
        ctx.lineTo(right, top);
        ctx.lineTo(right, top + cornerSize);
        ctx.stroke();
        // 左下
        ctx.beginPath();
        ctx.moveTo(left, bottom - cornerSize);
        ctx.lineTo(left, bottom);
        ctx.lineTo(left + cornerSize, bottom);
        ctx.stroke();
        // 右下
        ctx.beginPath();
        ctx.moveTo(right - cornerSize, bottom);
        ctx.lineTo(right, bottom);
        ctx.lineTo(right, bottom - cornerSize);
        ctx.stroke();

        await new Promise(r => setTimeout(r, 30));
    }

    // 最後に全体をフラッシュ
    ctx.fillStyle = 'rgba(0, 255, 200, 0.3)';
    ctx.fillRect(left, top, scanWidth, scanHeight);
    await new Promise(r => setTimeout(r, 200));
    ctx.clearRect(0, 0, width, height);
}

// 共通の分析処理
async function analyzeImage(canvas, width, height) {
    showSection(analysisSection);
    analysisSection.classList.add('analyzing');
    updateProgress(10);

    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, width, height);

    updateProgress(20);

    // MediaPipeで手を検出
    if (!handsReady) {
        alert('手の認識機能を読み込み中です。少々お待ちください。');
        showSection(cameraSection);
        return;
    }

    updateProgress(30);

    const landmarks = await detectHand(canvas);

    if (!landmarks) {
        alert('手が検出できませんでした。手のひらをはっきり写してください。');
        showSection(cameraSection);
        return;
    }

    updateProgress(40);

    // 分析画面にキャンバスを設定
    photoCanvas.width = width;
    photoCanvas.height = height;
    overlayCanvas.width = width;
    overlayCanvas.height = height;
    const photoCtx = photoCanvas.getContext('2d');
    photoCtx.putImageData(imageData, 0, 0);

    // スキャンアニメーションを表示
    const overlayCtx = overlayCanvas.getContext('2d');
    await showScanAnimation(overlayCtx, landmarks, width, height);

    updateProgress(60);

    // 手のひら領域を計算
    const palm = getPalmRegion(landmarks, width, height);
    console.log('Palm region:', palm);

    // 手のひらマスクを作成
    const mask = createPalmMask(palm, width, height, landmarks);

    updateProgress(70);

    // エッジ検出
    const edges = detectEdges(imageData, mask, palm);

    updateProgress(85);

    // 結果キャンバスに描画（色分けなし、エッジのみ表示）
    resultCanvas.width = width;
    resultCanvas.height = height;
    const resultCtx = resultCanvas.getContext('2d');
    drawResult(resultCtx, imageData, edges, mask, palm, width, height);

    // 凡例と占い結果は非表示
    legend.innerHTML = '';
    fortuneResult.innerHTML = '<h2>手相分析完了</h2><p style="text-align: center; color: #ccc;">手のひらのラインを検出しました</p>';

    updateProgress(100);

    await new Promise(r => setTimeout(r, 300));

    showSection(resultSection);
    analysisSection.classList.remove('analyzing');
}

// カメラ撮影・分析処理
async function captureAndAnalyze() {
    const width = video.videoWidth;
    const height = video.videoHeight;

    if (!width || !height) {
        alert('カメラの準備ができていません');
        return;
    }

    photoCanvas.width = width;
    photoCanvas.height = height;

    const ctx = photoCanvas.getContext('2d');
    ctx.drawImage(video, 0, 0, width, height);

    await analyzeImage(photoCanvas, width, height);
}

// 画像ファイルから分析
async function analyzeFromFile(file) {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = async () => {
        URL.revokeObjectURL(url);

        // 画像サイズを制限
        const maxSize = 640;
        let width = img.width;
        let height = img.height;

        if (width > maxSize || height > maxSize) {
            const ratio = Math.min(maxSize / width, maxSize / height);
            width = Math.floor(width * ratio);
            height = Math.floor(height * ratio);
        }

        photoCanvas.width = width;
        photoCanvas.height = height;

        const ctx = photoCanvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        await analyzeImage(photoCanvas, width, height);
    };

    img.onerror = () => {
        URL.revokeObjectURL(url);
        alert('画像の読み込みに失敗しました');
    };

    img.src = url;
}

// リトライ
function retry() {
    updateProgress(0);
    showSection(cameraSection);
}

// イベントリスナー
captureBtn.addEventListener('click', captureAndAnalyze);
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        analyzeFromFile(file);
        e.target.value = '';
    }
});
retryBtn.addEventListener('click', retry);

// 初期化
document.addEventListener('DOMContentLoaded', async () => {
    await initMediaPipe();
    await initCamera();
});
