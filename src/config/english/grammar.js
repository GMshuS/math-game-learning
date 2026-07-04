/**
 * 语法塔配置（14 塔）
 * 保留：塔结构+教程+楼层元数据、dragOrder精选20题、bossFight精选10题、特殊题型
 * 删除：大量静态选择题（由动态生成器替代）
 * 迁移：phrase（常用语塔）和 dialogue（情景对话塔）已移至 speaking.js
 *
 * 分类说明：
 *   morphology（词法篇）: beVerb, noun, pronoun, article, preposition, comparative
 *   tense（时态篇）: presentSimple, presentContinuous, futureTense, pastTense
 *   syntax（句法篇）: questionForm, thereBe, conjunction, basicClause
 *
 * getTowerById / getFloorByNumber 同时支持 grammarTowers 和 speakingTowers 查询，
 * 以便 EnglishGrammarGame.vue 可从口语专区获取塔数据。
 */

import { speakingTowers } from './speaking';

export const grammarTowers = [
  // 1. Be动词塔 (beVerb)
  {
    id: 'beVerb',
    name: 'Be动词塔',
    category: 'morphology',
    icon: '📖',
    description: '掌握 am/is/are 的用法，成为语法大师！',
    unlockLevel: 1,
    tutorial: {
      title: 'Be动词是什么？',
      rules: [
        { rule: 'I → am', example: 'I am a student.', explanation: '当主语是 I 时，be 动词用 am' },
        { rule: 'He/She/It → is', example: 'She is my friend.', explanation: '当主语是第三人称单数时，be 动词用 is' },
        { rule: 'You/We/They → are', example: 'They are happy.', explanation: '当主语是复数时，be 动词用 are' }
      ],
      tips: ['am 只和 I 搭配', 'is 用于第三人称单数', 'are 用于复数']
    },
    floors: [
      { floor: 1, type: 'choice', title: '识别题 (I搭配)', description: '选择正确的 be 动词 — 主语是 I 时用 am', questions: [] },
      { floor: 2, type: 'choice', title: '识别题 (第三人称搭配)', description: '选择正确的 be 动词 — 第三人称单数用 is', questions: [] },
      { floor: 3, type: 'choice', title: '识别题 (复数搭配)', description: '选择正确的 be 动词 — 复数主语用 are', questions: [] },
      { floor: 4, type: 'fillBlank', title: '填空题 (主谓匹配)', description: '根据主语填入正确的 be 动词', questions: [] },
      { floor: 5, type: 'fillBlank', title: '填空题 (混合人称)', description: '判断主语人称，填写正确的 be 动词', questions: [] },
      { floor: 6, type: 'fillBlank', title: '填空题 (否定句)', description: '在否定句中填入正确的 be 动词', questions: [] },
      {
        floor: 7, type: 'dragOrder', title: '排序题 (疑问句)', description: '拖拽单词组成正确的疑问句',
        questions: [
          { sentence: '你是一名学生吗？', blanks: [], words: ['you', 'Are', 'a student', '?'], answer: 'Are you a student?', options: [], voicePrompt: 'Are you a student?' },
          { sentence: '她是一名老师吗？', blanks: [], words: ['she', 'Is', 'a teacher', '?'], answer: 'Is she a teacher?', options: [], voicePrompt: 'Is she a teacher?' }
        ]
      },
      {
        floor: 8, type: 'bossFight', title: 'BOSS战 (语法魔王)', description: '找出并修复语法错误，击败语法魔王！',
        questions: [
          { wrongSentence: 'She are a teacher.', answer: 'is', options: ['is', 'am', 'are'], explanation: 'She 是第三人称单数，要用 is', voicePrompt: 'is' },
          { wrongSentence: 'I is happy.', answer: 'am', options: ['am', 'is', 'are'], explanation: 'I 要和 am 搭配', voicePrompt: 'am' }
        ],
        boss: { name: '语法魔王', icon: '👹', hp: 3 },
        winCondition: { consecutiveCorrect: 3 }
      }
    ]
  },
  // 2. 一般现在时 (presentSimple)
  {
    id: 'presentSimple',
    name: '一般现在时',
    category: 'tense',
    icon: '⏰',
    description: '掌握一般现在时的肯定句、否定句和疑问句',
    unlockLevel: 2,
    tutorial: {
      title: '一般现在时是什么？',
      rules: [
        { rule: '主语 + 动词原形 / 动词-s', example: 'I like apples. / He likes apples.', explanation: '第三人称单数主语后动词要加 -s 或 -es' },
        { rule: "否定句用 don't / doesn't", example: "I don't like cats. He doesn't like cats.", explanation: "第三人称单数用 doesn't，其他人称用 don't" },
        { rule: '疑问句用 Do / Does 开头', example: 'Do you like milk? / Does she like milk?', explanation: '第三人称单数用 Does，其他人称用 Do' }
      ],
      tips: ['he/she/it 是第三人称单数', '动词加 -s 规则：一般加 -s，以 s/x/ch/sh/o 结尾加 -es', 'does 后面的动词要恢复原形']
    },
    floors: [
      { floor: 1, type: 'choice', title: '选择题 (肯定句)', description: '选择正确的动词形式', questions: [] },
      { floor: 2, type: 'choice', title: '选择题 (第三人称单数)', description: '选择正确的第三人称单数动词形式', questions: [] },
      { floor: 3, type: 'choice', title: '选择题 (否定与疑问)', description: '选择正确的否定或疑问形式', questions: [] },
      { floor: 4, type: 'fillBlank', title: '填空题 (肯定句)', description: '填入正确的动词形式', questions: [] },
      { floor: 5, type: 'fillBlank', title: '填空题 (否定句)', description: "填入 don't 或 doesn't", questions: [] },
      { floor: 6, type: 'fillBlank', title: '填空题 (疑问句)', description: '填入 Do 或 Does', questions: [] },
      {
        floor: 7, type: 'dragOrder', title: '排序题 (一般现在时)', description: '拖拽单词组成正确的句子',
        questions: [
          { sentence: '他每天喝牛奶。', blanks: [], words: ['milk', 'He', 'every day', 'drinks'], answer: 'He drinks milk every day.', options: [], voicePrompt: 'He drinks milk every day.' },
          { sentence: '她不吃肉。', blanks: [], words: ['meat', 'She', "doesn't", 'eat'], answer: "She doesn't eat meat.", options: [], voicePrompt: "She doesn't eat meat." }
        ]
      },
      {
        floor: 8, type: 'bossFight', title: 'BOSS战 (时态魔王)', description: '找出并修复一般现在时的语法错误！',
        questions: [
          { wrongSentence: 'He go to school every day.', answer: 'goes', options: ['go', 'goes', 'going'], explanation: '第三人称单数 He 后面动词要加 -es', voicePrompt: 'goes' }
        ],
        boss: { name: '语法魔王', icon: '👹', hp: 3 },
        winCondition: { consecutiveCorrect: 3 }
      }
    ]
  },
  // 3. 现在进行时 (presentContinuous)
  {
    id: 'presentContinuous',
    name: '现在进行时',
    category: 'tense',
    icon: '🔄',
    description: '掌握现在进行时的构成和用法',
    unlockLevel: 2,
    tutorial: {
      title: '现在进行时是什么？',
      rules: [
        { rule: '主语 + be动词 + 动词-ing', example: 'I am reading. / She is singing.', explanation: '现在进行时表示正在进行的动作' },
        { rule: '否定句在 be 动词后加 not', example: 'He is not sleeping.', explanation: '表示"不在做某事"' },
        { rule: '疑问句把 be 动词提前', example: 'Are you watching TV?', explanation: '提问时把 am/is/are 放到句首' }
      ],
      tips: ['动词加 -ing 规则：一般直接加 -ing', '以 e 结尾的动词要去 e 加 -ing (make → making)', '以重读闭音节结尾的，双写尾字母加 -ing (run → running)']
    },
    floors: [
      { floor: 1, type: 'choice', title: '选择题 (肯定句)', description: '选择正确的现在进行时形式', questions: [] },
      { floor: 2, type: 'choice', title: '选择题 (否定句)', description: '选择正确的否定形式', questions: [] },
      { floor: 3, type: 'choice', title: '选择题 (疑问句)', description: '选择正确的疑问形式', questions: [] },
      { floor: 4, type: 'fillBlank', title: '填空题 (动词-ing)', description: '填入动词的现在分词 (-ing) 形式', questions: [] },
      { floor: 5, type: 'fillBlank', title: '填空题 (be动词选择)', description: '填入正确的 be 动词 (am/is/are)', questions: [] },
      { floor: 6, type: 'fillBlank', title: '填空题 (综合)', description: '根据上下文填入正确的形式', questions: [] },
      {
        floor: 7, type: 'dragOrder', title: '排序题 (现在进行时)', description: '拖拽单词组成正确的句子',
        questions: [
          { sentence: '她正在读书。', blanks: [], words: ['a book', 'She', 'reading', 'is'], answer: 'She is reading a book.', options: [], voicePrompt: 'She is reading a book.' },
          { sentence: '他们正在踢足球。', blanks: [], words: ['football', 'playing', 'They', 'are'], answer: 'They are playing football.', options: [], voicePrompt: 'They are playing football.' }
        ]
      },
      {
        floor: 8, type: 'bossFight', title: 'BOSS战 (进行时魔王)', description: '找出并修复现在进行时的语法错误！',
        questions: [
          { wrongSentence: 'She are reading a book.', answer: 'is', options: ['am', 'is', 'are'], explanation: 'She 是第三人称单数，要用 is', voicePrompt: 'is' }
        ],
        boss: { name: '语法魔王', icon: '👹', hp: 3 },
        winCondition: { consecutiveCorrect: 3 }
      }
    ]
  },
  // 4. 名词 (noun)
  {
    id: 'noun',
    name: '名词',
    category: 'morphology',
    icon: '📦',
    description: '学习名词的分类：可数名词与不可数名词',
    unlockLevel: 1,
    tutorial: {
      title: '名词是什么？',
      rules: [
        { rule: '可数名词 (Countable)', example: 'a book, two apples, many students', explanation: '可以用数字计数的名词，有单复数形式' },
        { rule: '不可数名词 (Uncountable)', example: 'water, rice, milk, homework', explanation: '不能直接用数字计数的名词，没有复数形式' },
        { rule: '可数名词复数变化', example: 'cat → cats, box → boxes, baby → babies', explanation: '一般加 -s，以 s/x/ch/sh/o 加 -es，辅音+y 变 y 为 i 加 -es' }
      ],
      tips: ['可数名词前面可以用 a/an', '不可数名词前面不能用 a/an', '不可数名词可以用 some, a little, much 修饰', '可数名词可以用 many, a few, several 修饰']
    },
    floors: [
      { floor: 1, type: 'choice', title: '选择题 (可数/不可数)', description: '判断名词是可数还是不可数', questions: [] },
      { floor: 2, type: 'choice', title: '选择题 (名词复数)', description: '选择正确的复数形式', questions: [] },
      {
        floor: 3, type: 'categorize', title: '分类题 (可数/不可数)', description: '将名词拖入正确的分类',
        questions: [{
          sentence: '将下列名词分类', prompt: '将下列名词分为可数名词和不可数名词',
          items: ['apple', 'water', 'book', 'rice', 'dog', 'milk', 'chair', 'bread', 'egg', 'sugar'],
          categories: [{ id: 'countable', label: '可数名词', icon: '📦' }, { id: 'uncountable', label: '不可数名词', icon: '💧' }],
          answer: 'apple:countable,water:uncountable,book:countable,rice:uncountable,dog:countable,milk:uncountable,chair:countable,bread:uncountable,egg:countable,sugar:uncountable'
        }]
      },
      { floor: 4, type: 'fillBlank', title: '填空题 (a/an)', description: '填入 a 或 an', questions: [] },
      { floor: 5, type: 'fillBlank', title: '填空题 (some/any)', description: '填入 some 或 any', questions: [] },
      { floor: 6, type: 'fillBlank', title: '填空题 (名词综合)', description: '填入正确的名词形式', questions: [] },
      {
        floor: 7, type: 'dragOrder', title: '排序题 (名词)', description: '拖拽单词组成正确的句子',
        questions: [
          { sentence: '桌子上有一些书。', blanks: [], words: ['There', 'on the desk', 'are', 'some books'], answer: 'There are some books on the desk.', options: [], voicePrompt: 'There are some books on the desk.' },
          { sentence: '我想要一些水。', blanks: [], words: ['want', 'I', 'some water'], answer: 'I want some water.', options: [], voicePrompt: 'I want some water.' }
        ]
      },
      {
        floor: 8, type: 'bossFight', title: 'BOSS战 (名词魔王)', description: '找出并修复名词用法中的错误！',
        questions: [
          { wrongSentence: 'I have three child.', answer: 'children', options: ['child', 'children', 'childs'], explanation: 'child 的复数是不规则变化 children', voicePrompt: 'children' },
          { wrongSentence: 'She is a engineer.', answer: 'an', options: ['a', 'an', 'the'], explanation: 'engineer 以元音音素开头，要用 an', voicePrompt: 'an' }
        ],
        boss: { name: '语法魔王', icon: '👹', hp: 3 },
        winCondition: { consecutiveCorrect: 3 }
      }
    ]
  },
  // 5. 代词 (pronoun)
  {
    id: 'pronoun',
    name: '代词',
    category: 'morphology',
    icon: '👤',
    description: '学习主格代词和宾格代词的用法',
    unlockLevel: 2,
    tutorial: {
      title: '代词是什么？',
      rules: [
        { rule: '主格代词 (Subject Pronouns)', example: 'I, you, he, she, it, we, they', explanation: '主格代词用作句子的主语' },
        { rule: '宾格代词 (Object Pronouns)', example: 'me, you, him, her, it, us, them', explanation: '宾格代词用作动词或介词的宾语' },
        { rule: '用法区别', example: 'I like her. (I=主格, her=宾格)', explanation: '动词前用主格，动词/介词后用宾格' }
      ],
      tips: ['I (我) 永远大写', 'you 的主格和宾格形式相同', 'it 的主格和宾格形式相同']
    },
    floors: [
      { floor: 1, type: 'choice', title: '选择题 (主格代词)', description: '选择正确的主格代词', questions: [] },
      {
        floor: 2, type: 'match', title: '配对题 (主格↔宾格)', description: '将主格代词与对应的宾格代词配对',
        questions: [{
          sentence: '将主格代词与对应的宾格代词配对', prompt: '将主格代词与对应的宾格代词配对',
          pairs: [
            { left: 'I', right: 'me' }, { left: 'he', right: 'him' }, { left: 'she', right: 'her' },
            { left: 'we', right: 'us' }, { left: 'they', right: 'them' }
          ],
          answer: 'i-me|he-him|she-her|we-us|they-them'
        }]
      },
      { floor: 3, type: 'choice', title: '选择题 (主格/宾格辨析)', description: '选择正确的代词形式', questions: [] },
      { floor: 4, type: 'fillBlank', title: '填空题 (代词选择)', description: '根据提示填入正确的代词', questions: [] },
      { floor: 5, type: 'fillBlank', title: '填空题 (物主代词)', description: '填入正确的物主代词', questions: [] },
      { floor: 6, type: 'fillBlank', title: '填空题 (代词综合)', description: '根据语境填入正确的代词形式', questions: [] },
      {
        floor: 7, type: 'dragOrder', title: '排序题 (代词)', description: '拖拽单词组成正确的句子',
        questions: [
          { sentence: '她是我最好的朋友。', blanks: [], words: ['She', 'my best friend', 'is'], answer: 'She is my best friend.', options: [], voicePrompt: 'She is my best friend.' },
          { sentence: '请给我们一些水。', blanks: [], words: ['some water', 'Please', 'us', 'give'], answer: 'Please give us some water.', options: [], voicePrompt: 'Please give us some water.' }
        ]
      },
      {
        floor: 8, type: 'bossFight', title: 'BOSS战 (代词魔王)', description: '找出并修复代词用法中的错误！',
        questions: [
          { wrongSentence: 'Me is a student.', answer: 'I', options: ['I', 'Me', 'My'], explanation: '主语要用主格 I，不能用宾格 me', voicePrompt: 'I' }
        ],
        boss: { name: '语法魔王', icon: '👹', hp: 3 },
        winCondition: { consecutiveCorrect: 3 }
      }
    ]
  },
  // 6. There be 句型 (thereBe)
  {
    id: 'thereBe',
    name: 'There be 句型',
    category: 'syntax',
    icon: '🏗️',
    description: '学习 There is / There are 的用法',
    unlockLevel: 2,
    tutorial: {
      title: 'There be 句型是什么？',
      rules: [
        { rule: 'There is + 单数/不可数名词', example: 'There is a book on the desk.', explanation: '单数名词或不可数名词用 There is' },
        { rule: 'There are + 复数名词', example: 'There are many students in the classroom.', explanation: '复数名词用 There are' },
        { rule: '否定句和疑问句', example: 'There is not / There are not / Is there? / Are there?', explanation: '否定加 not，疑问把 is/are 提前' }
      ],
      tips: ['There be 中的 be 动词由后面第一个名词决定', "缩写：There's = There is, There're = There are", "There be 表示'存在有'，have/has 表示'拥有'"]
    },
    floors: [
      { floor: 1, type: 'choice', title: '选择题 (There is)', description: '选择正确的 There is 形式', questions: [] },
      { floor: 2, type: 'choice', title: '选择题 (There are)', description: '选择正确的 There are 形式', questions: [] },
      { floor: 3, type: 'choice', title: '选择题 (There be 综合)', description: '选择 There is 或 There are', questions: [] },
      { floor: 4, type: 'fillBlank', title: '填空题 (is/are)', description: '填入 is 或 are', questions: [] },
      { floor: 5, type: 'fillBlank', title: '填空题 (否定句)', description: "填入 isn't 或 aren't", questions: [] },
      { floor: 6, type: 'fillBlank', title: '填空题 (疑问句)', description: '填入 Is 或 Are', questions: [] },
      {
        floor: 7, type: 'dragOrder', title: '排序题 (There be)', description: '拖拽单词组成正确的句子',
        questions: [
          { sentence: '桌子上有一本书。', blanks: [], words: ['There', 'a book', 'on the desk', 'is'], answer: 'There is a book on the desk.', options: [], voicePrompt: 'There is a book on the desk.' },
          { sentence: '花园里有很多花。', blanks: [], words: ['many flowers', 'in the garden', 'There', 'are'], answer: 'There are many flowers in the garden.', options: [], voicePrompt: 'There are many flowers in the garden.' }
        ]
      },
      {
        floor: 8, type: 'bossFight', title: 'BOSS战 (There be 魔王)', description: '找出并修复 There be 句型中的错误！',
        questions: [
          { wrongSentence: 'There have a book on the desk.', answer: 'is', options: ['is', 'are', 'have'], explanation: '表示"存在有"要用 There be 句型，不用 have', voicePrompt: 'is' },
          { wrongSentence: 'There are a cat under the table.', answer: 'is', options: ['is', 'are', 'have'], explanation: 'a cat 是单数，要用 There is', voicePrompt: 'is' }
        ],
        boss: { name: '语法魔王', icon: '👹', hp: 3 },
        winCondition: { consecutiveCorrect: 3 }
      }
    ]
  },
  // 7. 介词 (preposition)
  {
    id: 'preposition',
    name: '介词',
    category: 'morphology',
    icon: '📍',
    description: '学习方位介词和时间介词的用法',
    unlockLevel: 3,
    tutorial: {
      title: '介词是什么？',
      rules: [
        { rule: '方位介词', example: 'in, on, under, behind, in front of, next to', explanation: '表示物体之间的位置关系' },
        { rule: '时间介词', example: 'at (具体时间), in (月份/年), on (星期/日期)', explanation: '表示时间关系' },
        { rule: '常用搭配', example: "at 7 o'clock, in the morning, on Monday", explanation: '不同时间名词前用不同的介词' }
      ],
      tips: ['in: 在...里面 (in the box)', 'on: 在...上面 (on the table)', 'under: 在...下面 (under the bed)', 'at + 具体时间 / 小地点']
    },
    floors: [
      { floor: 1, type: 'choice', title: '选择题 (方位介词)', description: '选择正确的位置介词', questions: [] },
      {
        floor: 2, type: 'imageChoice', title: '看图题 (选介词)', description: '根据 emoji 场景选择正确的介词',
        questions: [
          { emoji: '🐱📦', sentence: 'The cat is ___ the box.', options: ['in', 'on', 'under', 'behind'], answer: 'in', prompt: '看图选择正确的介词' },
          { emoji: '📚📖➡️📚', sentence: 'The book is ___ the desk.', options: ['under', 'on', 'in', 'behind'], answer: 'on', prompt: '看图选择正确的介词' },
          { emoji: '⚽🪑', sentence: 'The ball is ___ the chair.', options: ['on', 'under', 'in', 'next to'], answer: 'under', prompt: '看图选择正确的介词' },
          { emoji: '🏫🌳🏫', sentence: 'The school is ___ the park.', options: ['behind', 'in front of', 'next to', 'between'], answer: 'next to', prompt: '看图选择正确的介词' },
          { emoji: '🚗🏠', sentence: 'The car is ___ the house.', options: ['behind', 'next to', 'in front of', 'under'], answer: 'in front of', prompt: '看图选择正确的介词' }
        ]
      },
      { floor: 3, type: 'choice', title: '选择题 (时间介词)', description: '选择正确的时间介词', questions: [] },
      { floor: 4, type: 'fillBlank', title: '填空题 (方位介词)', description: '填入正确的方位介词', questions: [] },
      { floor: 5, type: 'fillBlank', title: '填空题 (时间介词)', description: '填入 at / in / on', questions: [] },
      { floor: 6, type: 'fillBlank', title: '填空题 (介词综合)', description: '根据语境填入正确的介词', questions: [] },
      {
        floor: 7, type: 'dragOrder', title: '排序题 (介词)', description: '拖拽单词组成正确的句子',
        questions: [
          { sentence: '猫在桌子下面。', blanks: [], words: ['under', 'The cat', 'the desk', 'is'], answer: 'The cat is under the desk.', options: [], voicePrompt: 'The cat is under the desk.' }
        ]
      },
      {
        floor: 8, type: 'bossFight', title: 'BOSS战 (介词魔王)', description: '找出并修复介词用法中的错误！',
        questions: [
          { wrongSentence: "I get up in 7 o'clock.", answer: 'at', options: ['at', 'in', 'on'], explanation: '具体时间点前用 at', voicePrompt: 'at' }
        ],
        boss: { name: '语法魔王', icon: '👹', hp: 3 },
        winCondition: { consecutiveCorrect: 3 }
      }
    ]
  },
  // 8. 一般将来时 (futureTense)
  {
    id: 'futureTense',
    name: '一般将来时',
    category: 'tense',
    icon: '🔮',
    description: '学习 will 和 be going to 表达将来的用法',
    unlockLevel: 3,
    tutorial: {
      title: '一般将来时是什么？',
      rules: [
        { rule: 'will + 动词原形', example: 'I will go to Beijing next week.', explanation: 'will 表达"将要"，后接动词原形' },
        { rule: 'be going to + 动词原形', example: 'She is going to buy a new book.', explanation: 'be going to 表达"计划、打算做某事"' },
        { rule: '否定和疑问', example: "I will not (won't) go. / Will you come?", explanation: "will not 可缩写为 won't，疑问句将 will 提前" }
      ],
      tips: ['will 常用于"临时决定"', 'be going to 常用于"事先计划"', '时间标志词：tomorrow, next week, next year, soon']
    },
    floors: [
      { floor: 1, type: 'choice', title: '选择题 (will)', description: '选择正确的 will 形式', questions: [] },
      { floor: 2, type: 'choice', title: '选择题 (be going to)', description: '选择正确的 be going to 形式', questions: [] },
      { floor: 3, type: 'choice', title: '选择题 (将来时综合)', description: '选择 will 或 be going to', questions: [] },
      { floor: 4, type: 'fillBlank', title: '填空题 (will)', description: '填入 will + 动词的正确形式', questions: [] },
      { floor: 5, type: 'fillBlank', title: '填空题 (be going to)', description: '填入 be going to 的正确形式', questions: [] },
      { floor: 6, type: 'fillBlank', title: '填空题 (将来时综合)', description: '根据语境填入正确的将来时形式', questions: [] },
      {
        floor: 7, type: 'dragOrder', title: '排序题 (将来时)', description: '拖拽单词组成正确的句子',
        questions: [
          { sentence: '我明天会打电话给你。', blanks: [], words: ['I', 'you', 'will call', 'tomorrow'], answer: 'I will call you tomorrow.', options: [], voicePrompt: 'I will call you tomorrow.' },
          { sentence: '你明天会来吗？', blanks: [], words: ['Will', 'come', 'you', 'tomorrow', '?'], answer: 'Will you come tomorrow?', options: [], voicePrompt: 'Will you come tomorrow?' }
        ]
      },
      {
        floor: 8, type: 'bossFight', title: 'BOSS战 (将来时魔王)', description: '找出并修复将来时中的错误！',
        questions: [
          { wrongSentence: 'I will going to Beijing tomorrow.', answer: 'go', options: ['go', 'going', 'went'], explanation: 'will 后面要用动词原形，不是 -ing', voicePrompt: 'go' },
          { wrongSentence: 'She go to buy a book.', answer: 'goes', options: ['go', 'goes', 'going'], explanation: '第三人称单数主语后动词要加 -s 或 -es', voicePrompt: 'goes' }
        ],
        boss: { name: '语法魔王', icon: '👹', hp: 3 },
        winCondition: { consecutiveCorrect: 3 }
      }
    ]
  },
  // 9. 一般过去时 (pastTense)
  {
    id: 'pastTense',
    name: '一般过去时',
    category: 'tense',
    icon: '📅',
    description: '学习一般过去时的规则动词和不规则动词变化',
    unlockLevel: 4,
    tutorial: {
      title: '一般过去时是什么？',
      rules: [
        { rule: '规则动词过去式加 -ed', example: 'play → played, watch → watched, study → studied', explanation: '一般加 -ed，以 e 结尾加 -d，辅音+y 变 y 为 i 加 -ed' },
        { rule: '不规则动词需单独记忆', example: 'go → went, eat → ate, see → saw, buy → bought', explanation: '不规则动词变化没有统一规则，需要逐个记忆' },
        { rule: 'be 动词过去式', example: 'am/is → was, are → were', explanation: 'I/he/she/it 用 was，you/we/they 用 were' }
      ],
      tips: ['过去时表示已经发生的动作', '时间标志词：yesterday, last week, ago, in 2020', 'be 动词过去式只有 was 和 were 两种形式']
    },
    floors: [
      { floor: 1, type: 'choice', title: '选择题 (be动词过去式)', description: '选择 was 或 were', questions: [] },
      { floor: 2, type: 'choice', title: '选择题 (规则动词过去式)', description: '选择正确的过去式形式', questions: [] },
      {
        floor: 3, type: 'verbTable', title: '动词表 (不规则动词配对)', description: '将动词原形与过去式配对',
        questions: [{
          sentence: '将动词原形与过去式配对', prompt: '将动词原形与过去式配对',
          baseForms: ['go', 'eat', 'see', 'buy', 'have'],
          pastForms: ['went', 'ate', 'saw', 'bought', 'had'],
          answer: 'go-went|eat-ate|see-saw|buy-bought|have-had'
        }]
      },
      { floor: 4, type: 'fillBlank', title: '填空题 (不规则动词)', description: '填入动词的正确过去式', questions: [] },
      { floor: 5, type: 'fillBlank', title: '填空题 (否定句)', description: "填入 didn't + 动词原形", questions: [] },
      { floor: 6, type: 'fillBlank', title: '填空题 (过去时综合)', description: '根据语境填入正确的过去时形式', questions: [] },
      {
        floor: 7, type: 'dragOrder', title: '排序题 (过去时)', description: '拖拽单词组成正确的句子',
        questions: [
          { sentence: '我昨天去了动物园。', blanks: [], words: ['I', 'to the zoo', 'went', 'yesterday'], answer: 'I went to the zoo yesterday.', options: [], voicePrompt: 'I went to the zoo yesterday.' },
          { sentence: '他昨天没有上学。', blanks: [], words: ['He', 'to school', "didn't", 'go', 'yesterday'], answer: "He didn't go to school yesterday.", options: [], voicePrompt: "He didn't go to school yesterday." }
        ]
      },
      {
        floor: 8, type: 'bossFight', title: 'BOSS战 (过去时魔王)', description: '找出并修复过去时中的错误！',
        questions: [
          { wrongSentence: 'I go to the zoo yesterday.', answer: 'went', options: ['go', 'went', 'gone'], explanation: 'yesterday 是过去时间，要用过去式', voicePrompt: 'went' },
          { wrongSentence: "She didn't went to school.", answer: 'go', options: ['go', 'went', 'goes'], explanation: "didn't 后面要用动词原形", voicePrompt: 'go' }
        ],
        boss: { name: '语法魔王', icon: '👹', hp: 3 },
        winCondition: { consecutiveCorrect: 3 }
      }
    ]
  },
  // 10. 疑问句 (questionForm)
  {
    id: 'questionForm',
    name: '疑问句',
    category: 'syntax',
    icon: '❓',
    description: '学习一般疑问句和特殊疑问句的构成',
    unlockLevel: 3,
    tutorial: {
      title: '疑问句是什么？',
      rules: [
        { rule: '一般疑问句 (Yes/No Questions)', example: 'Are you a student? / Do you like apples?', explanation: '用 be/do/does/can 等助动词开头，回答用 Yes/No' },
        { rule: '特殊疑问句 (Wh- Questions)', example: 'What is your name? / Where do you live?', explanation: '用 What/Where/When/Why/How 等疑问词开头' },
        { rule: '疑问词用法', example: 'What(什么), Where(哪里), When(何时), Why(为什么), How(如何)', explanation: '不同疑问词询问不同信息' }
      ],
      tips: ['一般疑问句: 助动词 + 主语 + 谓语?', '特殊疑问句: 疑问词 + 一般疑问句语序?', 'What 问事物，Where 问地点，When 问时间，Why 问原因']
    },
    floors: [
      { floor: 1, type: 'choice', title: '选择题 (疑问词)', description: '选择正确的疑问词', questions: [] },
      {
        floor: 2, type: 'transform', title: '转换题 (→一般疑问句)', description: '从选项中选择正确的一般疑问句形式',
        questions: [
          { sentence: 'You are a student.', prompt: '选择正确的一般疑问句：', options: ['Are you a student?', 'Do you are a student?', 'You are a student?'], answer: 'Are you a student?' },
          { sentence: 'She likes apples.', prompt: '选择正确的一般疑问句：', options: ['Likes she apples?', 'Does she like apples?', 'Does she likes apples?'], answer: 'Does she like apples?' },
          { sentence: 'They play football.', prompt: '选择正确的一般疑问句：', options: ['Play they football?', 'Do they play football?', 'Do they plays football?'], answer: 'Do they play football?' },
          { sentence: 'He can swim.', prompt: '选择正确的一般疑问句：', options: ['Can he swim?', 'Does he can swim?', 'He can swim?'], answer: 'Can he swim?' },
          { sentence: 'We went to the park.', prompt: '选择正确的一般疑问句：', options: ['Went we to the park?', 'Did we go to the park?', 'Did we went to the park?'], answer: 'Did we go to the park?' }
        ]
      },
      {
        floor: 3, type: 'transform', title: '转换题 (→特殊疑问句)', description: '选择正确的特殊疑问句形式',
        questions: [
          { sentence: 'My name is Tom.', prompt: '对 Tom 提问：', options: ['What is your name?', 'What your name is?', 'Your name is what?'], answer: 'What is your name?' },
          { sentence: 'I live in Beijing.', prompt: '对 Beijing 提问：', options: ['Where you live?', 'Where do you live?', 'Do you live in Beijing?'], answer: 'Where do you live?' },
          { sentence: "I get up at 7 o'clock.", prompt: "对 at 7 o'clock 提问：", options: ['When do you get up?', 'What time do you get up?', 'Do you get up at 7?'], answer: 'What time do you get up?' },
          { sentence: 'I am late because I missed the bus.', prompt: '对 because... 提问：', options: ['Why are you late?', 'What are you late?', 'How are you late?'], answer: 'Why are you late?' },
          { sentence: 'I go to school by bus.', prompt: '对 by bus 提问：', options: ['How do you go to school?', 'What do you go to school?', 'Where do you go?'], answer: 'How do you go to school?' }
        ]
      },
      { floor: 4, type: 'fillBlank', title: '填空题 (疑问词)', description: '填入正确的疑问词 (What/Where/When/Why/How)', questions: [] },
      { floor: 5, type: 'fillBlank', title: '填空题 (一般疑问句)', description: '填入 Do / Does / Are / Is / Can', questions: [] },
      { floor: 6, type: 'fillBlank', title: '填空题 (疑问句综合)', description: '根据答句填入正确的疑问词或助动词', questions: [] },
      {
        floor: 7, type: 'dragOrder', title: '排序题 (疑问句)', description: '拖拽单词组成正确的疑问句',
        questions: [
          { sentence: '你叫什么名字？', blanks: [], words: ['What', 'your name', 'is', '?'], answer: 'What is your name?', options: [], voicePrompt: 'What is your name?' },
          { sentence: '你住在哪里？', blanks: [], words: ['Where', 'you', 'live', 'do', '?'], answer: 'Where do you live?', options: [], voicePrompt: 'Where do you live?' }
        ]
      },
      {
        floor: 8, type: 'bossFight', title: 'BOSS战 (疑问句魔王)', description: '找出并修复疑问句中的错误！',
        questions: [
          { wrongSentence: 'Does she likes apples?', answer: 'like', options: ['like', 'likes', 'liked'], explanation: 'Does 后面动词用原形', voicePrompt: 'like' },
          { wrongSentence: 'Are you like music?', answer: 'Do', options: ['Do', 'Are', 'Is'], explanation: 'like 是实义动词，要用 Do 提问', voicePrompt: 'Do' }
        ],
        boss: { name: '语法魔王', icon: '👹', hp: 3 },
        winCondition: { consecutiveCorrect: 3 }
      }
    ]
  },
  // 11. 比较级和最高级 (comparative)
  {
    id: 'comparative',
    name: '比较级和最高级',
    category: 'morphology',
    icon: '📊',
    description: '学习形容词的比较级和最高级变化规则',
    unlockLevel: 3,
    tutorial: {
      title: '比较级和最高级是什么？',
      rules: [
        { rule: '比较级 (Comparative)', example: 'tall → taller, big → bigger, happy → happier', explanation: '两者比较用比较级，通常加 -er' },
        { rule: '最高级 (Superlative)', example: 'tall → tallest, big → biggest, happy → happiest', explanation: '三者以上比较用最高级，通常加 -est，前面加 the' },
        { rule: '多音节形容词', example: 'beautiful → more beautiful, the most beautiful', explanation: '多音节形容词前加 more / most 构成比较级/最高级' }
      ],
      tips: ['比较级常用于 than 结构', '最高级前一定要加 the', '以重读闭音节结尾要双写尾字母 (big → bigger)', '以 y 结尾的辅音字母要变 y 为 i (happy → happier)']
    },
    floors: [
      { floor: 1, type: 'choice', title: '选择题 (比较级)', description: '选择正确的比较级形式', questions: [] },
      { floor: 2, type: 'choice', title: '选择题 (最高级)', description: '选择正确的最高级形式', questions: [] },
      {
        floor: 3, type: 'verbTable', title: '变形表 (形容词比较级)', description: '将形容词与比较级形式配对',
        questions: [{
          sentence: '将形容词原级与比较级配对', prompt: '将形容词与比较级形式配对',
          baseForms: ['tall', 'big', 'happy', 'beautiful', 'good'],
          pastForms: ['taller', 'bigger', 'happier', 'more beautiful', 'better'],
          answer: 'tall-taller|big-bigger|happy-happier|beautiful-more beautiful|good-better'
        }]
      },
      { floor: 4, type: 'fillBlank', title: '填空题 (比较级)', description: '填入正确的比较级形式', questions: [] },
      { floor: 5, type: 'fillBlank', title: '填空题 (最高级)', description: '填入正确的最高级形式', questions: [] },
      { floor: 6, type: 'fillBlank', title: '填空题 (比较级综合)', description: '根据语境填入正确的比较级或最高级形式', questions: [] },
      {
        floor: 7, type: 'dragOrder', title: '排序题 (比较级)', description: '拖拽单词组成正确的句子',
        questions: [
          { sentence: '汤姆比杰瑞高。', blanks: [], words: ['Tom', 'taller', 'is', 'than Jerry'], answer: 'Tom is taller than Jerry.', options: [], voicePrompt: 'Tom is taller than Jerry.' },
          { sentence: '她是我们班最高的。', blanks: [], words: ['She', 'in our class', 'the tallest', 'is'], answer: 'She is the tallest in our class.', options: [], voicePrompt: 'She is the tallest in our class.' }
        ]
      },
      {
        floor: 8, type: 'bossFight', title: 'BOSS战 (比较级魔王)', description: '找出并修复比较级用法中的错误！',
        questions: [
          { wrongSentence: 'She is tall than me.', answer: 'taller', options: ['tall', 'taller', 'tallest'], explanation: '比较级要用 taller，不是 tall', voicePrompt: 'taller' },
          { wrongSentence: 'He is the more smart student.', answer: 'smartest', options: ['smart', 'smarter', 'smartest'], explanation: 'smart 的单音节词最高级是 smartest', voicePrompt: 'smartest' }
        ],
        boss: { name: '语法魔王', icon: '👹', hp: 3 },
        winCondition: { consecutiveCorrect: 3 }
      }
    ]
  },
  // 12. 冠词 (article)
  {
    id: 'article',
    name: '冠词',
    category: 'morphology',
    icon: '📌',
    description: '学习冠词 a, an, the 以及零冠词的用法',
    unlockLevel: 3,
    tutorial: {
      title: '冠词是什么？',
      rules: [
        { rule: '不定冠词 a / an', example: 'a book, an apple', explanation: 'a 用于辅音音素开头，an 用于元音音素开头' },
        { rule: '定冠词 the', example: 'the sun, the book on the desk', explanation: '特指某人/物或独一无二的事物用 the' },
        { rule: '零冠词', example: 'I like dogs. / He goes to school.', explanation: '泛指复数名词、三餐、运动、科目等不用冠词' }
      ],
      tips: ['a 用在辅音音素前 (a university)', 'an 用在元音音素前 (an hour)', 'the 用于双方都知道的事物', '第一次提到用 a/an，再次提到用 the']
    },
    floors: [
      { floor: 1, type: 'choice', title: '选择题 (a/an)', description: '选择 a 或 an', questions: [] },
      { floor: 2, type: 'choice', title: '选择题 (the)', description: '选择是否用 the', questions: [] },
      { floor: 3, type: 'choice', title: '选择题 (冠词辨析)', description: '选择正确的冠词或零冠词', questions: [] },
      { floor: 4, type: 'fillBlank', title: '填空题 (a/an/the)', description: '填入 a / an / the', questions: [] },
      { floor: 5, type: 'fillBlank', title: '填空题 (零冠词)', description: '判断是否需要用冠词，不用填"X"', questions: [] },
      { floor: 6, type: 'fillBlank', title: '填空题 (冠词综合)', description: '根据语境填入正确的冠词或零冠词', questions: [] },
      {
        floor: 7, type: 'dragOrder', title: '排序题 (冠词)', description: '拖拽单词组成正确的句子',
        questions: [
          { sentence: '我有一本书。这本书很有趣。', blanks: [], words: ['I', 'a book', 'have', 'The book', 'interesting', 'is'], answer: 'I have a book The book is interesting', options: [], voicePrompt: 'I have a book. The book is interesting.' },
          { sentence: '她是一个诚实的孩子。', blanks: [], words: ['She', 'an honest girl', 'is'], answer: 'She is an honest girl', options: [], voicePrompt: 'She is an honest girl.' }
        ]
      },
      {
        floor: 8, type: 'bossFight', title: 'BOSS战 (冠词魔王)', description: '找出并修复冠词用法中的错误！',
        questions: [
          { wrongSentence: 'She is a engineer.', answer: 'an', options: ['a', 'an', 'the'], explanation: 'engineer 以元音音素开头，要用 an', voicePrompt: 'an' },
          { wrongSentence: 'I have an university degree.', answer: 'a', options: ['a', 'an', 'the'], explanation: 'university 以辅音音素开头，要用 a', voicePrompt: 'a' }
        ],
        boss: { name: '语法魔王', icon: '👹', hp: 3 },
        winCondition: { consecutiveCorrect: 3 }
      }
    ]
  },
  // 13. 基础从句 (basicClause)
  {
    id: 'basicClause',
    name: '基础从句',
    category: 'syntax',
    icon: '🔀',
    description: '学习使用连词连接句子和基础的从句结构',
    unlockLevel: 5,
    tutorial: {
      title: '从句是什么？',
      rules: [
        { rule: '并列句 (Compound Sentences)', example: 'I like tea, and she likes coffee.', explanation: '用 and/but/or 连接两个简单句' },
        { rule: '原因状语从句', example: 'I stayed home because it was raining.', explanation: 'because 引导原因状语从句' },
        { rule: '条件状语从句', example: 'If it rains, I will stay home.', explanation: 'if 引导条件状语从句' }
      ],
      tips: ['and 表示并列/递进', 'but 表示转折', 'because 表示原因', 'so 表示结果', 'if 表示条件']
    },
    floors: [
      { floor: 1, type: 'choice', title: '选择题 (连词选择)', description: '选择正确的连词', questions: [] },
      { floor: 2, type: 'choice', title: '选择题 (连词辨析)', description: '选择正确的连词填空', questions: [] },
      {
        floor: 3, type: 'connector', title: '连接题 (选连词)', description: '选择合适的连词连接两句話',
        questions: [
          { sentences: ['I was tired', 'I went to bed early'], options: ['because', 'so', 'but', 'and'], answer: 'so' },
          { sentences: ['She is rich', 'she is not happy'], options: ['because', 'so', 'but', 'and'], answer: 'but' },
          { sentences: ['He stayed home', 'it was raining'], options: ['because', 'so', 'but', 'if'], answer: 'because' },
          { sentences: ['You study hard', 'you will pass'], options: ['because', 'so', 'but', 'if'], answer: 'if' },
          { sentences: ['I like singing', 'I like dancing'], options: ['because', 'so', 'but', 'and'], answer: 'and' }
        ].map(q => ({
          sentence: '选择合适的连词连接句子', prompt: '选择合适的连词连接句子',
          sentences: q.sentences, options: q.options, answer: q.answer
        }))
      },
      { floor: 4, type: 'fillBlank', title: '填空题 (连词填空)', description: '填入正确的连词 (and/but/so/because/if)', questions: [] },
      { floor: 5, type: 'fillBlank', title: '填空题 (从句动词形式)', description: '根据语境填入正确的动词形式', questions: [] },
      { floor: 6, type: 'fillBlank', title: '填空题 (综合填空)', description: '填入正确的连词或动词形式', questions: [] },
      {
        floor: 7, type: 'dragOrder', title: '排序题 (从句)', description: '拖拽单词组成正确的句子',
        questions: [
          { sentence: '如果明天下雨，我就呆在家里。', blanks: [], words: ['If', 'I will stay home', 'it rains', 'tomorrow'], answer: 'If it rains tomorrow, I will stay home.', options: [], voicePrompt: 'If it rains tomorrow, I will stay home.' }
        ]
      },
      {
        floor: 8, type: 'bossFight', title: 'BOSS战 (从句魔王)', description: '找出并修复从句中的错误！',
        questions: [
          { wrongSentence: 'If it rain tomorrow, I will stay home.', answer: 'rains', options: ['rain', 'rains', 'rained'], explanation: 'if 条件句中第三人称单数用 rains', voicePrompt: 'rains' }
        ],
        boss: { name: '语法魔王', icon: '👹', hp: 3 },
        winCondition: { consecutiveCorrect: 3 }
      }
    ]
  },
  // 14. 形容词/副词塔 (adjAdv)
  {
    id: 'adjAdv',
    name: '形容词/副词塔',
    category: 'morphology',
    icon: '🎨',
    description: '学习形容词和副词的用法与区别',
    unlockLevel: 1,
    tutorial: {
      title: '形容词和副词是什么？',
      rules: [
        { rule: '形容词 (Adjective)', example: 'a beautiful flower, a tall man', explanation: '形容词修饰名词，表示特征' },
        { rule: '副词 (Adverb)', example: 'run quickly, very beautiful', explanation: '副词修饰动词、形容词或其他副词' },
        { rule: '形容词↔副词转换', example: 'quick → quickly, careful → carefully', explanation: '多数副词由形容词 + -ly 构成' }
      ],
      tips: ['形容词放在名词前', '副词放在动词后', 'well 是 good 的副词形式', 'fast 既是形容词也是副词']
    },
    floors: [
      { floor: 1, type: 'choice', title: '选择题 (形容词)', description: '选择正确的形容词形式', questions: [] },
      { floor: 2, type: 'choice', title: '选择题 (副词)', description: '选择正确的副词形式', questions: [] },
      { floor: 3, type: 'choice', title: '选择题 (形容词/副词辨析)', description: '选择正确的形容词或副词', questions: [] },
      { floor: 4, type: 'fillBlank', title: '填空题 (形容词)', description: '填入正确的形容词形式', questions: [] },
      { floor: 5, type: 'fillBlank', title: '填空题 (副词)', description: '填入正确的副词形式', questions: [] },
      { floor: 6, type: 'fillBlank', title: '填空题 (形容词/副词综合)', description: '根据语境填入正确的形容词或副词', questions: [] },
      {
        floor: 7, type: 'dragOrder', title: '排序题 (形容词/副词)', description: '拖拽单词组成正确的句子',
        questions: [
          { sentence: '她跑得很快。', blanks: [], words: ['She', 'runs', 'very', 'quickly'], answer: 'She runs very quickly.', options: [], voicePrompt: 'She runs very quickly.' }
        ]
      },
      {
        floor: 8, type: 'bossFight', title: 'BOSS战 (形容词/副词魔王)', description: '找出并修复形容词/副词用法中的错误！',
        questions: [
          { wrongSentence: 'She sings beautiful.', answer: 'beautifully', options: ['beautiful', 'beautifully', 'beauty'], explanation: '修饰动词 sing 要用副词 beautifully', voicePrompt: 'beautifully' },
          { wrongSentence: 'He is a carefully driver.', answer: 'careful', options: ['careful', 'carefully', 'care'], explanation: '修饰名词 driver 要用形容词 careful', voicePrompt: 'careful' }
        ],
        boss: { name: '语法魔王', icon: '👹', hp: 3 },
        winCondition: { consecutiveCorrect: 3 }
      }
    ]
  },
  // 15. 句子结构塔 (sentenceStructure)
  {
    id: 'sentenceStructure',
    name: '句子结构塔',
    category: 'syntax',
    icon: '📐',
    description: '学习英语句子的基本结构和语序规则',
    unlockLevel: 3,
    tutorial: {
      title: '句子结构是什么？',
      rules: [
        { rule: '基本结构：主语 + 谓语', example: 'I run. / She sings.', explanation: '最简单的句子由主语和谓语构成' },
        { rule: '主谓宾结构 (SVO)', example: 'I like apples. / He reads books.', explanation: '及物动词后面需要跟宾语' },
        { rule: '主系表结构 (SVC)', example: 'She is happy. / They are students.', explanation: '系动词后面跟表语说明主语状态' }
      ],
      tips: ['英语语序是 SVO (主谓宾)', '疑问句要倒装', '否定句加助动词', '时间状语常在句末']
    },
    floors: [
      { floor: 1, type: 'choice', title: '选择题 (句子成分)', description: '识别句子中的主语、谓语、宾语', questions: [] },
      { floor: 2, type: 'choice', title: '选择题 (语序)', description: '选择正确的英语语序', questions: [] },
      { floor: 3, type: 'choice', title: '选择题 (句子类型)', description: '识别陈述句、疑问句、祈使句', questions: [] },
      { floor: 4, type: 'fillBlank', title: '填空题 (句子补全)', description: '补全句子缺少的成分', questions: [] },
      { floor: 5, type: 'fillBlank', title: '填空题 (语序纠正)', description: '按正确语序填入单词', questions: [] },
      { floor: 6, type: 'fillBlank', title: '填空题 (句子结构综合)', description: '根据中文提示补全英文句子', questions: [] },
      {
        floor: 7, type: 'dragOrder', title: '排序题 (句子结构)', description: '拖拽单词组成正确的句子',
        questions: [
          { sentence: '她每天早上喝牛奶。', blanks: [], words: ['She', 'milk', 'every morning', 'drinks'], answer: 'She drinks milk every morning.', options: [], voicePrompt: 'She drinks milk every morning.' }
        ]
      },
      {
        floor: 8, type: 'bossFight', title: 'BOSS战 (句子结构魔王)', description: '找出并修复句子结构中的错误！',
        questions: [
          { wrongSentence: 'Like I apples.', answer: 'I like apples', options: ['I like apples', 'Apples I like', 'Like I apples'], explanation: '英语语序是主语+谓语+宾语 (SVO)', voicePrompt: 'I like apples' },
          { wrongSentence: 'She a teacher is.', answer: 'is a teacher', options: ['is a teacher', 'a teacher is', 'she is'], explanation: '系动词 be 要放在主语之后、表语之前', voicePrompt: 'She is a teacher' }
        ],
        boss: { name: '语法魔王', icon: '👹', hp: 3 },
        winCondition: { consecutiveCorrect: 3 }
      }
    ]
  },
  // 16. 连词塔 (conjunction)
  {
    id: 'conjunction',
    name: '连词塔',
    category: 'syntax',
    icon: '🔗',
    description: '掌握 and/but/or/so/because 等连词的用法！',
    unlockLevel: 2,
    tutorial: {
      title: '连词是什么？',
      rules: [
        { rule: 'and 表示并列/递进', example: 'I like apples and oranges.', explanation: 'and 连接两个并列的成分' },
        { rule: 'but 表示转折', example: "I like apples but I don't like pears.", explanation: 'but 连接表示转折关系的两部分' },
        { rule: 'so 表示结果', example: 'I was tired, so I went to bed.', explanation: 'so 连接因果关系中的结果' },
        { rule: 'because 表示原因', example: 'I stayed home because it was raining.', explanation: 'because 连接因果关系中的原因' }
      ],
      tips: ['and 连接肯定并列', 'but 引出相反信息', 'or 用于否定句和疑问句中', 'so 前面通常有逗号', 'because 回答 why 的提问']
    },
    floors: [
      { floor: 1, type: 'choice', title: '选择题 (and 并列连接)', description: '选择正确的 and 用法', questions: [] },
      { floor: 2, type: 'choice', title: '选择题 (but 转折关系)', description: '选择正确的 but 用法', questions: [] },
      { floor: 3, type: 'choice', title: '选择题 (or 选择关系)', description: '选择正确的 or 用法', questions: [] },
      { floor: 4, type: 'fillBlank', title: '填空题 (so/because 因果)', description: '填入 so 或 because', questions: [] },
      {
        floor: 5, type: 'categorize', title: '分类题 (连词分类)', description: '将连词拖入正确的分类',
        questions: [{
          sentence: '将下列连词分类', prompt: '将下列连词分为并列、转折、因果、选择四类',
          items: ['and', 'but', 'because', 'or', 'so', 'yet', 'for', 'nor'],
          categories: [
            { id: 'coordinate', label: '并列/递进', icon: '➕' },
            { id: 'contrast', label: '转折/对比', icon: '🔄' },
            { id: 'cause', label: '因果/原因', icon: '➡️' },
            { id: 'choice', label: '选择/条件', icon: '❓' }
          ],
          answer: 'and:coordinate,but:contrast,because:cause,or:choice,so:cause,yet:contrast,for:cause,nor:coordinate'
        }]
      },
      { floor: 6, type: 'fillBlank', title: '填空题 (连词综合)', description: '填入正确的连词 (and/but/or/so/because)', questions: [] },
      {
        floor: 7, type: 'dragOrder', title: '排序题 (连词)', description: '拖拽单词组成正确的句子',
        questions: [
          { sentence: '我累了所以我上床睡觉了。', blanks: [], words: ['I', 'tired', 'was', 'so', 'I went to bed'], answer: 'I was tired so I went to bed.', options: [], voicePrompt: 'I was tired so I went to bed.' },
          { sentence: '她喜欢猫和狗。', blanks: [], words: ['She', 'dogs', 'likes', 'cats', 'and'], answer: 'She likes cats and dogs.', options: [], voicePrompt: 'She likes cats and dogs.' }
        ]
      },
      {
        floor: 8, type: 'bossFight', title: 'BOSS战 (连词魔王)', description: '找出并修复连词用法中的错误！',
        questions: [
          { wrongSentence: "I like apples so I don't like pears.", answer: 'but', options: ['and', 'but', 'so'], explanation: '表示转折用 but，不是 so', voicePrompt: 'but' }
        ],
        boss: { name: '语法魔王', icon: '👹', hp: 3 },
        winCondition: { consecutiveCorrect: 3 }
      }
    ]
  },

];

/**
 * 根据塔 ID 获取塔数据（同时查 grammarTowers 和 speakingTowers）
 * @param {string} towerId 塔标识
 * @returns {object|null} 塔数据对象
 */
export function getTowerById(towerId) {
  return grammarTowers.find(t => t.id === towerId) ||
    speakingTowers.find(t => t.id === towerId) ||
    null;
}

/**
 * 获取塔的指定楼层
 * @param {string} towerId 塔标识
 * @param {number} floorNumber 楼层号
 * @returns {object|null} 楼层数据
 */
export function getFloorByNumber(towerId, floorNumber) {
  const tower = getTowerById(towerId);
  if (!tower) return null;
  return tower.floors.find(f => f.floor === floorNumber) || null;
}

/**
 * 统计塔的总题目数
 * @param {string} towerId 塔标识
 * @returns {number} 题目总数
 */
export function countTotalQuestions(towerId) {
  const tower = getTowerById(towerId);
  if (!tower) return 0;
  return tower.floors.reduce((sum, floor) => sum + floor.questions.length, 0);
}

export default grammarTowers;
