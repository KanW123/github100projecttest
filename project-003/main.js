/**
 * 手相占いアプリ - Palm Reading App
 * 肌色検出 + エッジ検出で手相の線を識別
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

// RGB → HSV 変換
function rgbToHsv(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const d = max - min;
    let h, s, v = max;

    s = max === 0 ? 0 : d / max;

    if (max === min) {
        h = 0;
    } else {
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break;
            case g: h = ((b - r) / d + 2) * 60; break;
            case b: h = ((r - g) / d + 4) * 60; break;
        }
    }
    return { h, s: s * 100, v: v * 100 };
}

// 肌色判定
function isSkinColor(r, g, b) {
    // RGB条件
    if (r < 60 || g < 40 || b < 20) return false;
    if (r <= g || r <= b) return false;
    if (Math.abs(r - g) < 15) return false;

    // HSV条件
    const { h, s, v } = rgbToHsv(r, g, b);
    if (h > 50 || s < 10 || s > 70 || v < 30) return false;

    return true;
}

// 肌色検出
function detectSkin(imageData) {
    const { data, width, height } = imageData;
    const mask = new Uint8Array(width * height);

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const idx = i / 4;
        mask[idx] = isSkinColor(r, g, b) ? 255 : 0;
    }

    return mask;
}

// Sobelエッジ検出
function detectEdges(imageData, skinMask) {
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

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const idx = y * width + x;

            // 収縮済みマスク領域のみ処理（輪郭は既に除外されている）
            if (skinMask && skinMask[idx] === 0) continue;

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

// 手のひら領域を検出（指を除外）
function detectPalmRegion(skinMask, width, height) {
    // 各行の肌色ピクセル幅を計算
    const rowWidths = [];
    const rowBounds = [];

    for (let y = 0; y < height; y++) {
        let minX = width, maxX = 0;
        let count = 0;
        for (let x = 0; x < width; x++) {
            if (skinMask[y * width + x] > 0) {
                minX = Math.min(minX, x);
                maxX = Math.max(maxX, x);
                count++;
            }
        }
        rowWidths.push(count > 0 ? maxX - minX : 0);
        rowBounds.push({ minX, maxX, count });
    }

    // 最大幅を見つける（手のひらの中心部）
    let maxWidth = 0;
    let maxWidthY = 0;
    for (let y = 0; y < height; y++) {
        if (rowWidths[y] > maxWidth) {
            maxWidth = rowWidths[y];
            maxWidthY = y;
        }
    }

    // 手のひらの上端を検出（幅が急激に狭くなる場所 = 指の付け根）
    let palmTop = 0;
    const widthThreshold = maxWidth * 0.7;
    for (let y = maxWidthY; y >= 0; y--) {
        if (rowWidths[y] < widthThreshold) {
            palmTop = y;
            break;
        }
    }

    // 手のひらの下端を検出
    let palmBottom = height - 1;
    for (let y = maxWidthY; y < height; y++) {
        if (rowWidths[y] < maxWidth * 0.3) {
            palmBottom = y;
            break;
        }
    }

    // 手のひら領域の左右境界（palmTop〜palmBottom間で計算）
    let palmMinX = width, palmMaxX = 0;
    for (let y = palmTop; y <= palmBottom; y++) {
        if (rowBounds[y].count > 0) {
            palmMinX = Math.min(palmMinX, rowBounds[y].minX);
            palmMaxX = Math.max(palmMaxX, rowBounds[y].maxX);
        }
    }

    return {
        top: palmTop,
        bottom: palmBottom,
        left: palmMinX,
        right: palmMaxX,
        width: palmMaxX - palmMinX,
        height: palmBottom - palmTop,
        centerX: palmMinX + (palmMaxX - palmMinX) / 2,
        centerY: palmTop + (palmBottom - palmTop) / 2
    };
}

// 手相の線を分類
function classifyPalmLines(edges, width, height, skinMask) {
    const lines = {
        lifeLine: [],
        headLine: [],
        heartLine: [],
        fateLine: []
    };

    // 手のひら領域を検出
    const palm = detectPalmRegion(skinMask, width, height);

    // 手のひらが検出できなかった場合
    if (palm.width < 50 || palm.height < 50) {
        console.log('Palm region not detected properly');
        return lines;
    }

    console.log('Palm region:', palm);

    // エッジポイントを手相の線に分類（手のひら領域内のみ）
    const threshold = 35;
    const margin = 0.08; // 境界から8%内側だけを対象に

    for (let y = palm.top; y <= palm.bottom; y++) {
        for (let x = palm.left; x <= palm.right; x++) {
            const idx = y * width + x;
            if (edges[idx] < threshold || skinMask[idx] === 0) continue;

            // 手のひら内での相対位置 (0-1)
            const relX = (x - palm.left) / palm.width;
            const relY = (y - palm.top) / palm.height;

            // 境界付近は除外（輪郭のエッジを避ける）
            if (relX < margin || relX > 1 - margin || relY < margin || relY > 1 - margin) continue;

            // 位置に基づいて分類
            // 感情線: 手のひら上部 (relY: 0.1-0.35)
            if (relY > 0.1 && relY < 0.35 && relX > 0.2 && relX < 0.9) {
                lines.heartLine.push({ x, y, strength: edges[idx] });
            }
            // 頭脳線: 手のひら中部 (relY: 0.25-0.5)
            else if (relY > 0.25 && relY < 0.5 && relX > 0.15 && relX < 0.85) {
                lines.headLine.push({ x, y, strength: edges[idx] });
            }
            // 生命線: 左側カーブ (親指側)
            else if (relX < 0.45 && relY > 0.2 && relY < 0.85) {
                lines.lifeLine.push({ x, y, strength: edges[idx] });
            }
            // 運命線: 中央縦線
            else if (relX > 0.35 && relX < 0.65 && relY > 0.4 && relY < 0.9) {
                lines.fateLine.push({ x, y, strength: edges[idx] });
            }
        }
    }

    return lines;
}

// 手相の強さを評価
function evaluateLineStrength(points) {
    if (points.length < 10) return 'weak';
    if (points.length < 50) return 'medium';
    return 'strong';
}

// 結果画像を描画
function drawResult(ctx, imageData, lines, width, height) {
    // 元画像を描画
    ctx.putImageData(imageData, 0, 0);

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

// 共通の分析処理
async function analyzeImage(imageData, width, height) {
    // 分析画面に切り替え
    showSection(analysisSection);
    analysisSection.classList.add('analyzing');
    updateProgress(10);

    // 非同期で処理
    await new Promise(r => setTimeout(r, 300));

    updateProgress(30);

    // 肌色検出
    const skinMask = detectSkin(imageData);
    updateProgress(50);

    // エッジ検出（肌色領域内のみ）
    const edges = detectEdges(imageData, skinMask);
    updateProgress(70);

    // 手相の線を分類（手のひら領域内、境界から離れた部分のみ）
    const lines = classifyPalmLines(edges, width, height, skinMask);
    updateProgress(90);

    // 結果キャンバスに描画
    resultCanvas.width = width;
    resultCanvas.height = height;
    const resultCtx = resultCanvas.getContext('2d');
    drawResult(resultCtx, imageData, lines, width, height);

    // 凡例生成
    createLegend(lines);

    // 占い結果生成
    const fortune = generateFortune(lines);
    displayFortune(fortune);

    updateProgress(100);

    await new Promise(r => setTimeout(r, 300));

    // 結果画面に切り替え
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
    overlayCanvas.width = width;
    overlayCanvas.height = height;

    const ctx = photoCanvas.getContext('2d');
    ctx.drawImage(video, 0, 0, width, height);

    const imageData = ctx.getImageData(0, 0, width, height);
    await analyzeImage(imageData, width, height);
}

// 画像ファイルから分析
async function analyzeFromFile(file) {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = async () => {
        URL.revokeObjectURL(url);

        // 画像サイズを制限（処理速度のため）
        const maxSize = 400;
        let width = img.width;
        let height = img.height;

        if (width > maxSize || height > maxSize) {
            const ratio = Math.min(maxSize / width, maxSize / height);
            width = Math.floor(width * ratio);
            height = Math.floor(height * ratio);
        }

        photoCanvas.width = width;
        photoCanvas.height = height;
        overlayCanvas.width = width;
        overlayCanvas.height = height;

        const ctx = photoCanvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const imageData = ctx.getImageData(0, 0, width, height);
        await analyzeImage(imageData, width, height);
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
        e.target.value = ''; // リセット
    }
});
retryBtn.addEventListener('click', retry);

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    initCamera();
});
