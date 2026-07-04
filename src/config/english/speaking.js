/**
 * 口语塔配置（speaking towers）
 * 包含常用语塔（phrase）和情景对话塔（dialogue）
 * 从 grammar.js 迁移而来，保持 floors 数据结构完整
 */
export const speakingTowers = [
  // 1. 常用语塔 (phrase)
  {
    id: 'phrase',
    name: '常用语塔',
    category: 'scene',
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
  // 2. 情景对话塔 (dialogue)
  {
    id: 'dialogue',
    name: '情景对话塔',
    category: 'scene',
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
 * 根据塔 ID 获取口语塔数据
 * @param {string} towerId 塔标识
 * @returns {object|null} 塔数据对象
 */
export function getSpeakingTowerById(towerId) {
  return speakingTowers.find(t => t.id === towerId) || null;
}

export default speakingTowers;
