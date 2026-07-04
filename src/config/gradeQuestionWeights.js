/**
 * 按年级题型权重配置
 * 每个年级中各种题型的权重分布，用于按权重随机选择题目类型
 * 权重总值不需要统一为 100，算法会按比例归一化
 *
 * 注意：只包含实际已实现的题型
 * 未实现的题型（pictureCompare, chartQuestion, fractionVisual）暂不加入
 */
export const gradeQuestionWeights = {
  1: { add: 15, subtract: 15, word: 10, scenario: 10, numberFill: 20,
       numberCompare: 15, placeValue: 15, patternFind: 10 },
  2: { add: 12, subtract: 12, multiply: 8, word: 15, scenario: 15, numberFill: 18,
       numberCompare: 12, placeValue: 10, estimate: 8, patternFind: 5 },
  3: { add: 6, subtract: 6, multiply: 8, divide: 8, mixed: 6,
       word: 8, scenario: 8, estimate: 6, numberFill: 4,
       numberCompare: 6, numberProperty: 8, patternFind: 5, averageCalc: 10,
       unit_length: 5, unit_mass: 4, unit_time: 4, chart_bar: 4,
       geometry_shape: 4, geometry_perimeter: 5, geometry_area: 5, geometry_angle: 3 },
  4: { add: 5, subtract: 5, multiply: 6, divide: 6, mixed: 6,
       word: 8, scenario: 8, decimal: 8, estimate: 4,
       numberCompare: 5, numberProperty: 8, operationLaw: 10, averageCalc: 6,
       unit_length: 5, unit_mass: 4, unit_time: 4, unit_area: 4,
       unit_volume: 3, unit_currency: 3,
       chart_bar: 5, chart_line: 4,
       geometry_shape: 4, geometry_perimeter: 5, geometry_area: 5,
       geometry_angle: 4, geometry_transform: 3 },
  5: { add: 3, subtract: 3, multiply: 4, divide: 4,
       fraction: 8, decimal: 8, mixed: 5, word: 6, scenario: 6, equation: 6, percentage: 5,
       numberProperty: 6, operationLaw: 6, ratioProportion: 6, negativeNumber: 5, averageCalc: 5,
       unit_length: 4, unit_mass: 3, unit_time: 3, unit_area: 4,
       unit_volume: 3, unit_currency: 3,
       chart_bar: 4, chart_line: 4, chart_pie: 3,
       geometry_shape: 4, geometry_perimeter: 4, geometry_area: 4,
       geometry_volume: 4, geometry_surface: 3, geometry_angle: 4,
       geometry_circle: 4, geometry_transform: 3 },
  6: { add: 2, subtract: 2, multiply: 4, divide: 4,
       fraction: 6, decimal: 6, percentage: 6, mixed: 4, word: 6, scenario: 6, equation: 8,
       numberProperty: 6, operationLaw: 6, ratioProportion: 6, negativeNumber: 6, averageCalc: 4,
       unit_length: 3, unit_mass: 3, unit_time: 3, unit_area: 3,
       unit_volume: 3, unit_currency: 3,
       chart_bar: 4, chart_line: 4, chart_pie: 4,
       geometry_shape: 4, geometry_perimeter: 4, geometry_area: 4,
       geometry_volume: 4, geometry_surface: 4, geometry_angle: 4,
       geometry_circle: 4, geometry_transform: 3 }
};

export default gradeQuestionWeights;
