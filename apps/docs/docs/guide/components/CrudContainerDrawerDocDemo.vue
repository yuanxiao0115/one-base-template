<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElButton, ElDrawer, ElForm, ElFormItem, ElInput, ElInputNumber, ElOption, ElSelect } from 'element-plus'
import 'element-plus/dist/index.css'

const singleVisible = ref(false)
const doubleVisible = ref(false)

const form = reactive({
  orgName: '',
  leader: '',
  phone: '',
  sort: 10,
  status: 1,
  remark: ''
})
</script>

<template>
  <div class="crud-drawer-demo">
    <div class="crud-drawer-demo__actions">
      <el-button type="primary" @click="singleVisible = true">打开单列抽屉</el-button>
      <el-button plain @click="doubleVisible = true">打开双列抽屉</el-button>
    </div>

    <el-drawer
      v-model="singleVisible"
      title="单列抽屉（默认）"
      :size="620"
      append-to-body
      class="crud-drawer-demo__drawer crud-drawer-demo__drawer--columns-1"
    >
      <el-form :model="form" label-width="88px">
        <el-form-item label="组织名称">
          <el-input v-model="form.orgName" placeholder="请输入组织名称" />
        </el-form-item>
        <el-form-item label="负责人">
          <el-input v-model="form.leader" placeholder="请输入负责人" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="1" />
        </el-form-item>
      </el-form>
    </el-drawer>

    <el-drawer
      v-model="doubleVisible"
      title="双列抽屉（drawerColumns=2）"
      :size="720"
      append-to-body
      class="crud-drawer-demo__drawer crud-drawer-demo__drawer--columns-2"
    >
      <el-form :model="form" label-width="88px">
        <el-form-item label="组织名称">
          <el-input v-model="form.orgName" placeholder="请输入组织名称" />
        </el-form-item>
        <el-form-item label="负责人">
          <el-input v-model="form.leader" placeholder="请输入负责人" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status">
            <el-option label="启用" :value="1" />
            <el-option label="停用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" class="ob-crud-container__item--full">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="3"
            placeholder="双列下可用 ob-crud-container__item--full 跨整行"
          />
        </el-form-item>
      </el-form>
    </el-drawer>
  </div>
</template>

<style scoped>
.crud-drawer-demo {
  padding: 16px;
  margin: 16px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
}

.crud-drawer-demo__actions {
  display: flex;
  gap: 12px;
}

.crud-drawer-demo :deep(.crud-drawer-demo__drawer .el-drawer__header) {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  min-height: 48px;
  height: 48px;
  margin-bottom: 0;
  padding: 15px 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.crud-drawer-demo :deep(.crud-drawer-demo__drawer .el-drawer__title) {
  margin: 0;
  color: var(--el-text-color-primary);
  font-family: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  font-size: 18px;
  font-weight: 600;
  line-height: 18px;
}

.crud-drawer-demo :deep(.crud-drawer-demo__drawer .el-drawer__body) {
  display: flex;
  min-height: 0;
  padding: 24px 20px;
}

.crud-drawer-demo :deep(.crud-drawer-demo__drawer .el-form) {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  row-gap: 16px;
  column-gap: 16px;
  width: 100%;
  align-content: flex-start;
}

.crud-drawer-demo :deep(.crud-drawer-demo__drawer .el-form > .el-form-item) {
  margin-bottom: 0;
}

.crud-drawer-demo :deep(.crud-drawer-demo__drawer .el-form-item__label) {
  font-size: 14px;
  line-height: 22px;
}

.crud-drawer-demo :deep(.crud-drawer-demo__drawer--columns-2 .el-form) {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.crud-drawer-demo :deep(.crud-drawer-demo__drawer--columns-2 .ob-crud-container__item--full) {
  grid-column: 1 / -1;
}

@media (max-width: 768px) {
  .crud-drawer-demo__actions {
    flex-direction: column;
  }
}
</style>
