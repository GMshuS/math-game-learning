/**
 * Sprint 3 & 4 英语语法动态生成器（8个语法点）
 *
 * 每个生成器接受 level 参数 (1-3)，返回 format 对象：
 *   { question, answer, options?, type: 'choice'|'fillBlank', knowledgeId }
 *
 * Sprint 3: questionForm, pronoun, adjAdv, comparative
 * Sprint 4: preposition, conjunction, sentenceStructure, basicClause
 *
 * 不依赖 grammar.js 静态题库，完全动态生成。
 * 模块导入时自动注册到英语题型注册表。
 */

import { register } from './registry';

// ────────────────────────── 工具函数 ──────────────────────────

/**
 * 从数组中随机取一个元素
 * @param {Array} arr
 * @returns {*}
 */
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * 对数组进行 Fisher-Yates 洗牌
 * @param {Array} arr
 * @returns {Array}
 */
function shuffle(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * 构建选择题选项（正确答案 + 干扰项，打乱顺序）
 * @param {*} correct
 * @param {Array} distractors
 * @returns {Array}
 */
function buildChoiceOptions(correct, distractors) {
  return shuffle([correct, ...distractors]);
}

/**
 * 生成随机选择题（choice 类型题目）
 * @param {string} question - 题干
 * @param {*} answer - 正确答案
 * @param {Array} options - 选项数组（含正确答案）
 * @param {string} knowledgeId - 知识点 ID
 * @returns {object}
 */
function choiceQuestion(question, answer, options, knowledgeId) {
  const finalOpts = options.includes(answer) ? shuffle([...options]) : buildChoiceOptions(answer, options);
  return {
    question,
    answer,
    options: finalOpts,
    type: 'choice',
    knowledgeId
  };
}

/**
 * 生成随机填空题（fillBlank 类型题目）
 * @param {string} question - 题干（用 ____ 表示填空位）
 * @param {*} answer - 正确答案
 * @param {string} knowledgeId - 知识点 ID
 * @returns {object}
 */
function fillBlankQuestion(question, answer, knowledgeId) {
  return {
    question,
    answer,
    type: 'fillBlank',
    knowledgeId
  };
}

// ────────────────────── 1. questionForm — 疑问句 ──────────────────────

/**
 * 疑问句形式生成器（一般疑问句 / 特殊疑问句 / 反意疑问句）
 * @param {number} level - 难度 1-3
 * @returns {object}
 */
function generateQuestionForm(level) {
  const questionType = Math.random() > 0.5 ? 'choice' : 'fillBlank';

  if (level === 1) {
    // Level 1: 一般疑问句 (be / do / can 提前)
    const templates = [
      { statement: 'You are a student.', question: 'Are you a student?', aux: 'Are' },
      { statement: 'He is from China.', question: 'Is he from China?', aux: 'Is' },
      { statement: 'They are happy.', question: 'Are they happy?', aux: 'Are' },
      { statement: 'She can swim.', question: 'Can she swim?', aux: 'Can' },
      { statement: 'I can help you.', question: 'Can I help you?', aux: 'Can' },
      { statement: 'You like apples.', question: 'Do you like apples?', aux: 'Do' },
      { statement: 'He plays football.', question: 'Does he play football?', aux: 'Does' },
      { statement: 'They go to school.', question: 'Do they go to school?', aux: 'Do' }
    ];
    const item = pickRandom(templates);

    const subMode = Math.random() > 0.5 ? 'be_do' : 'convert';
    if (subMode === 'be_do') {
      // 选择正确的疑问词开头
      const question = `将下列句子变为一般疑问句："${item.statement}" 应以哪个词开头？`;
      const distractors = ['Do', 'Does', 'Is', 'Are', 'Can'].filter(a => a !== item.aux);
      return choiceQuestion(question, item.aux, distractors, 'questionForm');
    } else {
      // 选择正确的疑问句形式
      const question = `"${item.statement}" 的一般疑问句是？`;
      const distractors = shuffle([
        item.statement.replace('.', '?'),
        `Do ${item.statement.toLowerCase().replace('you', 'I')}`,
        `${item.aux} ${item.statement.toLowerCase().replace('.', '?')}`
      ]).filter(q => q !== item.question).slice(0, 3);
      return choiceQuestion(question, item.question, distractors, 'questionForm');
    }
  }

  if (level === 2) {
    // Level 2: 特殊疑问句
    const whTemplates = [
      { q: 'What', statement: 'This is a book.', question: 'What is this?', hint: '问物品' },
      { q: 'Who', statement: 'Tom is my friend.', question: 'Who is your friend?', hint: '问人' },
      { q: 'Where', statement: 'She is in the park.', question: 'Where is she?', hint: '问地点' },
      { q: 'When', statement: 'We go to school at 8 o\'clock.', question: 'When do you go to school?', hint: '问时间' },
      { q: 'Why', statement: 'He is sad because he lost his toy.', question: 'Why is he sad?', hint: '问原因' },
      { q: 'How', statement: 'She goes to school by bus.', question: 'How does she go to school?', hint: '问方式' }
    ];
    const item = pickRandom(whTemplates);

    const subMode = Math.random() > 0.5 ? 'wh_word' : 'full_q';
    if (subMode === 'wh_word') {
      const question = `对划线部分提问（${item.hint}）："${item.statement}" 应选哪个疑问词？`;
      const distractors = ['What', 'Who', 'Where', 'When', 'Why', 'How'].filter(w => w !== item.q);
      return choiceQuestion(question, item.q, distractors, 'questionForm');
    } else {
      const question = `对划线部分提问（${item.hint}）："${item.statement}" 的正确问句是？`;
      const distractors = shuffle([
        `${item.q} ${item.statement.toLowerCase()}`,
        `${item.q} is this?`
      ]).slice(0, 3);
      return choiceQuestion(question, item.question, distractors, 'questionForm');
    }
  }

  // Level 3: 反意疑问句 + 混合
  const tagTemplates = [
    { statement: 'You are a student', tag: 'aren\'t you', answer: 'aren\'t you' },
    { statement: 'He is not here', tag: 'is he', answer: 'is he' },
    { statement: 'They can swim', tag: 'can\'t they', answer: 'can\'t they' },
    { statement: 'She can\'t sing', tag: 'can she', answer: 'can she' },
    { statement: 'You like coffee', tag: 'don\'t you', answer: 'don\'t you' },
    { statement: 'He doesn\'t know', tag: 'does he', answer: 'does he' },
    { statement: 'We have finished', tag: 'haven\'t we', answer: 'haven\'t we' },
    { statement: 'It is a nice day', tag: 'isn\'t it', answer: 'isn\'t it' }
  ];
  const item = pickRandom(tagTemplates);

  if (questionType === 'choice') {
    const question = `"${item.statement}, ____?" 反意疑问句的附加部分应选？`;
    const distractors = ['isn\'t it', 'aren\'t you', 'don\'t they', 'doesn\'t he'].filter(t => t !== item.tag);
    return choiceQuestion(question, item.tag, distractors, 'questionForm');
  } else {
    const question = `"${item.statement}, ____?" 填入反意疑问句的附加部分`;
    return fillBlankQuestion(question, item.tag, 'questionForm');
  }
}

// ────────────────────── 2. pronoun — 代词 ──────────────────────

/**
 * 代词生成器（主格 / 宾格 / 物主代词 / 反身代词）
 * @param {number} level - 难度 1-3
 * @returns {object}
 */
function generatePronoun(level) {
  const subjObjPairs = [
    { subj: 'I', obj: 'me', posAdj: 'my', posPro: 'mine', reflexive: 'myself' },
    { subj: 'he', obj: 'him', posAdj: 'his', posPro: 'his', reflexive: 'himself' },
    { subj: 'she', obj: 'her', posAdj: 'her', posPro: 'hers', reflexive: 'herself' },
    { subj: 'it', obj: 'it', posAdj: 'its', posPro: 'its', reflexive: 'itself' },
    { subj: 'you', obj: 'you', posAdj: 'your', posPro: 'yours', reflexive: 'yourself' },
    { subj: 'we', obj: 'us', posAdj: 'our', posPro: 'ours', reflexive: 'ourselves' },
    { subj: 'they', obj: 'them', posAdj: 'their', posPro: 'theirs', reflexive: 'themselves' }
  ];

  // Level 1: 主格 vs 宾格
  if (level === 1) {
    const pair = pickRandom(subjObjPairs);
    const useSubj = Math.random() > 0.5;
    const questionType = Math.random() > 0.5 ? 'choice' : 'fillBlank';

    if (useSubj) {
      // 主语位置 → 主格
      const sentences = [
        `____ is a student.`,
        `____ likes reading.`,
        `____ can play football.`,
        `____ goes to school by bus.`
      ];
      const sentence = pickRandom(sentences);
      const question = sentence.replace('____', '____');

      if (questionType === 'choice') {
        const distractors = subjObjPairs.filter(p => p.subj !== pair.subj).slice(0, 3).map(p => p.obj);
        return choiceQuestion(question, pair.subj, [pair.subj, ...distractors], 'pronoun');
      } else {
        return fillBlankQuestion(question, pair.subj, 'pronoun');
      }
    } else {
      // 宾语位置 → 宾格
      const sentences = [
        `Please help ____.`,
        `I can see ____.`,
        `Give it to ____.`,
        `She is waiting for ____.`
      ];
      const sentence = pickRandom(sentences);
      const question = sentence.replace('____', '____');

      if (questionType === 'choice') {
        const distractors = subjObjPairs.filter(p => p.obj !== pair.obj).slice(0, 3).map(p => p.subj);
        return choiceQuestion(question, pair.obj, [pair.obj, ...distractors], 'pronoun');
      } else {
        return fillBlankQuestion(question, pair.obj, 'pronoun');
      }
    }
  }

  // Level 2: 形容词性物主代词 vs 名词性物主代词
  if (level === 2) {
    const pair = pickRandom(subjObjPairs);
    const useAdj = Math.random() > 0.5;
    const questionType = Math.random() > 0.5 ? 'choice' : 'fillBlank';

    if (useAdj) {
      // 形容词性物主代词 (my/your/his/her...)
      const nouns = ['book', 'pen', 'bag', 'cat', 'house', 'car', 'school', 'friend'];
      const noun = pickRandom(nouns);
      const question = `This is ____ ${noun}. (${pair.subj})`;

      if (questionType === 'choice') {
        const distractors = subjObjPairs.filter(p => p.subj !== pair.subj).slice(0, 3).map(p => p.posAdj);
        return choiceQuestion(question, pair.posAdj, distractors, 'pronoun');
      } else {
        return fillBlankQuestion(question, pair.posAdj, 'pronoun');
      }
    } else {
      // 名词性物主代词 (mine/yours/his/hers...)
      const nouns = ['book', 'pen', 'bag', 'cat'];
      const noun = pickRandom(nouns);
      const question = `This ${noun} is ____. (${pair.subj})`;

      if (questionType === 'choice') {
        const distractors = subjObjPairs.filter(p => p.subj !== pair.subj).slice(0, 3).map(p => p.posPro);
        return choiceQuestion(question, pair.posPro, distractors, 'pronoun');
      } else {
        return fillBlankQuestion(question, pair.posPro, 'pronoun');
      }
    }
  }

  // Level 3: 反身代词 + 混合
  const questionType = Math.random() > 0.5 ? 'choice' : 'fillBlank';
  const pair = pickRandom(subjObjPairs);
  const reflexiveSentences = [
    `He taught ____ to play the guitar.`,
    `She looked at ____ in the mirror.`,
    `I made this cake by ____.`,
    `The cat cleaned ____.`,
    `They enjoyed ____ at the party.`,
    `We should believe in ____.`,
    `You should take care of ____.`
  ];
  const sentence = pickRandom(reflexiveSentences);
  const question = sentence.replace('____', '____');

  if (questionType === 'choice') {
    const allReflexive = subjObjPairs.map(p => p.reflexive);
    const distractors = allReflexive.filter(r => r !== pair.reflexive).slice(0, 3);
    return choiceQuestion(question, pair.reflexive, distractors, 'pronoun');
  } else {
    return fillBlankQuestion(question, pair.reflexive, 'pronoun');
  }
}

// ────────────────────── 3. adjAdv — 形容词/副词 ──────────────────────

/**
 * 形容词/副词生成器
 * @param {number} level - 难度 1-3
 * @returns {object}
 */
function generateAdjAdv(level) {
  const questionType = Math.random() > 0.5 ? 'choice' : 'fillBlank';

  if (level === 1) {
    // Level 1: 形容词用法（修饰名词，放在 be 动词后或名词前）
    const adjPairs = [
      { adj: 'happy', cn: '开心的', noun: 'girl' },
      { adj: 'big', cn: '大的', noun: 'house' },
      { adj: 'tall', cn: '高的', noun: 'tree' },
      { adj: 'small', cn: '小的', noun: 'cat' },
      { adj: 'beautiful', cn: '漂亮的', noun: 'flower' },
      { adj: 'fast', cn: '快的', noun: 'car' },
      { adj: 'clever', cn: '聪明的', noun: 'boy' },
      { adj: 'cold', cn: '冷的', noun: 'day' }
    ];
    const item = pickRandom(adjPairs);
    const usePred = Math.random() > 0.5;

    if (usePred) {
      // 表语形容词: The ___ is happy.
      const question = `The ${item.noun} is ____. (${item.cn})`;

      if (questionType === 'choice') {
        const distractors = adjPairs.filter(a => a.adj !== item.adj).slice(0, 3).map(a => a.adj);
        return choiceQuestion(question, item.adj, distractors, 'adjAdv');
      } else {
        return fillBlankQuestion(question, item.adj, 'adjAdv');
      }
    } else {
      // 定语形容词: a ___ girl
      const question = `a ____ ${item.noun}`;

      if (questionType === 'choice') {
        const distractors = adjPairs.filter(a => a.adj !== item.adj).slice(0, 3).map(a => a.adj);
        return choiceQuestion(question, item.adj, distractors, 'adjAdv');
      } else {
        return fillBlankQuestion(`填入形容词：a ____ ${item.noun}`, item.adj, 'adjAdv');
      }
    }
  }

  if (level === 2) {
    // Level 2: 副词用法（修饰动词，通常以 -ly 结尾）
    const advPairs = [
      { adv: 'quickly', base: 'quick', cn: '快速地' },
      { adv: 'carefully', base: 'careful', cn: '仔细地' },
      { adv: 'happily', base: 'happy', cn: '开心地' },
      { adv: 'slowly', base: 'slow', cn: '慢慢地' },
      { adv: 'loudly', base: 'loud', cn: '大声地' },
      { adv: 'easily', base: 'easy', cn: '容易地' },
      { adv: 'badly', base: 'bad', cn: '糟糕地' },
      { adv: 'well', base: 'good', cn: '好地' }
    ];
    const item = pickRandom(advPairs);
    const verbPhrases = ['runs', 'speaks', 'reads', 'writes', 'sings', 'works', 'drives', 'answers'];
    const verb = pickRandom(verbPhrases);

    const question = `He ____ ${verb}. (${item.cn})`;

    if (questionType === 'choice') {
      const distractors = adjPairs.filter(a => a.adv !== item.adv).slice(0, 3).map(a => a.adv);
      return choiceQuestion(question, item.adv, distractors, 'adjAdv');
    } else {
      return fillBlankQuestion(question, item.adv, 'adjAdv');
    }
  }

  // Level 3: 形容词 vs 副词区分
  const adjAdvPairs = [
    { adj: 'quick', adv: 'quickly', verb: 'runs', noun: 'runner' },
    { adj: 'careful', adv: 'carefully', verb: 'writes', noun: 'writer' },
    { adj: 'happy', adv: 'happily', verb: 'smiles', noun: 'girl' },
    { adj: 'slow', adv: 'slowly', verb: 'walks', noun: 'turtle' },
    { adj: 'loud', adv: 'loudly', verb: 'speaks', noun: 'speaker' },
    { adj: 'easy', adv: 'easily', verb: 'solves', noun: 'problem' }
  ];
  const item = pickRandom(adjAdvPairs);
  const useAdj = Math.random() > 0.5;

  if (useAdj) {
    const question = `The ${item.noun} is ____. (${item.adj === item.adv ? item.adj : item.adj})`;
    if (questionType === 'choice') {
      const distractors = adjAdvPairs.filter(a => a.adj !== item.adj).slice(0, 3).map(a => a.adv);
      return choiceQuestion(question, item.adj, [item.adj, ...distractors], 'adjAdv');
    } else {
      return fillBlankQuestion(question, item.adj, 'adjAdv');
    }
  } else {
    const question = `He ____ ${item.verb}. (${item.adv})`;
    if (questionType === 'choice') {
      const distractors = adjAdvPairs.filter(a => a.adv !== item.adv).slice(0, 3).map(a => a.adj);
      return choiceQuestion(question, item.adv, [item.adv, ...distractors], 'adjAdv');
    } else {
      return fillBlankQuestion(question, item.adv, 'adjAdv');
    }
  }
}

// ────────────────────── 4. comparative — 比较级/最高级 ──────────────────────

/**
 * 比较级/最高级生成器
 * @param {number} level - 难度 1-3
 * @returns {object}
 */
function generateComparative(level) {
  const questionType = Math.random() > 0.5 ? 'choice' : 'fillBlank';

  // 规则变化形容词
  const regularAdjs = [
    { base: 'tall', comp: 'taller', sup: 'tallest', cn: '高' },
    { base: 'short', comp: 'shorter', sup: 'shortest', cn: '矮' },
    { base: 'fast', comp: 'faster', sup: 'fastest', cn: '快' },
    { base: 'slow', comp: 'slower', sup: 'slowest', cn: '慢' },
    { base: 'big', comp: 'bigger', sup: 'biggest', cn: '大' },
    { base: 'small', comp: 'smaller', sup: 'smallest', cn: '小' },
    { base: 'hot', comp: 'hotter', sup: 'hottest', cn: '热' },
    { base: 'cold', comp: 'colder', sup: 'coldest', cn: '冷' },
    { base: 'happy', comp: 'happier', sup: 'happiest', cn: '开心' },
    { base: 'early', comp: 'earlier', sup: 'earliest', cn: '早' }
  ];

  // 多音节形容词
  const multiSyllAdjs = [
    { base: 'beautiful', comp: 'more beautiful', sup: 'most beautiful', cn: '漂亮' },
    { base: 'important', comp: 'more important', sup: 'most important', cn: '重要' },
    { base: 'interesting', comp: 'more interesting', sup: 'most interesting', cn: '有趣' },
    { base: 'difficult', comp: 'more difficult', sup: 'most difficult', cn: '困难' },
    { base: 'expensive', comp: 'more expensive', sup: 'most expensive', cn: '贵' }
  ];

  // 不规则变化
  const irregularAdjs = [
    { base: 'good', comp: 'better', sup: 'best', cn: '好' },
    { base: 'bad', comp: 'worse', sup: 'worst', cn: '坏' },
    { base: 'many', comp: 'more', sup: 'most', cn: '多' },
    { base: 'little', comp: 'less', sup: 'least', cn: '少' },
    { base: 'far', comp: 'farther', sup: 'farthest', cn: '远' }
  ];

  if (level === 1) {
    // Level 1: 规则比较级
    const adj = pickRandom(regularAdjs);
    const nounA = pickRandom(['Tom', 'Mary', 'Jack', 'Lily', 'Bob', 'Ann']);
    const nounB = pickRandom(['Tim', 'Lucy', 'Mike', 'Amy', 'John', 'Kate']).replace(nounA, 'Sam');

    if (questionType === 'choice') {
      const question = `${nounA} is ____ than ${nounB}. (${adj.cn})`;
      const distractors = regularAdjs.filter(a => a.comp !== adj.comp).slice(0, 3).map(a => a.comp);
      return choiceQuestion(question, adj.comp, [adj.base, adj.comp, adj.sup, ...distractors.slice(0, 1)], 'comparative');
    } else {
      const question = `${nounA} is ____ than ${nounB}. (${adj.cn})`;
      return fillBlankQuestion(question, adj.comp, 'comparative');
    }
  }

  if (level === 2) {
    // Level 2: 最高级 + 多音节比较级
    const useSup = Math.random() > 0.5;

    if (useSup) {
      // 最高级
      const adj = pickRandom([...regularAdjs, ...irregularAdjs]);
      const group = pickRandom(['the class', 'the group', 'all the students', 'the team']);

      if (questionType === 'choice') {
        const question = `${pickRandom(['Tom', 'Mary'])} is ____ in ${group}. (${adj.cn})`;
        const distractors = [adj.base, adj.comp].filter(d => d !== adj.sup);
        const allSup = [...regularAdjs, ...irregularAdjs].map(a => a.sup).filter(s => s !== adj.sup);
        return choiceQuestion(question, adj.sup, [...distractors, adj.sup, ...allSup.slice(0, 1)], 'comparative');
      } else {
        const question = `${pickRandom(['Tom', 'Mary'])} is ____ in ${group}. (${adj.cn})`;
        return fillBlankQuestion(question, adj.sup, 'comparative');
      }
    } else {
      // 多音节比较级
      const adj = pickRandom(multiSyllAdjs);
      const nounA = pickRandom(['This book', 'That movie', 'Math', 'English']);
      const nounB = pickRandom(['that one', 'this show', 'Science', 'Chinese']);

      if (questionType === 'choice') {
        const question = `${nounA} is ____ than ${nounB}. (${adj.cn})`;
        const distractors = [adj.base, adj.sup];
        return choiceQuestion(question, adj.comp, [...distractors, adj.comp], 'comparative');
      } else {
        const question = `${nounA} is ____ than ${nounB}. (${adj.cn})`;
        return fillBlankQuestion(question, adj.comp, 'comparative');
      }
    }
  }

  // Level 3: 不规则变化 + 混合
  const adj = pickRandom(irregularAdjs);
  const useComp = Math.random() > 0.5;

  const pairA = pickRandom(['Tom', 'Mary', 'Jack', 'Lily']);
  const pairB = pickRandom(['Tim', 'Lucy', 'Mike', 'Amy']).replace(pairA, 'Sam');

  if (useComp) {
    if (questionType === 'choice') {
      const question = `"${pairA} is ${adj.base} at math. ${pairB} is ____ at math." 选择正确的比较级形式。`;
      const distractors = [adj.base, adj.sup, adj.base + 'er'];
      return choiceQuestion(question, adj.comp, [...new Set([...distractors, adj.comp])], 'comparative');
    } else {
      const question = `${pairA} is ${adj.base}. ${pairB} is ____. (比较级)`;
      return fillBlankQuestion(question, adj.comp, 'comparative');
    }
  } else {
    const group = pickRandom(['all', 'everyone', 'the three', 'all of them']);
    if (questionType === 'choice') {
      const question = `${pairA} is ____ of ${group}. (${adj.cn}的最高级)`;
      const distractors = [adj.base, adj.comp, adj.base + 'est'];
      return choiceQuestion(question, adj.sup, [...new Set([...distractors, adj.sup])], 'comparative');
    } else {
      const question = `${pairA} is ____ of ${group}. (最高级)`;
      return fillBlankQuestion(question, adj.sup, 'comparative');
    }
  }
}

// ────────────────────── 5. preposition — 介词 ──────────────────────

/**
 * 介词生成器（方位介词 / 时间介词 / 固定搭配）
 * @param {number} level - 难度 1-3
 * @returns {object}
 */
function generatePreposition(level) {
  const questionType = Math.random() > 0.5 ? 'choice' : 'fillBlank';

  if (level === 1) {
    // Level 1: 方位介词 (in/on/under/behind/near/in front of)
    const locItems = [
      { sentence: 'The cat is ____ the box.', answer: 'in', options: ['in', 'on', 'under', 'behind'] },
      { sentence: 'The book is ____ the desk.', answer: 'on', options: ['on', 'under', 'behind', 'near'] },
      { sentence: 'The dog is ____ the chair.', answer: 'under', options: ['under', 'on', 'in', 'behind'] },
      { sentence: 'The boy is ____ the door.', answer: 'behind', options: ['behind', 'in', 'on', 'under'] },
      { sentence: 'The school is ____ the park.', answer: 'near', options: ['near', 'in', 'on', 'behind'] },
      { sentence: 'The tree is ____ the house.', answer: 'in front of', options: ['in front of', 'behind', 'under', 'near'] }
    ];
    const item = pickRandom(locItems);

    if (questionType === 'choice') {
      const distractors = item.options.filter(o => o !== item.answer);
      return choiceQuestion(item.sentence, item.answer, distractors, 'preposition');
    } else {
      return fillBlankQuestion(item.sentence, item.answer, 'preposition');
    }
  }

  if (level === 2) {
    // Level 2: 时间介词 (at/in/on/for/since)
    const timeItems = [
      { sentence: 'The class starts ____ 8 o\'clock.', answer: 'at', hint: '具体时间点' },
      { sentence: 'I was born ____ March.', answer: 'in', hint: '月份' },
      { sentence: 'We go to school ____ Monday.', answer: 'on', hint: '星期几' },
      { sentence: 'She has lived here ____ 2019.', answer: 'since', hint: '从过去某时间点' },
      { sentence: 'He studied ____ two hours.', answer: 'for', hint: '持续一段时间' },
      { sentence: 'I usually get up ____ the morning.', answer: 'in', hint: '上午/下午/晚上' },
      { sentence: 'We have a meeting ____ Friday morning.', answer: 'on', hint: '具体某天的上午' },
      { sentence: 'She will arrive ____ ten minutes.', answer: 'in', hint: '多长时间之后' }
    ];
    const item = pickRandom(timeItems);
    const question = `${item.sentence} (${item.hint})`;

    if (questionType === 'choice') {
      const distractors = ['at', 'in', 'on', 'for', 'since'].filter(p => p !== item.answer);
      return choiceQuestion(question, item.answer, distractors, 'preposition');
    } else {
      return fillBlankQuestion(question, item.answer, 'preposition');
    }
  }

  // Level 3: 介词固定搭配 + 混合
  const fixedPhrases = [
    { sentence: 'She is good ____ math.', answer: 'at' },
    { sentence: 'He is interested ____ science.', answer: 'in' },
    { sentence: 'I am afraid ____ dogs.', answer: 'of' },
    { sentence: 'We are proud ____ our country.', answer: 'of' },
    { sentence: 'Please look ____ the picture.', answer: 'at' },
    { sentence: 'Listen ____ the teacher carefully.', answer: 'to' },
    { sentence: 'She is waiting ____ the bus.', answer: 'for' },
    { sentence: 'He is talking ____ his friend.', answer: 'to' },
    { sentence: 'I agree ____ you.', answer: 'with' },
    { sentence: 'The book belongs ____ me.', answer: 'to' },
    { sentence: 'She is good ____ playing the piano.', answer: 'at' },
    { sentence: 'We arrived ____ the airport on time.', answer: 'at' }
  ];
  const item = pickRandom(fixedPhrases);

  if (questionType === 'choice') {
    const distractors = ['at', 'in', 'on', 'of', 'to', 'for', 'with'].filter(p => p !== item.answer);
    return choiceQuestion(item.sentence, item.answer, distractors, 'preposition');
  } else {
    return fillBlankQuestion(item.sentence, item.answer, 'preposition');
  }
}

// ────────────────────── 6. conjunction — 连词 ──────────────────────

/**
 * 连词生成器 (and/but/or/because/so)
 * @param {number} level - 难度 1-3
 * @returns {object}
 */
function generateConjunction(level) {
  const questionType = Math.random() > 0.5 ? 'choice' : 'fillBlank';

  if (level === 1) {
    // Level 1: and / but / or
    const conjItems = [
      { sentence: 'I like apples ____ oranges.', answer: 'and', hint: '并列关系' },
      { sentence: 'She is smart ____ lazy.', answer: 'but', hint: '转折关系' },
      { sentence: 'Do you want tea ____ coffee?', answer: 'or', hint: '选择关系' },
      { sentence: 'Tom ____ Jerry are friends.', answer: 'and', hint: '并列关系' },
      { sentence: 'He tried hard ____ failed.', answer: 'but', hint: '转折关系' },
      { sentence: 'You can come today ____ tomorrow.', answer: 'or', hint: '选择关系' }
    ];
    const item = pickRandom(conjItems);
    const question = `${item.sentence} (${item.hint})`;

    if (questionType === 'choice') {
      const distractors = ['and', 'but', 'or'].filter(c => c !== item.answer);
      return choiceQuestion(question, item.answer, distractors, 'conjunction');
    } else {
      return fillBlankQuestion(question, item.answer, 'conjunction');
    }
  }

  if (level === 2) {
    // Level 2: because / so
    const conjItems = [
      { sentence: 'He is happy ____ he got a gift.', answer: 'because', hint: '表原因' },
      { sentence: 'It rained, ____ we stayed home.', answer: 'so', hint: '表结果' },
      { sentence: 'She is crying ____ she lost her toy.', answer: 'because', hint: '表原因' },
      { sentence: 'I was tired, ____ I went to bed.', answer: 'so', hint: '表结果' },
      { sentence: 'He didn\'t come ____ he was sick.', answer: 'because', hint: '表原因' },
      { sentence: 'She studied hard, ____ she passed the exam.', answer: 'so', hint: '表结果' }
    ];
    const item = pickRandom(conjItems);
    const question = `${item.sentence} (${item.hint})`;

    if (questionType === 'choice') {
      const distractors = ['because', 'so', 'and', 'but'].filter(c => c !== item.answer);
      return choiceQuestion(question, item.answer, distractors, 'conjunction');
    } else {
      return fillBlankQuestion(question, item.answer, 'conjunction');
    }
  }

  // Level 3: 混合 (and/but/or/because/so/although/when)
  const conjItems = [
    { sentence: '____ it was cold, he went out without a coat.', answer: 'Although', hint: '虽然' },
    { sentence: 'I was reading ____ she came in.', answer: 'when', hint: '当...时' },
    { sentence: 'You can stay ____ you like.', answer: 'if', hint: '如果' },
    { sentence: 'She didn\'t come ____ she was busy.', answer: 'because', hint: '因为' },
    { sentence: 'He is rich ____ he is not happy.', answer: 'but', hint: '但是' },
    { sentence: 'Study hard, ____ you will pass.', answer: 'and', hint: '那么/就' },
    { sentence: 'Hurry up, ____ you\'ll be late.', answer: 'or', hint: '否则' },
    { sentence: 'I will call you ____ I arrive.', answer: 'when', hint: '当...时' }
  ];
  const item = pickRandom(conjItems);
  const question = `${item.sentence} (${item.hint})`;

  if (questionType === 'choice') {
    const distractors = ['And', 'But', 'Or', 'Because', 'So', 'Although', 'When', 'If'].filter(c => c !== item.answer);
    return choiceQuestion(question, item.answer, distractors, 'conjunction');
  } else {
    return fillBlankQuestion(question, item.answer, 'conjunction');
  }
}

// ────────────────────── 7. sentenceStructure — 句子结构 ──────────────────────

/**
 * 句子结构生成器（陈述句 / 祈使句 / 感叹句）
 * @param {number} level - 难度 1-3
 * @returns {object}
 */
function generateSentenceStructure(level) {
  const questionType = Math.random() > 0.5 ? 'choice' : 'fillBlank';

  if (level === 1) {
    // Level 1: 陈述句（肯定/否定）
    const templates = [
      { correct: 'She likes reading books.', wrong: 'She like reading books.', hint: '第三人称单数' },
      { correct: 'They go to school by bus.', wrong: 'They goes to school by bus.', hint: '主语是复数' },
      { correct: 'He doesn\'t like coffee.', wrong: 'He don\'t like coffee.', hint: '否定句' },
      { correct: 'I am a student.', wrong: 'I is a student.', hint: 'be动词搭配' },
      { correct: 'She can swim very well.', wrong: 'She can swims very well.', hint: '情态动词后接动词原形' },
      { correct: 'We have two cats.', wrong: 'We has two cats.', hint: '主语是复数' }
    ];
    const item = pickRandom(templates);
    const question = `找出正确的句子：`;
    const options = shuffle([item.correct, item.wrong]);

    return choiceQuestion(question, item.correct, options, 'sentenceStructure');
  }

  if (level === 2) {
    // Level 2: 祈使句
    const useDo = Math.random() > 0.5;

    if (useDo) {
      // 肯定祈使句
      const commands = [
        { sentence: '____ the door, please.', answer: 'Open', verb: '打开' },
        { sentence: '____ quiet in the library.', answer: 'Be', verb: '安静' },
        { sentence: '____ your homework first.', answer: 'Do', verb: '做' },
        { sentence: '____ to me carefully.', answer: 'Listen', verb: '听' },
        { sentence: '____ up, please.', answer: 'Stand', verb: '起立' },
        { sentence: '____ down, please.', answer: 'Sit', verb: '坐下' }
      ];
      const item = pickRandom(commands);

      if (questionType === 'choice') {
        const question = `选择正确的祈使句形式：${item.sentence}`;
        const distractors = ['Opens', 'Opening', 'Opened', 'To open'].filter(d => d !== item.answer).slice(0, 3);
        return choiceQuestion(question, item.answer, [item.answer, ...distractors.slice(0, 3)], 'sentenceStructure');
      } else {
        const question = `填入祈使句的动词形式：${item.sentence}`;
        return fillBlankQuestion(question, item.answer, 'sentenceStructure');
      }
    } else {
      // 否定祈使句
      const commands = [
        { sentence: '____ late for school.', answer: 'Don\'t be', verb: '不要迟到' },
        { sentence: '____ run in the hallway.', answer: 'Don\'t', verb: '不要跑' },
        { sentence: '____ forget your keys.', answer: 'Don\'t', verb: '不要忘记' },
        { sentence: '____ noise in class.', answer: 'Don\'t make', verb: '不要制造噪音' }
      ];
      const item = pickRandom(commands);

      if (questionType === 'choice') {
        const question = `"${item.sentence}" 括号内应填？(${item.verb})`;
        const distractors = ['Not', 'No', 'Aren\'t', 'Doesn\'t'].filter(d => d !== item.answer);
        return choiceQuestion(question, item.answer, [item.answer, ...distractors.slice(0, 3)], 'sentenceStructure');
      } else {
        const question = `${item.sentence} 填入正确形式（否定祈使句）`;
        return fillBlankQuestion(question, item.answer, 'sentenceStructure');
      }
    }
  }

  // Level 3: 感叹句 (What / How)
  const exclamTemplates = [
    { what: 'What a beautiful flower!', how: 'How beautiful the flower is!', noun: 'flower', adj: 'beautiful' },
    { what: 'What a tall tree!', how: 'How tall the tree is!', noun: 'tree', adj: 'tall' },
    { what: 'What a cute dog!', how: 'How cute the dog is!', noun: 'dog', adj: 'cute' },
    { what: 'What a big house!', how: 'How big the house is!', noun: 'house', adj: 'big' },
    { what: 'What a smart boy!', how: 'How smart the boy is!', noun: 'boy', adj: 'smart' },
    { what: 'What an interesting book!', how: 'How interesting the book is!', noun: 'book', adj: 'interesting' }
  ];
  const item = pickRandom(exclamTemplates);
  const useWhat = Math.random() > 0.5;

  if (useWhat) {
    // What 感叹句
    const question = `"____ a ${item.adj} ${item.noun}!" 选择正确的感叹词`;

    if (questionType === 'choice') {
      const distractors = ['How', 'So', 'Very', 'Such'].filter(d => d !== 'What');
      return choiceQuestion(question, 'What', [item.adj, 'What', ...distractors.slice(0, 2)], 'sentenceStructure');
    } else {
      return fillBlankQuestion(question, 'What', 'sentenceStructure');
    }
  } else {
    // How 感叹句
    const question = `"____ ${item.adj} the ${item.noun} is!" 选择正确的感叹词`;

    if (questionType === 'choice') {
      const distractors = ['What', 'So', 'Very', 'Such a'].filter(d => d !== 'How');
      return choiceQuestion(question, 'How', [item.adj, 'How', ...distractors.slice(0, 2)], 'sentenceStructure');
    } else {
      return fillBlankQuestion(question, 'How', 'sentenceStructure');
    }
  }
}

// ────────────────────── 8. basicClause — 基本从句 ──────────────────────

/**
 * 基本从句生成器（宾语从句 / 状语从句）
 * @param {number} level - 难度 1-3
 * @returns {object}
 */
function generateBasicClause(level) {
  const questionType = Math.random() > 0.5 ? 'choice' : 'fillBlank';

  if (level === 1) {
    // Level 1: 宾语从句 (that 引导)
    const templates = [
      { sentence: 'I think ____ he is right.', answer: 'that', hint: '认为' },
      { sentence: 'She said ____ she would come.', answer: 'that', hint: '说' },
      { sentence: 'We know ____ the earth is round.', answer: 'that', hint: '知道' },
      { sentence: 'He believes ____ she is honest.', answer: 'that', hint: '相信' },
      { sentence: 'I hope ____ you can come.', answer: 'that', hint: '希望' }
    ];
    const item = pickRandom(templates);
    const question = `${item.sentence} (${item.hint})`;

    if (questionType === 'choice') {
      const distractors = ['what', 'which', 'who', 'if'].filter(d => d !== item.answer);
      return choiceQuestion(question, item.answer, distractors, 'basicClause');
    } else {
      return fillBlankQuestion(question, item.answer, 'basicClause');
    }
  }

  if (level === 2) {
    // Level 2: 状语从句 (when/if/because)
    const templates = [
      { sentence: 'I will call you ____ I arrive.', answer: 'when', hint: '当...时' },
      { sentence: '____ it rains, we will stay at home.', answer: 'If', hint: '如果' },
      { sentence: 'She was late ____ she missed the bus.', answer: 'because', hint: '因为' },
      { sentence: '____ you work hard, you will succeed.', answer: 'If', hint: '如果' },
      { sentence: 'He was reading ____ I came in.', answer: 'when', hint: '当...时' },
      { sentence: 'I didn\'t go ____ I was tired.', answer: 'because', hint: '因为' }
    ];
    const item = pickRandom(templates);
    const question = `${item.sentence} (${item.hint})`;

    if (questionType === 'choice') {
      const distractors = ['when', 'if', 'because', 'that', 'although'].filter(d => d !== item.answer);
      return choiceQuestion(question, item.answer, distractors, 'basicClause');
    } else {
      return fillBlankQuestion(question, item.answer, 'basicClause');
    }
  }

  // Level 3: 混合（宾语从句 + 状语从句，含 that/whether/if）
  const templates = [
    { sentence: 'I wonder ____ he will come.', answer: 'whether', hint: '是否' },
    { sentence: 'She asked ____ I liked it.', answer: 'if', hint: '是否' },
    { sentence: 'He told me ____ he had finished.', answer: 'that', hint: '...' },
    { sentence: '____ you study hard, you will pass.', answer: 'If', hint: '如果' },
    { sentence: 'I don\'t know ____ she is.', answer: 'who', hint: '谁' },
    { sentence: 'Can you tell me ____ the station is?', answer: 'where', hint: '哪里' },
    { sentence: '____ it is sunny, we will go to the park.', answer: 'If', hint: '如果' },
    { sentence: 'She was happy ____ she got a present.', answer: 'because', hint: '因为' },
    { sentence: 'The question is ____ we have enough time.', answer: 'whether', hint: '是否' }
  ];
  const item = pickRandom(templates);
  const question = `${item.sentence} (${item.hint})`;

  if (questionType === 'choice') {
    const distractors = ['that', 'if', 'whether', 'what', 'who', 'where', 'when', 'because', 'although'].filter(d => d !== item.answer);
    return choiceQuestion(question, item.answer, distractors, 'basicClause');
  } else {
    return fillBlankQuestion(question, item.answer, 'basicClause');
  }
}

// ────────────────────────── 注册到英语题型注册表 ──────────────────────────

register('questionForm', generateQuestionForm);
register('pronoun', generatePronoun);
register('adjAdv', generateAdjAdv);
register('comparative', generateComparative);
register('preposition', generatePreposition);
register('conjunction', generateConjunction);
register('sentenceStructure', generateSentenceStructure);
register('basicClause', generateBasicClause);

// ────────────────────────── 导出 ──────────────────────────

export {
  generateQuestionForm,
  generatePronoun,
  generateAdjAdv,
  generateComparative,
  generatePreposition,
  generateConjunction,
  generateSentenceStructure,
  generateBasicClause
};
