import assert from 'node:assert/strict';
import path from 'node:path';
import stylelint from 'stylelint';

const ROOT_DIR = path.resolve(new URL('..', import.meta.url).pathname);
const CUSTOM_RULE_PLUGIN = path.join(ROOT_DIR, 'rules', 'stylelint', 'csslint-compat-rules.mjs');

const RULES = {
  css036: 'ob-csslint/css036-font-family-case-consistent',
  css037: 'ob-csslint/css037-min-font-size',
  css041: 'ob-csslint/css041-require-transition-property',
  css046: 'ob-csslint/css046-vendor-prefix-order'
};

async function lintCode(code, ruleName, ruleValue = true) {
  const result = await stylelint.lint({
    code,
    codeFilename: path.join(ROOT_DIR, 'tmp', 'verify-custom-csslint-rules.css'),
    config: {
      plugins: [CUSTOM_RULE_PLUGIN],
      rules: {
        [ruleName]: ruleValue
      }
    }
  });
  return result.results[0]?.warnings ?? [];
}

function hasRuleWarning(warnings, ruleName) {
  return warnings.some((warning) => warning.rule === ruleName);
}

async function expectRuleTriggered(ruleName, code, ruleValue = true) {
  const warnings = await lintCode(code, ruleName, ruleValue);
  assert.equal(
    hasRuleWarning(warnings, ruleName),
    true,
    `期望触发规则 ${ruleName}，实际 warnings=${JSON.stringify(warnings, null, 2)}`
  );
}

async function expectRuleNotTriggered(ruleName, code, ruleValue = true) {
  const warnings = await lintCode(code, ruleName, ruleValue);
  assert.equal(
    hasRuleWarning(warnings, ruleName),
    false,
    `期望不触发规则 ${ruleName}，实际 warnings=${JSON.stringify(warnings, null, 2)}`
  );
}

async function main() {
  await expectRuleTriggered(
    RULES.css036,
    `
.a {
  font-family: "Microsoft YaHei", sans-serif;
}
.b {
  font-family: "microsoft yahei", sans-serif;
}
`
  );

  await expectRuleNotTriggered(
    RULES.css036,
    `
.a {
  font-family: "Microsoft YaHei", sans-serif;
}
.b {
  font-family: "Microsoft YaHei", sans-serif;
}
`
  );

  await expectRuleTriggered(
    RULES.css037,
    `
.a {
  font-size: 10px;
}
`,
    [true, { minPx: 12, rootFontSize: 16, ignoreZero: true }]
  );

  await expectRuleNotTriggered(
    RULES.css037,
    `
.a {
  font-size: 12px;
}
`,
    [true, { minPx: 12, rootFontSize: 16, ignoreZero: true }]
  );

  await expectRuleTriggered(
    RULES.css041,
    `
.a {
  transition-duration: 0.2s;
}
`
  );

  await expectRuleNotTriggered(
    RULES.css041,
    `
.a {
  transition-property: opacity;
  transition-duration: 0.2s;
}
`
  );

  await expectRuleTriggered(
    RULES.css046,
    `
.a {
  transform: translateX(0);
  -webkit-transform: translateX(0);
}
`
  );

  await expectRuleNotTriggered(
    RULES.css046,
    `
.a {
  -webkit-transform: translateX(0);
  transform: translateX(0);
}
`
  );

  console.log('自定义 Csslint 兼容规则验证通过。');
}

main().catch((error) => {
  console.error('自定义 Csslint 兼容规则验证失败：');
  console.error(error);
  process.exit(1);
});
