import stylelint from 'stylelint';
import valueParser from 'postcss-value-parser';

const { createPlugin, utils } = stylelint;

const CSS036_RULE_NAME = 'ob-csslint/css036-font-family-case-consistent';
const CSS037_RULE_NAME = 'ob-csslint/css037-min-font-size';
const CSS041_RULE_NAME = 'ob-csslint/css041-require-transition-property';
const CSS046_RULE_NAME = 'ob-csslint/css046-vendor-prefix-order';

const CSS036_MESSAGES = utils.ruleMessages(CSS036_RULE_NAME, {
  rejected: (current, canonical) => `字体名大小写不一致：${current}，请统一为 ${canonical}`
});

const CSS037_MESSAGES = utils.ruleMessages(CSS037_RULE_NAME, {
  rejected: (actualPx, minPx) => `font-size 不能小于 ${minPx}px，当前约为 ${actualPx}px`
});

const CSS041_MESSAGES = utils.ruleMessages(CSS041_RULE_NAME, {
  rejected: '存在 transition-* 声明时，必须同时声明 transition 或 transition-property'
});

const CSS046_MESSAGES = utils.ruleMessages(CSS046_RULE_NAME, {
  rejected:
    '私有前缀属性顺序不正确，建议按 -webkit- / -moz- / -ms- / -o- / 无前缀 的顺序声明',
  missingFallback: (propertyName) => `存在私有前缀属性 ${propertyName} 时，必须同时声明无前缀兜底属性`
});

const GENERIC_FONT_FAMILIES = new Set([
  'serif',
  'sans-serif',
  'monospace',
  'cursive',
  'fantasy',
  'system-ui',
  'ui-serif',
  'ui-sans-serif',
  'ui-monospace',
  'ui-rounded',
  'math',
  'emoji',
  'fangsong'
]);

const TRANSITION_HELPER_PROPS = new Set([
  'transition-duration',
  'transition-delay',
  'transition-timing-function'
]);

const PREFIX_ORDER = ['-webkit-', '-moz-', '-ms-', '-o-', ''];
const PREFIX_RANK_MAP = new Map(PREFIX_ORDER.map((prefix, index) => [prefix, index]));

function stripWrappingQuotes(value) {
  if (value.length < 2) {
    return value;
  }
  const first = value[0];
  const last = value[value.length - 1];
  if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
    return value.slice(1, -1);
  }
  return value;
}

function collectFontFamilies(value) {
  const parsed = valueParser(value);
  const families = [];
  let buffer = '';

  for (const node of parsed.nodes) {
    if (node.type === 'div' && node.value === ',') {
      if (buffer.trim()) {
        families.push(buffer.trim());
      }
      buffer = '';
      continue;
    }
    buffer += valueParser.stringify(node);
  }

  if (buffer.trim()) {
    families.push(buffer.trim());
  }

  return families.map((family) => stripWrappingQuotes(family.trim())).filter(Boolean);
}

function isDynamicFontFamilyValue(rawFamily) {
  const normalized = rawFamily.toLowerCase();
  return (
    normalized.includes('var(') ||
    normalized.includes('env(') ||
    normalized.includes('calc(') ||
    normalized.startsWith('$') ||
    normalized.startsWith('--')
  );
}

function parseFontSizeToPx(rawValue, rootFontSize) {
  const normalized = rawValue.trim().toLowerCase();

  if (
    normalized.includes('var(') ||
    normalized.includes('calc(') ||
    normalized.includes('clamp(') ||
    normalized.includes('min(') ||
    normalized.includes('max(')
  ) {
    return null;
  }

  const unit = ['px', 'rem', 'em', '%'].find((item) => normalized.endsWith(item));
  if (!unit) {
    return null;
  }

  const numericPart = normalized.slice(0, normalized.length - unit.length).trim();
  if (!numericPart) {
    return null;
  }

  const value = Number(numericPart);
  if (!Number.isFinite(value)) {
    return null;
  }

  if (unit === 'px') {
    return value;
  }
  if (unit === 'rem' || unit === 'em') {
    return value * rootFontSize;
  }
  if (unit === '%') {
    return (value / 100) * rootFontSize;
  }
  return null;
}

function parseVendorProperty(prop) {
  const normalized = prop.toLowerCase();

  if (normalized.startsWith('--')) {
    return null;
  }

  for (const prefix of PREFIX_ORDER.slice(0, -1)) {
    if (normalized.startsWith(prefix)) {
      return {
        base: normalized.slice(prefix.length),
        rank: PREFIX_RANK_MAP.get(prefix)
      };
    }
  }

  return {
    base: normalized,
    rank: PREFIX_RANK_MAP.get('')
  };
}

const css036Rule = (primary, secondaryOptions = {}) => {
  return (root, result) => {
    const valid = utils.validateOptions(result, CSS036_RULE_NAME, {
      actual: primary,
      possible: [true]
    });
    if (!valid) {
      return;
    }

    const firstCaseMap = new Map();
    const ignoreDynamicValues = secondaryOptions.ignoreDynamicValues !== false;

    root.walkDecls(/^font-family$/i, (decl) => {
      const families = collectFontFamilies(decl.value);
      for (const family of families) {
        if (ignoreDynamicValues && isDynamicFontFamilyValue(family)) {
          continue;
        }
        const familyKey = family.toLowerCase();
        if (GENERIC_FONT_FAMILIES.has(familyKey)) {
          continue;
        }
        const firstCase = firstCaseMap.get(familyKey);
        if (!firstCase) {
          firstCaseMap.set(familyKey, family);
          continue;
        }
        if (firstCase !== family) {
          utils.report({
            result,
            ruleName: CSS036_RULE_NAME,
            message: CSS036_MESSAGES.rejected(family, firstCase),
            node: decl
          });
        }
      }
    });
  };
};

css036Rule.ruleName = CSS036_RULE_NAME;
css036Rule.messages = CSS036_MESSAGES;

const css037Rule = (primary, secondaryOptions = {}) => {
  return (root, result) => {
    const valid = utils.validateOptions(result, CSS037_RULE_NAME, {
      actual: primary,
      possible: [true]
    });
    if (!valid) {
      return;
    }

    const minPx = Number.isFinite(Number(secondaryOptions.minPx))
      ? Number(secondaryOptions.minPx)
      : 12;
    const rootFontSize = Number.isFinite(Number(secondaryOptions.rootFontSize))
      ? Number(secondaryOptions.rootFontSize)
      : 16;
    const ignoreZero = secondaryOptions.ignoreZero !== false;

    root.walkDecls(/^font-size$/i, (decl) => {
      const px = parseFontSizeToPx(decl.value, rootFontSize);
      if (px === null) {
        return;
      }
      if (ignoreZero && px === 0) {
        return;
      }
      if (px < minPx) {
        utils.report({
          result,
          ruleName: CSS037_RULE_NAME,
          message: CSS037_MESSAGES.rejected(px, minPx),
          node: decl
        });
      }
    });
  };
};

css037Rule.ruleName = CSS037_RULE_NAME;
css037Rule.messages = CSS037_MESSAGES;

const css041Rule = (primary) => {
  return (root, result) => {
    const valid = utils.validateOptions(result, CSS041_RULE_NAME, {
      actual: primary,
      possible: [true]
    });
    if (!valid) {
      return;
    }

    root.walkRules((ruleNode) => {
      let hasTransition = false;
      let hasTransitionProperty = false;
      const transitionHelperDecls = [];

      ruleNode.walkDecls((decl) => {
        const prop = decl.prop.toLowerCase();
        if (prop === 'transition') {
          hasTransition = true;
          return;
        }
        if (prop === 'transition-property') {
          hasTransitionProperty = true;
          return;
        }
        if (TRANSITION_HELPER_PROPS.has(prop)) {
          transitionHelperDecls.push(decl);
        }
      });

      if (hasTransition || hasTransitionProperty || transitionHelperDecls.length === 0) {
        return;
      }

      for (const decl of transitionHelperDecls) {
        utils.report({
          result,
          ruleName: CSS041_RULE_NAME,
          message: CSS041_MESSAGES.rejected,
          node: decl
        });
      }
    });
  };
};

css041Rule.ruleName = CSS041_RULE_NAME;
css041Rule.messages = CSS041_MESSAGES;

const css046Rule = (primary, secondaryOptions = {}) => {
  return (root, result) => {
    const valid = utils.validateOptions(result, CSS046_RULE_NAME, {
      actual: primary,
      possible: [true]
    });
    if (!valid) {
      return;
    }

    const requireUnprefixedFallback = secondaryOptions.requireUnprefixedFallback === true;

    root.walkRules((ruleNode) => {
      const lastRankByBase = new Map();
      const vendorUsageByBase = new Map();

      ruleNode.walkDecls((decl) => {
        const parsed = parseVendorProperty(decl.prop);
        if (!parsed) {
          return;
        }

        const usage = vendorUsageByBase.get(parsed.base) ?? {
          hasPrefixed: false,
          hasUnprefixed: false,
          lastNode: decl
        };
        if (parsed.rank === PREFIX_RANK_MAP.get('')) {
          usage.hasUnprefixed = true;
        } else {
          usage.hasPrefixed = true;
        }
        usage.lastNode = decl;
        vendorUsageByBase.set(parsed.base, usage);

        const previousRank = lastRankByBase.get(parsed.base);
        if (previousRank !== undefined && parsed.rank < previousRank) {
          utils.report({
            result,
            ruleName: CSS046_RULE_NAME,
            message: CSS046_MESSAGES.rejected,
            node: decl
          });
        }
        lastRankByBase.set(parsed.base, parsed.rank);
      });

      if (!requireUnprefixedFallback) {
        return;
      }

      for (const [base, usage] of vendorUsageByBase.entries()) {
        if (usage.hasPrefixed && !usage.hasUnprefixed) {
          utils.report({
            result,
            ruleName: CSS046_RULE_NAME,
            message: CSS046_MESSAGES.missingFallback(base),
            node: usage.lastNode
          });
        }
      }
    });
  };
};

css046Rule.ruleName = CSS046_RULE_NAME;
css046Rule.messages = CSS046_MESSAGES;

export default [
  createPlugin(CSS036_RULE_NAME, css036Rule),
  createPlugin(CSS037_RULE_NAME, css037Rule),
  createPlugin(CSS041_RULE_NAME, css041Rule),
  createPlugin(CSS046_RULE_NAME, css046Rule)
];
