// ゲーム状態
const state = {
    location: null,
    flags: {},         // フラグ管理
    scenarioStep: {},  // 各キャラとの会話進行
    gamePhase: 'opening' // 'opening', 'explore', 'ending'
};

// 画像パス設定
const images = {
    // 新規生成画像
    '冒頭の夢': 'images/冒頭の夢.png',
    '博士の妻': 'images/博士の妻.png',
    '博士の部屋': 'images/博士の部屋.png',
    '老婆の部屋': 'images/老婆の部屋.png',
    // 既存画像（project-007/assets/images/）
    '廊下': '../assets/images/廊下.png',
    'バー': '../assets/images/バー.png',
    '魚屋': '../assets/images/魚屋.png',
    '階段下': '../assets/images/階段下.png',
    '階段上': '../assets/images/階段上.png',
    // フォールバック
    'default': 'images/冒頭の夢.png'
};

// 場所データ
const locations = {
    '廊下': {
        description: '薄暗い廊下。蒸気が立ち込めている。\n服が濡れている。夢...？',
        connections: ['バー', '階段下', '魚屋'],
        character: null,
        image: '廊下'
    },
    'バー': {
        description: '水槽のある薄暗いバー。\nカウンターにトゲだらけの男がいる。',
        connections: ['廊下'],
        character: 'マスター',
        image: 'バー'
    },
    '階段下': {
        description: '上へ続く階段。蒸気パイプが壁を這っている。',
        connections: ['廊下', '階段上'],
        character: null,
        image: '階段下'
    },
    '階段上': {
        description: '階段の上。奥に薄明かりが見える。',
        connections: ['階段下', '老婆の部屋'],
        character: null,
        image: '階段上'
    },
    '老婆の部屋': {
        description: '狭い部屋。\n背中から蒸気パイプが生えた老婆がいる。\n片目が——時計の文字盤になっている。',
        connections: ['階段上'],
        character: '老婆',
        image: '老婆の部屋'
    },
    '魚屋': {
        description: '魚の並ぶ店。機械の腕を持つ店主がいる。',
        connections: ['廊下'],
        character: '魚屋',
        image: '魚屋'
    }
};

// オープニングシーケンス
const openingSequence = [
    {
        text: `水の中にいる。\n\n息ができない。`,
        image: '冒頭の夢',
        choices: [{ text: '...', next: 1 }]
    },
    {
        text: `見下ろすと、巨大な時計仕掛けが見える。\n\nそして——無数の人影が浮かんでいる。`,
        image: '冒頭の夢',
        choices: [{ text: '...', next: 2 }]
    },
    {
        text: `全員、同じ顔をしている。\n\n俺と同じ顔？`,
        image: '冒頭の夢',
        choices: [{ text: '...', next: 3 }]
    },
    {
        text: `——\n\n\n目を開ける。\n\n薄暗い廊下。蒸気が立ち込めている。\n服が濡れている。`,
        image: '廊下',
        choices: [{ text: '...', next: 4 }]
    },
    {
        text: `手に何か握っている。\n\n古い写真。若い女性が写っている。\n\n誰だ？`,
        image: '廊下',
        choices: [{ text: '...', next: 5 }]
    },
    {
        text: `わからない。でも——\n\n「この人を探さなきゃ」\n\nなぜかそう思った。`,
        image: '廊下',
        choices: [{ text: '探し始める', next: 'start_explore' }]
    }
];

// 会話データ
const conversations = {
    'マスター': [
        {
            condition: () => true,
            text: `マスター「......」\n\nカウンターのトゲだらけの男がこちらを見た。\n\nマスター「またお前か」`,
            choices: [
                { text: 'また？', next: 1 },
                { text: '俺を知ってるのか', next: 1 }
            ]
        },
        {
            text: `マスター「何度目だ？　毎回同じこと聞いて、同じ場所に行って——」\n\nマスター「......まあいい。どうせ覚えてないんだろ」`,
            choices: [
                { text: '教えてくれ、何が起きてる', next: 2 },
                { text: 'この写真の女を知らないか', next: 3 }
            ]
        },
        {
            text: `マスター「知らない方がいいぞ」\n\nマスター「お前が何者かなんて、知ったところで何も変わらん」\n\nマスター「——上に行け。老婆に聞け。どうせそうするんだろ」`,
            choices: [{ text: '...', next: 'end' }],
            onFinish: () => setFlag('metMaster')
        },
        {
            text: `マスターは写真をちらりと見た。\n\nマスター「......知ってる。上にいる」\n\nマスター「でもお前、その女に会いたいのか？　本当に？」`,
            choices: [{ text: '...', next: 'end' }],
            onFinish: () => setFlag('metMaster')
        }
    ],
    '魚屋': [
        {
            condition: () => true,
            text: `機械の腕を持つ店主が、魚を並べている。\n\n店主「ああ、お前か」`,
            choices: [
                { text: '俺を知ってるのか', next: 1 },
                { text: 'この写真の女を探してる', next: 2 }
            ]
        },
        {
            text: `店主「知ってるも何も、毎日来るじゃねえか」\n\n店主「......いや、毎日じゃないか。時々だ」\n\n店主「でも同じ顔して同じこと聞く」`,
            choices: [{ text: '...', next: 'end' }],
            onFinish: () => setFlag('metFishmonger')
        },
        {
            text: `店主「その女か」\n\n店主「上で見たぞ。——いや、『見た』っていうか......」\n\n店主「まだ『いる』っていうか......」\n\n店主「お前、上に行くつもりか？　やめとけ」`,
            choices: [{ text: '...', next: 'end' }],
            onFinish: () => setFlag('metFishmonger')
        }
    ],
    '老婆': [
        {
            condition: () => !hasFlag('metMaster') && !hasFlag('metFishmonger'),
            text: `老婆はこちらを見ようともしない。\n\n老婆「用があるなら、先に下で聞いてきな」`,
            choices: [{ text: '...', next: 'end' }]
        },
        {
            condition: () => hasFlag('metMaster') || hasFlag('metFishmonger'),
            text: `老婆「お前、何度目だ？」`,
            choices: [
                { text: '何度目って、どういう意味だ', next: 2 },
                { text: 'この写真の女を探してる', next: 3 }
            ]
        },
        {
            text: `老婆「毎回聞くな。もう数えてない」\n\n老婆「お前は何度も来る。写真を持って。女を探して」\n\n老婆「そして毎回、同じところに行く」`,
            choices: [
                { text: '教えてくれ', next: 4 },
                { text: '...', next: 'end' }
            ]
        },
        {
            text: `老婆「知ってる」\n\n老婆「お前が探してるのは——」\n\n老婆「いや、やめておこう」`,
            choices: [
                { text: '教えてくれ', next: 4 },
                { text: '...', next: 'end' }
            ]
        },
        {
            text: `老婆「お前が探してるのは、お前自身だよ」\n\n老婆「わからんか？　行けばわかる」\n\n老婆「博士の部屋だ。この先にある」`,
            choices: [{ text: '...', next: 'end' }],
            onFinish: () => {
                setFlag('metOldWoman');
                // 博士の部屋を追加
                locations['老婆の部屋'].connections.push('博士の部屋');
                locations['博士の部屋'] = {
                    description: '時計だらけの部屋。\n\n壁に——人が埋め込まれている。',
                    connections: ['老婆の部屋'],
                    character: '博士',
                    image: '博士の部屋'
                };
            }
        }
    ],
    '博士': [
        {
            condition: () => true,
            text: `女性の上半身。\n肩からケーブルが花びらのように広がっている。\n胸には回転するレンズ。頭部は開いていて、回路が光っている。\n\n写真の女だ。\n\n博士「来たか」\n\n白衣の男が振り返る。\n\n博士「お前が探していた女だ」`,
            image: '博士の妻',
            choices: [
                { text: 'これが......？', next: 1 },
                { text: '何をした', next: 2 }
            ]
        },
        {
            text: `博士「妻だ」\n\n博士「時間を守る力を持っていた。この街の時間を」\n\n博士「5年前、俺の実験のせいでこうなった」`,
            image: '博士の妻',
            choices: [{ text: '...', next: 3 }]
        },
        {
            text: `博士「俺がこうしたんじゃない。俺の実験の——失敗だ」\n\n博士「妻は時間を守る力を持っていた。その力が暴走した」`,
            image: '博士の妻',
            choices: [{ text: '...', next: 3 }]
        },
        {
            text: `博士「だから、時間を巻き戻す。妻がこうなる前に」\n\n博士「——お前も同じだ」`,
            image: '博士の部屋',
            choices: [
                { text: '俺も？', next: 4 },
                { text: '俺は誰なんだ', next: 4 }
            ]
        },
        {
            text: `博士「お前は何度も来る。時間を巻き戻すたびに」\n\n博士「妻を探して、ここに来て、俺と話して——」\n\n博士「そして消える。また巻き戻される」`,
            image: '博士の部屋',
            choices: [{ text: '俺は誰なんだ', next: 5 }]
        },
        {
            text: `博士「お前は俺が作った」\n\n博士「妻の記憶から」`,
            image: '博士の妻',
            choices: [{ text: '...', next: 6 }],
            onFinish: () => setFlag('knowsTruth')
        },
        {
            text: `博士「妻が最後に想っていた——『自分を助けに来てくれる誰か』」\n\n博士「その『誰か』を、俺は形にした」\n\n博士「それがお前だ」`,
            image: '博士の妻',
            choices: [{ text: '...', next: 7 }]
        },
        {
            text: `博士「お前には妻を探す衝動がある」\n\n博士「でも妻は既にこうなってる」\n\n博士「時間を巻き戻せば、妻は元に戻る」\n\n博士「お前は——消える」`,
            image: '博士の妻',
            choices: [
                { text: '巻き戻せ', next: 'ending_dawn' },
                { text: 'やめろ', next: 'ending_eternal' },
                { text: '俺を消さずに巻き戻す方法は？', next: 8 }
            ]
        },
        {
            text: `博士「ある」\n\n博士「お前が妻の代わりになれ」\n\n博士「時間を守る力を、お前が引き継ぐ」\n\n博士「妻は解放される。お前はここに——永遠に繋がれる」`,
            image: '博士の妻',
            choices: [
                { text: '俺がなる', next: 'ending_clockkeeper' },
                { text: '......やはり巻き戻せ', next: 'ending_dawn' }
            ]
        }
    ]
};

// エンディング
const endings = {
    'ending_dawn': {
        title: '夜明け',
        image: '冒頭の夢',
        text: `博士「......わかった」\n\n装置が動き始める。時計が逆回転する。\n\n自分の体が薄くなっていくのがわかる。\n\n壁の女が——妻が——目を開けた。\n\n「ありがとう」\n\n誰かの声が聞こえた。\n\n——\n\n\nお前は消えた。\n妻は救われた。\nこの街は——なかったことになった。\n\n\n【エンディング: 夜明け】`
    },
    'ending_eternal': {
        title: '永遠の住人',
        image: '廊下',
        text: `博士「......そうか」\n\n博士「なら、また来い。何度でも」\n\n博士「お前は忘れて、また写真を持って、また来る」\n\n博士「俺は待ってる」\n\n——\n\n目を開ける。\n薄暗い廊下。蒸気が立ち込めている。\n手には古い写真。\n\n「この人を探さなきゃ」\n\n\nお前は永遠にこの街を彷徨う。\n何度も、何度も。\n\n\n【エンディング: 永遠の住人】`
    },
    'ending_clockkeeper': {
        title: '時計守り',
        image: '博士の妻',
        text: `博士「......すまない」\n\nケーブルが伸びてくる。\n\n壁に引き寄せられる。体が固定される。\n\n壁の女が——妻が——ゆっくりと落ちてきた。\n\n博士「妻を......頼む」\n\n視界がぼやける。時計の音だけが聞こえる。\n\n——\n\n\nお前は街の時間を守る者になった。\n永遠に。\n\n\n【エンディング: 時計守り】`
    }
};

// DOM
const locationNameEl = document.getElementById('location-name');
const textDisplayEl = document.getElementById('text-display');
const choicesEl = document.getElementById('choices');
const knowledgeEl = document.getElementById('knowledge-display');
const movingOverlay = document.getElementById('moving-overlay');
const sceneImageEl = document.getElementById('scene-image');

// 画像切り替え
function setImage(imageName, fade = true) {
    const path = images[imageName] || images['default'];

    if (fade) {
        sceneImageEl.classList.add('fade');
        setTimeout(() => {
            sceneImageEl.src = path;
            sceneImageEl.onload = () => {
                sceneImageEl.classList.remove('fade');
            };
            // 画像ロード失敗時もフェード解除
            sceneImageEl.onerror = () => {
                sceneImageEl.src = images['default'];
                sceneImageEl.classList.remove('fade');
            };
        }, 300);
    } else {
        sceneImageEl.src = path;
    }
}

// フラグ管理
function setFlag(flag) {
    state.flags[flag] = true;
    updateKnowledgeDisplay();
}

function hasFlag(flag) {
    return state.flags[flag] === true;
}

function updateKnowledgeDisplay() {
    const flagNames = {
        'metMaster': 'マスターと話した',
        'metFishmonger': '魚屋と話した',
        'metOldWoman': '老婆の話を聞いた',
        'knowsTruth': '真実を知った'
    };
    const active = Object.keys(state.flags)
        .filter(k => state.flags[k])
        .map(k => flagNames[k] || k);
    knowledgeEl.textContent = active.length > 0 ? active.join(', ') : 'なし';
}

// オープニング表示
function showOpening(step = 0) {
    state.gamePhase = 'opening';
    locationNameEl.textContent = '???';

    const scene = openingSequence[step];
    textDisplayEl.innerHTML = scene.text.replace(/\n/g, '<br>');

    // 画像切り替え
    if (scene.image) {
        setImage(scene.image, step > 0);
    }

    choicesEl.innerHTML = '';
    scene.choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.textContent = choice.text;
        btn.onclick = () => {
            if (choice.next === 'start_explore') {
                startExplore();
            } else {
                showOpening(choice.next);
            }
        };
        choicesEl.appendChild(btn);
    });
}

// 探索開始
function startExplore() {
    state.gamePhase = 'explore';
    state.location = '廊下';
    showLocation();
}

// 場所表示
function showLocation() {
    const loc = locations[state.location];
    locationNameEl.textContent = state.location;
    textDisplayEl.innerHTML = loc.description.replace(/\n/g, '<br>');

    // 画像切り替え
    if (loc.image) {
        setImage(loc.image);
    }

    choicesEl.innerHTML = '';

    // 会話選択肢
    if (loc.character) {
        const btn = document.createElement('button');
        btn.className = 'choice-btn talk';
        btn.textContent = `${loc.character}に話しかける`;
        btn.onclick = () => startConversation(loc.character);
        choicesEl.appendChild(btn);
    }

    // 移動選択肢
    loc.connections.forEach(dest => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn move';
        btn.textContent = `${dest}へ行く`;
        btn.onclick = () => moveTo(dest);
        choicesEl.appendChild(btn);
    });
}

// 移動
function moveTo(dest) {
    movingOverlay.classList.remove('hidden');
    setTimeout(() => {
        state.location = dest;
        movingOverlay.classList.add('hidden');
        showLocation();
    }, 1000);
}

// 会話開始
function startConversation(character) {
    const convs = conversations[character];
    if (!convs) return;

    // 初期化
    if (!state.scenarioStep[character]) {
        state.scenarioStep[character] = 0;
    }

    showConversationStep(character, state.scenarioStep[character]);
}

// 会話ステップ表示
function showConversationStep(character, stepIndex) {
    const convs = conversations[character];

    // 条件に合うステップを探す
    let step = null;
    for (let i = stepIndex; i < convs.length; i++) {
        const s = convs[i];
        if (!s.condition || s.condition()) {
            step = s;
            state.scenarioStep[character] = i;
            break;
        }
    }

    if (!step) {
        showLocation();
        return;
    }

    textDisplayEl.innerHTML = step.text.replace(/\n/g, '<br>');

    // 会話中の画像切り替え（指定がある場合）
    if (step.image) {
        setImage(step.image);
    }

    choicesEl.innerHTML = '';
    step.choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.textContent = choice.text;
        btn.onclick = () => {
            if (step.onFinish) step.onFinish();

            if (choice.next === 'end') {
                state.scenarioStep[character]++;
                showLocation();
            } else if (typeof choice.next === 'string' && choice.next.startsWith('ending_')) {
                showEnding(choice.next);
            } else {
                showConversationStep(character, choice.next);
            }
        };
        choicesEl.appendChild(btn);
    });
}

// エンディング表示
function showEnding(endingKey) {
    state.gamePhase = 'ending';
    const ending = endings[endingKey];
    locationNameEl.textContent = ending.title;
    textDisplayEl.innerHTML = ending.text.replace(/\n/g, '<br>');

    // エンディング画像
    if (ending.image) {
        setImage(ending.image);
    }

    choicesEl.innerHTML = '';
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.textContent = '最初から';
    btn.onclick = () => resetGame();
    choicesEl.appendChild(btn);
}

// ゲームリセット
function resetGame() {
    state.location = null;
    state.flags = {};
    state.scenarioStep = {};
    state.gamePhase = 'opening';

    // 博士の部屋を削除
    delete locations['博士の部屋'];
    locations['老婆の部屋'].connections = ['階段上'];

    updateKnowledgeDisplay();
    showOpening(0);
}

// 開始
showOpening(0);
