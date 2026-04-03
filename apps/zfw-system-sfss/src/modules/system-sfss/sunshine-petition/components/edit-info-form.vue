<script setup lang="ts">
import { ref, onMounted } from "vue";
import { petitionApi } from "../api";

const props = defineProps<{
  mode?: unknown;
  isJing?: boolean;
  disabled?: boolean;
}>();

const typeData = ref([]);
const countyData = ref([]);
const submitForm = defineModel();
const formRef = ref();
const treeSelectRef = ref();

defineExpose({
  formRef
});

const xianChange = val => {
  const current = countyData.value.find(item => item.code === val);
  submitForm.value.DISTRICT_NAME = current?.name || "";
};

const getType = val => {
  const node = treeSelectRef.value?.getCurrentNode(val);
  submitForm.value.TYPE = node?.WHOLE_NAME || "";
};

onMounted(async () => {
  const res: response = await petitionApi.districtList("130100000000");
  countyData.value = res.data;
  const treeRes: response = await petitionApi.tree();
  typeData.value = treeRes.data;
});

const rules = {
  NAME: [{ required: true, message: "请输入姓名", trigger: "blur" }],
  PHONE_NUM: [{ required: true, message: "请输入电话", trigger: "blur" }],
  IDCARD_NUM: [{ required: true, message: "请输入身份证号", trigger: "blur" }]
};
</script>

<template>
  <div>
    <el-form
      ref="formRef"
      :rules="rules"
      label-position="top"
      :model="submitForm"
      :disabled="props.disabled"
      class="search-form bg-bg_color w-[99/100] !p-[0px]"
    >
      <el-row :gutter="32">
        <el-col :span="12">
          <el-form-item label="姓名" prop="NAME">
            <el-input
              v-model="submitForm.NAME"
              placeholder="请输入姓名"
              clearable
              class="!w-[360px]"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="身份证号" prop="IDCARD_NUM">
            <el-input
              v-model="submitForm.IDCARD_NUM"
              placeholder="请输入身份证号"
              clearable
              class="!w-[360px]"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="手机号" prop="PHONE_NUM">
            <el-input
              v-model="submitForm.PHONE_NUM"
              placeholder="请输入手机号"
              clearable
              class="!w-[360px]"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="住址" prop="ADDRESS">
            <el-input
              v-model="submitForm.ADDRESS"
              placeholder="请输入住址"
              clearable
              class="!w-[360px]"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="区县" prop="DISTRICT_CODE">
            <el-select
              v-model="submitForm.DISTRICT_CODE"
              placeholder="请选择区县"
              clearable
              class="!w-[360px]"
              @change="xianChange"
            >
              <el-option
                v-for="(item, index) in countyData"
                :key="index"
                :label="item.name"
                :value="item.code"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col v-if="!isJing" :span="12">
          <el-form-item label="责任单位" prop="RESPONSIBLE_DEPT">
            <el-input
              v-model="submitForm.RESPONSIBLE_DEPT"
              placeholder="请输入责任单位"
              clearable
              class="!w-[360px]"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="责任单位(乡镇)" prop="TOWN">
            <el-input
              v-model="submitForm.TOWN"
              placeholder="请输入责任单位(乡镇)"
              clearable
              class="!w-[360px]"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="初件/重件" prop="OCCURRENCE_TYPE">
            <el-select
              v-model="submitForm.OCCURRENCE_TYPE"
              placeholder="请选择"
              clearable
            >
              <el-option label="初件" value="初件" />
              <el-option label="重件" value="重件" />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="信访日期" prop="DATE">
            <el-date-picker
              v-model="submitForm.DATE"
              value-format="YYYY-MM-DD"
              format="YYYY-MM-DD"
              type="date"
              class="!w-[360px]"
              placeholder="请选择信访日期"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="信访类别" prop="TYPE_ID">
            <el-tree-select
              ref="treeSelectRef"
              v-model="submitForm.TYPE_ID"
              :data="typeData"
              :render-after-expand="false"
              :props="{ label: 'NAME', value: 'ID' }"
              node-key="ID"
              clearable
              @change="getType"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="信访人数" prop="PERSON_COUNT">
            <el-input
              v-model="submitForm.PERSON_COUNT"
              placeholder="请输入信访人数"
              clearable
              class="!w-[360px]"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="诉求" prop="APPEAL">
            <el-input
              v-model="submitForm.APPEAL"
              placeholder="请输入诉求"
              type="textarea"
              clearable
              maxlength="500"
              :rows="3"
              class="!w-[100%]"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="备注" prop="REMARK">
            <el-input
              v-model="submitForm.REMARK"
              placeholder="请输入备注"
              type="textarea"
              clearable
              maxlength="500"
              :rows="3"
              class="!w-[100%]"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>
