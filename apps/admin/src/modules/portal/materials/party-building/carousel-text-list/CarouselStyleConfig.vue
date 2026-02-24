<template>
  <el-collapse-item title="轮播图样式" name="carousel">
    <el-form-item label="轮播图宽度">
      <div class="form-item-with-tip">
        <div class="input-with-unit">
          <el-input-number
            v-model="modelValue.width"
            :min="100"
            :max="1200"
            controls-position="right"
          >
            <template #suffix>
              <span class="suffix-unit">px</span>
            </template>
          </el-input-number>
        </div>
        <div class="form-tip">设置轮播图的宽度</div>
      </div>
    </el-form-item>

    <el-form-item label="轮播图高度">
      <div class="form-item-with-tip">
        <div class="input-with-unit">
          <el-input-number
            v-model="modelValue.height"
            :min="100"
            :max="500"
            controls-position="right"
          >
            <template #suffix>
              <span class="suffix-unit">px</span>
            </template>
          </el-input-number>
        </div>
        <div class="form-tip">设置轮播图的高度</div>
      </div>
    </el-form-item>

    <el-form-item label="指示器颜色">
      <div class="form-item-with-tip">
        <el-color-picker v-model="modelValue.indicatorColor" show-alpha />
        <div class="form-tip">设置指示器的颜色</div>
      </div>
    </el-form-item>

    <el-form-item label="箭头颜色">
      <div class="form-item-with-tip">
        <el-color-picker v-model="modelValue.arrowColor" show-alpha />
        <div class="form-tip">设置箭头的颜色</div>
      </div>
    </el-form-item>

    <el-form-item label="图片填充方式">
      <div class="form-item-with-tip">
        <el-select v-model="modelValue.imageFit">
          <el-option label="填充(fill)" value="fill" />
          <el-option label="包含(contain)" value="contain" />
          <el-option label="覆盖(cover)" value="cover" />
          <el-option label="无缩放(none)" value="none" />
          <el-option label="缩小(scale-down)" value="scale-down" />
        </el-select>
        <div class="form-tip">设置图片的填充方式</div>
      </div>
    </el-form-item>

    <el-form-item label="标题显示">
      <div class="form-item-with-tip">
        <el-switch
          v-model="modelValue.showTitle"
          :active-value="true"
          :inactive-value="false"
        />
        <div class="form-tip">是否显示轮播图标题</div>
      </div>
    </el-form-item>

    <template v-if="modelValue.showTitle">
      <el-form-item label="标题背景色">
        <div class="form-item-with-tip">
          <el-color-picker v-model="modelValue.titleBackground" show-alpha />
          <div class="form-tip">设置标题背景颜色</div>
        </div>
      </el-form-item>

      <el-form-item label="标题文字颜色">
        <div class="form-item-with-tip">
          <el-color-picker v-model="modelValue.titleColor" show-alpha />
          <div class="form-tip">设置标题文字颜色</div>
        </div>
      </el-form-item>

      <el-form-item label="页码颜色">
        <div class="form-item-with-tip">
          <el-color-picker v-model="modelValue.pageIndicatorColor" show-alpha />
          <div class="form-tip">设置页码指示器的颜色</div>
        </div>
      </el-form-item>

      <el-form-item label="标题字体大小">
        <div class="form-item-with-tip">
          <div class="input-with-unit">
            <el-input-number
              v-model="modelValue.titleFontSize"
              :min="12"
              :max="24"
              controls-position="right"
            >
              <template #suffix>
                <span class="suffix-unit">px</span>
              </template>
            </el-input-number>
          </div>
          <div class="form-tip">设置标题的字体大小</div>
        </div>
      </el-form-item>
    </template>

    <el-form-item label="圆角">
      <div class="form-item-with-tip">
        <div class="input-with-unit">
          <el-input-number
            v-model="modelValue.borderRadius"
            :min="0"
            :max="20"
            controls-position="right"
          >
            <template #suffix>
              <span class="suffix-unit">px</span>
            </template>
          </el-input-number>
        </div>
        <div class="form-tip">设置轮播图圆角大小</div>
      </div>
    </el-form-item>
  </el-collapse-item>
</template>

<script setup lang="ts">
// 类型定义
export interface CarouselStyleModelType {
  width: number;
  height: number;
  indicatorColor: string;
  arrowColor: string;
  imageFit: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down';
  showTitle: boolean;
  titleBackground: string;
  titleColor: string;
  titleFontSize: number;
  borderRadius: number;
  pageIndicatorColor: string;
}

// 使用defineModel
const modelValue = defineModel<CarouselStyleModelType>({
  default: () => ({
    width: 400,
    height: 200,
    indicatorColor: 'rgba(255, 255, 255, 0.7)',
    arrowColor: 'rgba(255, 255, 255, 0.7)',
    imageFit: 'cover',
    showTitle: true,
    titleBackground: 'rgba(0, 0, 0, 0.5)',
    titleColor: '#ffffff',
    titleFontSize: 16,
    borderRadius: 4,
    pageIndicatorColor: '#FFE97C'
  })
});

// 组件名称定义
defineOptions({
  name: 'pb-carousel-style-config'
});
</script>

<style scoped>
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
