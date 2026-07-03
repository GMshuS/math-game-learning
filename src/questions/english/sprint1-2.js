/**
 * Sprint 1 & 2 英语语法动态生成器（8个语法点）
 *
 * 每个生成器接受 level 参数 (1-3)，返回 format 对象：
 *   { question, answer, options?, type: 'choice'|'fillBlank', knowledgeId }
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
  // 确保选项中包含答案且顺序打乱
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

// ────────────────────── 1. beVerb — Be动词 ──────────────────────

/**
 * be 动词生成器 (am/is/are)
 * @param {number} level - 难度 1-3
 * @returns {object}
 */
function generateBeVerb(level) {
  const subjectsL1 = [
    { s: 'I', be: 'am' },
    { s: 'He', be: 'is' },
    { s: 'She', be: 'is' },
    { s: 'It', be: 'is' },
    { s: 'You', be: 'are' },
    { s: 'We', be: 'are' },
    { s: 'They', be: 'are' }
  ];

  const subjectsL2 = [
    { s: 'My mother', be: 'is' },
    { s: 'The cat', be: 'is' },
    { s: 'This book', be: 'is' },
    { s: 'Tom and Jerry', be: 'are' },
    { s: 'The children', be: 'are' },
    { s: 'My parents', be: 'are' },
    { s: '___', be: 'is' }, // placeholder for singular noun
    { s: '___', be: 'are' } // placeholder for plural noun
  ];

  const subjectsL3 = [
    { s: 'There', be: 'is' },
    { s: 'There', be: 'are' },
    { s: 'Either you or she', be: 'is' },
    { s: 'Neither he nor I', be: 'am' },
    { s: 'Everyone', be: 'is' },
    { s: 'Somebody', be: 'is' },
    { s: 'Both of them', be: 'are' },
    { s: 'All of the water', be: 'is' }
  ];

  let pool;
  let questionType = Math.random() > 0.5 ? 'choice' : 'fillBlank';

  if (level === 1) {
    pool = subjectsL1;
  } else if (level === 2) {
    pool = subjectsL2;
    // 替换占位符
    pool = pool.map(item => {
      if (item.s === '___' && item.be === 'is') {
        return { ...item, s: pickRandom(['The girl', 'My friend', 'His dog', 'The school']) };
      }
      if (item.s === '___' && item.be === 'are') {
        return { ...item, s: pickRandom(['The girls', 'My friends', 'The dogs', 'The schools']) };
      }
      return item;
    });
  } else {
    pool = subjectsL3;
  }

  const item = pickRandom(pool);
  const predicateL1 = [
    'a student', 'happy', 'tall', 'my friend', 'at home',
    'from China', 'smart', 'hungry', 'ten years old'
  ];
  const predicateL2 = [
    'very kind', 'in the classroom', 'on the table',
    'playing football', 'from England', 'a teacher',
    'reading a book', 'going to school'
  ];
  const predicateL3 = [
    'responsible for the project',
    'interested in science',
    'going to the library',
    'supposed to be here',
    'known for its beauty'
  ];

  const predicates = level === 1 ? predicateL1 : level === 2 ? predicateL2 : predicateL3;
  const pred = pickRandom(predicates);

  if (questionType === 'choice') {
    const question = `${item.s} ____ ${pred}.`;
    const distractors = ['am', 'is', 'are'].filter(b => b !== item.be);
    return choiceQuestion(question, item.be, distractors, 'beVerb');
  } else {
    const question = `${item.s} ____ ${pred}.`;
    return fillBlankQuestion(question, item.be, 'beVerb');
  }
}

// ────────────────────── 2. noun — 名词单复数/所有格 ──────────────────────

/**
 * 名词生成器（单复数 / 所有格）
 * @param {number} level - 难度 1-3
 * @returns {object}
 */
function generateNoun(level) {
  const pluralRules = [
    // 规则复数
    { singular: 'cat', plural: 'cats', rule: '加 -s' },
    { singular: 'dog', plural: 'dogs', rule: '加 -s' },
    { singular: 'book', plural: 'books', rule: '加 -s' },
    { singular: 'pen', plural: 'pens', rule: '加 -s' },
    { singular: 'bus', plural: 'buses', rule: '加 -es' },
    { singular: 'box', plural: 'boxes', rule: '加 -es' },
    { singular: 'watch', plural: 'watches', rule: '加 -es' },
    { singular: 'brush', plural: 'brushes', rule: '加 -es' },
    { singular: 'baby', plural: 'babies', rule: '变 y 为 i 加 -es' },
    { singular: 'city', plural: 'cities', rule: '变 y 为 i 加 -es' },
    { singular: 'knife', plural: 'knives', rule: '变 f 为 v 加 -es' },
    { singular: 'wolf', plural: 'wolves', rule: '变 f 为 v 加 -es' },
    // 不规则复数
    { singular: 'child', plural: 'children', rule: '不规则' },
    { singular: 'man', plural: 'men', rule: '不规则' },
    { singular: 'woman', plural: 'women', rule: '不规则' },
    { singular: 'tooth', plural: 'teeth', rule: '不规则' },
    { singular: 'foot', plural: 'feet', rule: '不规则' },
    { singular: 'mouse', plural: 'mice', rule: '不规则' },
    { singular: 'sheep', plural: 'sheep', rule: '单复数同形' },
    { singular: 'fish', plural: 'fish', rule: '单复数同形' }
  ];

  const possessiveNouns = [
    { phrase: 'the book of Tom', possessive: "Tom's book" },
    { phrase: 'the bag of Mary', possessive: "Mary's bag" },
    { phrase: 'the tail of the cat', possessive: "the cat's tail" },
    { phrase: 'the room of the girls', possessive: "the girls' room" },
    { phrase: 'the car of my parents', possessive: "my parents' car" },
    { phrase: 'the name of the boy', possessive: "the boy's name" },
    { phrase: 'the house of Mr. Li', possessive: "Mr. Li's house" },
    { phrase: 'the toys of the children', possessive: "the children's toys" }
  ];

  const questionTypes = level === 1
    ? ['plural']
    : level === 2
      ? ['plural', 'plural']
      : ['plural', 'possessive'];

  const type = pickRandom(questionTypes);

  if (type === 'possessive' && level >= 2) {
    const item = pickRandom(possessiveNouns);
    const questionType = Math.random() > 0.4 ? 'choice' : 'fillBlank';

    if (questionType === 'choice') {
      const question = `"${item.phrase}" 的正确表达是？`;
      const distractors = possessiveNouns
        .filter(p => p.possessive !== item.possessive)
        .slice(0, 3)
        .map(p => p.possessive);
      return choiceQuestion(question, item.possessive, distractors, 'noun');
    } else {
      const question = `"${item.phrase}" 用名词所有格表达：____`;
      return fillBlankQuestion(question, item.possessive, 'noun');
    }
  }

  // 单复数题型
  const rule = pickRandom(pluralRules);
  const isSingularToPlural = Math.random() > 0.5;
  const questionType = Math.random() > 0.4 ? 'choice' : 'fillBlank';

  if (isSingularToPlural) {
    if (questionType === 'choice') {
      const question = `"${rule.singular}" 的复数形式是？`;
      const distractors = pluralRules
        .filter(r => r.plural !== rule.plural)
        .slice(0, 3)
        .map(r => r.plural);
      return choiceQuestion(question, rule.plural, distractors, 'noun');
    } else {
      const question = `"${rule.singular}" 的复数形式：____`;
      return fillBlankQuestion(question, rule.plural, 'noun');
    }
  } else {
    if (questionType === 'choice') {
      const question = `"${rule.plural}" 的单数形式是？`;
      const distractors = pluralRules
        .filter(r => r.singular !== rule.singular)
        .slice(0, 3)
        .map(r => r.singular);
      return choiceQuestion(question, rule.singular, distractors, 'noun');
    } else {
      const question = `"${rule.plural}" 的单数形式：____`;
      return fillBlankQuestion(question, rule.singular, 'noun');
    }
  }
}

// ────────────────────── 3. thereBe — There be句型 ──────────────────────

/**
 * There be 句型生成器
 * @param {number} level - 难度 1-3
 * @returns {object}
 */
function generateThereBe(level) {
  const itemsL1 = [
    { noun: 'a book', count: 'singular', be: 'is' },
    { noun: 'an apple', count: 'singular', be: 'is' },
    { noun: 'a cat', count: 'singular', be: 'is' },
    { noun: 'some books', count: 'plural', be: 'are' },
    { noun: 'two dogs', count: 'plural', be: 'are' },
    { noun: 'many students', count: 'plural', be: 'are' }
  ];

  const itemsL2 = [
    { noun: 'some water', count: 'uncountable', be: 'is' },
    { noun: 'a lot of people', count: 'plural', be: 'are' },
    { noun: 'a pen and two pencils', count: 'singular', be: 'is' },
    { noun: 'two pencils and a pen', count: 'plural', be: 'are' },
    { noun: 'some milk', count: 'uncountable', be: 'is' },
    { noun: 'a piece of paper', count: 'singular', be: 'is' }
  ];

  const itemsL3 = [
    { noun: 'no one', count: 'singular', be: 'is' },
    { noun: 'nothing', count: 'singular', be: 'is' },
    { noun: 'a lot of furniture', count: 'uncountable', be: 'is' },
    { noun: 'plenty of opportunities', count: 'plural', be: 'are' },
    { noun: 'a number of problems', count: 'plural', be: 'are' },
    { noun: 'the number of students', count: 'singular', be: 'is' }
  ];

  const pool = level === 1 ? itemsL1 : level === 2 ? itemsL2 : itemsL3;
  const item = pickRandom(pool);

  const locations = [
    'on the table', 'in the room', 'under the chair',
    'in the box', 'on the desk', 'in the bag',
    'near the window', 'behind the door', 'in the garden',
    'on the shelf'
  ];
  const location = pickRandom(locations);

  const beChoices = ['is', 'are'];
  const questionType = Math.random() > 0.5 ? 'choice' : 'fillBlank';

  if (questionType === 'choice') {
    const question = `There ____ ${item.noun} ${location}.`;
    const distractors = beChoices.filter(b => b !== item.be);
    return choiceQuestion(question, item.be, distractors, 'thereBe');
  } else {
    const question = `There ____ ${item.noun} ${location}.`;
    return fillBlankQuestion(question, item.be, 'thereBe');
  }
}

// ────────────────────── 4. article — 冠词 ──────────────────────

/**
 * 冠词生成器 (a/an/the)
 * @param {number} level - 难度 1-3
 * @returns {object}
 */
function generateArticle(level) {
  const anWords = ['apple', 'egg', 'hour', 'honest', 'orange', 'umbrella', 'interesting', 'animal'];
  const aWords = ['book', 'cat', 'dog', 'university', 'useful', 'european', 'one-eyed', 'house'];
  const thePhrases = [
    { phrase: '____ sun', article: 'the' },
    { phrase: '____ moon', article: 'the' },
    { phrase: '____ earth', article: 'the' },
    { phrase: '____ same thing', article: 'the' },
    { phrase: '____ only one', article: 'the' },
    { phrase: '____ best student', article: 'the' }
  ];

  const zeroArticlePhrases = [
    { phrase: 'I go to ____ school', article: '/' },
    { phrase: 'He is in ____ hospital', article: '/' },
    { phrase: 'She goes to ____ bed', article: '/' },
    { phrase: 'We have ____ breakfast', article: '/' },
    { phrase: 'They play ____ basketball', article: '/' },
    { phrase: 'I like ____ music', article: '/' }
  ];

  const questionType = Math.random() > 0.5 ? 'choice' : 'fillBlank';
  let question, answer, options;

  if (level === 1) {
    // a vs an (simple)
    const useAn = Math.random() > 0.5;
    const word = useAn ? pickRandom(anWords) : pickRandom(aWords);
    const article = useAn ? 'an' : 'a';
    question = `____ ${word}`;
    answer = article;

    if (questionType === 'choice') {
      options = buildChoiceOptions(answer, ['a', 'an', 'the']);
      return choiceQuestion(question, answer, options, 'article');
    } else {
      return fillBlankQuestion(`在横线上填入冠词：____ ${word}`, answer, 'article');
    }
  }

  if (level === 2) {
    // a/an vs the
    const isThe = Math.random() > 0.5;
    if (isThe) {
      const ph = pickRandom(thePhrases);
      question = ph.phrase;
      answer = ph.article;
    } else {
      const useAn = Math.random() > 0.5;
      const word = useAn ? pickRandom(anWords) : pickRandom(aWords);
      const article = useAn ? 'an' : 'a';
      question = `____ ${word}`;
      answer = article;
    }

    if (questionType === 'choice') {
      options = buildChoiceOptions(answer, ['a', 'an', 'the']);
      return choiceQuestion(question, answer, options, 'article');
    } else {
      return fillBlankQuestion(`在横线上填入冠词：${question}`, answer, 'article');
    }
  }

  // Level 3: mixed a/an/the/zero article
  const typeRoll = Math.random();
  if (typeRoll < 0.33) {
    const word = pickRandom([...anWords, ...aWords]);
    const isAn = anWords.includes(word);
    answer = isAn ? 'an' : 'a';
    question = `____ ${word}`;
  } else if (typeRoll < 0.66) {
    const ph = pickRandom(thePhrases);
    question = ph.phrase;
    answer = ph.article;
  } else {
    const ph = pickRandom(zeroArticlePhrases);
    // Extract just the blank part
    question = ph.phrase;
    answer = ph.article;
  }

  if (questionType === 'choice') {
    options = buildChoiceOptions(answer, ['a', 'an', 'the', '/']);
    const cleanOptions = options.filter(o => o !== undefined);
    return choiceQuestion(question, answer, cleanOptions, 'article');
  } else {
    return fillBlankQuestion(`填入合适的冠词（不需冠词填'/'）：${question}`, answer, 'article');
  }
}

// ────────────────────── 5. presentSimple — 一般现在时 ──────────────────────

/**
 * 一般现在时生成器
 * @param {number} level - 难度 1-3
 * @returns {object}
 */
function generatePresentSimple(level) {
  const verbsL1 = [
    { base: 'play', third: 'plays', cn: '玩' },
    { base: 'read', third: 'reads', cn: '读' },
    { base: 'write', third: 'writes', cn: '写' },
    { base: 'run', third: 'runs', cn: '跑' },
    { base: 'eat', third: 'eats', cn: '吃' },
    { base: 'drink', third: 'drinks', cn: '喝' },
    { base: 'like', third: 'likes', cn: '喜欢' }
  ];

  const verbsL2 = [
    { base: 'study', third: 'studies', cn: '学习' },
    { base: 'watch', third: 'watches', cn: '看' },
    { base: 'go', third: 'goes', cn: '去' },
    { base: 'do', third: 'does', cn: '做' },
    { base: 'have', third: 'has', cn: '有' },
    { base: 'say', third: 'says', cn: '说' },
    { base: 'teach', third: 'teaches', cn: '教' }
  ];

  const subjectsL1 = [
    { subj: 'I', verbForm: 'base' },
    { subj: 'You', verbForm: 'base' },
    { subj: 'We', verbForm: 'base' },
    { subj: 'They', verbForm: 'base' },
    { subj: 'He', verbForm: 'third' },
    { subj: 'She', verbForm: 'third' },
    { subj: 'Tom', verbForm: 'third' }
  ];

  const subjectsL2 = [
    { subj: 'The children', verbForm: 'base' },
    { subj: 'My parents', verbForm: 'base' },
    { subj: 'The dog', verbForm: 'third' },
    { subj: 'His sister', verbForm: 'third' },
    { subj: 'The teachers', verbForm: 'base' },
    { subj: 'Everyone', verbForm: 'third' }
  ];

  const subjectsL3 = [
    { subj: 'The boy', verbForm: 'third' },
    { subj: 'The students', verbForm: 'base' },
    { subj: 'My father', verbForm: 'third' },
    { subj: 'The company', verbForm: 'third' },
    { subj: 'Neither of them', verbForm: 'third' }
  ];

  const verbPool = level === 1 ? verbsL1 : level === 2 ? verbsL2 : [...verbsL1, ...verbsL2];
  const subjectPool = level === 1 ? subjectsL1 : level === 2 ? subjectsL2 : subjectsL3;
  const subj = pickRandom(subjectPool);
  const verb = pickRandom(verbPool);
  const correctForm = subj.verbForm === 'third' ? verb.third : verb.base;

  const objects = [
    'every day', 'in the morning', 'after school',
    'on weekends', 'at home', 'at school',
    'every week', 'on Sundays'
  ];
  const obj = pickRandom(objects);

  // 否定句 level 2+
  const useNegative = level >= 2 && Math.random() > 0.6;
  // 疑问句 level 3
  const useQuestion = level >= 3 && Math.random() > 0.6;

  let question, answer;

  if (useQuestion) {
    const doForm = subj.verbForm === 'third' ? 'Does' : 'Do';
    const baseVerb = verb.base;
    question = `${doForm} ${subj.subj} ${baseVerb} ${obj}?`;
    answer = `Yes, ${doForm.toLowerCase() === 'does' ? 'does' : 'do'}`;
    return choiceQuestion(question, answer, ['Yes, do', 'Yes, does', 'No, don\'t', 'No, doesn\'t'], 'presentSimple');
  }

  if (useNegative) {
    const negAux = subj.verbForm === 'third' ? "doesn't" : "don't";
    const baseVerb = verb.base;
    question = `${subj.subj} ____ ${baseVerb} ${obj}.`;
    answer = negAux;
  } else {
    question = `${subj.subj} ____ ${obj}.`;
    answer = correctForm;
  }

  const questionType = Math.random() > 0.5 ? 'choice' : 'fillBlank';

  if (questionType === 'choice') {
    const verbForms = [...new Set(verbPool.flatMap(v => [v.base, v.third]))];
    const distractors = verbForms.filter(f => f !== answer).slice(0, 3);
    return choiceQuestion(question, answer, distractors, 'presentSimple');
  } else {
    return fillBlankQuestion(question, answer, 'presentSimple');
  }
}

// ────────────────────── 6. presentContinuous — 现在进行时 ──────────────────────

/**
 * 现在进行时生成器 (am/is/are + doing)
 * @param {number} level - 难度 1-3
 * @returns {object}
 */
function generatePresentContinuous(level) {
  const subjects = [
    { s: 'I', be: 'am' },
    { s: 'He', be: 'is' },
    { s: 'She', be: 'is' },
    { s: 'You', be: 'are' },
    { s: 'We', be: 'are' },
    { s: 'They', be: 'are' },
    { s: 'Tom', be: 'is' },
    { s: 'The cat', be: 'is' },
    { s: 'The children', be: 'are' }
  ];

  const verbs = [
    { base: 'play', ing: 'playing' },
    { base: 'run', ing: 'running' },
    { base: 'swim', ing: 'swimming' },
    { base: 'read', ing: 'reading' },
    { base: 'write', ing: 'writing' },
    { base: 'dance', ing: 'dancing' },
    { base: 'sit', ing: 'sitting' },
    { base: 'eat', ing: 'eating' },
    { base: 'sleep', ing: 'sleeping' },
    { base: 'sing', ing: 'singing' },
    { base: 'make', ing: 'making' },
    { base: 'have', ing: 'having' }
  ];

  const subj = pickRandom(subjects);
  const verb = pickRandom(verbs);

  // Level 2+: 否定句
  const useNegative = level >= 2 && Math.random() > 0.6;
  // Level 3+: 疑问句
  const useQuestion = level >= 3 && Math.random() > 0.5;

  const locations = [
    'in the park', 'at school', 'at home',
    'in the classroom', 'on the playground',
    'in the garden', 'under the tree', 'by the river'
  ];
  const location = pickRandom(locations);

  let question, answer;
  const correctBe = subj.be;
  const correctIng = verb.ing;

  if (useQuestion) {
    const beForm = correctBe === 'am' ? 'Am' :
      correctBe === 'is' ? 'Is' : 'Are';
    question = `${beForm} ${subj.s} ${correctIng} ${location}?`;
    answer = `Yes, ${subj.s} ${correctBe}`;
    // For I, answer is "Yes, I am"
    if (subj.s === 'I') answer = 'Yes, I am';
    const distractors = ['Yes, he is', 'Yes, she is', 'No', 'Yes'];
    return choiceQuestion(question, answer, distractors, 'presentContinuous');
  }

  if (useNegative) {
    const negBe = correctBe + ' not';
    question = `${subj.s} ____ ${correctIng} ${location}.`;
    answer = negBe;
  } else {
    question = `${subj.s} ____ ${correctIng} ${location}.`;
    answer = correctBe;
  }

  const questionType = Math.random() > 0.5 ? 'choice' : 'fillBlank';

  if (questionType === 'choice') {
    const distractors = ['am', 'is', 'are'].filter(b => b !== answer);
    return choiceQuestion(question, answer, distractors, 'presentContinuous');
  } else {
    return fillBlankQuestion(question, answer, 'presentContinuous');
  }
}

// ────────────────────── 7. pastTense — 一般过去时 ──────────────────────

/**
 * 一般过去时生成器
 * @param {number} level - 难度 1-3
 * @returns {object}
 */
function generatePastTense(level) {
  const regularVerbs = [
    { base: 'play', past: 'played' },
    { base: 'walk', past: 'walked' },
    { base: 'study', past: 'studied' },
    { base: 'stop', past: 'stopped' },
    { base: 'live', past: 'lived' },
    { base: 'like', past: 'liked' },
    { base: 'cry', past: 'cried' },
    { base: 'carry', past: 'carried' }
  ];

  const irregularVerbs = [
    { base: 'go', past: 'went' },
    { base: 'eat', past: 'ate' },
    { base: 'see', past: 'saw' },
    { base: 'take', past: 'took' },
    { base: 'have', past: 'had' },
    { base: 'do', past: 'did' },
    { base: 'say', past: 'said' },
    { base: 'make', past: 'made' },
    { base: 'buy', past: 'bought' },
    { base: 'write', past: 'wrote' },
    { base: 'read', past: 'read' },
    { base: 'come', past: 'came' },
    { base: 'give', past: 'gave' },
    { base: 'sing', past: 'sang' },
    { base: 'swim', past: 'swam' },
    { base: 'run', past: 'ran' },
    { base: 'draw', past: 'drew' },
    { base: 'fly', past: 'flew' }
  ];

  const subjects = ['I', 'You', 'He', 'She', 'Tom', 'We', 'They', 'My mother', 'The children'];

  let verbPool;
  if (level === 1) {
    verbPool = regularVerbs;
  } else if (level === 2) {
    verbPool = [...regularVerbs, ...irregularVerbs.slice(0, 8)];
  } else {
    verbPool = [...regularVerbs, ...irregularVerbs];
  }

  const verb = pickRandom(verbPool);
  const subj = pickRandom(subjects);

  const timeMarkers = [
    'yesterday', 'last night', 'last week',
    'last month', 'last year', 'two days ago',
    'in 2020', 'just now'
  ];
  const time = pickRandom(timeMarkers);

  // 否定句 level 2+
  const useNegative = level >= 2 && Math.random() > 0.6;
  // 疑问句 level 3
  const useQuestion = level >= 3 && Math.random() > 0.5;

  let question, answer;

  if (useQuestion) {
    question = `Did ${subj} ${verb.base} ${time}?`;
    answer = `Yes, ${subj} did`;
    return choiceQuestion(question, answer,
      [`Yes, ${subj} did`, `No, ${subj} didn't`, `Yes, ${subj} ${verb.past}`, 'No'],
      'pastTense');
  }

  if (useNegative) {
    question = `${subj} ____ ${verb.base} ${time}.`;
    answer = "didn't";
  } else {
    question = `${subj} ____ ${time}.`;
    answer = verb.past;
  }

  const questionType = Math.random() > 0.45 ? 'choice' : 'fillBlank';

  if (questionType === 'choice') {
    // 从动词池收集所有过去式作为干扰项
    const allPast = [...new Set(verbPool.map(v => v.past))];
    const distractors = allPast.filter(p => p !== answer).slice(0, 3);
    return choiceQuestion(question, answer, distractors.length > 0 ? distractors : ['played', 'went', 'saw'], 'pastTense');
  } else {
    return fillBlankQuestion(question, answer, 'pastTense');
  }
}

// ────────────────────── 8. futureTense — 一般将来时 ──────────────────────

/**
 * 一般将来时生成器 (will / be going to)
 * @param {number} level - 难度 1-3
 * @returns {object}
 */
function generateFutureTense(level) {
  const subjects = [
    { s: 'I', be: 'am' },
    { s: 'You', be: 'are' },
    { s: 'He', be: 'is' },
    { s: 'She', be: 'is' },
    { s: 'We', be: 'are' },
    { s: 'They', be: 'are' },
    { s: 'Tom', be: 'is' },
    { s: 'The students', be: 'are' }
  ];

  const actions = [
    { base: 'go to school', phrase: 'going to school' },
    { base: 'play football', phrase: 'playing football' },
    { base: 'read a book', phrase: 'reading a book' },
    { base: 'visit grandma', phrase: 'visiting grandma' },
    { base: 'do homework', phrase: 'doing homework' },
    { base: 'watch TV', phrase: 'watching TV' },
    { base: 'travel to Beijing', phrase: 'traveling to Beijing' },
    { base: 'learn English', phrase: 'learning English' },
    { base: 'make a cake', phrase: 'making a cake' }
  ];

  const timeMarkers = [
    'tomorrow', 'next week', 'next month',
    'next year', 'this weekend', 'in the future',
    'soon', 'tonight'
  ];

  const subj = pickRandom(subjects);
  const action = pickRandom(actions);
  const time = pickRandom(timeMarkers);

  // Level 1: 只用 will
  // Level 2: will + be going to
  // Level 3: will/be going to + 否定/疑问

  const useWill = level === 1 ? true : Math.random() > 0.5;
  const useNegative = level >= 2 && Math.random() > 0.5;
  const useQuestion = level >= 3 && Math.random() > 0.4;

  let question, answer;

  if (useQuestion) {
    if (useWill) {
      question = `Will ${subj.s} ${action.base} ${time}?`;
      answer = `Yes, ${subj.s} will`;
    } else {
      const beForm = subj.be === 'am' ? 'Am' : subj.be === 'is' ? 'Is' : 'Are';
      question = `${beForm} ${subj.s} going to ${action.base} ${time}?`;
      answer = `Yes, ${subj.s} ${subj.be}`;
    }
    return choiceQuestion(question, answer,
      ['Yes', 'No', 'Maybe', 'I don\'t know'],
      'futureTense');
  }

  if (useWill) {
    if (useNegative) {
      question = `${subj.s} ____ ${action.base} ${time}.`;
      answer = "won't";
    } else {
      question = `${subj.s} ____ ${action.base} ${time}.`;
      answer = 'will';
    }
  } else {
    if (useNegative) {
      const negBe = subj.be + ' not';
      question = `${subj.s} ____ going to ${action.base} ${time}.`;
      answer = negBe;
    } else {
      question = `${subj.s} ____ going to ${action.base} ${time}.`;
      answer = subj.be;
    }
  }

  const questionType = Math.random() > 0.5 ? 'choice' : 'fillBlank';

  if (questionType === 'choice') {
    let distractors;
    if (useWill) {
      distractors = ['will', "won't", 'is', 'are'].filter(d => d !== answer);
    } else {
      distractors = ['am', 'is', 'are', 'will'].filter(d => d !== answer);
    }
    return choiceQuestion(question, answer, distractors.slice(0, 3), 'futureTense');
  } else {
    return fillBlankQuestion(question, answer, 'futureTense');
  }
}

// ────────────────────────── 注册到英语题型注册表 ──────────────────────────

register('beVerb', generateBeVerb);
register('noun', generateNoun);
register('thereBe', generateThereBe);
register('article', generateArticle);
register('presentSimple', generatePresentSimple);
register('presentContinuous', generatePresentContinuous);
register('pastTense', generatePastTense);
register('futureTense', generateFutureTense);

// ────────────────────────── 导出 ──────────────────────────

export {
  generateBeVerb,
  generateNoun,
  generateThereBe,
  generateArticle,
  generatePresentSimple,
  generatePresentContinuous,
  generatePastTense,
  generateFutureTense
};
