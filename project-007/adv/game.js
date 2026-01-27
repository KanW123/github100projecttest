// ゲームステート
const gameState = {
    currentSceneId: 'A01',
    inventory: [],
    flags: [],
    history: []
};

// データ格納
let scenarioData = {};  // id -> scene object
let branchesData = [];  // 分岐データ
let itemsData = {};     // アイテム定義

// DOM要素
const characterNameEl = document.getElementById('character-name');
const sceneTextEl = document.getElementById('scene-text');
const choicesContainerEl = document.getElementById('choices-container');
const inventoryListEl = document.getElementById('inventory-list');
const sceneIdDisplayEl = document.getElementById('scene-id-display');

// CSV解析
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = parseCSVLine(lines[0]);
    const result = [];

    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const obj = {};
        headers.forEach((h, idx) => {
            obj[h.trim()] = (values[idx] || '').trim();
        });
        result.push(obj);
    }
    return result;
}

// CSV行解析（引用符対応）
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    return result;
}

// データ読み込み
async function loadGameData() {
    try {
        // シナリオ読み込み
        const scenarioRes = await fetch('scenarios/scenario.csv');
        const scenarioText = await scenarioRes.text();
        const scenarios = parseCSV(scenarioText);
        scenarios.forEach(s => {
            scenarioData[s.id] = s;
        });

        // 分岐読み込み
        const branchesRes = await fetch('scenarios/branches.csv');
        const branchesText = await branchesRes.text();
        branchesData = parseCSV(branchesText);

        // アイテム読み込み
        const itemsRes = await fetch('scenarios/items.csv');
        const itemsText = await itemsRes.text();
        const items = parseCSV(itemsText);
        items.forEach(item => {
            itemsData[item.id] = item;
        });

        console.log('Game data loaded:', {
            scenes: Object.keys(scenarioData).length,
            branches: branchesData.length,
            items: Object.keys(itemsData).length
        });

        return true;
    } catch (e) {
        console.error('Failed to load game data:', e);
        return false;
    }
}

// シーン表示
function showScene(sceneId) {
    const scene = scenarioData[sceneId];
    if (!scene) {
        console.error('Scene not found:', sceneId);
        sceneTextEl.textContent = `[エラー] シーン ${sceneId} が見つかりません`;
        return;
    }

    gameState.currentSceneId = sceneId;
    gameState.history.push(sceneId);

    // キャラクター名表示
    if (scene.character && scene.character !== 'ナレーター') {
        characterNameEl.textContent = scene.character;
    } else {
        characterNameEl.textContent = '';
    }

    // テキスト表示
    sceneTextEl.textContent = scene.text;
    sceneTextEl.classList.remove('fade-in');
    void sceneTextEl.offsetWidth; // reflow
    sceneTextEl.classList.add('fade-in');

    // アイテム獲得
    if (scene.item_gain) {
        addItem(scene.item_gain);
    }

    // 選択肢表示
    showChoices(sceneId, scene.choices);

    // UI更新
    updateInventoryUI();
    sceneIdDisplayEl.textContent = `Scene: ${sceneId}`;
}

// 選択肢表示
function showChoices(sceneId, choicesText) {
    choicesContainerEl.innerHTML = '';

    // 分岐データから選択肢を取得
    const branches = branchesData.filter(b => b.from_id === sceneId);

    if (branches.length === 0) {
        // 分岐がない場合、CSVのchoicesを「次へ」として扱う
        if (choicesText) {
            const btn = createChoiceButton(choicesText, () => {
                // 次のシーンを探す（IDの数字をインクリメント）
                const nextId = getNextSceneId(sceneId);
                if (nextId && scenarioData[nextId]) {
                    showScene(nextId);
                } else {
                    sceneTextEl.textContent = '[ゲーム終了]';
                    choicesContainerEl.innerHTML = '<button class="choice-btn" onclick="restartGame()">最初から</button>';
                }
            });
            choicesContainerEl.appendChild(btn);
        }
        return;
    }

    // 選択肢を表示
    branches.forEach(branch => {
        if (branch.condition_type === 'choice') {
            const btn = createChoiceButton(branch.condition_value, () => {
                showScene(branch.to_id);
            });

            // アイテム必須チェック
            if (branch.item_required && !hasItem(branch.item_required)) {
                btn.disabled = true;
                btn.textContent += ` [${getItemName(branch.item_required)}が必要]`;
            }

            choicesContainerEl.appendChild(btn);
        }
    });
}

// 選択肢ボタン作成
function createChoiceButton(text, onClick) {
    const btn = document.createElement('button');
    btn.className = 'choice-btn fade-in';
    btn.textContent = text;
    btn.onclick = onClick;
    return btn;
}

// 次のシーンID取得（単純なインクリメント）
function getNextSceneId(currentId) {
    const match = currentId.match(/^([A-Z])(\d+)$/);
    if (match) {
        const letter = match[1];
        const num = parseInt(match[2], 10) + 1;
        return `${letter}${num.toString().padStart(2, '0')}`;
    }
    return null;
}

// アイテム追加
function addItem(itemId) {
    if (!gameState.inventory.includes(itemId)) {
        gameState.inventory.push(itemId);
        const itemName = getItemName(itemId);
        console.log(`アイテム獲得: ${itemName}`);
    }
}

// アイテム所持チェック
function hasItem(itemId) {
    return gameState.inventory.includes(itemId);
}

// アイテム名取得
function getItemName(itemId) {
    if (itemsData[itemId]) {
        return itemsData[itemId].name;
    }
    return itemId;
}

// インベントリUI更新
function updateInventoryUI() {
    if (gameState.inventory.length === 0) {
        inventoryListEl.textContent = 'なし';
    } else {
        const names = gameState.inventory.map(id => getItemName(id));
        inventoryListEl.textContent = names.join(', ');
    }
}

// ゲームリスタート
function restartGame() {
    gameState.currentSceneId = 'A01';
    gameState.inventory = [];
    gameState.flags = [];
    gameState.history = [];
    showScene('A01');
}

// ゲーム開始
async function startGame() {
    sceneTextEl.textContent = '読み込み中...';

    const loaded = await loadGameData();
    if (loaded) {
        showScene('A01');
    } else {
        sceneTextEl.textContent = 'ゲームデータの読み込みに失敗しました。';
    }
}

// 初期化
document.addEventListener('DOMContentLoaded', startGame);
