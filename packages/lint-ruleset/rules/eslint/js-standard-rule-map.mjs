/**
 * 平台 ESLint-规范（JSxxx）映射字典。
 * 说明：
 * - direct：当前规则集可直接用 ESLint 规则表达。
 * - partial：可近似表达，或依赖额外插件/自定义规则。
 */
export const jsStandardRuleMap = {
  JS004: {
    mappingStatus: 'direct',
    replacementTool: 'ESLint',
    replacementRuleOrPack: 'indent',
    note: 'switch/case 缩进层级可由 indent 直接约束'
  },
  JS005: {
    mappingStatus: 'partial',
    replacementTool: 'ESLint',
    replacementRuleOrPack: 'space-infix-ops + space-unary-ops',
    note: '二元/一元运算符空格通过组合规则近似约束'
  },
  JS006: {
    mappingStatus: 'direct',
    replacementTool: 'ESLint',
    replacementRuleOrPack: 'space-before-blocks',
    note: '代码块左花括号前空格可直接约束'
  },
  JS007: {
    mappingStatus: 'direct',
    replacementTool: 'ESLint',
    replacementRuleOrPack: 'keyword-spacing',
    note: '关键字后空格可直接约束'
  },
  JS008: {
    mappingStatus: 'direct',
    replacementTool: 'ESLint',
    replacementRuleOrPack: 'key-spacing',
    note: '对象属性冒号前后空格可直接约束'
  },
  JS009: {
    mappingStatus: 'partial',
    replacementTool: 'ESLint',
    replacementRuleOrPack: 'func-call-spacing + space-before-function-paren',
    note: '函数声明/调用括号空格通过组合规则近似约束'
  },
  JS010: {
    mappingStatus: 'partial',
    replacementTool: 'ESLint',
    replacementRuleOrPack: 'comma-spacing + semi-spacing',
    note: '逗号/分号前后空格通过组合规则近似约束'
  },
  JS011: {
    mappingStatus: 'partial',
    replacementTool: 'ESLint',
    replacementRuleOrPack: 'space-in-parens + array-bracket-spacing',
    note: '圆括号/方括号内空格通过组合规则近似约束'
  },
  JS012: {
    mappingStatus: 'partial',
    replacementTool: 'ESLint',
    replacementRuleOrPack: 'object-curly-spacing + array-bracket-spacing',
    note: '对象/数组字面量内空格通过组合规则近似约束'
  },
  JS013: {
    mappingStatus: 'direct',
    replacementTool: 'ESLint',
    replacementRuleOrPack: 'no-trailing-spaces',
    note: '行尾空格可直接约束'
  },
  JS014: {
    mappingStatus: 'partial',
    replacementTool: 'ESLint',
    replacementRuleOrPack: 'one-statement-per-line',
    note: '语句后换行可由 one-statement-per-line 近似约束'
  },
  JS015: {
    mappingStatus: 'partial',
    replacementTool: 'ESLint',
    replacementRuleOrPack: 'max-len',
    note: '单行最大长度可用 max-len 近似约束'
  },
  JS016: {
    mappingStatus: 'direct',
    replacementTool: 'ESLint',
    replacementRuleOrPack: 'operator-linebreak',
    note: '运算符换行位置可直接约束'
  },
  JS017: {
    mappingStatus: 'partial',
    replacementTool: 'ESLint',
    replacementRuleOrPack: 'comma-style + semi-style',
    note: '逗号/分号换行位置通过组合规则近似约束'
  },
  JS021: {
    mappingStatus: 'direct',
    replacementTool: 'ESLint',
    replacementRuleOrPack: 'semi',
    note: '语句分号可直接约束'
  },
  JS022: {
    mappingStatus: 'direct',
    replacementTool: 'ESLint',
    replacementRuleOrPack: 'curly',
    note: '控制语句块花括号可直接约束'
  },
  JS023: {
    mappingStatus: 'partial',
    replacementTool: 'ESLint',
    replacementRuleOrPack: 'semi + no-extra-semi',
    note: '函数定义尾部分号通过组合规则近似约束'
  },
  JS024: {
    mappingStatus: 'direct',
    replacementTool: 'ESLint',
    replacementRuleOrPack: 'wrap-iife',
    note: 'IIFE 包裹形式可直接约束'
  },
  JS025: {
    mappingStatus: 'direct',
    replacementTool: 'ESLint',
    replacementRuleOrPack: 'camelcase',
    note: '变量命名可直接约束'
  },
  JS026: {
    mappingStatus: 'partial',
    replacementTool: 'ESLint',
    replacementRuleOrPack: 'id-match',
    note: '常量全大写下划线命名可近似约束'
  },
  JS027: {
    mappingStatus: 'direct',
    replacementTool: 'ESLint',
    replacementRuleOrPack: 'camelcase',
    note: '函数命名可直接约束'
  },
  JS028: {
    mappingStatus: 'direct',
    replacementTool: 'ESLint',
    replacementRuleOrPack: 'camelcase',
    note: '函数参数命名可直接约束'
  },
  JS029: {
    mappingStatus: 'partial',
    replacementTool: 'ESLint',
    replacementRuleOrPack: 'new-cap + id-match',
    note: '类 Pascal 命名通过组合规则近似约束'
  },
  JS030: {
    mappingStatus: 'partial',
    replacementTool: 'ESLint',
    replacementRuleOrPack: 'camelcase',
    note: '类方法/属性命名可近似约束'
  },
  JS031: {
    mappingStatus: 'partial',
    replacementTool: 'ESLint(+@typescript-eslint)',
    replacementRuleOrPack: '@typescript-eslint/naming-convention',
    note: '枚举命名依赖 TS 命名规则插件'
  },
  JS032: {
    mappingStatus: 'partial',
    replacementTool: 'ESLint(+@typescript-eslint)',
    replacementRuleOrPack: '@typescript-eslint/naming-convention',
    note: '命名空间命名依赖 TS 命名规则插件'
  },
  JS038: {
    mappingStatus: 'partial',
    replacementTool: 'ESLint',
    replacementRuleOrPack: 'spaced-comment + line-comment-position',
    note: '单行注释格式通过组合规则近似约束'
  },
  JS040: {
    mappingStatus: 'partial',
    replacementTool: 'ESLint(+eslint-plugin-jsdoc)',
    replacementRuleOrPack: 'jsdoc/require-jsdoc',
    note: '文档注释完整性依赖 jsdoc 插件'
  },
  JS041: {
    mappingStatus: 'partial',
    replacementTool: 'ESLint',
    replacementRuleOrPack: 'lines-around-comment',
    note: '注释前空行可近似约束'
  },
  JS043: {
    mappingStatus: 'partial',
    replacementTool: 'ESLint(+eslint-plugin-jsdoc)',
    replacementRuleOrPack: 'jsdoc/check-syntax',
    note: 'JSDoc 类型定义格式依赖 jsdoc 插件'
  },
  JS044: {
    mappingStatus: 'partial',
    replacementTool: 'ESLint(+eslint-plugin-jsdoc)',
    replacementRuleOrPack: 'jsdoc/check-types',
    note: 'JSDoc 基本类型大小写依赖 jsdoc 插件'
  },
  JS050: {
    mappingStatus: 'partial',
    replacementTool: 'ESLint(+eslint-plugin-jsdoc)',
    replacementRuleOrPack: 'jsdoc/check-tag-names',
    note: '@lends 标签语义依赖 jsdoc 插件'
  },
  JS051: {
    mappingStatus: 'partial',
    replacementTool: 'ESLint(+eslint-plugin-jsdoc)',
    replacementRuleOrPack: 'jsdoc/require-access',
    note: '成员可访问性标签依赖 jsdoc 插件'
  },
  JS052: {
    mappingStatus: 'partial',
    replacementTool: 'ESLint(+eslint-plugin-jsdoc)',
    replacementRuleOrPack: 'jsdoc/require-description + jsdoc/require-param + jsdoc/require-returns',
    note: '函数注释完整性依赖 jsdoc 插件'
  },
  JS053: {
    mappingStatus: 'partial',
    replacementTool: 'ESLint(+eslint-plugin-jsdoc)',
    replacementRuleOrPack:
      'jsdoc/require-param-type + jsdoc/require-param-description + jsdoc/require-returns-type + jsdoc/require-returns-description',
    note: '参数/返回值注释细项依赖 jsdoc 插件'
  },
  JS060: {
    mappingStatus: 'partial',
    replacementTool: 'ESLint(+eslint-plugin-jsdoc)',
    replacementRuleOrPack: 'jsdoc/require-tags',
    note: '@const 标签语义依赖 jsdoc 插件'
  },
  JS070: {
    mappingStatus: 'direct',
    replacementTool: 'ESLint',
    replacementRuleOrPack: 'no-use-before-define',
    note: '先定义后使用可直接约束'
  },
  JS071: {
    mappingStatus: 'direct',
    replacementTool: 'ESLint',
    replacementRuleOrPack: 'one-var',
    note: '每个 var 声明一个变量可直接约束'
  },
  JS073: {
    mappingStatus: 'direct',
    replacementTool: 'ESLint',
    replacementRuleOrPack: 'eqeqeq',
    note: '严格相等可直接约束'
  },
  JS086: {
    mappingStatus: 'direct',
    replacementTool: 'ESLint',
    replacementRuleOrPack: 'radix',
    note: 'parseInt 进制可直接约束'
  },
  JS089: {
    mappingStatus: 'direct',
    replacementTool: 'ESLint',
    replacementRuleOrPack: 'quotes',
    note: '单引号字符串可直接约束'
  },
  JS093: {
    mappingStatus: 'direct',
    replacementTool: 'ESLint',
    replacementRuleOrPack: 'no-new-object',
    note: '对象字面量创建可直接约束'
  },
  JS094: {
    mappingStatus: 'direct',
    replacementTool: 'ESLint',
    replacementRuleOrPack: 'quote-props',
    note: '对象属性引号策略可直接约束'
  },
  JS096: {
    mappingStatus: 'direct',
    replacementTool: 'ESLint',
    replacementRuleOrPack: 'no-extend-native',
    note: '禁止扩展原生对象原型可直接约束'
  },
  JS099: {
    mappingStatus: 'direct',
    replacementTool: 'ESLint',
    replacementRuleOrPack: 'no-array-constructor',
    note: '数组字面量创建可直接约束'
  },
  JS100: {
    mappingStatus: 'partial',
    replacementTool: 'ESLint',
    replacementRuleOrPack: 'no-restricted-syntax',
    note: '禁止 for-in 遍历数组需结合 AST 选择器配置'
  },
  JS110: {
    mappingStatus: 'partial',
    replacementTool: 'ESLint',
    replacementRuleOrPack: 'constructor-super + no-this-before-super',
    note: '继承 constructor 合法性通过组合规则近似约束'
  },
  JS116: {
    mappingStatus: 'direct',
    replacementTool: 'ESLint',
    replacementRuleOrPack: 'no-eval',
    note: '禁止直接 eval 可直接约束'
  },
  JS125: {
    mappingStatus: 'partial',
    replacementTool: 'ESLint(+import)',
    replacementRuleOrPack: 'import/no-amd + import/no-dynamic-require',
    note: '模块 id 合规性通过 import 生态规则近似约束'
  },
  JS138: {
    mappingStatus: 'partial',
    replacementTool: 'ESLint(custom)',
    replacementRuleOrPack: 'custom:css-unit-in-js-style-object',
    note: 'JS 内联 style 单位约束需自定义规则'
  }
};
