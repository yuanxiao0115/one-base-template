<template>
  <el-collapse-item title="列表样式" name="list">
    <el-form-item label="标题颜色">
      <div class="form-item-with-tip">
        <el-color-picker v-model="modelValue.titleColor" show-alpha />
        <div class="form-tip">列表标题文字颜色</div>
      </div>
    </el-form-item>

    <el-form-item label="标题悬停颜色">
      <div class="form-item-with-tip">
        <el-color-picker v-model="modelValue.titleHoverColor" show-alpha />
        <div class="form-tip">鼠标悬停时的标题颜色</div>
      </div>
    </el-form-item>

    <el-form-item label="标题字体大小">
      <div class="form-item-with-tip">
        <div class="input-with-unit">
          <el-input-number
            v-model="modelValue.titleFontSize"
            :min="12"
            :max="28"
            controls-position="right"
          >
            <template #suffix>
              <span class="suffix-unit">px</span>
            </template>
          </el-input-number>
        </div>
        <div class="form-tip">设置标题字体大小</div>
      </div>
    </el-form-item>

    <el-form-item label="标题字体粗细">
      <div class="form-item-with-tip">
        <el-select v-model="modelValue.titleFontWeight">
          <el-option label="常规" value="normal" />
          <el-option label="加粗" value="bold" />
          <el-option label="更粗" value="bolder" />
          <el-option label="较细" value="lighter" />
        </el-select>
        <div class="form-tip">设置标题字体粗细</div>
      </div>
    </el-form-item>

    <el-divider content-position="left">日期样式</el-divider>

    <el-form-item label="日期颜色">
      <div class="form-item-with-tip">
        <el-color-picker v-model="modelValue.dateColor" show-alpha />
        <div class="form-tip">发布时间文字颜色</div>
      </div>
    </el-form-item>

    <el-form-item label="日期字体大小">
      <div class="form-item-with-tip">
        <div class="input-with-unit">
          <el-input-number
            v-model="modelValue.dateFontSize"
            :min="10"
            :max="20"
            controls-position="right"
          >
            <template #suffix>
              <span class="suffix-unit">px</span>
            </template>
          </el-input-number>
        </div>
        <div class="form-tip">发布时间字体大小</div>
      </div>
    </el-form-item>

    <el-divider content-position="left">圆点样式</el-divider>

    <el-form-item label="圆点颜色">
      <div class="form-item-with-tip">
        <el-color-picker v-model="modelValue.dotColor" show-alpha />
        <div class="form-tip">列表圆点颜色</div>
      </div>
    </el-form-item>

    <el-form-item label="圆点大小">
      <div class="form-item-with-tip">
        <div class="input-with-unit">
          <el-input-number
            v-model="modelValue.dotSize"
            :min="2"
            :max="12"
            controls-position="right"
          >
            <template #suffix>
              <span class="suffix-unit">px</span>
            </template>
          </el-input-number>
        </div>
        <div class="form-tip">圆点直径</div>
      </div>
    </el-form-item>

    <el-form-item label="圆点间距">
      <div class="form-item-with-tip">
        <div class="input-with-unit">
          <el-input-number
            v-model="modelValue.dotGap"
            :min="2"
            :max="20"
            controls-position="right"
          >
            <template #suffix>
              <span class="suffix-unit">px</span>
            </template>
          </el-input-number>
        </div>
        <div class="form-tip">圆点与文字间距</div>
      </div>
    </el-form-item>

    <el-divider content-position="left">分割线</el-divider>

    <el-form-item label="分割线颜色">
      <div class="form-item-with-tip">
        <el-color-picker v-model="modelValue.rowDividerColor" show-alpha />
        <div class="form-tip">列表项分割线颜色</div>
      </div>
    </el-form-item>

    <el-form-item label="分割线样式">
      <el-select v-model="modelValue.rowDividerStyle">
        <el-option label="无" value="none" />
        <el-option label="实线" value="solid" />
        <el-option label="虚线" value="dashed" />
        <el-option label="点线" value="dotted" />
      </el-select>
    </el-form-item>

    <el-form-item label="分割线粗细">
      <div class="input-with-unit">
        <el-input-number
          v-model="modelValue.rowDividerWidth"
          :min="0"
          :max="4"
          controls-position="right"
        >
          <template #suffix>
            <span class="suffix-unit">px</span>
          </template>
        </el-input-number>
      </div>
    </el-form-item>

    <el-form-item label="行间距">
      <div class="input-with-unit">
        <el-input-number
          v-model="modelValue.rowPaddingY"
          :min="0"
          :max="20"
          controls-position="right"
        >
          <template #suffix>
            <span class="suffix-unit">px</span>
          </template>
        </el-input-number>
      </div>
    </el-form-item>

    <el-divider content-position="left">图片样式</el-divider>

    <el-form-item label="图片宽度">
      <div class="form-item-with-tip">
        <div class="input-with-unit">
          <el-input-number
            v-model="modelValue.imageWidth"
            :min="60"
            :max="300"
            controls-position="right"
          >
            <template #suffix>
              <span class="suffix-unit">px</span>
            </template>
          </el-input-number>
        </div>
        <div class="form-tip">仅图文列表生效</div>
      </div>
    </el-form-item>

    <el-form-item label="图片高度">
      <div class="form-item-with-tip">
        <div class="input-with-unit">
          <el-input-number
            v-model="modelValue.imageHeight"
            :min="40"
            :max="200"
            controls-position="right"
          >
            <template #suffix>
              <span class="suffix-unit">px</span>
            </template>
          </el-input-number>
        </div>
        <div class="form-tip">仅图文列表生效</div>
      </div>
    </el-form-item>

    <el-form-item label="图片圆角">
      <div class="form-item-with-tip">
        <div class="input-with-unit">
          <el-input-number
            v-model="modelValue.imageBorderRadius"
            :min="0"
            :max="20"
            controls-position="right"
          >
            <template #suffix>
              <span class="suffix-unit">px</span>
            </template>
          </el-input-number>
        </div>
        <div class="form-tip">仅图文列表生效</div>
      </div>
    </el-form-item>
  </el-collapse-item>
</template>

<script setup lang="ts">
import type { ListStyleModelType } from './types';

const modelValue = defineModel<ListStyleModelType>({
  default: () => ({
    titleColor: '#303133',
    titleHoverColor: '#0f79e9',
    titleFontSize: 14,
    titleFontWeight: 'normal',
    dateColor: '#909399',
    dateFontSize: 12,
    dotColor: '#0f79e9',
    dotSize: 6,
    dotGap: 8,
    rowDividerColor: 'rgba(0, 0, 0, 0.06)',
    rowDividerStyle: 'solid',
    rowDividerWidth: 1,
    rowPaddingY: 8,
    imageWidth: 80,
    imageHeight: 55,
    imageBorderRadius: 4
  })
});

defineOptions({
  name: 'pb-list-style-config'
});
</script>

<style scoped>
:deep(.el-divider__text) {
  font-weight: 600;
  color: var(--config-text, #0f172a);
  letter-spacing: 0.2px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: var(--config-muted, #64748b);
}

.form-item-with-tip {
  display: flex;
  flex-direction: column;
}

.form-tip {
  margin-top: 5px;
  font-size: 12px;
  color: var(--config-muted, #909399);
  line-height: 1.4;
}

.input-with-unit {
  display: flex;
  align-items: center;
  margin-right: 10px;
}

.suffix-unit {
  margin-right: 8px;
  font-size: 14px;
  color: var(--config-muted, #909399);
}
</style>
