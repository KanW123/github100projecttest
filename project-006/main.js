// ==================================
// Mystic Tarot - Main JavaScript
// ==================================
// カードデータはcard-data.js、アドバイスロジックはadvice-logic.jsに分離

// DOM要素
const introSection = document.getElementById('introSection');
const modeSection = document.getElementById('modeSection');
const loveSetupSection = document.getElementById('loveSetupSection');
const spreadSection = document.getElementById('spreadSection');
const resultSection = document.getElementById('resultSection');
const startBtn = document.getElementById('startBtn');
const retryBtn = document.getElementById('retryBtn');
const cardSpread = document.getElementById('cardSpread');
const resultCard = document.getElementById('resultCard');
const bgImage1 = document.getElementById('bgImage1');
const bgImage2 = document.getElementById('bgImage2');
const bgm = document.getElementById('bgm');
const bgmToggle = document.getElementById('bgmToggle');

// 現在の占いモード
let currentMode = 'daily';
let selectedCards = [];
let cardsToSelect = 1;

// 恋愛占い設定
let loveSettings = {
    yourGender: null,
    partnerGender: null,
    relation: null
};

// BGM状態
let bgmPlaying = false;

// モード設定
const modeConfig = {
    daily: {
        title: '今日の運勢',
        cards: 1,
        hint: '直感を信じて、1枚のカードをタップしてください',
        resultTitle: (card) => `${card.nameJa}（${card.name}）`
    },
    love: {
        title: '恋愛占い',
        cards: 2,
        hint: 'あなたのカードと相手のカードを選んでください（2枚）',
        labels: ['あなた', '相手'],
        resultTitle: () => '恋愛の相性'
    },
    time: {
        title: '過去・現在・未来',
        cards: 3,
        hint: '3枚のカードを順番に選んでください',
        labels: ['過去', '現在', '未来'],
        resultTitle: () => '時の流れ'
    },
    career: {
        title: '仕事運',
        cards: 1,
        hint: '直感を信じて、1枚のカードをタップしてください',
        resultTitle: (card) => `${card.nameJa}（${card.name}）`
    }
};

// パーティクルキャンバス
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');

// パーティクル配列
let particles = [];

// キャンバスサイズ設定
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// パーティクルクラス
class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedY = Math.random() * 0.3 + 0.1;
        this.speedX = (Math.random() - 0.5) * 0.2;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.twinkleSpeed = Math.random() * 0.02 + 0.01;
        this.twinkleOffset = Math.random() * Math.PI * 2;
    }

    update() {
        this.y -= this.speedY;
        this.x += this.speedX;
        this.opacity = 0.3 + Math.sin(Date.now() * this.twinkleSpeed + this.twinkleOffset) * 0.3;

        if (this.y < -10) {
            this.y = canvas.height + 10;
            this.x = Math.random() * canvas.width;
        }
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = '#d4af37';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#d4af37';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// パーティクル初期化
function initParticles() {
    particles = [];
    const particleCount = Math.floor((canvas.width * canvas.height) / 15000);
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

// パーティクルアニメーション
function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animateParticles);
}

// 背景画像のクロスフェード
let currentBg = 1;
function initBackgroundCrossfade() {
    bgImage1.classList.add('active');

    setInterval(() => {
        if (currentBg === 1) {
            bgImage1.classList.remove('active');
            bgImage2.classList.add('active');
            currentBg = 2;
        } else {
            bgImage2.classList.remove('active');
            bgImage1.classList.add('active');
            currentBg = 1;
        }
    }, 10000);
}

// カード選択
function selectCard(cardElement, index) {
    // すでに選択されている場合は無視
    if (cardElement.classList.contains('selected')) return;

    // 選択アニメーション
    cardElement.classList.add('selected');

    // ランダムにカードを選ぶ（シャッフル効果）
    let selectedCardIndex;
    do {
        selectedCardIndex = Math.floor(Math.random() * majorArcana.length);
    } while (selectedCards.some(c => c.cardIndex === selectedCardIndex));

    const isReversed = Math.random() < 0.3; // 30%の確率で逆位置

    selectedCards.push({
        cardIndex: selectedCardIndex,
        isReversed: isReversed
    });

    // ヒントを更新
    const spreadHint = document.querySelector('.spread-hint');
    const remaining = cardsToSelect - selectedCards.length;

    if (remaining > 0) {
        // まだ選ぶカードがある
        const labels = modeConfig[currentMode].labels;
        if (labels) {
            spreadHint.textContent = `${labels[selectedCards.length]}のカードを選んでください`;
        } else {
            spreadHint.textContent = `あと${remaining}枚選んでください`;
        }
    } else {
        // 全部選んだ - 他のカードをフェードアウト
        const allCards = document.querySelectorAll('.spread-card');
        allCards.forEach((c) => {
            if (!c.classList.contains('selected')) {
                c.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                c.style.opacity = '0';
                c.style.transform = 'scale(0.8)';
            }
        });

        setTimeout(() => {
            showResult();
        }, 800);
    }
}

// 結果表示
function showResult() {
    const config = modeConfig[currentMode];

    // セクション切り替え
    spreadSection.classList.add('hidden');
    resultSection.classList.remove('hidden');

    if (selectedCards.length === 1) {
        // シングルカード表示
        const { cardIndex, isReversed } = selectedCards[0];
        const card = majorArcana[cardIndex];

        document.getElementById('cardImage').src = card.image;
        document.getElementById('cardImage').alt = card.name;

        const position = isReversed ? '逆位置' : '正位置';
        document.getElementById('positionBadge').textContent = position;
        document.getElementById('resultTitle').textContent = config.resultTitle(card);

        // 拡張版の詳細アドバイスを使用
        const detailedAdvice = generateDetailedSingleCardAdvice(card, isReversed, currentMode);
        const reading = isReversed ? card.reversed : card.upright;

        // 詳細な意味を表示
        let meaningText = '';
        if (card.keywords) {
            meaningText += `【キーワード】${card.keywords.join('、')}\n\n`;
        }
        meaningText += `【カードの意味】\n`;
        meaningText += reading.detailed || reading.meaning;

        document.getElementById('cardMeaning').textContent = meaningText;
        document.getElementById('cardAdvice').textContent = detailedAdvice;

        // シングルカード表示
        document.querySelector('.result-card-container').style.display = '';
        document.getElementById('multiCardResult').style.display = 'none';

        // カードフリップアニメーション
        setTimeout(() => {
            if (isReversed) {
                resultCard.classList.add('reversed');
            } else {
                resultCard.classList.add('flipped');
            }
        }, 300);
    } else {
        // マルチカード表示
        document.querySelector('.result-card-container').style.display = 'none';
        document.getElementById('multiCardResult').style.display = '';
        document.getElementById('resultTitle').textContent = config.resultTitle();

        const multiContainer = document.getElementById('multiCardResult');
        multiContainer.innerHTML = '';

        selectedCards.forEach((selection, i) => {
            const { cardIndex, isReversed } = selection;
            const card = majorArcana[cardIndex];
            const reading = isReversed ? card.reversed : card.upright;
            const label = config.labels ? config.labels[i] : `カード ${i + 1}`;

            const cardDiv = document.createElement('div');
            cardDiv.className = 'multi-card-item';
            cardDiv.innerHTML = `
                <div class="multi-card-label">${label}</div>
                <div class="multi-card ${isReversed ? 'reversed' : ''}">
                    <img src="${card.image}" alt="${card.name}">
                </div>
                <div class="multi-card-name">${card.nameJa}</div>
                <div class="multi-card-position">${isReversed ? '逆位置' : '正位置'}</div>
                <div class="multi-card-meaning">${reading.meaning}</div>
            `;
            multiContainer.appendChild(cardDiv);

            // カード登場アニメーション
            setTimeout(() => {
                cardDiv.classList.add('visible');
            }, 300 + i * 400);
        });

        // アドバイス生成（複数カードの場合）
        generateMultiCardAdvice();
    }
}

// マルチカードのアドバイス生成
function generateMultiCardAdvice() {
    let advice = '';
    let meaning = '';

    if (currentMode === 'love') {
        const you = selectedCards[0];
        const partner = selectedCards[1];
        const yourCard = majorArcana[you.cardIndex];
        const partnerCard = majorArcana[partner.cardIndex];

        // 拡張版の相性スコア計算
        const compatibility = calculateCompatibilityAdvanced(you, partner);

        // 基本の状態説明（拡張版）
        meaning = `【あなたの状態】\n`;
        meaning += `${yourCard.nameJa}（${you.isReversed ? '逆位置' : '正位置'}）\n`;
        if (yourCard.keywords) {
            meaning += `キーワード: ${yourCard.keywords.slice(0, 3).join('、')}\n`;
        }
        meaning += you.isReversed
            ? yourCard.reversed.meaning
            : yourCard.upright.meaning;
        meaning += `\n\n`;

        meaning += `【お相手の状態】\n`;
        meaning += `${partnerCard.nameJa}（${partner.isReversed ? '逆位置' : '正位置'}）\n`;
        if (partnerCard.keywords) {
            meaning += `キーワード: ${partnerCard.keywords.slice(0, 3).join('、')}\n`;
        }
        meaning += partner.isReversed
            ? partnerCard.reversed.meaning
            : partnerCard.upright.meaning;

        // 拡張版の詳細アドバイス
        advice = generateDetailedLoveAdviceExpanded(yourCard, partnerCard, you.isReversed, partner.isReversed, compatibility, loveSettings);

    } else if (currentMode === 'time') {
        const pastSelection = selectedCards[0];
        const presentSelection = selectedCards[1];
        const futureSelection = selectedCards[2];
        const past = majorArcana[pastSelection.cardIndex];
        const present = majorArcana[presentSelection.cardIndex];
        const future = majorArcana[futureSelection.cardIndex];

        // 拡張版の意味表示
        meaning = `【過去】${past.nameJa}（${pastSelection.isReversed ? '逆位置' : '正位置'}）\n`;
        if (past.keywords) meaning += `キーワード: ${past.keywords.slice(0, 3).join('、')}\n`;
        meaning += pastSelection.isReversed ? past.reversed.meaning : past.upright.meaning;

        meaning += `\n\n【現在】${present.nameJa}（${presentSelection.isReversed ? '逆位置' : '正位置'}）\n`;
        if (present.keywords) meaning += `キーワード: ${present.keywords.slice(0, 3).join('、')}\n`;
        meaning += presentSelection.isReversed ? present.reversed.meaning : present.upright.meaning;

        meaning += `\n\n【未来】${future.nameJa}（${futureSelection.isReversed ? '逆位置' : '正位置'}）\n`;
        if (future.keywords) meaning += `キーワード: ${future.keywords.slice(0, 3).join('、')}\n`;
        meaning += futureSelection.isReversed ? future.reversed.meaning : future.upright.meaning;

        // 拡張版の時間軸アドバイス
        advice = generateDetailedTimeAdvice(past, present, future, pastSelection.isReversed, presentSelection.isReversed, futureSelection.isReversed);
    }

    document.getElementById('cardMeaning').textContent = meaning;
    document.getElementById('cardAdvice').textContent = advice;
}

// リセット
function resetReading() {
    // 結果カードのクラスをリセット
    resultCard.classList.remove('flipped', 'reversed');

    // 選択状態リセット
    selectedCards = [];

    // 恋愛設定もリセット
    resetLoveSettings();

    // アニメーションのリセット
    document.getElementById('positionBadge').style.animation = 'none';
    document.getElementById('resultContent').style.animation = 'none';
    document.querySelector('.retry-btn').style.animation = 'none';

    // 強制リフロー
    void document.getElementById('positionBadge').offsetWidth;

    // セクション切り替え（モード選択に戻る）
    resultSection.classList.add('hidden');
    loveSetupSection.classList.add('hidden');
    modeSection.classList.remove('hidden');

    // マルチカード表示リセット
    document.getElementById('multiCardResult').innerHTML = '';
    document.getElementById('multiCardResult').style.display = 'none';
    document.querySelector('.result-card-container').style.display = '';

    // アニメーションを再適用
    setTimeout(() => {
        document.getElementById('positionBadge').style.animation = '';
        document.getElementById('resultContent').style.animation = '';
        document.querySelector('.retry-btn').style.animation = '';
    }, 100);
}

// 画像プリロード
function preloadAllImages() {
    return new Promise((resolve) => {
        const imagePaths = [
            ...majorArcana.map(card => card.image),
            'assets/cards/card_back.png'
        ];

        let loadedCount = 0;
        const totalImages = imagePaths.length;

        imagePaths.forEach(path => {
            const img = new Image();
            img.onload = img.onerror = () => {
                loadedCount++;
                // プログレス更新
                const progress = Math.round((loadedCount / totalImages) * 100);
                const loadingText = document.querySelector('.spread-hint');
                if (loadingText && loadingText.dataset.loading === 'true') {
                    loadingText.textContent = `カードを準備中... ${progress}%`;
                }

                if (loadedCount >= totalImages) {
                    resolve();
                }
            };
            img.src = path;
        });
    });
}

// モード選択画面へ
startBtn.addEventListener('click', async () => {
    introSection.classList.add('hidden');
    modeSection.classList.remove('hidden');

    // 画像をバックグラウンドでプリロード開始
    preloadAllImages();
});

// モードカードのクリックイベント
document.querySelectorAll('.mode-card').forEach(card => {
    card.addEventListener('click', () => {
        currentMode = card.dataset.mode;
        selectedCards = [];
        cardsToSelect = modeConfig[currentMode].cards;

        // 恋愛モードは設定画面へ
        if (currentMode === 'love') {
            modeSection.classList.add('hidden');
            loveSetupSection.classList.remove('hidden');
            resetLoveSettings();
        } else {
            startReading();
        }
    });
});

// 恋愛占い設定リセット
function resetLoveSettings() {
    loveSettings = { yourGender: null, partnerGender: null, relation: null };
    document.querySelectorAll('.gender-btn, .relation-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    document.getElementById('startLoveBtn').disabled = true;
}

// 性別・関係性選択
document.querySelectorAll('.gender-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.dataset.target;
        const gender = btn.dataset.gender;

        // 同じグループの他のボタンの選択を解除
        document.querySelectorAll(`.gender-btn[data-target="${target}"]`).forEach(b => {
            b.classList.remove('selected');
        });
        btn.classList.add('selected');

        if (target === 'you') {
            loveSettings.yourGender = gender;
        } else {
            loveSettings.partnerGender = gender;
        }

        checkLoveSettingsComplete();
    });
});

document.querySelectorAll('.relation-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.relation-btn').forEach(b => {
            b.classList.remove('selected');
        });
        btn.classList.add('selected');
        loveSettings.relation = btn.dataset.relation;
        checkLoveSettingsComplete();
    });
});

function checkLoveSettingsComplete() {
    const complete = loveSettings.yourGender && loveSettings.partnerGender && loveSettings.relation;
    document.getElementById('startLoveBtn').disabled = !complete;
}

// 恋愛占い開始
document.getElementById('startLoveBtn').addEventListener('click', () => {
    loveSetupSection.classList.add('hidden');
    startReading();
});

// 占い開始
async function startReading() {
    modeSection.classList.add('hidden');
    spreadSection.classList.remove('hidden');

    // タイトルとヒントを更新
    document.querySelector('.spread-title').textContent = modeConfig[currentMode].title;
    const spreadHint = document.querySelector('.spread-hint');
    spreadHint.dataset.loading = 'true';
    spreadHint.textContent = 'カードを準備中...';

    // カードスプレッドを生成（初期状態は非表示）
    cardSpread.innerHTML = '';
    cardSpread.classList.add('loading');

    for (let i = 0; i < 22; i++) {
        const card = document.createElement('div');
        card.className = 'spread-card loading';
        card.dataset.index = i;
        // ランダムな回転を設定
        const rotation = (Math.random() - 0.5) * 10;
        card.style.setProperty('--card-rotation', `${rotation}deg`);
        cardSpread.appendChild(card);
    }

    // 全画像をプリロード
    await preloadAllImages();

    // ローディング完了 - カードを配る演出
    spreadHint.dataset.loading = 'false';
    spreadHint.textContent = 'カードを配っています...';
    cardSpread.classList.remove('loading');

    // カードを順番に飛ばして配置
    const cards = cardSpread.querySelectorAll('.spread-card');
    await dealCards(cards);

    // ヒントを表示
    spreadHint.textContent = modeConfig[currentMode].hint;

    // カードにクリックイベントを追加
    cards.forEach((card, i) => {
        card.classList.remove('loading');
        card.addEventListener('click', () => selectCard(card, i));
    });
}

// カードを配る演出
function dealCards(cards) {
    return new Promise((resolve) => {
        let dealt = 0;
        const totalCards = cards.length;

        cards.forEach((card, i) => {
            setTimeout(() => {
                card.classList.add('dealt');
                dealt++;
                if (dealt >= totalCards) {
                    setTimeout(resolve, 300);
                }
            }, i * 60); // 60msごとに1枚ずつ
        });
    });
}

retryBtn.addEventListener('click', resetReading);

// 初期化
window.addEventListener('resize', () => {
    resizeCanvas();
    initParticles();
});

document.addEventListener('DOMContentLoaded', () => {
    resizeCanvas();
    initParticles();
    animateParticles();
    initBackgroundCrossfade();
    initBGM();
});

// BGM初期化
function initBGM() {
    bgm.volume = 0.5;

    bgmToggle.addEventListener('click', () => {
        if (bgmPlaying) {
            bgm.pause();
            bgmToggle.classList.remove('playing');
            bgmToggle.querySelector('.bgm-icon').textContent = '🔇';
        } else {
            bgm.play().catch(e => console.log('BGM再生エラー:', e));
            bgmToggle.classList.add('playing');
            bgmToggle.querySelector('.bgm-icon').textContent = '🔊';
        }
        bgmPlaying = !bgmPlaying;
    });
}
