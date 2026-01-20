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

// 手のランドマークから手のひら領域を計算
function getPalmRegion(landmarks, width, height) {
    // ランドマークインデックス:
    // 0: 手首
    // 5: 人差し指付け根, 9: 中指付け根, 13: 薬指付け根, 17: 小指付け根
    // 1: 親指付け根

    const wrist = landmarks[0];
    const indexBase = landmarks[5];
    const middleBase = landmarks[9];
    const ringBase = landmarks[13];
    const pinkyBase = landmarks[17];
    const thumbBase = landmarks[1];

    // 手のひらの境界を計算
    const palmPoints = [wrist, thumbBase, indexBase, middleBase, ringBase, pinkyBase];

    let minX = 1, maxX = 0, minY = 1, maxY = 0;
    for (const p of palmPoints) {
        minX = Math.min(minX, p.x);
        maxX = Math.max(maxX, p.x);
        minY = Math.min(minY, p.y);
        maxY = Math.max(maxY, p.y);
    }

    // ピクセル座標に変換（少し内側にマージン）
    const margin = 0.02;
    return {
        left: Math.floor((minX + margin) * width),
        right: Math.floor((maxX - margin) * width),
        top: Math.floor((minY + margin) * height),
        bottom: Math.floor((maxY - margin) * height),
        width: Math.floor((maxX - minX - margin * 2) * width),
        height: Math.floor((maxY - minY - margin * 2) * height),
        landmarks: landmarks,
        // 手のひらの中心
        centerX: Math.floor(middleBase.x * width),
        centerY: Math.floor((wrist.y + middleBase.y) / 2 * height)
    };
}

// 手のひら領域のマスクを作成
function createPalmMask(palm, width, height, landmarks) {
    const mask = new Uint8Array(width * height);

    // 手のひらのポリゴンを定義（手首→親指側→指の付け根→小指側→手首）
    const polygonPoints = [
        landmarks[0],  // 手首
        landmarks[1],  // 親指付け根
        landmarks[2],  // 親指
        landmarks[5],  // 人差し指付け根
        landmarks[9],  // 中指付け根
        landmarks[13], // 薬指付け根
        landmarks[17], // 小指付け根
    ].map(p => ({ x: Math.floor(p.x * width), y: Math.floor(p.y * height) }));

    // ポリゴン内部を塗りつぶし
    for (let y = palm.top; y <= palm.bottom; y++) {
        for (let x = palm.left; x <= palm.right; x++) {
            if (isPointInPolygon(x, y, polygonPoints)) {
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

// Sobelエッジ検出
function detectEdges(imageData, mask, palm) {
    const { data, width, height } = imageData;
    const edges = new Float32Array(width * height);

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
        }
    }

    // 正規化
    let max = 0;
    for (let i = 0; i < edges.length; i++) {
        if (edges[i] > max) max = edges[i];
    }
    if (max > 0) {
        for (let i = 0; i < edges.length; i++) {
            edges[i] = (edges[i] / max) * 255;
        }
    }

    return edges;
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

    const threshold = 30;

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

// 結果画像を描画
function drawResult(ctx, imageData, lines, palm, width, height) {
    // 元画像を描画
    ctx.putImageData(imageData, 0, 0);

    // 手のひら領域を薄くハイライト
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(palm.left, palm.top, palm.width, palm.height);

    // 各線を色付きで描画
    for (const [lineType, points] of Object.entries(lines)) {
        if (points.length === 0) continue;

        const color = PALM_LINES[lineType].color;
        ctx.fillStyle = color;

        for (const point of points) {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // ランドマークを描画（デバッグ用、小さく）
    if (palm.landmarks) {
        ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
        for (const lm of palm.landmarks) {
            ctx.beginPath();
            ctx.arc(lm.x * width, lm.y * height, 3, 0, Math.PI * 2);
            ctx.fill();
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

    updateProgress(50);

    // 手のひら領域を計算
    const palm = getPalmRegion(landmarks, width, height);
    console.log('Palm region:', palm);

    // 手のひらマスクを作成
    const mask = createPalmMask(palm, width, height, landmarks);

    updateProgress(70);

    // エッジ検出
    const edges = detectEdges(imageData, mask, palm);

    updateProgress(80);

    // 手相の線を分類
    const lines = classifyPalmLines(edges, width, height, mask, palm);

    updateProgress(90);

    // 結果キャンバスに描画
    resultCanvas.width = width;
    resultCanvas.height = height;
    const resultCtx = resultCanvas.getContext('2d');
    drawResult(resultCtx, imageData, lines, palm, width, height);

    // 凡例生成
    createLegend(lines);

    // 占い結果生成
    const fortune = generateFortune(lines);
    displayFortune(fortune);

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
