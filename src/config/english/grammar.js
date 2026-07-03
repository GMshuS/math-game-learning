/**
 * 语法塔配置（缩减版）
 * 保留：塔结构+教程+楼层元数据、dragOrder精选20题、bossFight精选10题、特殊题型、常用语塔、对话塔
 * 删除：大量静态选择题（由动态生成器替代）
 */

export const grammarTowers = [
  // 1. Be动词塔 (be-verb)
  {
    id: 'be-verb',
    name: 'Be动词塔',
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
  // 14. 连词塔 (conjunction)
  {
    id: 'conjunction',
    name: '连词塔',
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
  // 15. 常用语塔 (phrase) — 完整保留（非语法题型）
  {
    id: 'phrase',
    name: '常用语塔',
    icon: '💬',
    description: '学习问候、购物、交通、就餐等场景的常用表达！',
    unlockLevel: 1,
    tutorial: {
      title: '常用语是什么？',
      rules: [
        { rule: '问候 (Greetings)', example: 'Good morning! How are you?', explanation: '日常见面使用的礼貌用语' },
        { rule: '购物 (Shopping)', example: "How much is it? I'd like to buy...", explanation: '购物时询问价格和表达需求' },
        { rule: '交通 (Transportation)', example: 'Excuse me, where is the bus stop?', explanation: '问路和乘坐交通工具的表达' },
        { rule: '就餐 (Dining)', example: "I'd like to order... Check, please!", explanation: '餐厅点单和结账用语' }
      ],
      tips: ['Good morning 用于中午12点前', 'How much 询问价格', 'Excuse me 用于打扰别人', 'Check, please 用于餐厅结账', 'Nice to meet you 初次见面用']
    },
    floors: [
      {
        floor: 1, type: 'choice', title: '选择题 (问候表达)', description: '选择正确的问候用语',
        questions: [
          { sentence: '早上好！—— ___', blanks: ['___'], answer: 'Good morning!', options: ['Good morning!', 'Good night!', 'Goodbye!'], voicePrompt: 'Good morning!' },
          { sentence: '你怎么样？—— ___', blanks: ['___'], answer: 'How are you?', options: ['How are you?', "What's this?", 'Who are you?'], voicePrompt: 'How are you?' },
          { sentence: '很高兴见到你！—— ___', blanks: ['___'], answer: 'Nice to meet you!', options: ['Nice to meet you!', 'Thank you!', 'Sorry!'], voicePrompt: 'Nice to meet you!' },
          { sentence: '你好！—— ___', blanks: ['___'], answer: 'Hello!', options: ['Hello!', 'Help!', 'Bye!'], voicePrompt: 'Hello!' },
          { sentence: '你叫什么名字？—— ___', blanks: ['___'], answer: "What's your name?", options: ["What's your name?", 'How old are you?', 'Where are you from?'], voicePrompt: "What's your name?" }
        ]
      },
      {
        floor: 2, type: 'choice', title: '选择题 (购物表达)', description: '选择正确的购物用语',
        questions: [
          { sentence: '这个多少钱？—— ___', blanks: ['___'], answer: 'How much is it?', options: ['How much is it?', 'How many are there?', 'How old is it?'], voicePrompt: 'How much is it?' },
          { sentence: '我想要买一本书。—— ___', blanks: ['___'], answer: "I'd like to buy a book.", options: ["I'd like to buy a book.", 'I like reading books.', 'I have a book.'], voicePrompt: "I'd like to buy a book." },
          { sentence: '太贵了！—— ___', blanks: ['___'], answer: "It's too expensive!", options: ["It's too expensive!", "It's too cheap!", "It's very good!"], voicePrompt: "It's too expensive!" },
          { sentence: '我要这个。—— ___', blanks: ['___'], answer: "I'll take this one.", options: ["I'll take this one.", "I don't like this.", 'This is mine.'], voicePrompt: "I'll take this one." },
          { sentence: '你有零钱吗？—— ___', blanks: ['___'], answer: 'Do you have change?', options: ['Do you have change?', 'Do you have time?', 'Do you have a pen?'], voicePrompt: 'Do you have change?' }
        ]
      },
      {
        floor: 3, type: 'imageChoice', title: '看图题 (交通场景)', description: '根据 emoji 场景选择正确的表达',
        questions: [
          { emoji: '🚌🏁', sentence: 'Where is the bus stop?', options: ['Where is the bus stop?', 'Where is the train station?', 'Where is the airport?'], answer: 'Where is the bus stop?', prompt: '看图选择正确的问路用语' },
          { emoji: '🚕➡️🏠', sentence: 'Please take me to this address.', options: ['Please take me to this address.', 'I want to buy a ticket.', 'Excuse me, is this seat taken?'], answer: 'Please take me to this address.', prompt: '看图选择正确的乘车用语' },
          { emoji: '🚇🚉', sentence: 'Which line goes to the city center?', options: ['Which line goes to the city center?', 'How much is the ticket?', 'Where can I get a taxi?'], answer: 'Which line goes to the city center?', prompt: '看图选择正确的地铁用语' },
          { emoji: '🚲🚶', sentence: 'How can I get to the park?', options: ['How can I get to the park?', 'What time does the bus leave?', 'Is this the right way?'], answer: 'How can I get to the park?', prompt: '看图选择正确的问路用语' },
          { emoji: '🎫🚂', sentence: 'One ticket to Shanghai, please.', options: ['One ticket to Shanghai, please.', 'Where is the exit?', 'How long does it take?'], answer: 'One ticket to Shanghai, please.', prompt: '看图选择正确的购票用语' }
        ]
      },
      {
        floor: 4, type: 'match', title: '配对题 (中英配对)', description: '将英文常用语与中文配对',
        questions: [{
          sentence: '将英文常用语与中文翻译配对', prompt: '将英文常用语与中文翻译配对',
          pairs: [
            { left: 'Good morning!', right: '早上好！' }, { left: 'How much is it?', right: '多少钱？' },
            { left: 'Nice to meet you!', right: '很高兴见到你！' }, { left: 'Excuse me.', right: '打扰一下。' },
            { left: 'Check, please!', right: '请结账！' }
          ],
          answer: 'Good morning!-早上好！|How much is it?-多少钱？|Nice to meet you!-很高兴见到你！|Excuse me.-打扰一下。|Check, please!-请结账！'
        }]
      },
      {
        floor: 5, type: 'choice', title: '选择题 (就餐表达)', description: '选择正确的就餐用语',
        questions: [
          { sentence: '我想要点餐。—— ___', blanks: ['___'], answer: "I'd like to order.", options: ["I'd like to order.", "I'd like to go.", "I'd like to sleep."], voicePrompt: "I'd like to order." },
          { sentence: '请结账！—— ___', blanks: ['___'], answer: 'Check, please!', options: ['Check, please!', 'Help, please!', 'Wait, please!'], voicePrompt: 'Check, please!' },
          { sentence: '今天的特色菜是什么？—— ___', blanks: ['___'], answer: "What's today's special?", options: ["What's today's special?", "What's your name?", "What's the weather like?"], voicePrompt: "What's today's special?" },
          { sentence: '这个很好吃！—— ___', blanks: ['___'], answer: 'This is delicious!', options: ['This is delicious!', 'This is terrible!', 'This is expensive!'], voicePrompt: 'This is delicious!' },
          { sentence: '我想要一杯水。—— ___', blanks: ['___'], answer: "I'd like a glass of water.", options: ["I'd like a glass of water.", "I'd like a bowl of rice.", "I'd like a piece of cake."], voicePrompt: "I'd like a glass of water." }
        ]
      },
      {
        floor: 6, type: 'fillBlank', title: '填空题 (天气与爱好)', description: '填入正确的天气或爱好表达',
        questions: [
          { sentence: "It's ___ today. (晴天)", blanks: ['___'], answer: 'sunny', options: ['sunny', 'rainy', 'cloudy'], voicePrompt: "It's sunny today." },
          { sentence: 'I like ___ in my free time. (读书)', blanks: ['___'], answer: 'reading', options: ['reading', 'running', 'cooking'], voicePrompt: 'I like reading in my free time.' },
          { sentence: "What's the weather ___ today?", blanks: ['___'], answer: 'like', options: ['like', 'look', 'love'], voicePrompt: "What's the weather like today?" },
          { sentence: 'She enjoys ___ to music. (听音乐)', blanks: ['___'], answer: 'listening', options: ['listening', 'listens', 'listen'], voicePrompt: 'She enjoys listening to music.' },
          { sentence: "It's getting ___ outside. (冷的)", blanks: ['___'], answer: 'cold', options: ['cold', 'hot', 'warm'], voicePrompt: "It's getting cold outside." }
        ]
      },
      {
        floor: 7, type: 'dragOrder', title: '排序题 (常用语)', description: '拖拽单词组成正确的常用表达',
        questions: [
          { sentence: '很高兴见到你！', blanks: [], words: ['Nice', 'meet', 'you', 'to'], answer: 'Nice to meet you!', options: [], voicePrompt: 'Nice to meet you!' },
          { sentence: '请问这个多少钱？', blanks: [], words: ['How', 'is', 'much', 'it', '?'], answer: 'How much is it?', options: [], voicePrompt: 'How much is it?' },
          { sentence: '今天天气怎么样？', blanks: [], words: ["What's", 'like', 'today', 'the weather'], answer: "What's the weather like today?", options: [], voicePrompt: "What's the weather like today?" }
        ]
      },
      {
        floor: 8, type: 'bossFight', title: 'BOSS战 (常用语魔王)', description: '找出并修复常用语用法中的错误！',
        questions: [
          { wrongSentence: 'How many is it? (想知道价格)', answer: 'How much', options: ['How much', 'How many', 'How old'], explanation: '询问价格用 How much', voicePrompt: 'How much' },
          { wrongSentence: 'Good night! (早上见面说)', answer: 'Good morning', options: ['Good morning', 'Good night', 'Good evening'], explanation: '早上见面应该说 Good morning', voicePrompt: 'Good morning' },
          { wrongSentence: 'I like to order. (想要点餐)', answer: "I'd like", options: ["I'd like", 'I like', 'I am like'], explanation: "表达礼貌的\"想要\"用 I'd like", voicePrompt: "I'd like" }
        ],
        boss: { name: '语法魔王', icon: '👹', hp: 3 },
        winCondition: { consecutiveCorrect: 3 }
      }
    ]
  },
  // 16. 情景对话塔 (dialogue) — 保留 dialogueChoice 楼层
  {
    id: 'dialogue',
    name: '情景对话塔',
    icon: '🎭',
    description: '在学校、餐厅、购物、问路等情景中练习对话！',
    unlockLevel: 2,
    tutorial: {
      title: '情景对话是什么？',
      rules: [
        { rule: '注意场景 (Scene)', example: '在学校用正式用语，在朋友间用非正式用语', explanation: '不同场景使用不同的表达方式' },
        { rule: '注意角色 (Role)', example: '对老师要有礼貌，对朋友可以随意', explanation: '对话对象决定语言风格' },
        { rule: '注意上下文 (Context)', example: '根据前文对话选择合适的回答', explanation: '对话要前后呼应、合乎逻辑' }
      ],
      tips: ['先理解场景再选择答案', '注意对话的礼貌程度', '回答要与问题内容匹配', '注意中英文表达习惯的差异']
    },
    floors: [
      {
        floor: 1, type: 'dialogueChoice', title: '对话选择题 (学校场景)', description: '在学校场景中选择合适的对话',
        questions: [
          { scene: '在学校，你遇到新同学', speaker: '你', dialogue: '___', context: '你想和新同学打招呼并自我介绍', options: ['Hello! My name is Tom. Nice to meet you!', 'Goodbye! See you later!', "I'm sorry, I don't know."], answer: 'Hello! My name is Tom. Nice to meet you!', voicePrompt: 'Hello! My name is Tom. Nice to meet you!' },
          { scene: '在课堂上，老师提问', speaker: '你', dialogue: '___', context: '老师问了一个问题，你知道答案', options: ["I don't know.", 'Let me try! The answer is 10.', 'Can I go to the bathroom?'], answer: 'Let me try! The answer is 10.', voicePrompt: 'Let me try! The answer is 10.' },
          { scene: '下课了，你想借同学的笔', speaker: '你', dialogue: '___', context: '你忘带笔了，想向同桌借', options: ['Give me your pen!', 'Excuse me, can I borrow your pen?', 'This pen is mine.'], answer: 'Excuse me, can I borrow your pen?', voicePrompt: 'Excuse me, can I borrow your pen?' },
          { scene: '在操场上，同学邀请你一起玩', speaker: '你', dialogue: '___', context: '同学邀请你一起踢足球', options: ["I'm busy. Go away.", 'Sure! I love playing football!', 'Football is boring.'], answer: 'Sure! I love playing football!', voicePrompt: 'Sure! I love playing football!' },
          { scene: '放学了，和老师告别', speaker: '你', dialogue: '___', context: '放学时和老师说再见', options: ['Goodbye, teacher! See you tomorrow!', "I'm hungry.", 'Where is my bag?'], answer: 'Goodbye, teacher! See you tomorrow!', voicePrompt: 'Goodbye, teacher! See you tomorrow!' }
        ]
      },
      {
        floor: 2, type: 'dialogueChoice', title: '对话选择题 (餐厅场景)', description: '在餐厅场景中选择合适的对话',
        questions: [
          { scene: '在餐厅，服务员迎接你', speaker: '你', dialogue: '___', context: '服务员问"欢迎光临！请问几位？"', options: ['Two people, please.', "I'm fine, thank you.", 'This is a book.'], answer: 'Two people, please.', voicePrompt: 'Two people, please.' },
          { scene: '在餐厅，你想点餐', speaker: '你', dialogue: '___', context: '你准备点一份牛排', options: ["I'd like a steak, please.", "I don't like steak.", 'Steak is expensive.'], answer: "I'd like a steak, please.", voicePrompt: "I'd like a steak, please." },
          { scene: '在餐厅，你想去洗手间', speaker: '你', dialogue: '___', context: '你需要问服务员洗手间在哪里', options: ['Where is the toilet?', 'Give me food!', 'I want to go home.'], answer: 'Where is the toilet?', voicePrompt: 'Where is the toilet?' },
          { scene: '用餐结束后想打包', speaker: '你', dialogue: '___', context: '你吃不完想打包带走', options: ['Can I have a doggy bag?', "I don't want this.", 'Throw it away.'], answer: 'Can I have a doggy bag?', voicePrompt: 'Can I have a doggy bag?' },
          { scene: '在餐厅结账时', speaker: '你', dialogue: '___', context: '你吃完饭准备结账', options: ['Check, please!', "I'm leaving now.", 'Good night!'], answer: 'Check, please!', voicePrompt: 'Check, please!' }
        ]
      },
      {
        floor: 3, type: 'dialogueChoice', title: '对话选择题 (购物场景)', description: '在购物场景中选择合适的对话',
        questions: [
          { scene: '在服装店，你看中了一件衣服', speaker: '你', dialogue: '___', context: '你想要知道这件衣服的价格', options: ['How much is this?', 'How many are there?', 'What time is it?'], answer: 'How much is this?', voicePrompt: 'How much is this?' },
          { scene: '在书店，你找不到想要的书', speaker: '你', dialogue: '___', context: '你需要店员帮忙找一本英语书', options: ['Excuse me, do you have English books?', "I don't like this store.", 'This book is boring.'], answer: 'Excuse me, do you have English books?', voicePrompt: 'Excuse me, do you have English books?' },
          { scene: '在鞋店，你想试穿鞋子', speaker: '你', dialogue: '___', context: '你看中一双鞋想试穿', options: ['Can I try these on?', 'I want to buy these.', 'These are too small.'], answer: 'Can I try these on?', voicePrompt: 'Can I try these on?' },
          { scene: '在超市结账时', speaker: '你', dialogue: '___', context: '收银员问"Do you need a bag?"', options: ['Yes, please.', "No, it's okay.", 'How much?'], answer: 'Yes, please.', voicePrompt: 'Yes, please.' },
          { scene: '你买完东西想退货', speaker: '你', dialogue: '___', context: '买的东西不合适，想退货', options: ["I'd like to return this, please.", 'I want to buy another one.', 'This is a gift.'], answer: "I'd like to return this, please.", voicePrompt: "I'd like to return this, please." }
        ]
      },
      {
        floor: 4, type: 'choice', title: '选择题 (问路与方向)', description: '选择正确的问路和指路表达',
        questions: [
          { sentence: 'Excuse me, ___ the nearest hospital?', blanks: ['___'], answer: 'where is', options: ['where is', 'what is', 'how is'], voicePrompt: 'Excuse me, where is the nearest hospital?' },
          { sentence: 'Go straight and ___ left at the corner.', blanks: ['___'], answer: 'turn', options: ['turn', 'take', 'go'], voicePrompt: 'Go straight and turn left at the corner.' },
          { sentence: "It's ___ the bank and the post office.", blanks: ['___'], answer: 'between', options: ['between', 'next to', 'behind'], voicePrompt: "It's between the bank and the post office." },
          { sentence: 'How long does it ___ to get there?', blanks: ['___'], answer: 'take', options: ['take', 'cost', 'spend'], voicePrompt: 'How long does it take to get there?' },
          { sentence: "It's about five minutes' ___ from here.", blanks: ['___'], answer: 'walk', options: ['walk', 'run', 'drive'], voicePrompt: "It's about five minutes' walk from here." }
        ]
      },
      {
        floor: 5, type: 'fillBlank', title: '填空题 (电话用语)', description: '填入正确的电话对话用语',
        questions: [
          { sentence: 'Hello! ___ I speak to Mr. Wang?', blanks: ['___'], answer: 'May', options: ['May', 'Must', 'Can'], voicePrompt: 'Hello! May I speak to Mr. Wang?' },
          { sentence: "Who's ___ please?", blanks: ['___'], answer: 'calling', options: ['calling', 'speaking', 'talking'], voicePrompt: "Who's calling please?" },
          { sentence: "I'm sorry, he's not ___ right now.", blanks: ['___'], answer: 'available', options: ['available', 'here', 'busy'], voicePrompt: "I'm sorry, he's not available right now." },
          { sentence: 'Can I ___ a message?', blanks: ['___'], answer: 'leave', options: ['leave', 'take', 'give'], voicePrompt: 'Can I leave a message?' },
          { sentence: "I'll call you ___ later.", blanks: ['___'], answer: 'back', options: ['back', 'again', 'soon'], voicePrompt: "I'll call you back later." }
        ]
      },
      {
        floor: 6, type: 'dialogueChoice', title: '对话选择题 (医院场景)', description: '在医院场景中选择合适的对话',
        questions: [
          { scene: '在医院挂号处', speaker: '你', dialogue: '___', context: '你感觉不舒服，要看医生', options: ["I'd like to see a doctor.", 'I want to buy medicine.', "I'm looking for the exit."], answer: "I'd like to see a doctor.", voicePrompt: "I'd like to see a doctor." },
          { scene: '在诊室，医生问你', speaker: '你', dialogue: '___', context: '医生问"What\'s wrong with you?"', options: ['I have a headache.', "I'm very happy.", 'I like this hospital.'], answer: 'I have a headache.', voicePrompt: 'I have a headache.' },
          { scene: '医生给你开药后', speaker: '你', dialogue: '___', context: '医生开完药，你想问怎么吃', options: ['How should I take this medicine?', 'This medicine is bitter.', "I don't need medicine."], answer: 'How should I take this medicine?', voicePrompt: 'How should I take this medicine?' },
          { scene: '在药房取药时', speaker: '你', dialogue: '___', context: '药剂师问"Do you have insurance?"', options: ['Yes, I do.', 'No, thank you.', 'What is insurance?'], answer: 'Yes, I do.', voicePrompt: 'Yes, I do.' },
          { scene: '看完病准备离开', speaker: '你', dialogue: '___', context: '看完医生，准备离开时', options: ['Thank you, doctor. Goodbye!', "I'll come again tomorrow.", 'This hospital is too big.'], answer: 'Thank you, doctor. Goodbye!', voicePrompt: 'Thank you, doctor. Goodbye!' }
        ]
      },
      {
        floor: 7, type: 'dragOrder', title: '排序题 (对话排序)', description: '拖拽单词组成正确的对话句子',
        questions: [
          { sentence: '请问你叫什么名字？', blanks: [], words: ['your', "What's", 'name', '?'], answer: "What's your name?", options: [], voicePrompt: "What's your name?" },
          { sentence: '我可以试穿一下吗？', blanks: [], words: ['try', 'Can', 'I', 'on', 'this'], answer: 'Can I try this on?', options: [], voicePrompt: 'Can I try this on?' },
          { sentence: '你感觉怎么样？', blanks: [], words: ['How', 'feeling', 'you', 'are'], answer: 'How are you feeling?', options: [], voicePrompt: 'How are you feeling?' },
          { sentence: '请稍等一下。', blanks: [], words: ['moment', 'please', 'one', 'Just'], answer: 'Just one moment, please.', options: [], voicePrompt: 'Just one moment, please.' },
          { sentence: '你能再说一遍吗？', blanks: [], words: ['you', 'Can', 'say', 'that', 'again', '?'], answer: 'Can you say that again?', options: [], voicePrompt: 'Can you say that again?' }
        ]
      },
      {
        floor: 8, type: 'bossFight', title: 'BOSS战 (对话魔王)', description: '找出并修复对话中的错误！',
        questions: [
          { wrongSentence: "What is your name? — I'm 10 years old.", answer: 'My name is Tom.', options: ['My name is Tom.', "I'm 10 years old.", 'I like apples.'], explanation: '问名字要回答名字，不是年龄', voicePrompt: 'My name is Tom.' },
          { wrongSentence: 'Can I help you? — Yes, I can.', answer: "Yes, I'd like to buy a book.", options: ["Yes, I'd like to buy a book.", 'Yes, I can.', "No, I can't."], explanation: '店员问你需要什么帮助，应说明需求', voicePrompt: "Yes, I'd like to buy a book." },
          { wrongSentence: "How much is this? — It's 10 o'clock.", answer: "It's 20 dollars.", options: ["It's 20 dollars.", "It's 10 o'clock.", "It's a book."], explanation: '问价格要用价格回答', voicePrompt: "It's 20 dollars." },
          { wrongSentence: "Where are you from? — I'm 12.", answer: "I'm from China.", options: ["I'm from China.", "I'm 12.", "I'm a student."], explanation: '问来自哪里要回答国家/城市', voicePrompt: "I'm from China." },
          { wrongSentence: 'Nice to meet you! — Goodbye!', answer: 'Nice to meet you too!', options: ['Nice to meet you too!', 'Goodbye!', 'Thank you!'], explanation: '对"很高兴见到你"应该回应相同的话', voicePrompt: 'Nice to meet you too!' }
        ],
        boss: { name: '语法魔王', icon: '👹', hp: 3 },
        winCondition: { consecutiveCorrect: 3 }
      }
    ]
  }
];

/**
 * 根据塔 ID 获取塔数据
 * @param {string} towerId 塔标识
 * @returns {object|null} 塔数据对象
 */
export function getTowerById(towerId) {
  return grammarTowers.find(t => t.id === towerId) || null;
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
