/**
 * 知识点定义 + 学科注册式架构
 *
 * 每个知识点节点对应一种题型类型，id 与现有题型注册的 key 一致。
 * subjects 注册表设计：未来新增学科只需在 subjects 对象中添加一项。
 */
const mathKnowledgeNodes = [
  // 基础运算（21 个原有节点）
  { id: 'add', label: '加法', icon: '➕', gradeRange: [1, 6] },
  { id: 'subtract', label: '减法', icon: '➖', gradeRange: [1, 6] },
  { id: 'multiply', label: '乘法', icon: '✖️', gradeRange: [2, 6] },
  { id: 'divide', label: '除法', icon: '➗', gradeRange: [3, 6] },
  { id: 'mixed', label: '四则运算', icon: '🧮', gradeRange: [3, 6] },
  { id: 'fraction', label: '分数', icon: '🔢', gradeRange: [3, 6] },
  { id: 'decimal', label: '小数', icon: '🔟', gradeRange: [4, 6] },
  { id: 'percentage', label: '百分数', icon: '💯', gradeRange: [5, 6] },
  { id: 'word', label: '应用题', icon: '📝', gradeRange: [1, 6] },
  { id: 'numberFill', label: '填空', icon: '⬜', gradeRange: [1, 6] },
  { id: 'estimate', label: '估算', icon: '📐', gradeRange: [2, 6] },
  { id: 'equation', label: '方程', icon: '⚖️', gradeRange: [4, 6] },
  { id: 'custom', label: '自定义模板', icon: '📋', gradeRange: [1, 6] },
  { id: 'averageCalc', label: '平均数', icon: '📊', gradeRange: [3, 6] },
  { id: 'negativeNumber', label: '负数', icon: '➖', gradeRange: [5, 6] },
  { id: 'numberCompare', label: '数的大小比较', icon: '⚖️', gradeRange: [1, 6] },
  { id: 'numberProperty', label: '数的性质', icon: '🔬', gradeRange: [3, 6] },
  { id: 'operationLaw', label: '运算定律', icon: '📐', gradeRange: [4, 6] },
  { id: 'patternFind', label: '找规律', icon: '🔍', gradeRange: [1, 6] },
  { id: 'placeValue', label: '数位认知', icon: '🔢', gradeRange: [1, 4] },
  { id: 'ratioProportion', label: '比和比例', icon: '📏', gradeRange: [5, 6] },

  // === 单位换算类（6 个新增节点） ===
  { id: 'unit_length', label: '长度单位', icon: '📏', gradeRange: [2, 6] },
  { id: 'unit_mass', label: '重量单位', icon: '⚖️', gradeRange: [2, 6] },
  { id: 'unit_volume', label: '体积单位', icon: '🧊', gradeRange: [3, 6] },
  { id: 'unit_time', label: '时间单位', icon: '⏱️', gradeRange: [1, 6] },
  { id: 'unit_area', label: '面积单位', icon: '📐', gradeRange: [3, 6] },
  { id: 'unit_currency', label: '货币单位', icon: '💰', gradeRange: [2, 6] },

  // === 几何类（7 个新增节点） ===
  { id: 'geometry_shape', label: '图形认知', icon: '🔷', gradeRange: [1, 6] },
  { id: 'geometry_perimeter', label: '周长计算', icon: '📏', gradeRange: [3, 6] },
  { id: 'geometry_area', label: '面积计算', icon: '📐', gradeRange: [3, 6] },
  { id: 'geometry_volume', label: '体积计算', icon: '📦', gradeRange: [5, 6] },
  { id: 'geometry_surface', label: '表面积计算', icon: '📦', gradeRange: [5, 6] },
  { id: 'geometry_angle', label: '角度认识', icon: '📐', gradeRange: [4, 6] },
  { id: 'geometry_circle', label: '圆的认识', icon: '⭕', gradeRange: [5, 6] },
  { id: 'geometry_transform', label: '图形变换', icon: '🔄', gradeRange: [4, 6] },

  // === 统计图表类（3 个新增节点） ===
  { id: 'chart_bar', label: '条形统计图', icon: '📊', gradeRange: [3, 6] },
  { id: 'chart_line', label: '折线统计图', icon: '📈', gradeRange: [4, 6] },
  { id: 'chart_pie', label: '扇形统计图', icon: '🥧', gradeRange: [5, 6] },

  // === 概率类（4 个新增节点） ===
  { id: 'probability_basic', label: '概率基础', icon: '🎲', gradeRange: [3, 6] },
  { id: 'probability_compare', label: '概率比较', icon: '⚖️', gradeRange: [4, 6] },
  { id: 'probability_calc', label: '概率计算', icon: '🧮', gradeRange: [5, 6] },
  { id: 'probability_event', label: '事件分类', icon: '📋', gradeRange: [3, 6] },

  // === 场景应用类（34 个场景模板 knowledgeId） ===
  // 时间管理（time_*）
  { id: 'time_add', label: '时间加法', icon: '⏰', gradeRange: [1, 4] },
  { id: 'time_sub', label: '时间减法', icon: '⏰', gradeRange: [1, 4] },
  { id: 'time_diff', label: '时间差计算', icon: '⏱️', gradeRange: [1, 4] },
  { id: 'time_24hr', label: '24时制转换', icon: '🕐', gradeRange: [3, 4] },
  { id: 'time_plan', label: '时间规划', icon: '📅', gradeRange: [4, 4] },
  { id: 'time_optimize', label: '时间优化', icon: '⏳', gradeRange: [4, 4] },

  // 生活消费（money_*）
  { id: 'money_change', label: '找零计算', icon: '💰', gradeRange: [2, 3] },
  { id: 'money_decimal', label: '小数价格计算', icon: '💵', gradeRange: [3, 3] },
  { id: 'money_multi', label: '单价数量总价', icon: '🛒', gradeRange: [4, 4] },
  { id: 'money_discount', label: '折扣满减', icon: '🏷️', gradeRange: [5, 5] },
  { id: 'money_tax', label: '税率利率', icon: '📈', gradeRange: [6, 6] },

  // 生活度量（measure_*）
  { id: 'measure_length', label: '长度应用', icon: '📏', gradeRange: [2, 5] },
  { id: 'measure_mass', label: '质量应用', icon: '⚖️', gradeRange: [2, 5] },
  { id: 'measure_volume', label: '体积应用', icon: '🧊', gradeRange: [3, 5] },
  { id: 'measure_area', label: '面积应用', icon: '📐', gradeRange: [3, 5] },

  // 家装建造（building_*）
  { id: 'building_area', label: '铺地面积', icon: '🏠', gradeRange: [3, 6] },
  { id: 'building_perimeter', label: '周长应用', icon: '📏', gradeRange: [3, 6] },
  { id: 'building_surface', label: '表面积应用', icon: '📦', gradeRange: [5, 6] },
  { id: 'building_tile', label: '地砖数量', icon: '🧱', gradeRange: [3, 6] },
  { id: 'building_volume', label: '体积应用', icon: '📦', gradeRange: [5, 6] },

  // 数据分析（data_*）
  { id: 'data_chart', label: '统计图表', icon: '📊', gradeRange: [3, 6] },
  { id: 'data_average', label: '平均数应用', icon: '📈', gradeRange: [3, 6] },
  { id: 'data_percent', label: '百分率应用', icon: '💯', gradeRange: [5, 6] },
  { id: 'data_probability', label: '概率应用', icon: '🎲', gradeRange: [5, 6] },

  // 倍数关系（multiple_*）
  { id: 'multiple_gcd', label: '最大公因数应用', icon: '🔢', gradeRange: [5, 5] },
  { id: 'multiple_lcm', label: '最小公倍数应用', icon: '🔢', gradeRange: [5, 5] },
  { id: 'multiple_cycle', label: '周期问题', icon: '🔄', gradeRange: [5, 5] },

  // 比例关系（ratio_*）
  { id: 'ratio_scale', label: '比例尺', icon: '🗺️', gradeRange: [6, 6] },
  { id: 'ratio_distribute', label: '按比分配', icon: '📊', gradeRange: [6, 6] },
  { id: 'ratio_proportion', label: '正比例', icon: '📈', gradeRange: [6, 6] },

  // 综合实践（composite_*）
  { id: 'composite_travel', label: '综合出游', icon: '🚗', gradeRange: [6, 6] },
  { id: 'composite_building', label: '综合装修', icon: '🏗️', gradeRange: [6, 6] },
  { id: 'composite_shopping', label: '综合购物', icon: '🛍️', gradeRange: [6, 6] },
  { id: 'composite_work', label: '综合工程', icon: '🏭', gradeRange: [6, 6] }
];

const englishKnowledgeNodes = [
  // 现有节点
  { id: 'en2cn', label: '英译中', icon: '🇬🇧', gradeRange: [1, 6] },
  { id: 'cn2en', label: '中译英', icon: '🇨🇳', gradeRange: [1, 6] },
  { id: 'listening', label: '听力', icon: '🎧', gradeRange: [1, 6] },

  // 词法类
  { id: 'noun', label: '名词', icon: '📦', gradeRange: [1, 6] },
  { id: 'pronoun', label: '代词', icon: '👤', gradeRange: [2, 6] },
  { id: 'verb', label: '动词', icon: '🏃', gradeRange: [1, 6] },
  { id: 'adjAdv', label: '形容词/副词', icon: '🎨', gradeRange: [2, 6] },
  { id: 'preposition', label: '介词', icon: '📍', gradeRange: [3, 6] },
  { id: 'article', label: '冠词', icon: '📌', gradeRange: [2, 6] },
  { id: 'conjunction', label: '连词', icon: '🔗', gradeRange: [2, 6] },

  // 时态类
  { id: 'presentSimple', label: '一般现在时', icon: '⏰', gradeRange: [2, 6] },
  { id: 'presentContinuous', label: '现在进行时', icon: '🔄', gradeRange: [2, 6] },
  { id: 'futureTense', label: '一般将来时', icon: '🔮', gradeRange: [3, 6] },
  { id: 'pastTense', label: '一般过去时', icon: '📅', gradeRange: [3, 6] },

  // 句法类
  { id: 'sentenceStructure', label: '句子结构', icon: '📐', gradeRange: [2, 6] },
  { id: 'thereBe', label: 'There be句型', icon: '🏗️', gradeRange: [3, 6] },
  { id: 'questionForm', label: '疑问句', icon: '❓', gradeRange: [2, 6] },

  // 口语类
  { id: 'readAloud', label: '朗读', icon: '📖', gradeRange: [1, 6] },
  { id: 'pronunciation', label: '发音', icon: '🔊', gradeRange: [1, 6] },

  // 语法塔新增节点（映射 grammarTowers 塔 id）
  { id: 'beVerb', label: 'Be动词', icon: '📖', gradeRange: [1, 6] },
  { id: 'comparative', label: '比较级', icon: '📊', gradeRange: [3, 6] },
  { id: 'basicClause', label: '基础从句', icon: '🔀', gradeRange: [4, 6] },

  // 批次2新增塔的知识点节点
  { id: 'phrase', label: '常用语', icon: '💬', gradeRange: [1, 6] },
  { id: 'dialogue', label: '情景对话', icon: '🎭', gradeRange: [2, 6] }
];

const subjects = {
  math: {
    id: 'math',
    label: '数学',
    icon: '📐',
    color: '#4A90D9',
    nodes: mathKnowledgeNodes,
    store: 'mathKnowledge'
  },
  english: {
    id: 'english',
    label: '英语',
    icon: '🔤',
    color: '#7B68EE',
    nodes: englishKnowledgeNodes,
    store: 'englishKnowledge'
  }
};

/**
 * 根据学科 id 获取学科注册信息
 * @param {string} id - 学科标识（'math' | 'english'）
 * @returns {object|undefined} 学科注册信息
 */
function getSubjectById(id) {
  return subjects[id];
}

/**
 * 根据学科 id 和知识点 id 获取知识点节点
 * @param {string} subjectId - 学科标识
 * @param {string} nodeId - 知识点节点标识
 * @returns {object|undefined} 知识点节点
 */
function getNodeById(subjectId, nodeId) {
  const subject = subjects[subjectId];
  if (!subject) return undefined;
  return subject.nodes.find(n => n.id === nodeId);
}

export {
  mathKnowledgeNodes,
  englishKnowledgeNodes,
  subjects,
  getSubjectById,
  getNodeById
};
