// ゲーム状態
const state = {
    location: '廊下',
    knowledge: [],      // 知っていること
    talked: {},         // 誰と話したか
    scenarioStep: {}    // 各キャラとの会話進行
};

// 場所データ
const locations = {
    '廊下': {
        description: '蒸気が立ち込める薄暗い廊下。どこへ向かう？',
        connections: ['バー', '階段下', '魚屋'],
        character: null
    },
    'バー': {
        description: '水槽のある薄暗いバー。カウンターにトゲだらけの男がいる。',
        connections: ['廊下'],
        character: 'マスター'
    },
    '階段下': {
        description: '上へ続く階段。蒸気パイプが壁を這っている。',
        connections: ['廊下', '階段上'],
        character: null
    },
    '階段上': {
        description: '階段の上。奥に薄明かりが見える。',
        connections: ['階段下', '老婆の部屋'],
        character: null
    },
    '老婆の部屋': {
        description: '狭い部屋。背中から蒸気パイプが生えた老婆がいる。',
        connections: ['階段上'],
        character: '老婆'
    },
    '魚屋': {
        description: '魚の並ぶ店。機械の腕を持つ店主がいる。',
        connections: ['廊下'],
        character: '魚屋'
    }
};

// 会話データ（短く、核心的に）
const conversations = {
    'マスター': [
        {
            condition: () => true,
            text: `「またか」\n\nマスターはグラスを拭きながら言った。\n\n「また迷い込んできたのがいる。ここは出口がないんだ。知ってたか？」`,
            choices: [
                { text: '出口がない？', next: 1 },
                { text: '「また」とは？', next: 2 }
            ],
            onFinish: () => addKnowledge('出口がない')
        },
        {
            text: `「この街は閉じてる。外に出た奴はいない」\n\n「——いや、一人だけいた。博士の妻だ。出て行った。そして街が壊れ始めた」`,
            choices: [{ text: '...', next: 'end' }],
            onFinish: () => addKnowledge('博士の妻が出て行った')
        },
        {
            text: `「お前の前にも何人か来た。みんな同じ顔してた」\n\n「出口を探して、博士のところへ行って、それっきりだ」`,
            choices: [
                { text: '博士は誰だ', next: 3 },
                { text: '...', next: 'end' }
            ]
        },
        {
            text: `「上に住んでる。時計ばっかりいじってる男だ」\n\n「あいつに会いたきゃ、老婆に聞け。階段の上だ」`,
            choices: [{ text: '...', next: 'end' }],
            onFinish: () => addKnowledge('博士は上にいる')
        }
    ],
    '魚屋': [
        {
            condition: () => true,
            text: `「今日も同じ魚だ。昨日も同じ。明日も同じ」\n\n機械の腕が魚を並べ直す。\n\n「お前、新顔だな。いつからいる？」`,
            choices: [
                { text: 'さっき来たばかりだ', next: 1 },
                { text: '覚えていない', next: 1 }
            ]
        },
        {
            text: `「そうか。俺もいつから居るか覚えてない」\n\n「この街じゃ時間が変だ。同じ日が続いてる気がする」\n\n「——でも誰も気にしない。慣れちまった」`,
            choices: [{ text: '...', next: 'end' }],
            onFinish: () => addKnowledge('時間がおかしい')
        }
    ],
    '老婆': [
        {
            condition: () => !state.knowledge.includes('博士は上にいる'),
            text: `老婆はこちらを見ようともしない。\n\n「用があるなら、先に下で聞いてきな」`,
            choices: [{ text: '...', next: 'end' }]
        },
        {
            condition: () => state.knowledge.includes('博士は上にいる'),
            text: `「博士に会いたいのか」\n\n老婆の片目が時計の文字盤になっている。\n\n「会ってどうする。あいつは街を壊そうとしてる」`,
            choices: [
                { text: '壊す？', next: 1 },
                { text: '止められるのか', next: 2 }
            ],
            onFinish: () => addKnowledge('博士は街を壊そうとしている')
        },
        {
            text: `「あいつの妻が死んだ。いや、出て行った。どっちでも同じだ」\n\n「それから、あいつは時間を巻き戻そうとしてる。妻がいた頃に」\n\n「——でもそうすると、今のこの街は消える。私たちも」`,
            choices: [{ text: '...', next: 'end' }],
            onFinish: () => addKnowledge('時間を巻き戻すと街が消える')
        },
        {
            text: `「止める？私は止めない。もう何百回もこの会話をした」\n\n「お前が止めるか、止めないか。それだけだ」\n\n「博士の部屋は、この先だ。行くなら行け」`,
            choices: [{ text: '...', next: 'end' }],
            onFinish: () => {
                addKnowledge('博士の部屋への道');
                locations['老婆の部屋'].connections.push('博士の部屋');
                locations['博士の部屋'] = {
                    description: '時計だらけの部屋。中央に巨大な装置。白衣の男がいる。',
                    connections: ['老婆の部屋'],
                    character: '博士'
                };
            }
        }
    ],
    '博士': [
        {
            condition: () => true,
            text: `「来たか」\n\n博士は装置から目を離さない。\n\n「お前も出口を探しに来たんだろう。教えてやる。出口はここだ」\n\n中央の装置を指差す。\n\n「これを動かせば、時間が戻る。妻がいた頃に。そして——」`,
            choices: [
                { text: 'そして？', next: 1 },
                { text: '街が消えるんだろう', next: 2 }
            ]
        },
        {
            text: `「この街は出られる。お前も、私も」\n\n「ただし、今の街は消える。ここにいる連中も」\n\n「——でも、それの何が悪い？どうせ同じ日を繰り返すだけの街だ」`,
            choices: [
                { text: '彼らにも生活がある', next: 3 },
                { text: '...確かに', next: 4 }
            ]
        },
        {
            text: `「知ってるのか。老婆に聞いたな」\n\n「そうだ。この街は消える。だから何だ？」\n\n「妻が戻る。それだけでいい」`,
            choices: [
                { text: '彼らにも生活がある', next: 3 },
                { text: '...', next: 4 }
            ]
        },
        {
            text: `「生活？」博士は笑った。「同じ魚を並べて、同じ酒を注いで、それが生活か？」\n\n「お前はどうする。この装置を止めるか。それとも——」`,
            choices: [
                { text: '止める', next: 'ending_stop' },
                { text: '動かせ', next: 'ending_run' }
            ]
        },
        {
            text: `「そうか」博士は頷いた。\n\n「なら、手伝え。このスイッチを押すだけだ」`,
            choices: [
                { text: '押す', next: 'ending_run' },
                { text: 'やはり止める', next: 'ending_stop' }
            ]
        }
    ]
};

// エンディング
const endings = {
    'ending_stop': {
        text: `あなたは装置に手を伸ばし——\n\n電源を引き抜いた。\n\n「......」\n\n博士は何も言わなかった。\n\n装置が止まる。時計の音が消える。\n\n\n——この街に、終わりのない日々が続く。\n\n\n【エンディング: 永遠の住人】`
    },
    'ending_run': {
        text: `スイッチを押した。\n\n装置が唸りを上げる。時計が逆回転を始める。\n\n「ああ......やっと......」\n\n博士の顔に光が戻る。\n\n世界が白く染まっていく——\n\n\n目を開けると、知らない街にいた。\n\n振り返っても、九龍城はどこにもなかった。\n\n\n【エンディング: 夜明け】`
    }
};

// DOM
const locationNameEl = document.getElementById('location-name');
const textDisplayEl = document.getElementById('text-display');
const choicesEl = document.getElementById('choices');
const knowledgeEl = document.getElementById('knowledge-display');
const movingOverlay = document.getElementById('moving-overlay');

// 知識追加
function addKnowledge(k) {
    if (!state.knowledge.includes(k)) {
        state.knowledge.push(k);
        updateKnowledgeDisplay();
    }
}

function updateKnowledgeDisplay() {
    knowledgeEl.textContent = state.knowledge.length > 0 ? state.knowledge.join(', ') : 'なし';
}

// 場所表示
function showLocation() {
    const loc = locations[state.location];
    locationNameEl.textContent = state.location;
    textDisplayEl.textContent = loc.description;

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
        // 会話終了、場所に戻る
        showLocation();
        return;
    }

    textDisplayEl.innerHTML = step.text.replace(/\n/g, '<br>');

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
    const ending = endings[endingKey];
    textDisplayEl.innerHTML = ending.text.replace(/\n/g, '<br>');

    choicesEl.innerHTML = '';
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.textContent = '最初から';
    btn.onclick = () => {
        state.location = '廊下';
        state.knowledge = [];
        state.talked = {};
        state.scenarioStep = {};
        delete locations['博士の部屋'];
        locations['老婆の部屋'].connections = ['階段上'];
        updateKnowledgeDisplay();
        showLocation();
    };
    choicesEl.appendChild(btn);
}

// 開始
showLocation();
