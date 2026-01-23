// ==================================
// Mystic Tarot - Main JavaScript
// ==================================

// 大アルカナ22枚のデータ
const majorArcana = [
    {
        number: 0,
        name: "The Fool",
        nameJa: "愚者",
        symbol: "🃏",
        image: "assets/cards/the_fool.png",
        upright: {
            meaning: "新しい始まり、無邪気さ、冒険心、可能性、自由な精神。未知への一歩を踏み出す勇気を象徴しています。",
            advice: "今は新しいことを始める絶好のタイミングです。失敗を恐れず、心のままに進んでください。予期せぬ展開があなたを素晴らしい場所へ導くでしょう。"
        },
        reversed: {
            meaning: "無謀さ、軽率、リスクへの無自覚、停滞。慎重さが必要な時期を示しています。",
            advice: "今は一歩立ち止まって考える時です。衝動的な行動は避け、計画を見直してから進みましょう。"
        }
    },
    {
        number: 1,
        name: "The Magician",
        nameJa: "魔術師",
        symbol: "✨",
        image: "assets/cards/the_magician.png",
        upright: {
            meaning: "創造力、意志の力、スキル、自信、集中力。あなたには目標を達成するために必要なすべてが備わっています。",
            advice: "あなたの才能と能力を信じてください。今こそ行動を起こし、夢を現実に変える時です。集中力を持って取り組めば、望む結果が得られるでしょう。"
        },
        reversed: {
            meaning: "才能の浪費、自信過剰、詐欺、混乱。力の使い方を見直す必要があります。",
            advice: "本当に大切なことに集中しましょう。エネルギーを分散させず、一つのことに全力を注いでください。"
        }
    },
    {
        number: 2,
        name: "The High Priestess",
        nameJa: "女教皇",
        symbol: "🌙",
        image: "assets/cards/the_high_priestess.png",
        upright: {
            meaning: "直感、神秘、内なる知恵、潜在意識、静寂。表面下に隠された真実を見抜く力を持っています。",
            advice: "内なる声に耳を傾けてください。論理だけでなく、直感を信じることが大切です。答えはすでにあなたの中にあります。"
        },
        reversed: {
            meaning: "秘密、直感の無視、表面的な判断。内なる声を聞くことを怠っています。",
            advice: "外部の情報に振り回されず、自分自身と向き合う時間を作りましょう。瞑想や静かな時間が助けになります。"
        }
    },
    {
        number: 3,
        name: "The Empress",
        nameJa: "女帝",
        symbol: "👑",
        image: "assets/cards/the_empress.png",
        upright: {
            meaning: "豊穣、母性、自然、創造性、美。愛と豊かさに満ちた時期を示しています。",
            advice: "創造的なエネルギーを存分に発揮してください。周囲への愛情と思いやりが、さらなる豊かさを引き寄せます。"
        },
        reversed: {
            meaning: "依存、過保護、創造性のブロック。自立と自己表現が必要です。",
            advice: "自分自身を大切にし、自立心を育てましょう。過度に他者に依存せず、自分の力を信じてください。"
        }
    },
    {
        number: 4,
        name: "The Emperor",
        nameJa: "皇帝",
        symbol: "⚔️",
        image: "assets/cards/the_emperor.png",
        upright: {
            meaning: "権威、構造、秩序、父性、リーダーシップ。安定と統制を司る力を持っています。",
            advice: "明確な目標を立て、計画的に行動しましょう。規律と秩序が成功への鍵です。自信を持ってリーダーシップを発揮してください。"
        },
        reversed: {
            meaning: "支配欲、柔軟性の欠如、権力の乱用。コントロールを手放す必要があります。",
            advice: "すべてをコントロールしようとせず、柔軟性を持ちましょう。他者の意見にも耳を傾けてください。"
        }
    },
    {
        number: 5,
        name: "The Hierophant",
        nameJa: "教皇",
        symbol: "📿",
        image: "assets/cards/the_hierophant.png",
        upright: {
            meaning: "伝統、精神的指導、教育、信仰、conformity。古くからの知恵と教えを尊重する時です。",
            advice: "経験者や専門家からの助言を求めましょう。伝統的なアプローチが今は最善かもしれません。学びと成長を大切に。"
        },
        reversed: {
            meaning: "反抗、非伝統、個人の信念。既存のルールに疑問を持っています。",
            advice: "自分自身の価値観を見つめ直す時です。他者の期待よりも、自分の信念に従う勇気を持ちましょう。"
        }
    },
    {
        number: 6,
        name: "The Lovers",
        nameJa: "恋人たち",
        symbol: "💕",
        image: "assets/cards/the_lovers.png",
        upright: {
            meaning: "愛、調和、選択、価値観の一致、パートナーシップ。重要な選択と深い繋がりを示しています。",
            advice: "心からの選択をする時です。あなたの価値観に基づいて決断してください。愛と誠実さが道を照らします。"
        },
        reversed: {
            meaning: "不調和、価値観の不一致、誤った選択。関係性や選択を見直す必要があります。",
            advice: "現在の状況や関係性を客観的に見つめ直しましょう。自分にとって本当に大切なものは何かを考えてください。"
        }
    },
    {
        number: 7,
        name: "The Chariot",
        nameJa: "戦車",
        symbol: "🏆",
        image: "assets/cards/the_chariot.png",
        upright: {
            meaning: "勝利、意志の力、決断力、前進、自己制御。困難を乗り越える力を持っています。",
            advice: "目標に向かって力強く進んでください。障害があっても諦めず、意志の力で突破しましょう。勝利はすぐそこです。"
        },
        reversed: {
            meaning: "方向性の喪失、攻撃性、コントロールの欠如。進む方向を見失っています。",
            advice: "一度立ち止まり、本当に進みたい方向を確認しましょう。無理に進むより、方向を見直すことが大切です。"
        }
    },
    {
        number: 8,
        name: "Strength",
        nameJa: "力",
        symbol: "🦁",
        image: "assets/cards/strength.png",
        upright: {
            meaning: "内なる力、勇気、忍耐、自信、思いやり。柔らかな力で困難を乗り越える強さを持っています。",
            advice: "力強さと優しさのバランスを保ちましょう。困難に対しては、攻撃的ではなく、穏やかで粘り強いアプローチが効果的です。"
        },
        reversed: {
            meaning: "自己不信、弱さ、生エネルギーの欠如。内なる力を取り戻す必要があります。",
            advice: "自分自身を信じることから始めましょう。小さな成功体験を積み重ね、自信を取り戻してください。"
        }
    },
    {
        number: 9,
        name: "The Hermit",
        nameJa: "隠者",
        symbol: "🏔️",
        image: "assets/cards/the_hermit.png",
        upright: {
            meaning: "内省、孤独、探求、知恵、指導。自分自身と向き合い、真実を探求する時期です。",
            advice: "静かな時間を大切にしてください。一人で考え、内なる答えを見つける時です。焦らず、自分のペースで進みましょう。"
        },
        reversed: {
            meaning: "孤立、引きこもり、疎外感。孤独が過ぎています。",
            advice: "完全に閉じこもるのではなく、信頼できる人との交流も大切にしましょう。バランスが重要です。"
        }
    },
    {
        number: 10,
        name: "Wheel of Fortune",
        nameJa: "運命の輪",
        symbol: "☸️",
        image: "assets/cards/wheel_of_fortune.png",
        upright: {
            meaning: "運命、転機、幸運、サイクル、変化。人生の重要な転換点に立っています。",
            advice: "変化を恐れず、流れに身を任せましょう。今は運気が上昇している時。チャンスを逃さないでください。"
        },
        reversed: {
            meaning: "不運、抵抗、コントロールの喪失。変化に抵抗しています。",
            advice: "変化に抵抗しても流れは止められません。受け入れることで、新しい可能性が開けます。"
        }
    },
    {
        number: 11,
        name: "Justice",
        nameJa: "正義",
        symbol: "⚖️",
        image: "assets/cards/justice.png",
        upright: {
            meaning: "正義、公平、真実、因果応報、バランス。行動の結果が明らかになる時です。",
            advice: "正直で公平な態度を保ちましょう。真実を見つめ、責任ある行動を取ることが大切です。正しい判断が報われます。"
        },
        reversed: {
            meaning: "不公平、不誠実、偏見、責任回避。バランスが崩れています。",
            advice: "自分の行動を振り返り、公平さを取り戻しましょう。他者を責める前に、自分の責任を認めることが大切です。"
        }
    },
    {
        number: 12,
        name: "The Hanged Man",
        nameJa: "吊られた男",
        symbol: "🔮",
        image: "assets/cards/the_hanged_man.png",
        upright: {
            meaning: "一時停止、視点の転換、手放し、犠牲、啓示。違う角度から物事を見る時です。",
            advice: "今は行動よりも観察の時。立ち止まることで、新しい視点が得られます。焦らず、物事を違う角度から見てみましょう。"
        },
        reversed: {
            meaning: "抵抗、遅延、無駄な犠牲。手放すことへの抵抗があります。",
            advice: "古い考え方や執着を手放す勇気を持ちましょう。しがみつくことで、かえって前に進めなくなっています。"
        }
    },
    {
        number: 13,
        name: "Death",
        nameJa: "死神",
        symbol: "🦋",
        image: "assets/cards/death.png",
        upright: {
            meaning: "終わりと始まり、変容、移行、再生、手放し。古いものが終わり、新しいものが始まります。",
            advice: "終わりを恐れないでください。それは新しい始まりへの扉です。古い自分を手放し、変容を受け入れましょう。"
        },
        reversed: {
            meaning: "変化への抵抗、停滞、古いパターンへの執着。変容を拒んでいます。",
            advice: "変化は避けられません。抵抗するほど苦しくなります。流れに身を任せる勇気を持ちましょう。"
        }
    },
    {
        number: 14,
        name: "Temperance",
        nameJa: "節制",
        symbol: "🌈",
        image: "assets/cards/temperance.png",
        upright: {
            meaning: "バランス、節度、調和、忍耐、目的。中庸の道を歩む時です。",
            advice: "極端を避け、バランスを保ちましょう。忍耐強く、着実に進むことで、目標に到達できます。焦りは禁物です。"
        },
        reversed: {
            meaning: "不均衡、極端、焦り、過剰。バランスが崩れています。",
            advice: "生活のバランスを見直しましょう。仕事と休息、与えることと受け取ることのバランスを整えてください。"
        }
    },
    {
        number: 15,
        name: "The Devil",
        nameJa: "悪魔",
        symbol: "⛓️",
        image: "assets/cards/the_devil.png",
        upright: {
            meaning: "束縛、執着、物質主義、誘惑、影。何かに縛られている状態を示しています。",
            advice: "自分を縛っているものに気づいてください。それは外部からではなく、自分自身が作り出した鎖かもしれません。解放は可能です。"
        },
        reversed: {
            meaning: "解放、自由、束縛からの脱出。縛りから解き放たれる時です。",
            advice: "今こそ悪習慣や有害な関係から離れる時。自由への一歩を踏み出す勇気を持ちましょう。"
        }
    },
    {
        number: 16,
        name: "The Tower",
        nameJa: "塔",
        symbol: "⚡",
        image: "assets/cards/the_tower.png",
        upright: {
            meaning: "突然の変化、崩壊、啓示、解放、混乱。予期せぬ出来事が起こりますが、それは必要な変化です。",
            advice: "突然の変化に動揺するかもしれませんが、古い構造が崩れることで真実が見えてきます。再建の機会と捉えましょう。"
        },
        reversed: {
            meaning: "変化の回避、災難の先延ばし、恐れ。避けられない変化を先延ばしにしています。",
            advice: "問題を先延ばしにしても、いずれ向き合わなければなりません。今、勇気を持って対処しましょう。"
        }
    },
    {
        number: 17,
        name: "The Star",
        nameJa: "星",
        symbol: "⭐",
        image: "assets/cards/the_star.png",
        upright: {
            meaning: "希望、インスピレーション、平和、信仰、再生。困難の後に訪れる希望の光です。",
            advice: "希望を持ち続けてください。暗闘の時期を経て、今は回復と癒しの時。夢を信じ、未来に向かって進みましょう。"
        },
        reversed: {
            meaning: "絶望、信仰の欠如、切り離された感覚。希望を見失っています。",
            advice: "小さな希望の光を見つけてください。完璧を求めず、少しずつでも前に進むことが大切です。"
        }
    },
    {
        number: 18,
        name: "The Moon",
        nameJa: "月",
        symbol: "🌕",
        image: "assets/cards/the_moon.png",
        upright: {
            meaning: "幻想、直感、潜在意識、不安、秘密。表面下に隠されたものに注意が必要です。",
            advice: "直感を信じつつも、幻想に惑わされないように。物事をはっきり見極めるまで、重要な決断は控えましょう。"
        },
        reversed: {
            meaning: "混乱の解消、真実の露見、恐怖の克服。霧が晴れていきます。",
            advice: "これまで不明瞭だったことが明らかになってきます。恐れを手放し、真実を受け入れる準備をしましょう。"
        }
    },
    {
        number: 19,
        name: "The Sun",
        nameJa: "太陽",
        symbol: "☀️",
        image: "assets/cards/the_sun.png",
        upright: {
            meaning: "喜び、成功、活力、楽観、明晰さ。輝かしい時期が訪れています。",
            advice: "この幸せな時期を存分に楽しんでください。ポジティブなエネルギーを周囲に分け与えましょう。成功は手の届くところにあります。"
        },
        reversed: {
            meaning: "一時的な挫折、楽観の欠如、遅延。光が少し曇っています。",
            advice: "小さな挫折に落胆しないで。太陽は再び輝きます。前向きな姿勢を保ち続けてください。"
        }
    },
    {
        number: 20,
        name: "Judgement",
        nameJa: "審判",
        symbol: "📯",
        image: "assets/cards/judgement.png",
        upright: {
            meaning: "再生、目覚め、自己評価、召命、許し。人生を振り返り、新たなステージに進む時です。",
            advice: "過去を振り返り、学びを得る時です。自分自身を許し、他者も許しましょう。新しい自分として生まれ変わる準備ができています。"
        },
        reversed: {
            meaning: "自己不信、後悔、決断の回避。過去に囚われています。",
            advice: "過去の過ちを引きずらないで。学びを得たら前に進みましょう。自分を許すことから始めてください。"
        }
    },
    {
        number: 21,
        name: "The World",
        nameJa: "世界",
        symbol: "🌍",
        image: "assets/cards/the_world.png",
        upright: {
            meaning: "完成、達成、統合、旅の終わり、充実感。一つのサイクルが完了しました。",
            advice: "おめでとうございます。一つの旅が完了しました。達成感を味わい、次なる冒険への準備をしましょう。すべては繋がっています。"
        },
        reversed: {
            meaning: "未完成、遅延、目標への到達困難。あと一歩のところで止まっています。",
            advice: "完成までもう少しです。諦めないで最後まで歩み続けましょう。成功は目前です。"
        }
    }
];

// DOM要素
const introSection = document.getElementById('introSection');
const spreadSection = document.getElementById('spreadSection');
const resultSection = document.getElementById('resultSection');
const startBtn = document.getElementById('startBtn');
const retryBtn = document.getElementById('retryBtn');
const cardSpread = document.getElementById('cardSpread');
const resultCard = document.getElementById('resultCard');
const bgImage1 = document.getElementById('bgImage1');
const bgImage2 = document.getElementById('bgImage2');

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

// カードスプレッド生成
function createCardSpread() {
    cardSpread.innerHTML = '';
    for (let i = 0; i < 22; i++) {
        const card = document.createElement('div');
        card.className = 'spread-card';
        card.dataset.index = i;
        card.style.animationDelay = `${i * 0.05}s`;
        card.addEventListener('click', () => selectCard(card, i));
        cardSpread.appendChild(card);
    }
}

// カード選択
function selectCard(cardElement, index) {
    // すでに選択されている場合は無視
    if (cardElement.classList.contains('selected')) return;

    // 選択アニメーション
    cardElement.classList.add('selected');

    // 他のカードをフェードアウト
    const allCards = document.querySelectorAll('.spread-card');
    allCards.forEach((c, i) => {
        if (i !== index) {
            c.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            c.style.opacity = '0';
            c.style.transform = 'scale(0.8)';
        }
    });

    // ランダムにカードを選ぶ（シャッフル効果）
    const selectedCardIndex = Math.floor(Math.random() * majorArcana.length);
    const isReversed = Math.random() < 0.3; // 30%の確率で逆位置

    setTimeout(() => {
        showResult(selectedCardIndex, isReversed);
    }, 800);
}

// 結果表示
function showResult(cardIndex, isReversed) {
    const card = majorArcana[cardIndex];

    // DOM要素更新 - カード画像を表示
    document.getElementById('cardImage').src = card.image;
    document.getElementById('cardImage').alt = card.name;

    const position = isReversed ? '逆位置' : '正位置';
    document.getElementById('positionBadge').textContent = position;
    document.getElementById('resultTitle').textContent = `${card.nameJa}（${card.name}）`;

    const reading = isReversed ? card.reversed : card.upright;
    document.getElementById('cardMeaning').textContent = reading.meaning;
    document.getElementById('cardAdvice').textContent = reading.advice;

    // セクション切り替え
    spreadSection.classList.add('hidden');
    resultSection.classList.remove('hidden');

    // カードフリップアニメーション
    setTimeout(() => {
        if (isReversed) {
            resultCard.classList.add('reversed');
        } else {
            resultCard.classList.add('flipped');
        }
    }, 300);
}

// ローマ数字変換
function toRoman(num) {
    if (num === 0) return '0';
    const romanNumerals = [
        ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'],
        ['', 'X', 'XX']
    ];

    if (num <= 9) return romanNumerals[0][num];
    if (num <= 21) {
        const tens = Math.floor(num / 10);
        const ones = num % 10;
        return romanNumerals[1][tens] + romanNumerals[0][ones];
    }
    return num.toString();
}

// リセット
function resetReading() {
    // 結果カードのクラスをリセット
    resultCard.classList.remove('flipped', 'reversed');

    // アニメーションのリセット
    document.getElementById('positionBadge').style.animation = 'none';
    document.getElementById('resultContent').style.animation = 'none';
    document.querySelector('.retry-btn').style.animation = 'none';

    // 強制リフロー
    void document.getElementById('positionBadge').offsetWidth;

    // セクション切り替え
    resultSection.classList.add('hidden');
    spreadSection.classList.remove('hidden');

    // カードスプレッドを再生成
    createCardSpread();

    // アニメーションを再適用
    setTimeout(() => {
        document.getElementById('positionBadge').style.animation = '';
        document.getElementById('resultContent').style.animation = '';
        document.querySelector('.retry-btn').style.animation = '';
    }, 100);
}

// イベントリスナー
startBtn.addEventListener('click', () => {
    introSection.classList.add('hidden');
    spreadSection.classList.remove('hidden');
    createCardSpread();
});

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
});
