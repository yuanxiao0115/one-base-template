import { mergeWithBaseConfig } from './config-merger';

// 组件配置接口
export interface ComponentConfig {
  id: string;
  type: string;
  cmptName: string;
  cmptWidth: number;
  cmptHeight: number;
  cmptIcon: string;
  cmptConfig: any;
}

/**
 * 创建组件配置的工厂函数
 * @param id 组件ID
 * @param type 组件类型
 * @param name 组件名称
 * @param width 组件宽度
 * @param height 组件高度
 * @param icon 组件图标
 * @param config 组件配置
 * @param baseConfig 基础配置
 * @returns 组件配置对象
 */
export const createComponent = (
  id: string,
  type: string,
  name: string,
  width: number,
  height: number,
  icon: string,
  config: any,
  baseConfig?: any
): ComponentConfig => {
  // 如果提供了基础配置，就合并配置
  const finalConfig = baseConfig
    ? mergeWithBaseConfig(config, baseConfig)
    : config;

  return {
    id,
    type,
    cmptName: name,
    cmptWidth: width,
    cmptHeight: height,
    cmptIcon: icon,
    cmptConfig: finalConfig
  };
};

/**
 * 创建一组组件配置
 * @param components 组件参数数组
 * @param baseConfig 基础配置
 * @returns 组件配置数组
 */
export const createComponentGroup = (
  components: Array<{
    id: string;
    type: string;
    name: string;
    width: number;
    height: number;
    icon: string;
    config: any;
  }>,
  baseConfig?: any
): ComponentConfig[] => {
  return components.map(comp =>
    createComponent(
      comp.id,
      comp.type,
      comp.name,
      comp.width,
      comp.height,
      comp.icon,
      comp.config,
      baseConfig
    )
  );
};
