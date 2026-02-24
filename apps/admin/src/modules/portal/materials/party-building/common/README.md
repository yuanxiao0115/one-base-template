# useSchemaConfig Hooks 使用指南

`useSchemaConfig` 是一个用于管理多个子组件数据与schema同步的通用hooks。当你需要处理具有多个子配置部分的复杂组件时，这个hooks可以帮助你简化数据管理和同步。

## 基本用法

```typescript
import { useSchemaConfig } from "../../../hooks/useSchemaConfig";

// 定义你的数据类型
interface TitleConfig {
  title: string;
  showMore: boolean;
}

interface LayoutConfig {
  layout: string;
  contentGap: number;
}

// 定义整体数据类型
interface ComponentData {
  title: TitleConfig;
  layout: LayoutConfig;
}

// 使用hooks
const { sectionData, contentData, updateSchema } =
  useSchemaConfig<ComponentData>({
    name: "your-component-name",
    sections: {
      title: {
        defaultValue: {
          title: "",
          showMore: false
        }
      },
      layout: {
        defaultValue: {
          layout: "default",
          contentGap: 16
        }
      }
    },
    schema: props.schema, // 传入的初始schema
    onChange: newSchema => {
      // 当任何子组件数据变化时，这里会收到更新后的完整schema
      emit("schemaChange", newSchema);
    }
  });

// 然后在模板中直接使用
// <TitleConfig v-model="sectionData.title" />
// <LayoutConfig v-model="sectionData.layout" />
```

## 特性

1. **自动数据同步**：子组件数据变化会自动合并到完整schema
2. **类型安全**：支持TypeScript泛型，提供类型安全的数据访问
3. **便捷绑定**：返回的`sectionData`可以直接用于v-model绑定
4. **深度监听**：自动监听嵌套对象的变化，包括子对象中的属性变更
5. **默认值支持**：为每个section提供默认值
6. **统一事件**：所有变化通过单一回调函数通知

## 数据更新流程

1. **子组件内部属性变化**：如`sectionData.title.title = "新标题"`

   - hooks内部的深度监听会检测到这一变化
   - 自动将变化同步到contentData
   - 触发onChange回调通知父组件

2. **整个对象变化**：如`sectionData.title = { title: "新标题", ... }`

   - 通过Object.defineProperty的setter捕获变化
   - 自动将变化同步到contentData
   - 触发onChange回调通知父组件

3. **父组件schema变化**：
   - hooks监听schema变化
   - 更新所有子组件数据
   - 不会触发onChange回调，避免循环更新

## 适用场景

- 配置页面组件
- 表单拆分为多个子组件时
- 需要将大型表单拆分为更小、更易管理的部分
- 需要在多个子组件间共享和同步数据

## 注意事项

1. 每个子组件的数据必须是对象类型
2. 所有变更会在`nextTick`后触发onChange回调
3. 返回的`contentData`是只读的，不应直接修改
4. 当有多层组件嵌套时，要确保事件正确传递
