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

        const reading = isReversed ? card.reversed : card.upright;
        document.getElementById('cardMeaning').textContent = reading.meaning;
        document.getElementById('cardAdvice').textContent = reading.advice;

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
    const config = modeConfig[currentMode];
    let advice = '';
    let meaning = '';

    if (currentMode === 'love') {
        const you = selectedCards[0];
        const partner = selectedCards[1];
        const yourCard = majorArcana[you.cardIndex];
        const partnerCard = majorArcana[partner.cardIndex];

        // 相性スコア計算（カードの組み合わせで決定）
        const compatibilityScore = calculateCompatibility(you, partner);

        // 基本の状態説明
        meaning = `【あなたの状態】\n`;
        meaning += you.isReversed
            ? `${yourCard.nameJa}（逆位置）: ${yourCard.reversed.meaning}\n\n`
            : `${yourCard.nameJa}（正位置）: ${yourCard.upright.meaning}\n\n`;
        meaning += `【お相手の状態】\n`;
        meaning += partner.isReversed
            ? `${partnerCard.nameJa}（逆位置）: ${partnerCard.reversed.meaning}`
            : `${partnerCard.nameJa}（正位置）: ${partnerCard.upright.meaning}`;

        // 詳細アドバイス（性別と関係性に応じて）
        advice = generateDetailedLoveAdvice(yourCard, partnerCard, you.isReversed, partner.isReversed, compatibilityScore);

    } else if (currentMode === 'time') {
        const pastSelection = selectedCards[0];
        const presentSelection = selectedCards[1];
        const futureSelection = selectedCards[2];
        const past = majorArcana[pastSelection.cardIndex];
        const present = majorArcana[presentSelection.cardIndex];
        const future = majorArcana[futureSelection.cardIndex];

        meaning = `【過去】${past.nameJa}\n`;
        meaning += pastSelection.isReversed ? past.reversed.meaning : past.upright.meaning;
        meaning += `\n\n【現在】${present.nameJa}\n`;
        meaning += presentSelection.isReversed ? present.reversed.meaning : present.upright.meaning;
        meaning += `\n\n【未来】${future.nameJa}\n`;
        meaning += futureSelection.isReversed ? future.reversed.meaning : future.upright.meaning;

        advice = generateTimeAdvice(past, present, future, pastSelection.isReversed, presentSelection.isReversed, futureSelection.isReversed);
    }

    document.getElementById('cardMeaning').textContent = meaning;
    document.getElementById('cardAdvice').textContent = advice;
}

// 相性スコア計算
function calculateCompatibility(you, partner) {
    // 両方正位置ならベース高め、両方逆位置なら課題あり
    let score = 50;
    if (!you.isReversed && !partner.isReversed) score += 20;
    if (you.isReversed && partner.isReversed) score -= 10;
    // カードの相性も加味
    const yourNum = majorArcana[you.cardIndex].number;
    const partnerNum = majorArcana[partner.cardIndex].number;
    // 恋人たち(6)が含まれていれば加点
    if (yourNum === 6 || partnerNum === 6) score += 15;
    // 太陽(19)が含まれていれば加点
    if (yourNum === 19 || partnerNum === 19) score += 10;
    return Math.min(100, Math.max(0, score));
}

// 恋愛の詳細アドバイス生成
function generateDetailedLoveAdvice(yourCard, partnerCard, yourReversed, partnerReversed, score) {
    const { yourGender, partnerGender, relation } = loveSettings;
    let advice = '';

    // 相性スコア表示
    const scoreLabel = score >= 70 ? '★★★ 良好' : score >= 40 ? '★★ 普通' : '★ 要注意';
    advice += `【相性】${scoreLabel}（${score}点）\n\n`;

    // 交際前の場合
    if (relation === 'before') {
        advice += `【片思い・交際前のあなたへ】\n`;

        if (!yourReversed && !partnerReversed) {
            advice += `カードは両者ともに良い状態を示しています。相手もあなたに好意を持っている可能性が高いです。\n\n`;
            advice += `【行動のアドバイス】\n`;
            advice += `・積極的にアプローチしてみましょう\n`;
            advice += `・自然な形で二人きりの時間を作ることをお勧めします\n`;
            advice += `・あなたの気持ちを素直に伝えるタイミングです`;
        } else if (yourReversed && !partnerReversed) {
            advice += `相手の状態は良好ですが、あなた自身に少し迷いや不安があるようです。\n\n`;
            advice += `【行動のアドバイス】\n`;
            advice += `・まずは自分の気持ちを整理しましょう\n`;
            advice += `・焦ってアプローチするより、友人関係を深めることから\n`;
            advice += `・自信を持てるよう、自分磨きに時間をかけて`;
        } else if (!yourReversed && partnerReversed) {
            advice += `あなたの想いは純粋ですが、相手は今、心に余裕がないかもしれません。\n\n`;
            advice += `【行動のアドバイス】\n`;
            advice += `・急かさず、相手のペースを尊重しましょう\n`;
            advice += `・さりげないサポートで存在をアピール\n`;
            advice += `・告白は相手の状況が落ち着いてからが吉`;
        } else {
            advice += `お互いに複雑な心境にあるようです。今は恋愛よりも自分自身と向き合う時期かもしれません。\n\n`;
            advice += `【行動のアドバイス】\n`;
            advice += `・無理に関係を進めないこと\n`;
            advice += `・友人としての関係を大切に\n`;
            advice += `・お互いの状況が変わるのを待つのも選択肢`;
        }
    }
    // 交際中の場合
    else {
        advice += `【交際中・結婚されている方へ】\n`;

        if (!yourReversed && !partnerReversed) {
            advice += `お二人の関係は安定しています。互いへの信頼と愛情が感じられます。\n\n`;
            advice += `【関係を深めるために】\n`;
            advice += `・日頃の感謝を言葉にして伝えましょう\n`;
            advice += `・新しい体験を一緒にすると絆が深まります\n`;
            advice += `・将来の話をオープンにできる良い時期です`;
        } else if (yourReversed && !partnerReversed) {
            advice += `パートナーはあなたを大切に思っていますが、あなた自身に何か引っかかることがあるようです。\n\n`;
            advice += `【関係改善のために】\n`;
            advice += `・不満があれば素直に話し合いましょう\n`;
            advice += `・一人の時間も大切にしてバランスを取って\n`;
            advice += `・パートナーの良いところを意識的に見つめ直して`;
        } else if (!yourReversed && partnerReversed) {
            advice += `あなたの愛情は変わりませんが、相手は何か悩みを抱えているかもしれません。\n\n`;
            advice += `【関係改善のために】\n`;
            advice += `・責めずに話を聞いてあげましょう\n`;
            advice += `・相手の変化に敏感になって\n`;
            advice += `・二人で問題を共有し、解決策を一緒に考えて`;
        } else {
            advice += `お互いに課題を抱えている時期です。でも、これは関係を見つめ直すチャンスでもあります。\n\n`;
            advice += `【関係改善のために】\n`;
            advice += `・冷静に話し合う時間を設けましょう\n`;
            advice += `・過去の問題を持ち出さず、今に集中して\n`;
            advice += `・必要であれば第三者（カウンセラーなど）の力を借りることも`;
        }
    }

    return advice;
}

// 時間軸の詳細アドバイス生成
function generateTimeAdvice(past, present, future, pastRev, presentRev, futureRev) {
    let advice = '';

    advice += `【時の流れが示すメッセージ】\n\n`;

    // 過去の影響
    advice += `過去に「${past.nameJa}」のエネルギーを経験したことが、今のあなたの基盤となっています。`;
    if (pastRev) {
        advice += `その時の困難や試練から学んだことを忘れないでください。\n\n`;
    } else {
        advice += `その経験があなたに強さを与えています。\n\n`;
    }

    // 現在の状況
    advice += `現在、あなたは「${present.nameJa}」の時期にいます。`;
    if (presentRev) {
        advice += `課題に直面しているかもしれませんが、これは成長のための試練です。\n\n`;
    } else {
        advice += `この力を最大限に活かせる時です。\n\n`;
    }

    // 未来への展望
    advice += `未来には「${future.nameJa}」が待っています。`;
    if (futureRev) {
        advice += `注意が必要ですが、今から準備をすれば困難は乗り越えられます。\n\n`;
    } else {
        advice += `希望を持って進んでください。良い展開が期待できます。\n\n`;
    }

    advice += `【今すべきこと】\n`;
    advice += `・過去の経験を糧にしましょう\n`;
    advice += `・現在に集中し、できることを着実に\n`;
    advice += `・未来を信じて、前向きな行動を`;

    return advice;
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
