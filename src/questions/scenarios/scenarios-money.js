/**
 * 生活消费场景模板（G2-G6）
 * 知识点：money_change / money_decimal / money_multi / money_discount / money_tax
 *
 * 模板 M1-M4:  G2（simple_change, two_items, remain_money, jiao_change）
 * 模板 M5-M8:  G3（decimal_change, compare_price, estimate_enough, multiple_items）
 * 模板 M9-M12: G4（fruit_weight, unit_price_from_total, combo_purchase, budget_plan）
 * 模板 M13-M16: G5（discount_sale, min_spend, recharge_discount, compare_discount）
 * 模板 M17-M19: G6（income_tax, savings_interest, vat_calc）
 *
 * 统一接口：export default { id, gradeMin, gradeMax, weight, generate }
 */
import { randomInt, randomRange, pick } from '../_helpers.js';

// ============================================================
//  加权随机选择
// ============================================================
function weightedPick(items) {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let r = Math.random() * total;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item;
  }
  return items[items.length - 1];
}

// ============================================================
//  统一结果包装
// ============================================================
function toResult({ knowledgeId, question, parts }) {
  return {
    question,
    type: 'word',
    knowledgeId,
    parts,
    operands: parts.map(p => p.answer).filter(v => typeof v === 'number' && !Number.isNaN(v)),
    answer: parts[0].answer
  };
}

// ============================================================
//  G2 模板（M1-M4）— money_change
// ============================================================

/**
 * M1: simple_change — 简单找零
 * 例：买一支铅笔3元，付了5元，应找回多少元？
 *
 * items = [('一支铅笔',1,3), ('一块橡皮',1,2), ('一个笔记本',3,5),
 *           ('一把尺子',1,2), ('一个转笔刀',2,5)]
 * price ∈ [minPrice, maxPrice], paid ∈ {5, 10}
 * 确保 paid > price
 */
function generateSimpleChange() {
  const items = [
    { name: '一支铅笔', min: 1, max: 3 },
    { name: '一块橡皮', min: 1, max: 2 },
    { name: '一个笔记本', min: 3, max: 5 },
    { name: '一把尺子', min: 1, max: 2 },
    { name: '一个转笔刀', min: 2, max: 5 }
  ];
  let price, paid, change, item;
  // 迭代重试，避免递归栈溢出风险
  for (let attempt = 0; attempt < 100; attempt++) {
    item = pick(items);
    price = randomInt(item.min, item.max);
    paid = pick([5, 10]);
    if (price < paid) { change = paid - price; break; }
  }
  const question = `买${item.name}${price}元，付了${paid}元，应找回多少元？`;
  return {
    knowledgeId: 'money_change',
    question,
    parts: [
      { type: 'number', answer: change, label: '元' }
    ]
  };
}

/**
 * M2: two_items — 两样物品总价
 * 例：买一个铅笔3元和橡皮2元，一共需要多少元？
 *
 * items = [('铅笔',1,3), ('橡皮',1,2), ('尺子',1,3), ('本子',2,5), ('彩笔',3,6)]
 * 选两个不同物品，price1 + price2 = total
 */
function generateTwoItems() {
  const items = [
    { name: '铅笔', min: 1, max: 3 },
    { name: '橡皮', min: 1, max: 2 },
    { name: '尺子', min: 1, max: 3 },
    { name: '本子', min: 2, max: 5 },
    { name: '彩笔', min: 3, max: 6 }
  ];
  const idx1 = Math.floor(Math.random() * items.length);
  let idx2;
  do {
    idx2 = Math.floor(Math.random() * items.length);
  } while (idx2 === idx1);
  const item1 = items[idx1];
  const item2 = items[idx2];
  const price1 = randomInt(item1.min, item1.max);
  const price2 = randomInt(item2.min, item2.max);
  const total = price1 + price2;
  const question = `买一个${item1.name}${price1}元和${item2.name}${price2}元，一共需要多少元？`;
  return {
    knowledgeId: 'money_change',
    question,
    parts: [
      { type: 'number', answer: total, label: '元' }
    ]
  };
}

/**
 * M3: remain_money — 花后剩余
 * 例：小红带了20元，买了一个8元的布娃娃，还剩多少元？
 *
 * total ∈ {10,15,20,25,30,40,50}
 * spend ∈ {5,8,10,12,15,18,20}
 * 确保 total > spend
 * 变体：小明、小华、小丽，商品名变化
 */
function generateRemainMoney() {
  const names = ['小红', '小明', '小华', '小丽'];
  const name = pick(names);
  const goods = ['布娃娃', '故事书', '小汽车', '积木', '水彩笔', '文具盒'];
  const good = pick(goods);
  const total = pick([10, 15, 20, 25, 30, 40, 50]);
  const spendOptions = [5, 8, 10, 12, 15, 18, 20].filter(v => v < total);
  const spend = pick(spendOptions);
  const remain = total - spend;
  const question = `${name}带了${total}元，买了一个${spend}元的${good}，还剩多少元？`;
  return {
    knowledgeId: 'money_change',
    question,
    parts: [
      { type: 'number', answer: remain, label: '元' }
    ]
  };
}

/**
 * M4: jiao_change — 元角找零
 * 例：一块橡皮3角，付了1元，应找回多少角？
 *
 * items = [('橡皮',1,5), ('铅笔',2,6), ('贴纸',3,7), ('糖果',1,4)]
 * priceJiao ∈ [min, max]
 * changeJiao = 10 - priceJiao
 */
function generateJiaoChange() {
  const items = [
    { name: '橡皮', min: 1, max: 5 },
    { name: '铅笔', min: 2, max: 6 },
    { name: '贴纸', min: 3, max: 7 },
    { name: '糖果', min: 1, max: 4 }
  ];
  const item = pick(items);
  const priceJiao = randomInt(item.min, item.max);
  const changeJiao = 10 - priceJiao;
  const question = `一块${item.name}${priceJiao}角，付了1元，应找回多少角？`;
  return {
    knowledgeId: 'money_change',
    question,
    parts: [
      { type: 'number', answer: changeJiao, label: '角' }
    ]
  };
}

// ============================================================
//  G3 模板（M5-M8）— money_decimal
// ============================================================

/**
 * M5: decimal_change — 小数价格找零
 * 例：一包薯片3.5元，一瓶果汁4.0元，付了10元，应找回多少元？
 *
 * paid ∈ {10, 20, 50}
 * price1 ∈ [2.0, Math.min(paid*0.6, 15.0)] step 0.5
 * price2 ∈ [2.0, paid - price1 - 2] step 0.5
 * total, change 保留一位小数
 * 变体：牛奶+饼干、面包+酸奶、苹果+香蕉
 */
function generateDecimalChange() {
  let price1, price2, total, change, paid;
  // 迭代重试，避免递归栈溢出风险
  for (let attempt = 0; attempt < 100; attempt++) {
    const paidOptions = [10, 20, 50];
    paid = pick(paidOptions);
    const maxPrice1 = Math.min(paid * 0.6, 15.0);
    price1 = randomRange(2.0, maxPrice1, 0.5);
    const maxPrice2 = paid - price1 - 2;
    if (maxPrice2 < 2.0) continue;
    price2 = randomRange(2.0, maxPrice2, 0.5);
    total = Math.round((price1 + price2) * 10) / 10;
    change = Math.round((paid - total) * 10) / 10;
    if (change > 0) break;
  }
  const pairs = [
    '一包薯片', '一瓶果汁',
    '一盒牛奶', '一包饼干',
    '一个面包', '一杯酸奶',
    '一个苹果', '一根香蕉'
  ];
  const item1 = pick(pairs.slice(0, 4));
  let item2;
  do {
    item2 = pick(pairs.slice(4));
  } while (item2 === item1);
  const question = `${item1}${price1}元，${item2}${price2}元，付了${paid}元，应找回多少元？`;
  return {
    knowledgeId: 'money_decimal',
    question,
    parts: [
      { type: 'number', answer: change, label: '元' }
    ]
  };
}

/**
 * M6: compare_price — 比价
 * 例：超市A一箱牛奶50元，超市B同款牛奶65元，超市A买比超市B便宜多少元？
 *
 * priceA ∈ [20, 80] (5的倍数)
 * priceB = priceA + randomInt(3, 20)
 * diff = priceB - priceA
 */
function generateComparePrice() {
  const priceA = randomRange(20, 80, 5);
  const priceB = priceA + randomInt(3, 20);
  const diff = priceB - priceA;
  const items = ['一箱牛奶', '一桶油', '一袋大米', '一箱饮料', '一盒巧克力'];
  const item = pick(items);
  const question = `超市A${item}${priceA}元，超市B同款${item}${priceB}元，在超市A买比超市B便宜多少元？`;
  return {
    knowledgeId: 'money_decimal',
    question,
    parts: [
      { type: 'number', answer: diff, label: '元' }
    ]
  };
}

/**
 * M7: estimate_enough — 估算够不够
 * 例：书包35元、文具盒18元、彩笔16元。小明大约带了69元，够吗？
 *
 * price1 ∈ [21-29,31-39], price2/price3 ∈ [11-19,21-29]
 * 四舍五入到十位估算，判断带钱是否够
 * parts: choice type（'够'/'不够'）
 */
function generateEstimateEnough() {
  const price1Options = [21, 22, 23, 24, 25, 26, 27, 28, 29, 31, 32, 33, 34, 35, 36, 37, 38, 39];
  const price23Options = [11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23, 24, 25, 26, 27, 28, 29];
  const price1 = pick(price1Options);
  const price2 = pick(price23Options);
  const price3 = pick(price23Options);
  const actual = price1 + price2 + price3;
  const est1 = Math.round(price1 / 10) * 10;
  const est2 = Math.round(price2 / 10) * 10;
  const est3 = Math.round(price3 / 10) * 10;
  const estimated = est1 + est2 + est3;
  const isEnough = estimated >= actual;
  const answer = isEnough ? '够' : '不够';
  const items = ['书包', '文具盒', '彩笔', '故事书', '玩具车', '水彩笔'];
  const i1 = pick(items);
  let i2, i3;
  do { i2 = pick(items); } while (i2 === i1);
  do { i3 = pick(items); } while (i3 === i1 || i3 === i2);
  const question = `${i1}${price1}元、${i2}${price2}元、${i3}${price3}元。小明大约带了${estimated}元，够吗？（先用估算判断）`;
  return {
    knowledgeId: 'money_decimal',
    question,
    parts: [
      { type: 'choice', answer: answer, options: ['够', '不够'] }
    ]
  };
}

/**
 * M8: multiple_items — 单价×数量
 * 例：一个面包3.5元，买4个需要多少元？
 *
 * unitPrice ∈ {2.5,3,3.5,4,4.5,5,5.5,6,6.5,7,7.5,8}
 * quantity ∈ [2, 6]
 * total = Math.round(unitPrice * quantity * 10) / 10
 * 变体：酸奶、蛋糕、果冻
 */
function generateMultipleItems() {
  const unitPrice = pick([2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8]);
  const quantity = randomInt(2, 6);
  const total = Math.round(unitPrice * quantity * 10) / 10;
  const items = ['一个面包', '一杯酸奶', '一块蛋糕', '一个果冻', '一杯奶茶'];
  const item = pick(items);
  const question = `${item}${unitPrice}元，买${quantity}个需要多少元？`;
  return {
    knowledgeId: 'money_decimal',
    question,
    parts: [
      { type: 'number', answer: total, label: '元' }
    ]
  };
}

// ============================================================
//  G4 模板（M9-M12）— money_multi
// ============================================================

/**
 * M9: fruit_weight — 水果按重量计价
 * 例：苹果每公斤8元，买2.5公斤需要多少元？
 *
 * fruits = [('苹果',5,10), ('香蕉',4,7), ('葡萄',8,15), ('橙子',6,12), ('草莓',12,20)]
 * pricePerKg = randomInt(min, max)
 * weight = randomRange(1.5, 5.0, 0.5)
 * total = Math.round(pricePerKg * weight * 100) / 100
 */
function generateFruitWeight() {
  const fruits = [
    { name: '苹果', min: 5, max: 10 },
    { name: '香蕉', min: 4, max: 7 },
    { name: '葡萄', min: 8, max: 15 },
    { name: '橙子', min: 6, max: 12 },
    { name: '草莓', min: 12, max: 20 }
  ];
  const fruit = pick(fruits);
  const pricePerKg = randomInt(fruit.min, fruit.max);
  const weight = randomRange(1.5, 5.0, 0.5);
  const total = Math.round(pricePerKg * weight * 100) / 100;
  const question = `${fruit.name}每公斤${pricePerKg}元，买${weight}公斤需要多少元？`;
  return {
    knowledgeId: 'money_multi',
    question,
    parts: [
      { type: 'number', answer: total, label: '元' }
    ]
  };
}

/**
 * M10: unit_price_from_total — 总价÷数量求单价
 * 例：买了5支同样的笔共花了17.5元，每支笔多少元？
 *
 * quantity ∈ [3, 10]
 * unitPrice ∈ {2.5,3,3.5,4,4.5,5,5.5,6,6.5,7,8,9,10}
 * total = unitPrice * quantity
 */
function generateUnitPriceFromTotal() {
  const unitPrice = pick([2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 8, 9, 10]);
  const quantity = randomInt(3, 10);
  const total = unitPrice * quantity;
  const items = ['笔', '笔记本', '橡皮', '尺子', '文具盒'];
  const item = pick(items);
  const question = `买了${quantity}支同样的${item}共花了${total}元，每支${item}多少元？`;
  return {
    knowledgeId: 'money_multi',
    question,
    parts: [
      { type: 'number', answer: unitPrice, label: '元' }
    ]
  };
}

/**
 * M11: combo_purchase — 组合购买
 * 例：买3杯奶茶每杯12元，4个蛋挞每个5元，一共需要多少元？
 *
 * price1 ∈ [8, 15], qty1 ∈ [2, 4]
 * price2 ∈ [3, 8], qty2 ∈ [2, 5]
 * total = price1*qty1 + price2*qty2
 * 变体：汉堡+薯条、书+文具、蛋糕+饮料
 */
function generateComboPurchase() {
  const price1 = randomInt(8, 15);
  const qty1 = randomInt(2, 4);
  const price2 = randomInt(3, 8);
  const qty2 = randomInt(2, 5);
  const total = price1 * qty1 + price2 * qty2;
  const combos = [
    { name1: '杯奶茶', name2: '个蛋挞' },
    { name1: '个汉堡', name2: '份薯条' },
    { name1: '本书', name2: '个文具' },
    { name1: '块蛋糕', name2: '杯饮料' }
  ];
  const combo = pick(combos);
  const question = `买${qty1}${combo.name1}每${combo.name1.charAt(0) === '杯' ? '杯' : '个'}${price1}元，${qty2}${combo.name2}每${combo.name2.charAt(0) === '份' ? '份' : '个'}${price2}元，一共需要多少元？`;
  return {
    knowledgeId: 'money_multi',
    question,
    parts: [
      { type: 'number', answer: total, label: '元' }
    ]
  };
}

/**
 * M12: budget_plan — 预算规划
 * 例：小明带了80元，买一个25元的书包，剩下的钱买6元一支的笔，最多能买几支？
 *
 * budget ∈ {30,40,50,60,70,80,90,100}
 * bigItem ∈ [15, budget*0.6] (5的倍数)
 * smallPrice ∈ {3,4,5,6,7,8}
 * remaining = budget - bigItem
 * maxCount = Math.floor(remaining / smallPrice)
 * 确保 maxCount ≥ 1
 */
function generateBudgetPlan() {
  let budget, bigItem, smallPrice, maxCount;
  // 迭代重试，避免递归栈溢出风险
  for (let attempt = 0; attempt < 100; attempt++) {
    budget = pick([30, 40, 50, 60, 70, 80, 90, 100]);
    const maxBig = Math.floor(budget * 0.6);
    const bigOptions = [];
    for (let v = 15; v <= maxBig; v += 5) bigOptions.push(v);
    if (bigOptions.length === 0) continue;
    bigItem = pick(bigOptions);
    smallPrice = pick([3, 4, 5, 6, 7, 8]);
    const remaining = budget - bigItem;
    maxCount = Math.floor(remaining / smallPrice);
    if (maxCount >= 1) break;
  }
  const bigGoods = ['书包', '文具盒', '玩具', '故事书', '水彩笔'];
  const bigGood = pick(bigGoods);
  const question = `小明带了${budget}元，买一个${bigItem}元的${bigGood}，剩下的钱买${smallPrice}元一支的笔，最多能买几支？`;
  return {
    knowledgeId: 'money_multi',
    question,
    parts: [
      { type: 'number', answer: maxCount, label: '支' }
    ]
  };
}

// ============================================================
//  G5 模板（M13-M16）— money_discount
// ============================================================

/**
 * M13: discount_sale — 折扣计算
 * 例：一件衣服原价200元，打7折出售，售价是多少元？
 *
 * original ∈ {100,150,200,250,300,350,400,450,500}
 * discount ∈ {6,6.5,7,7.5,8,8.5,9}
 * salePrice = Math.floor(original * discount / 10)
 * 变体：鞋子、书包、玩具
 */
function generateDiscountSale() {
  const original = pick([100, 150, 200, 250, 300, 350, 400, 450, 500]);
  const discount = pick([6, 6.5, 7, 7.5, 8, 8.5, 9]);
  const salePrice = Math.floor(original * discount / 10);
  const items = ['衣服', '鞋子', '书包', '玩具', '手表'];
  const item = pick(items);
  const question = `一件${item}原价${original}元，打${discount}折出售，售价是多少元？`;
  return {
    knowledgeId: 'money_discount',
    question,
    parts: [
      { type: 'number', answer: salePrice, label: '元' }
    ]
  };
}

/**
 * M14: min_spend — 满减计算
 * 例：商场"满200减50"，妈妈买了260元的衣服，实际需要付多少元？
 *
 * threshold ∈ {100,200,300}
 * discountAmt ∈ {30,50,60}
 * spend = threshold + randomInt(2, 8)*10
 * finalPrice = spend - discountAmt
 */
function generateMinSpend() {
  const threshold = pick([100, 200, 300]);
  const discountAmt = pick([30, 50, 60]);
  const spend = threshold + randomInt(2, 8) * 10;
  const finalPrice = spend - discountAmt;
  const items = ['衣服', '鞋子', '包包', '化妆品', '电子产品'];
  const item = pick(items);
  const question = `商场"满${threshold}减${discountAmt}"，妈妈买了${spend}元的${item}，实际需要付多少元？`;
  return {
    knowledgeId: 'money_discount',
    question,
    parts: [
      { type: 'number', answer: finalPrice, label: '元' }
    ]
  };
}

/**
 * M15: recharge_discount — 充值折扣
 * 例：面包店充值200元送30元，小明充了200元，实际相当于打了几折？
 *
 * recharge ∈ {100,200,500}
 * bonus ∈ {10,20,30,50}
 * ratio = recharge / (recharge + bonus)
 * discount = Math.round(ratio * 10 * 10) / 10  // 保留一位小数
 * 变体：买二送一、第二件半价
 */
function generateRechargeDiscount() {
  const recharge = pick([100, 200, 500]);
  const bonus = pick([10, 20, 30, 50]);
  const ratio = recharge / (recharge + bonus);
  const discount = Math.round(ratio * 10 * 10) / 10;
  const stores = ['面包店', '奶茶店', '蛋糕店', '咖啡店'];
  const store = pick(stores);
  const question = `${store}充值${recharge}元送${bonus}元，小明充了${recharge}元，实际相当于打了几折？`;
  return {
    knowledgeId: 'money_discount',
    question,
    parts: [
      { type: 'number', answer: discount, label: '折' }
    ]
  };
}

/**
 * M16: compare_discount — 比较折扣
 * 例：A店原价200元打7折，B店原价230元不打折。哪家店更便宜？便宜多少元？
 *
 * 含 choice + number 组合 parts
 * storeAPrice ∈ [100, 300] (50的倍数)
 * discount ∈ {7, 7.5, 8, 8.5}
 * priceA = Math.floor(storeAPrice * discount / 10)
 * offset = pick([-1,-1,1,1,1]) * randomInt(10, 60)
 * priceB = storeAPrice + offset
 * 确保 priceA 和 priceB 至少差5元
 */
function generateCompareDiscount() {
  let storeAPrice, discount, priceA, sign, offset, priceB;
  // 迭代重试，避免递归栈溢出风险
  for (let attempt = 0; attempt < 100; attempt++) {
    storeAPrice = randomRange(100, 300, 50);
    discount = pick([7, 7.5, 8, 8.5]);
    priceA = Math.floor(storeAPrice * discount / 10);
    sign = pick([-1, -1, 1, 1, 1]);
    offset = sign * randomInt(10, 60);
    priceB = storeAPrice + offset;
    if (Math.abs(priceA - priceB) >= 5) break;
  }
  const cheaper = priceA < priceB ? 'A店' : 'B店';
  const diff = Math.abs(priceA - priceB);
  const question = `A店原价${storeAPrice}元打${discount}折，B店原价${priceB}元不打折。哪家店更便宜？便宜多少元？`;
  return {
    knowledgeId: 'money_discount',
    question,
    parts: [
      { type: 'choice', answer: cheaper, options: ['A店', 'B店'], label: '哪家更便宜？' },
      { type: 'number', answer: diff, label: '便宜多少元？' }
    ]
  };
}

// ============================================================
//  G6 模板（M17-M19）— money_tax
// ============================================================

/**
 * M17: income_tax — 个人所得税计算
 * 例：李阿姨月收入8000元，扣除5000元免征额后按3%缴纳个人所得税，每月应缴税多少元？
 *
 * income ∈ {6000,7000,8000,9000,10000,12000,15000}
 * exemption = 5000
 * ratePct = 3
 * taxable = income - exemption
 * tax = Math.round(taxable * ratePct / 100)
 */
function generateIncomeTax() {
  const income = pick([6000, 7000, 8000, 9000, 10000, 12000, 15000]);
  const exemption = 5000;
  const ratePct = 3;
  const taxable = income - exemption;
  const tax = Math.round(taxable * ratePct / 100);
  const names = ['李阿姨', '王叔叔', '张老师', '陈经理', '赵医生'];
  const name = pick(names);
  const question = `${name}月收入${income}元，扣除${exemption}元免征额后按${ratePct}%缴纳个人所得税，每月应缴税多少元？`;
  return {
    knowledgeId: 'money_tax',
    question,
    parts: [
      { type: 'number', answer: tax, label: '元' }
    ]
  };
}

/**
 * M18: savings_interest — 存款利息计算
 * 例：小红把压岁钱5000元存入银行，年利率2.25%，一年后能得到多少元利息？
 *
 * principal ∈ {2000,3000,5000,8000,10000}
 * ratePct ∈ {1.5, 1.75, 2.25, 2.75}
 * interest = Math.round(principal * ratePct / 100 * 100) / 100
 */
function generateSavingsInterest() {
  const principal = pick([2000, 3000, 5000, 8000, 10000]);
  const ratePct = pick([1.5, 1.75, 2.25, 2.75]);
  const interest = Math.round(principal * ratePct / 100 * 100) / 100;
  const names = ['小红', '小明', '小华', '小丽', '小刚'];
  const name = pick(names);
  const question = `${name}把压岁钱${principal}元存入银行，年利率${ratePct}%，一年后能得到多少元利息？`;
  return {
    knowledgeId: 'money_tax',
    question,
    parts: [
      { type: 'number', answer: interest, label: '元' }
    ]
  };
}

/**
 * M19: vat_calc — 增值税计算
 * 例：一台手机不含税价格3000元，增值税率13%，手机中含有多少元增值税？
 *
 * priceExVat ∈ {1000,1500,2000,2500,3000,3500,4000,4500,5000}
 * vatRatePct = 13
 * vat = Math.round(priceExVat * vatRatePct / 100 * 100) / 100
 */
function generateVatCalc() {
  const priceExVat = pick([1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000]);
  const vatRatePct = 13;
  const vat = Math.round(priceExVat * vatRatePct / 100 * 100) / 100;
  const goods = ['一台手机', '一台电脑', '一台电视', '一台冰箱', '一部相机'];
  const good = pick(goods);
  const question = `${good}不含税价格${priceExVat}元，增值税率${vatRatePct}%，${good}中含有多少元增值税？`;
  return {
    knowledgeId: 'money_tax',
    question,
    parts: [
      { type: 'number', answer: vat, label: '元' }
    ]
  };
}

// ============================================================
//  模板注册
// ============================================================
const g2Templates = [
  { fn: generateSimpleChange, weight: 3 },
  { fn: generateTwoItems, weight: 2 },
  { fn: generateRemainMoney, weight: 3 },
  { fn: generateJiaoChange, weight: 2 }
];

const g3Templates = [
  { fn: generateDecimalChange, weight: 3 },
  { fn: generateComparePrice, weight: 2 },
  { fn: generateEstimateEnough, weight: 2 },
  { fn: generateMultipleItems, weight: 3 }
];

const g4Templates = [
  { fn: generateFruitWeight, weight: 3 },
  { fn: generateUnitPriceFromTotal, weight: 2 },
  { fn: generateComboPurchase, weight: 3 },
  { fn: generateBudgetPlan, weight: 3 }
];

const g5Templates = [
  { fn: generateDiscountSale, weight: 3 },
  { fn: generateMinSpend, weight: 3 },
  { fn: generateRechargeDiscount, weight: 2 },
  { fn: generateCompareDiscount, weight: 2 }
];

const g6Templates = [
  { fn: generateIncomeTax, weight: 3 },
  { fn: generateSavingsInterest, weight: 2 },
  { fn: generateVatCalc, weight: 1 }
];

// ============================================================
//  场景模块默认导出
// ============================================================
export default {
  id: 'money',
  gradeMin: 2,
  gradeMax: 6,
  weight: 5,

  /**
   * 按年级生成生活消费应用题
   * @param {number} grade - 当前年级（2-6）
   * @param {object} _range - 数字范围（本场景未使用）
   * @returns {object} 题目对象
   */
  generate(grade, _range) {
    let result;
    if (grade === 2) {
      result = weightedPick(g2Templates).fn();
    } else if (grade === 3) {
      result = weightedPick(g3Templates).fn();
    } else if (grade === 4) {
      result = weightedPick(g4Templates).fn();
    } else if (grade === 5) {
      result = weightedPick(g5Templates).fn();
    } else {
      // G6 及以上使用 G6 模板
      result = weightedPick(g6Templates).fn();
    }
    return toResult(result);
  }
};
