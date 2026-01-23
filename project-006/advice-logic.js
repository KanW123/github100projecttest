// ==================================
// Mystic Tarot - 拡張アドバイスロジック
// ==================================

// 相性スコア計算（拡張版）
function calculateCompatibilityAdvanced(you, partner) {
    const yourCard = majorArcana[you.cardIndex];
    const partnerCard = majorArcana[partner.cardIndex];
    let score = 50;
    let factors = [];

    // 正逆位置による基本スコア
    if (!you.isReversed && !partner.isReversed) {
        score += 25;
        factors.push("両者のカードが正位置で、互いにオープンな状態");
    } else if (you.isReversed && partner.isReversed) {
        score -= 5;
        factors.push("両者に課題があるものの、それを乗り越えることで深い絆が生まれる可能性");
    } else if (!you.isReversed && partner.isReversed) {
        score += 5;
        factors.push("あなたが相手を支える形の関係");
    } else {
        score += 5;
        factors.push("相手があなたを支える形の関係");
    }

    // 特別な組み合わせチェック
    const cardPair = [yourCard.number, partnerCard.number].sort((a, b) => a - b);

    for (const perfect of specialCombinations.perfect) {
        if (cardPair[0] === perfect[0] && cardPair[1] === perfect[1]) {
            score += 20;
            factors.push("★特別な相性：最高の組み合わせ");
            break;
        }
    }

    for (const challenging of specialCombinations.challenging) {
        if (cardPair[0] === challenging[0] && cardPair[1] === challenging[1]) {
            score -= 10;
            factors.push("挑戦的な組み合わせ：困難を乗り越える努力が必要");
            break;
        }
    }

    for (const growth of specialCombinations.growth) {
        if (cardPair[0] === growth[0] && cardPair[1] === growth[1]) {
            score += 10;
            factors.push("成長をもたらす組み合わせ");
            break;
        }
    }

    // アーキタイプの相性
    let yourArchetype = null;
    let partnerArchetype = null;

    for (const [type, cards] of Object.entries(cardArchetypes)) {
        if (cards.includes(yourCard.number)) yourArchetype = type;
        if (cards.includes(partnerCard.number)) partnerArchetype = type;
    }

    if (yourArchetype && partnerArchetype) {
        if (yourArchetype === partnerArchetype) {
            score += 10;
            factors.push("同じエネルギータイプで共感しやすい");
        } else if (
            (yourArchetype === 'emotional' && partnerArchetype === 'spiritual') ||
            (yourArchetype === 'spiritual' && partnerArchetype === 'emotional') ||
            (yourArchetype === 'action' && partnerArchetype === 'transformation') ||
            (yourArchetype === 'transformation' && partnerArchetype === 'action')
        ) {
            score += 15;
            factors.push("補完し合うエネルギーで相乗効果");
        }
    }

    // 特定カードボーナス
    if (yourCard.number === 6 || partnerCard.number === 6) {
        score += 15;
        factors.push("「恋人たち」のカードが愛の力を示す");
    }
    if (yourCard.number === 19 || partnerCard.number === 19) {
        score += 10;
        factors.push("「太陽」のカードが幸福をもたらす");
    }
    if (yourCard.number === 3 || partnerCard.number === 3) {
        score += 8;
        factors.push("「女帝」のカードが愛情と豊かさを示す");
    }

    return {
        score: Math.min(100, Math.max(0, score)),
        factors: factors
    };
}

// 恋愛詳細アドバイス生成（大幅拡張版）
function generateDetailedLoveAdviceExpanded(yourCard, partnerCard, yourReversed, partnerReversed, compatibility, loveSettings) {
    const { yourGender, partnerGender, relation } = loveSettings;
    let advice = '';

    // 相性スコアとレベル表示
    const level = compatibility.score >= 80 ? '★★★★★ 最高' :
                  compatibility.score >= 65 ? '★★★★ 良好' :
                  compatibility.score >= 50 ? '★★★ 普通' :
                  compatibility.score >= 35 ? '★★ 要努力' : '★ 困難';

    advice += `【総合相性】${level}（${compatibility.score}点）\n\n`;

    // 相性要因の説明
    if (compatibility.factors.length > 0) {
        advice += `【相性のポイント】\n`;
        compatibility.factors.forEach(f => {
            advice += `・${f}\n`;
        });
        advice += `\n`;
    }

    // 交際前のシナリオ（大幅拡張）
    if (relation === 'before') {
        advice += generateBeforeDatingAdvice(yourCard, partnerCard, yourReversed, partnerReversed, compatibility.score, yourGender, partnerGender);
    } else {
        advice += generateAfterDatingAdvice(yourCard, partnerCard, yourReversed, partnerReversed, compatibility.score, yourGender, partnerGender);
    }

    // カード固有のアドバイス
    advice += `\n【カード別詳細アドバイス】\n\n`;
    advice += generateCardSpecificLoveAdvice(yourCard, yourReversed, 'あなた');
    advice += `\n`;
    advice += generateCardSpecificLoveAdvice(partnerCard, partnerReversed, 'お相手');

    return advice;
}

// 交際前のアドバイス（詳細シナリオ）
function generateBeforeDatingAdvice(yourCard, partnerCard, yourRev, partnerRev, score, yourGender, partnerGender) {
    let advice = `【片思い・交際前のあなたへ】\n\n`;

    // 4パターンの組み合わせ
    if (!yourRev && !partnerRev) {
        // 両方正位置
        advice += `✨ 状況分析：非常に良好\n`;
        advice += `両方のカードが正位置で出ており、お互いに良い状態にあることを示しています。\n`;
        advice += `相手もあなたに好意を持っている可能性が高く、関係を進展させる絶好のタイミングです。\n\n`;

        advice += `【具体的な行動プラン】\n`;
        if (score >= 70) {
            advice += `1. 積極的にアプローチしましょう\n`;
            advice += `   → 二人きりの時間を作ることをお勧めします\n`;
            advice += `   → 食事やお茶に誘ってみてください\n\n`;
            advice += `2. あなたの気持ちを素直に伝えるタイミングです\n`;
            advice += `   → 遠回しではなく、率直な言葉で\n`;
            advice += `   → 相手の反応を見ながら、自然な形で\n\n`;
            advice += `3. 相手の興味や関心を共有しましょう\n`;
            advice += `   → 共通の話題を見つけて会話を深める\n`;
            advice += `   → 相手の話をしっかり聞く姿勢を見せる\n\n`;
        } else {
            advice += `1. 焦らず関係を育てましょう\n`;
            advice += `   → まずは友人としての信頼関係を築く\n`;
            advice += `   → 自然な流れでの接点を増やす\n\n`;
            advice += `2. 自分の魅力を磨く時間も大切に\n`;
            advice += `   → 自己成長が相手の目を引く\n`;
            advice += `   → 自信を持つことで魅力が増す\n\n`;
        }

        advice += `【告白のタイミング】\n`;
        advice += `カードは「今が好機」と告げています。\n`;
        advice += `相手との自然な会話の流れの中で、あなたの気持ちを伝えてみてください。\n`;
        advice += `大げさな演出よりも、誠実で素直な言葉が相手の心に響くでしょう。\n\n`;

    } else if (yourRev && !partnerRev) {
        // あなた逆位置、相手正位置
        advice += `📍 状況分析：自分を見つめ直す時\n`;
        advice += `相手の状態は良好ですが、あなた自身に迷いや不安があるようです。\n`;
        advice += `今は焦ってアプローチするより、自分の気持ちを整理することが先決です。\n\n`;

        advice += `【まず取り組むべきこと】\n`;
        advice += `1. 自分の気持ちを確認する\n`;
        advice += `   → 本当にこの人を好きなのか、自問してみてください\n`;
        advice += `   → 憧れや寂しさからの感情ではないか確認\n\n`;
        advice += `2. 自信を取り戻すための行動を\n`;
        advice += `   → 自分磨きに時間をかける\n`;
        advice += `   → 小さな成功体験を積み重ねる\n\n`;
        advice += `3. 友人関係から丁寧に築く\n`;
        advice += `   → 急がず、信頼関係を育てる\n`;
        advice += `   → 自然体でいられる関係を目指す\n\n`;

        advice += `【注意点】\n`;
        advice += `・自信のなさから、相手を試すような行動は避けてください\n`;
        advice += `・比較や嫉妬の感情に振り回されないように\n`;
        advice += `・まずは自分を愛することから始めましょう\n\n`;

    } else if (!yourRev && partnerRev) {
        // あなた正位置、相手逆位置
        advice += `💭 状況分析：相手のペースを尊重する時\n`;
        advice += `あなたの想いは純粋ですが、相手は今、心に余裕がないようです。\n`;
        advice += `仕事や人間関係など、何か悩みを抱えている可能性があります。\n\n`;

        advice += `【効果的なアプローチ】\n`;
        advice += `1. さりげないサポートで存在をアピール\n`;
        advice += `   → 困っていることがあれば自然に手を差し伸べる\n`;
        advice += `   → 見返りを求めない優しさを見せる\n\n`;
        advice += `2. 相手の話を聞く姿勢を大切に\n`;
        advice += `   → 悩みを打ち明けられる存在になる\n`;
        advice += `   → アドバイスより、まず共感を\n\n`;
        advice += `3. 急かさず、相手のペースを尊重\n`;
        advice += `   → 恋愛を前面に出しすぎない\n`;
        advice += `   → 信頼できる友人としての立場を確立\n\n`;

        advice += `【告白のタイミング】\n`;
        advice += `今すぐの告白は控えめに。相手の状況が落ち着くのを待ちましょう。\n`;
        advice += `その間、あなたの誠実さと優しさを行動で示し続けることで、\n`;
        advice += `相手の心の中でのあなたの存在感は確実に高まっていきます。\n\n`;

    } else {
        // 両方逆位置
        advice += `🌙 状況分析：互いの成長が鍵\n`;
        advice += `お互いに複雑な心境にあり、今は恋愛よりも自己成長の時期かもしれません。\n`;
        advice += `この状況を悲観せず、成長のチャンスと捉えてください。\n\n`;

        advice += `【今すべきこと】\n`;
        advice += `1. 無理に関係を進めない\n`;
        advice += `   → 焦りは禁物です\n`;
        advice += `   → 自然な流れに身を任せましょう\n\n`;
        advice += `2. 友人としての関係を大切に\n`;
        advice += `   → 恋愛感情を一度脇に置いて\n`;
        advice += `   → 純粋な人間関係として向き合う\n\n`;
        advice += `3. 自分自身の課題に向き合う\n`;
        advice += `   → 恋愛に逃げず、自己成長を優先\n`;
        advice += `   → 課題を乗り越えた先に、より良い関係が待っている\n\n`;

        advice += `【希望のメッセージ】\n`;
        advice += `今は困難に見えても、これは二人が真に結ばれるための準備期間です。\n`;
        advice += `お互いが成長し、より良い状態になった時、\n`;
        advice += `今よりも深く、強い絆で結ばれる可能性があります。\n`;
        advice += `焦らず、今は自分磨きと相手への理解を深める時間にしてください。\n\n`;
    }

    return advice;
}

// 交際中のアドバイス（詳細シナリオ）
function generateAfterDatingAdvice(yourCard, partnerCard, yourRev, partnerRev, score, yourGender, partnerGender) {
    let advice = `【交際中・結婚されている方へ】\n\n`;

    if (!yourRev && !partnerRev) {
        // 両方正位置
        advice += `💕 状況分析：安定した良好な関係\n`;
        advice += `お二人の関係は非常に安定しています。\n`;
        advice += `互いへの信頼と愛情がしっかりと感じられる状態です。\n\n`;

        advice += `【関係をさらに深めるために】\n`;
        advice += `1. 日頃の感謝を言葉にして伝えましょう\n`;
        advice += `   → 「当たり前」と思っていることにも感謝を\n`;
        advice += `   → 小さな優しさを見逃さない\n\n`;
        advice += `2. 新しい体験を一緒にする\n`;
        advice += `   → 旅行、趣味、学びなど、共有体験を増やす\n`;
        advice += `   → マンネリ防止と絆の強化に効果的\n\n`;
        advice += `3. 将来の話をオープンにできる良い時期\n`;
        advice += `   → 結婚を考えているなら、具体的な計画を\n`;
        advice += `   → 既婚者なら、将来のビジョンを共有\n\n`;

        if (score >= 75) {
            advice += `【特別なメッセージ】\n`;
            advice += `カードは、お二人の関係が非常に良い状態にあることを示しています。\n`;
            advice += `この幸せな時期を大切にし、より深い絆を築いていってください。\n`;
            advice += `次のステップ（同棲、結婚、家族計画など）を考えるのに最適な時です。\n\n`;
        }

    } else if (yourRev && !partnerRev) {
        // あなた逆位置、相手正位置
        advice += `🔍 状況分析：自分の中にある課題\n`;
        advice += `パートナーはあなたを大切に思っていますが、\n`;
        advice += `あなた自身に何か引っかかることがあるようです。\n\n`;

        advice += `【考えられる原因と対処法】\n`;
        advice += `1. 不満や不安を言葉にできていない\n`;
        advice += `   → 溜め込まず、素直に話し合いましょう\n`;
        advice += `   → 責めるのではなく、「私はこう感じている」という表現で\n\n`;
        advice += `2. 自分の時間や空間が足りない\n`;
        advice += `   → 一人の時間も大切にしてバランスを取る\n`;
        advice += `   → 依存しすぎない健全な距離感を\n\n`;
        advice += `3. パートナーの良いところを見失っている\n`;
        advice += `   → 出会った頃の気持ちを思い出して\n`;
        advice += `   → 相手の長所を意識的に見つめ直す\n\n`;

        advice += `【改善のためのステップ】\n`;
        advice += `・自分の感情を日記などに書き出してみる\n`;
        advice += `・信頼できる友人に相談する\n`;
        advice += `・必要であれば、カップルカウンセリングも選択肢に\n\n`;

    } else if (!yourRev && partnerRev) {
        // あなた正位置、相手逆位置
        advice += `💭 状況分析：パートナーへのサポートが必要\n`;
        advice += `あなたの愛情は変わりませんが、\n`;
        advice += `相手は何か悩みを抱えているようです。\n\n`;

        advice += `【パートナーを支えるために】\n`;
        advice += `1. 責めずに話を聞いてあげましょう\n`;
        advice += `   → 「どうしたの？」と優しく声をかける\n`;
        advice += `   → 解決策より、まず共感を示す\n\n`;
        advice += `2. 相手の変化に敏感になって\n`;
        advice += `   → 仕事や人間関係でストレスを抱えていないか\n`;
        advice += `   → 体調や睡眠の変化にも注意\n\n`;
        advice += `3. 二人で問題を共有し、解決策を一緒に考えて\n`;
        advice += `   → 「私たち」として問題に向き合う\n`;
        advice += `   → 一人で背負わせない\n\n`;

        advice += `【注意点】\n`;
        advice += `・過度に干渉しすぎない\n`;
        advice += `・相手を変えようとしない\n`;
        advice += `・自分も疲弊しないよう、適度な距離を保つ\n\n`;

    } else {
        // 両方逆位置
        advice += `⚠️ 状況分析：関係の見直しが必要な時期\n`;
        advice += `お互いに課題を抱えている時期です。\n`;
        advice += `しかし、これは関係を見つめ直すチャンスでもあります。\n\n`;

        advice += `【関係改善のために】\n`;
        advice += `1. 冷静に話し合う時間を設けましょう\n`;
        advice += `   → 感情的にならず、お互いの気持ちを聞く\n`;
        advice += `   → 「今の関係をどうしたいか」を率直に\n\n`;
        advice += `2. 過去の問題を持ち出さず、今に集中して\n`;
        advice += `   → 過去の失敗を蒸し返さない\n`;
        advice += `   → 今からできることに焦点を当てる\n\n`;
        advice += `3. 必要であれば第三者の力を借りる\n`;
        advice += `   → カップルカウンセラーやセラピスト\n`;
        advice += `   → 信頼できる共通の友人\n\n`;

        advice += `【重要なメッセージ】\n`;
        advice += `困難な時期ですが、これを乗り越えることで関係はより強くなります。\n`;
        advice += `諦める前に、できることを試してみてください。\n`;
        advice += `ただし、心身に害を及ぼす関係であれば、距離を置くことも選択肢です。\n`;
        advice += `自分自身を大切にすることを忘れないでください。\n\n`;
    }

    return advice;
}

// カード固有の恋愛アドバイス
function generateCardSpecificLoveAdvice(card, isReversed, label) {
    let advice = `◆ ${label}のカード「${card.nameJa}」\n`;

    if (card.love) {
        advice += isReversed ? card.love.reversed : card.love.upright;
    } else {
        advice += isReversed ? card.reversed.meaning : card.upright.meaning;
    }

    advice += `\n`;
    return advice;
}

// 時間軸占いの詳細アドバイス
function generateDetailedTimeAdvice(past, present, future, pastRev, presentRev, futureRev) {
    let advice = '';

    advice += `【時の流れが語るあなたの物語】\n\n`;

    // 過去の分析
    advice += `━━━━━ 過去 ━━━━━\n`;
    advice += `カード：${past.nameJa}（${pastRev ? '逆位置' : '正位置'}）\n\n`;

    if (pastRev) {
        advice += `過去に「${past.nameJa}」のエネルギーに関する困難や課題がありました。\n`;
        advice += `${past.reversed.meaning}\n\n`;
        advice += `この経験から学んだことは、今のあなたの糧となっています。\n`;
        advice += `過去の痛みや失敗を否定せず、それがあなたを強くしたことを認めてください。\n`;
    } else {
        advice += `過去に「${past.nameJa}」のポジティブなエネルギーを経験しました。\n`;
        advice += `${past.upright.meaning}\n\n`;
        advice += `この経験があなたに自信と強さを与えています。\n`;
        advice += `過去の成功体験を思い出し、今後の糧にしてください。\n`;
    }
    advice += `\n`;

    // 現在の分析
    advice += `━━━━━ 現在 ━━━━━\n`;
    advice += `カード：${present.nameJa}（${presentRev ? '逆位置' : '正位置'}）\n\n`;

    if (presentRev) {
        advice += `現在、あなたは「${present.nameJa}」の課題に直面しています。\n`;
        advice += `${present.reversed.meaning}\n\n`;
        advice += `【今すぐできること】\n`;
        advice += `・${present.reversed.advice}\n`;
        advice += `・この課題は成長のための試練と捉えてください\n`;
        advice += `・焦らず、一歩ずつ前進しましょう\n`;
    } else {
        advice += `現在、あなたは「${present.nameJa}」のエネルギーの中にいます。\n`;
        advice += `${present.upright.meaning}\n\n`;
        advice += `【この力を最大限に活かすために】\n`;
        advice += `・${present.upright.advice}\n`;
        advice += `・今のポジティブな流れを信じてください\n`;
        advice += `・自分の直感を大切に\n`;
    }
    advice += `\n`;

    // 未来の分析
    advice += `━━━━━ 未来 ━━━━━\n`;
    advice += `カード：${future.nameJa}（${futureRev ? '逆位置' : '正位置'}）\n\n`;

    if (futureRev) {
        advice += `未来には「${future.nameJa}」に関する課題が待っています。\n`;
        advice += `${future.reversed.meaning}\n\n`;
        advice += `【未来への準備】\n`;
        advice += `・このカードは警告ではなく、準備の機会を示しています\n`;
        advice += `・今から心構えをすることで、困難を軽減できます\n`;
        advice += `・${future.reversed.advice}\n`;
    } else {
        advice += `未来には「${future.nameJa}」の祝福が待っています。\n`;
        advice += `${future.upright.meaning}\n\n`;
        advice += `【希望のメッセージ】\n`;
        advice += `・良い展開が期待できます\n`;
        advice += `・今の努力は必ず報われるでしょう\n`;
        advice += `・${future.upright.advice}\n`;
    }
    advice += `\n`;

    // 全体の流れ分析
    advice += `━━━━━ 全体の流れ ━━━━━\n\n`;

    const positiveCount = [!pastRev, !presentRev, !futureRev].filter(Boolean).length;

    if (positiveCount === 3) {
        advice += `【非常に良い流れです】\n`;
        advice += `過去の経験を活かし、現在の力を発揮することで、\n`;
        advice += `輝かしい未来に向かって順調に進んでいます。\n`;
        advice += `自信を持って歩み続けてください。\n`;
    } else if (positiveCount === 2) {
        advice += `【概ね良好な流れです】\n`;
        advice += `一部に課題はありますが、全体的には良い方向に向かっています。\n`;
        advice += `課題を乗り越えることで、より強くなれるでしょう。\n`;
    } else if (positiveCount === 1) {
        advice += `【成長と変容の時期です】\n`;
        advice += `困難が多い時期ですが、これは大きな変化の前触れでもあります。\n`;
        advice += `今の試練を乗り越えた先に、新しい自分が待っています。\n`;
    } else {
        advice += `【大きな転換期です】\n`;
        advice += `多くの課題に直面していますが、これは人生の大きな転換点です。\n`;
        advice += `古いものを手放し、新しい自分に生まれ変わる時が来ています。\n`;
        advice += `変化を恐れず、受け入れる勇気を持ってください。\n`;
    }

    advice += `\n【総合アドバイス】\n`;
    advice += `・過去の経験（良いものも悪いものも）を糧にしましょう\n`;
    advice += `・現在に集中し、できることを着実に行ってください\n`;
    advice += `・未来を信じて、前向きな姿勢を保ちましょう\n`;
    advice += `・すべては繋がっており、今の選択が未来を創ります\n`;

    return advice;
}

// デイリーと仕事運の詳細アドバイス
function generateDetailedSingleCardAdvice(card, isReversed, mode) {
    let advice = '';

    if (mode === 'daily') {
        advice += `【今日のテーマ】\n`;
        advice += `「${card.nameJa}」のエネルギーがあなたの一日を導きます。\n\n`;

        advice += `【詳細な解釈】\n`;
        advice += isReversed ? card.reversed.detailed : card.upright.detailed;
        advice += `\n\n`;

        advice += `【今日のキーワード】\n`;
        if (card.keywords) {
            advice += card.keywords.slice(0, 3).map(k => `・${k}`).join('\n');
        }
        advice += `\n\n`;

        advice += `【今日の過ごし方】\n`;
        advice += isReversed ? card.reversed.advice : card.upright.advice;
        advice += `\n\n`;

        advice += `【ラッキーアクション】\n`;
        const luckyActions = getLuckyActions(card.number, isReversed);
        advice += luckyActions;

    } else if (mode === 'career') {
        advice += `【仕事運のテーマ】\n`;
        advice += `「${card.nameJa}」があなたの仕事運を示しています。\n\n`;

        advice += `【詳細な解釈】\n`;
        if (card.career) {
            advice += isReversed ? card.career.reversed : card.career.upright;
        } else {
            advice += isReversed ? card.reversed.meaning : card.upright.meaning;
        }
        advice += `\n\n`;

        advice += `【キャリアへのアドバイス】\n`;
        advice += isReversed ? card.reversed.advice : card.upright.advice;
        advice += `\n\n`;

        advice += `【今週の仕事運】\n`;
        const careerForecast = getCareerForecast(card.number, isReversed);
        advice += careerForecast;
    }

    return advice;
}

// ラッキーアクション生成
function getLuckyActions(cardNumber, isReversed) {
    const actions = {
        0: ["新しいことに挑戦する", "直感に従う", "冒険的な選択をする"],
        1: ["創造的な作業をする", "コミュニケーションを取る", "計画を立てる"],
        2: ["瞑想や内省の時間を持つ", "直感を信じる", "静かな場所で過ごす"],
        3: ["自然に触れる", "クリエイティブな活動", "愛情を表現する"],
        4: ["計画を立てる", "整理整頓", "ルーティンを守る"],
        5: ["学びの機会を求める", "アドバイスを受け入れる", "伝統を大切にする"],
        6: ["大切な人との時間を持つ", "重要な選択をする", "調和を意識する"],
        7: ["目標に向かって前進", "困難に立ち向かう", "自信を持って行動"],
        8: ["忍耐強く取り組む", "優しさを持って接する", "内なる強さを発揮"],
        9: ["一人の時間を大切に", "深く考える", "精神的な活動をする"],
        10: ["変化を受け入れる", "チャンスを掴む", "流れに身を任せる"],
        11: ["公平な判断をする", "正直に行動する", "責任を果たす"],
        12: ["違う視点から見る", "待つ", "手放す練習をする"],
        13: ["古いものを手放す", "変化を受け入れる", "新しい始まりを意識"],
        14: ["バランスを取る", "焦らず進む", "調和を大切にする"],
        15: ["束縛から解放される", "本当の欲求を見つめる", "自由を求める"],
        16: ["変化に備える", "真実を受け入れる", "再建を始める"],
        17: ["希望を持つ", "インスピレーションを求める", "癒しの時間を持つ"],
        18: ["直感を信じる", "夢に注目する", "慎重に判断する"],
        19: ["喜びを分かち合う", "ポジティブに過ごす", "成功を祝う"],
        20: ["過去を振り返る", "許しを実践する", "新たな始まりを受け入れる"],
        21: ["達成を祝う", "感謝を表す", "次の目標を考える"]
    };

    const cardActions = actions[cardNumber] || ["今日を大切に過ごす"];
    if (isReversed) {
        return `・${cardActions[0]}ことを意識してみましょう（逆位置なので特に重要）`;
    }
    return cardActions.map(a => `・${a}`).join('\n');
}

// 仕事運予報生成
function getCareerForecast(cardNumber, isReversed) {
    const forecasts = {
        positive: [
            "今週は新しいプロジェクトや機会が訪れそうです。",
            "上司や同僚との関係が良好で、協力を得やすい時期です。",
            "創造性が高まり、良いアイデアが浮かびやすいでしょう。",
            "努力が認められ、評価につながる可能性があります。"
        ],
        neutral: [
            "今週は着実に進むことが大切です。",
            "焦らず、一つずつタスクをこなしていきましょう。",
            "学びの機会を大切にしてください。",
            "周囲との調和を意識して行動しましょう。"
        ],
        challenging: [
            "今週は予期せぬ変化があるかもしれません。柔軟に対応しましょう。",
            "人間関係に注意が必要です。誤解を避けるため、コミュニケーションを丁寧に。",
            "焦りは禁物です。慎重に判断してください。",
            "困難があっても、それは成長のチャンスと捉えましょう。"
        ]
    };

    if (isReversed) {
        return forecasts.challenging[cardNumber % 4];
    }

    const positiveCards = [1, 3, 6, 8, 10, 14, 17, 19, 21];
    if (positiveCards.includes(cardNumber)) {
        return forecasts.positive[cardNumber % 4];
    }
    return forecasts.neutral[cardNumber % 4];
}
