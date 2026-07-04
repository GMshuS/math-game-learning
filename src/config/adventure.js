/**
 * 冒险模式配置
 */
export const adventureConfig = {
  // 世界区域
  areas: [
    {
      id: 'area_1',
      name: '数字森林',
      description: '学习数字的基础之地',
      gradeRange: [1, 2],
      color: '#4ade80',
      levels: [
        { number: 1, title: '认识数字', desc: '学习 1-20 的数字读写和顺序' },
        { number: 2, title: '数字比大小', desc: '比较 20 以内数字的大小' },
        { number: 3, title: '数位与位置', desc: '认识个位和十位，理解数位含义' },
        { number: 4, title: '10以内加法', desc: '掌握 10 以内的加法运算' },
        { number: 5, title: '10以内减法', desc: '掌握 10 以内的减法运算' },
        { number: 6, title: '20以内加法', desc: '掌握 20 以内的进位加法' },
        { number: 7, title: '20以内减法', desc: '掌握 20 以内的退位减法' },
        { number: 8, title: '数字找规律', desc: '发现数字序列中的规律并填空' },
        { number: 9, title: '数字填空综合', desc: '数字相关的填空题综合练习' },
        { number: 10, title: '综合挑战', desc: '综合运用所学知识应对挑战' }
      ],
      unlockedBy: null
    },
    {
      id: 'area_2',
      name: '加减山谷',
      description: '掌握加减法的山谷',
      gradeRange: [1, 2],
      color: '#60a5fa',
      levels: [
        { number: 1, title: '两位数加法', desc: '学习两位数加一位数、两位数加两位数' },
        { number: 2, title: '进位加法', desc: '掌握进位加法的计算技巧' },
        { number: 3, title: '两位数减法', desc: '学习两位数减一位数、两位数减两位数' },
        { number: 4, title: '退位减法', desc: '掌握退位减法的计算技巧' },
        { number: 5, title: '加减混合', desc: '加减法混合运算练习' },
        { number: 6, title: '连加连减', desc: '多个数连续加、连续减的计算' },
        { number: 7, title: '估算入门', desc: '学习简单的估算方法' },
        { number: 8, title: '加法应用题', desc: '用加法解决生活中的实际问题' },
        { number: 9, title: '减法应用题', desc: '用减法解决生活中的实际问题' },
        { number: 10, title: '综合挑战', desc: '加减法综合运用' }
      ],
      unlockedBy: 'area_1'
    },
    {
      id: 'area_3',
      name: '乘除城堡',
      description: '乘除法的神秘城堡',
      gradeRange: [3, 4],
      color: '#fbbf24',
      levels: [
        { number: 1, title: '乘法入门', desc: '理解乘法的意义，学习乘法口诀' },
        { number: 2, title: '乘法口诀', desc: '熟记并使用乘法口诀表' },
        { number: 3, title: '除法入门', desc: '理解除法的意义，学会用乘法口诀求商' },
        { number: 4, title: '整除与余数', desc: '学习有余数的除法' },
        { number: 5, title: '乘除混合', desc: '乘法和除法混合运算' },
        { number: 6, title: '四则混合运算', desc: '加减乘除四则混合运算，掌握运算顺序' },
        { number: 7, title: '长度单位换算', desc: '毫米、厘米、分米、米之间的换算' },
        { number: 8, title: '质量与时间单位', desc: '克、千克、吨；时、分、秒的单位换算' },
        { number: 9, title: '图形认识与周长', desc: '认识基本图形，计算周长' },
        { number: 10, title: '面积计算', desc: '长方形、正方形的面积计算' },
        { number: 11, title: '条形统计图', desc: '看懂和绘制条形统计图' },
        { number: 12, title: '综合挑战', desc: '乘除法与几何综合运用' }
      ],
      unlockedBy: 'area_2'
    },
    {
      id: 'area_4',
      name: '分数海岛',
      description: '探索分数的奥秘',
      gradeRange: [5, 6],
      color: '#f472b6',
      levels: [
        { number: 1, title: '分数认识', desc: '理解分数的意义，认识分子分母' },
        { number: 2, title: '分数加减', desc: '同分母和异分母分数加减法' },
        { number: 3, title: '分数乘除', desc: '分数的乘法和除法运算' },
        { number: 4, title: '小数认识', desc: '小数的意义、读写和大小比较' },
        { number: 5, title: '小数运算', desc: '小数的加减乘除运算' },
        { number: 6, title: '百分数', desc: '百分数的意义和与分数小数的互化' },
        { number: 7, title: '简易方程', desc: '用字母表示数，解简单方程' },
        { number: 8, title: '比和比例', desc: '理解比的意义，解决比例问题' },
        { number: 9, title: '负数认识', desc: '认识负数，理解正负方向' },
        { number: 10, title: '综合挑战', desc: '分数小数百分数综合运用' }
      ],
      unlockedBy: 'area_3'
    },
    {
      id: 'area_5',
      name: '数学之王座',
      description: '最终的挑战之地',
      gradeRange: [5, 6],
      color: '#a78bfa',
      levels: [
        { number: 1, title: '分数小数综合', desc: '分数与小数的混合运算和互化' },
        { number: 2, title: '百分数应用', desc: '折扣、利率、税率等百分数实际问题' },
        { number: 3, title: '方程与比例', desc: '解方程和比例的实际应用' },
        { number: 4, title: '几何面积体积', desc: '平行四边形、三角形、梯形面积和长方体体积' },
        { number: 5, title: '圆与表面积', desc: '圆的周长面积、圆柱/圆锥的表面积' },
        { number: 6, title: '统计图表', desc: '条形图、折线图、扇形图的阅读与分析' },
        { number: 7, title: '运算定律巧算', desc: '运用交换律、结合律、分配律简便计算' },
        { number: 8, title: '终极挑战', desc: '综合所有知识点的终极考验' }
      ],
      unlockedBy: 'area_4'
    }
  ],

  // 怪物类型
  monsters: [
    { id: 'slime', name: '数字史莱姆', difficulty: 1, exp: 10, coins: 5 },
    { id: 'goblin', name: '计算哥布林', difficulty: 2, exp: 20, coins: 10 },
    { id: 'orc', name: '算术兽人', difficulty: 3, exp: 30, coins: 15 },
    { id: 'dragon', name: '数学巨龙', difficulty: 5, exp: 100, coins: 50 }
  ],

  // 关卡奖励
  levelRewards: {
    firstClear: { coins: 50, exp: 100 },
    perfectScore: { coins: 25, exp: 50 },
    timeBonus: { coins: 10, exp: 20 }
  }
};

/**
 * 获取区域信息
 */
export function getArea(areaId) {
  return adventureConfig.areas.find(a => a.id === areaId);
}

/**
 * 获取所有区域
 */
export function getAllAreas() {
  return adventureConfig.areas;
}

/**
 * 根据年级获取可用区域
 */
export function getAreasForGrade(grade) {
  return adventureConfig.areas.filter(area => 
    grade >= area.gradeRange[0] && grade <= area.gradeRange[1]
  );
}

export default adventureConfig;
