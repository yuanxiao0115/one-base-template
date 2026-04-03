<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Close } from "@element-plus/icons-vue";
import { jcApi } from "./api";
const props = defineProps({
  mode: Object
});

const countyData = ref([]);
const submitForm = defineModel();
const formRef = ref();
defineExpose({
  formRef
});
onMounted(async () => {
  const res: response = await jcApi.districtList("130100000000");
  countyData.value = res.data;
});
const rules = {
  LX: [{ required: true, message: "请输入类型", trigger: "blur" }],
  RQ: [{ required: true, message: "请选择日期", trigger: "change" }],
  XFSQ: [{ required: true, message: "请输入信访诉求", trigger: "blur" }]
};
const addPerson = async () => {
  submitForm.value.PERSONLIST.push({
    NAME: "",
    IDCARD_NUM: "",
    LIVE_ADDRESS: "",
    PHONE_NUM: "",
    NATIVE_ADDRESS: ""
  });
};
const delPerson = async (i: Number) => {
  submitForm.value.PERSONLIST.splice(i, 1);
};
const xianChange = async val => {
  submitForm.value.DISTRICT_NAME = countyData.value.find(
    item => item.code === val
  ).name;
};
</script>

<template>
  <el-form
    ref="formRef"
    :rules="rules"
    label-position="top"
    :model="submitForm"
    class="search-form bg-bg_color w-[99/100] !p-[0px]"
  >
    <el-row :gutter="32">
      <el-col :span="12">
        <el-form-item label="案件名称" prop="AJMC">
          <el-input
            v-model.trim="submitForm.AJMC"
            placeholder="请输入案件名称"
            maxlength="100"
            clearable
            class="!w-[360px]"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="条码" prop="TM">
          <el-input
            v-model.trim="submitForm.TM"
            placeholder="请输入条码"
            maxlength="50"
            clearable
            class="!w-[360px]"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="信访日期" prop="DJRQ">
          <el-date-picker
            v-model="submitForm.DJRQ"
            type="date"
            value-format="YYYY-MM-DD"
            format="YYYY-MM-DD"
            placeholder="请选择日期"
            class="!w-[360px]"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="信访类型" prop="XFLX">
          <el-input
            v-model.trim="submitForm.XFLX"
            placeholder="请输入信访类型"
            maxlength="100"
            clearable
            class="!w-[360px]"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="是否重复" prop="SFCF">
          <el-select v-model="submitForm.SFCF">
            <el-option label="是" value="是" />
            <el-option label="否" value="否" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="信访方式" prop="SFFSH">
          <el-input
            v-model.trim="submitForm.SFFSH"
            placeholder="请输入信访方式"
            maxlength="50"
            clearable
            class="!w-[360px]"
          />
        </el-form-item>
      </el-col>
      <!-- <el-col :span="12">
        <el-form-item label="致检察长" prop="ZJCZ">
          <el-input
            v-model.trim="submitForm.ZJCZ"
            placeholder="请输入"
            maxlength="100"
            clearable
            class="!w-[360px]"
          />
        </el-form-item>
      </el-col> -->

      <el-col :span="12">
        <el-form-item label="案发地" prop="AFD">
          <el-input
            v-model.trim="submitForm.AFD"
            placeholder="请输入案发地"
            maxlength="100"
            clearable
            class="!w-[360px]"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="接收单位" prop="JSDW">
          <el-input
            v-model.trim="submitForm.JSDW"
            placeholder="请输入接收单位"
            maxlength="100"
            clearable
            class="!w-[360px]"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="信访次数" prop="XFCS">
          <el-input
            v-model.trim="submitForm.XFCS"
            placeholder="请输入信访次数"
            maxlength="100"
            clearable
            class="!w-[360px]"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="承办单位" prop="CBDW">
          <el-input
            v-model.trim="submitForm.CBDW"
            placeholder="请输入承办单位"
            maxlength="20"
            clearable
            class="!w-[360px]"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="登记人" prop="DJR">
          <el-input
            v-model.trim="submitForm.DJR"
            placeholder="请输入登记人"
            maxlength="100"
            clearable
            class="!w-[360px]"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="分流/办理情况" prop="BLQK">
          <el-input
            v-model="submitForm.BLQK"
            placeholder="请输入分流/办理情况"
            maxlength="100"
            clearable
            class="!w-[360px]"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="承办人" prop="CBR">
          <el-input
            v-model.trim="submitForm.CBR"
            placeholder="请输入承办人"
            maxlength="50"
            clearable
            class="!w-[360px]"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="推送日期" prop="SLRQ">
          <el-date-picker
            v-model="submitForm.SLRQ"
            type="date"
            value-format="YYYY-MM-DD"
            format="YYYY-MM-DD"
            placeholder="请选择日期"
            class="!w-[360px]"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="部门受案号" prop="BMSAH">
          <el-input
            v-model.trim="submitForm.BMSAH"
            placeholder="请输入部门受案号"
            maxlength="50"
            clearable
            class="!w-[360px]"
          />
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item label="被信访人姓名" prop="BXFRXM">
          <el-input
            v-model.trim="submitForm.BXFRXM"
            placeholder="请输入被信访人姓名"
            maxlength="50"
            clearable
            class="!w-[360px]"
          />
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item label="案情摘要" prop="AQZY">
          <el-input
            v-model.trim="submitForm.AQZY"
            placeholder="请输入案情摘要"
            maxlength="1000"
            type="textarea"
            :rows="3"
            clearable
            class="!w-[770px]"
          />
        </el-form-item>
      </el-col>
    </el-row>
    <div class="org-title flex items-center pl-[16px] mb-[16px]">相关人员</div>
    <el-row v-show="props.mode !== 'view'" :gutter="32">
      <el-col :span="24">
        <el-button type="primary" @click="addPerson"> 添加人员 </el-button>
      </el-col>
    </el-row>
    <el-row
      v-for="(e, i) in submitForm.PERSONLIST"
      :key="i"
      :gutter="32"
      style="margin: 10px 0; border: 1px solid #333"
    >
      <el-col :span="12">
        <el-form-item label="姓名" prop="NAME">
          <el-input
            v-model.trim="e.NAME"
            placeholder="请输入姓名"
            maxlength="50"
            clearable
            class="!w-[360px]"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="身份证号" prop="IDCARD_NUM">
          <el-input
            v-model.trim="e.IDCARD_NUM"
            placeholder="请输入身份证号"
            maxlength="50"
            clearable
            class="!w-[360px]"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="联系方式" prop="PHONE_NUM">
          <el-input
            v-model.trim="e.PHONE_NUM"
            placeholder="请输入联系方式"
            maxlength="11"
            clearable
            class="!w-[330px]"
          />
          <el-icon v-show="props.mode !== 'view'" size="16">
            <Close style="color: red; cursor: pointer" @click="delPerson(i)" />
          </el-icon>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>
<style lang="scss" scoped>
.org-title {
  height: 40px;
  font-size: 14px;
  font-weight: 600;
  color: var(--one-text-color-4);
  background-color: #f5f5f5;
}

:deep(.add-btn.el-button) {
  margin-top: 5px;
  border-style: dashed !important;
}
</style>
