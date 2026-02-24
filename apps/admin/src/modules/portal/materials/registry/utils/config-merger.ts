/**
 * 深度合并对象的辅助函数
 * @param target 目标对象
 * @param source 源对象
 * @returns 合并后的对象
 */
export const mergeDeep = (target: any, source: any): any => {
  const isObject = (obj: any) => obj && typeof obj === 'object' && !Array.isArray(obj);

  if (!isObject(target) || !isObject(source)) {
    return source;
  }

  const output = { ...target };

  Object.keys(source).forEach(key => {
    if (isObject(source[key])) {
      if (!(key in target)) {
        output[key] = source[key];
      } else {
        output[key] = mergeDeep(target[key], source[key]);
      }
    } else {
      output[key] = source[key];
    }
  });

  return output;
};

/**
 * 将基础配置与组件特定配置合并
 * @param componentConfig 组件特定配置
 * @param baseConfig 基础配置
 * @returns 合并后的配置
 */
export const mergeWithBaseConfig = (
  componentConfig: any,
  baseConfig: any
): any => {
  if (!baseConfig) return componentConfig;

  const result = { ...componentConfig };

  // 合并content部分的配置
  if (result.content) {
    // 复制title配置
    if (baseConfig.title && !result.content.title) {
      result.content.title = { ...baseConfig.title };
    }
  }

  // 合并style部分的配置
  if (result.style) {
    // 复制标题样式
    if (baseConfig.titleStyle && !result.style.title) {
      result.style.title = { ...baseConfig.titleStyle };
    }

    // 复制容器样式
    if (baseConfig.container && !result.style.container) {
      result.style.container = { ...baseConfig.container };
    }
  }

  return result;
};

/**
 * 批量合并组件配置
 * @param configMap 配置映射对象，键为组件ID，值为组件配置
 * @param baseConfig 基础配置
 * @returns 合并后的配置映射对象
 */
export const batchMergeConfigs = (
  configMap: Record<string, any>,
  baseConfig: any
): Record<string, any> => {
  const result: Record<string, any> = {};

  Object.keys(configMap).forEach(key => {
    result[key] = mergeWithBaseConfig(configMap[key], baseConfig);
  });

  return result;
};
