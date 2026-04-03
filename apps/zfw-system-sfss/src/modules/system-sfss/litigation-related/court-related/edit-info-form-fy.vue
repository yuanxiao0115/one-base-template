<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Close, Delete } from "@element-plus/icons-vue";
import { fyApi } from "./api";
import addImage from "../assets/add.png";

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
  const res: response = await fyApi.districtList("130100000000");
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
    <el-row
      :gutter="32"
      style="margin-bottom: 14px; border-bottom: 1px solid #eeeeee"
    >
      <el-col :span="12">
        <el-form-item label="日期" prop="RQ">
          <el-date-picker
            v-model="submitForm.RQ"
            type="date"
            value-format="YYYY-MM-DD"
            format="YYYY-MM-DD"
            placeholder="请选择日期"
            class="!w-[360px]"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="初/重" prop="CZ">
          <el-select
            v-model="submitForm.CZ"
            placeholder="请选择初/重"
            class="!w-[360px]"
          >
            <el-option label="初件" value="初件" />
            <el-option label="重件" value="重件" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="类型" prop="LX">
          <el-input
            v-model.trim="submitForm.LX"
            placeholder="请输入类型"
            maxlength="50"
            clearable
            class="!w-[360px]"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="责任单位" prop="ZRDW">
          <el-input
            v-model.trim="submitForm.ZRDW"
            placeholder="请输入责任单位"
            maxlength="100"
            clearable
            class="!w-[360px]"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="责任领导" prop="ZRLD">
          <el-input
            v-model.trim="submitForm.ZRLD"
            placeholder="请输入责任领导"
            maxlength="50"
            clearable
            class="!w-[360px]"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="包联领导" prop="BLLD">
          <el-input
            v-model.trim="submitForm.BLLD"
            placeholder="请输入包联领导"
            maxlength="50"
            clearable
            class="!w-[360px]"
          />
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item label="信访诉求" prop="XFSQ">
          <el-input
            v-model.trim="submitForm.XFSQ"
            placeholder="请输入信访诉求"
            type="textarea"
            :rows="3"
            maxlength="500"
            clearable
            class="!w-[100%]"
          />
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item label="办理情况" prop="BLQK">
          <el-input
            v-model.trim="submitForm.BLQK"
            placeholder="请输入办理情况（写明化解情况）"
            type="textarea"
            :rows="3"
            maxlength="500"
            clearable
            class="!w-[100%]"
          />
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item label="是否进行过评查" prop="SFJXGPC">
          <el-input
            v-model.trim="submitForm.SFJXGPC"
            placeholder="请写明哪个单位评查，时间、评查结果"
            type="textarea"
            :rows="3"
            maxlength="500"
            clearable
            class="!w-[100%]"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="案件进展" prop="AJJZ">
          <el-input
            v-model.trim="submitForm.AJJZ"
            placeholder="请输入案件进展"
            maxlength="50"
            clearable
            class="!w-[360px]"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="拟终结/再审进度" prop="NZJJD">
          <el-input
            v-model.trim="submitForm.NZJJD"
            placeholder="请输入拟终结进度/拟再审进度"
            maxlength="100"
            clearable
            class="!w-[360px]"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="是否未判先访" prop="SFSYWPXF">
          <el-select v-model="submitForm.SFSYWPXF">
            <el-option label="是" value="是" />
            <el-option label="否" value="否" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="月份" prop="YF">
          <el-input
            v-model.trim="submitForm.YF"
            placeholder="请输入月份"
            maxlength="20"
            clearable
            class="!w-[360px]"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="案件生效日期" prop="AJSXRQ">
          <el-date-picker
            v-model="submitForm.AJSXRQ"
            type="date"
            value-format="YYYY-MM-DD"
            format="YYYY-MM-DD"
            placeholder="请选择案件生效日期"
            class="!w-[360px]"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item
          label="未曾立案、裁定不予受理、驳回起诉、行政拆迁、涉众经济纠纷等（属于那种情况）"
          prop="SYNZQK"
        >
          <el-input
            v-model.trim="submitForm.SYNZQK"
            placeholder="请输入"
            maxlength="100"
            clearable
            class="!w-[360px]"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="是否隐患排查" prop="SFYHPC">
          <el-select v-model="submitForm.SFYHPC">
            <el-option label="是" value="是" />
            <el-option label="否" value="否" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="全流程调解" prop="QLCTJ">
          <el-select v-model="submitForm.QLCTJ">
            <el-option label="是" value="是" />
            <el-option label="否" value="否" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="判后答疑" prop="PHDY">
          <el-select v-model="submitForm.PHDY">
            <el-option label="是" value="是" />
            <el-option label="否" value="否" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="风险研判" prop="FXYP">
          <el-select v-model="submitForm.FXYP">
            <el-option label="是" value="是" />
            <el-option label="否" value="否" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="人数" prop="RS">
          <el-input
            v-model="submitForm.RS"
            placeholder="请输入人数"
            maxlength="50"
            clearable
            class="!w-[360px]"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="被反映案号" prop="BFYAH">
          <el-input
            v-model.trim="submitForm.BFYAH"
            placeholder="请输入被反映案号"
            maxlength="50"
            clearable
            class="!w-[360px]"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="被反映或省院庭室" prop="BFYHSYTS">
          <el-input
            v-model.trim="submitForm.BFYHSYTS"
            placeholder="请输入被反映或省院庭室"
            maxlength="100"
            clearable
            class="!w-[360px]"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="分类" prop="FL">
          <el-input
            v-model.trim="submitForm.FL"
            placeholder="请输入分类"
            maxlength="50"
            clearable
            class="!w-[360px]"
          />
        </el-form-item>
      </el-col>
      <!-- 案由信息部分 -->
      <el-col :span="12">
        <el-form-item label="一级案由" prop="YIJAY">
          <el-input
            v-model.trim="submitForm.YIJAY"
            placeholder="请输入一级案由"
            maxlength="100"
            clearable
            class="!w-[360px]"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="二级案由" prop="ERJAY">
          <el-input
            v-model.trim="submitForm.ERJAY"
            placeholder="请输入二级案由"
            maxlength="100"
            clearable
            class="!w-[360px]"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="三级案由" prop="SANJAY">
          <el-input
            v-model.trim="submitForm.SANJAY"
            placeholder="请输入三级案由"
            maxlength="100"
            clearable
            class="!w-[360px]"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="四级案由" prop="SIJAY">
          <el-input
            v-model.trim="submitForm.SIJAY"
            placeholder="请输入四级案由"
            maxlength="100"
            clearable
            class="!w-[360px]"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="具体案由" prop="JTAY">
          <el-input
            v-model.trim="submitForm.JTAY"
            placeholder="请输入具体案由"
            maxlength="500"
            :rows="3"
            clearable
            class="!w-[360px]"
          />
        </el-form-item>
      </el-col>
      <!-- 一审信息 -->
      <el-col :span="12">
        <el-form-item label="一审案号" prop="YISAH">
          <el-input
            v-model.trim="submitForm.YISAH"
            placeholder="请输入一审案号"
            maxlength="50"
            clearable
            class="!w-[360px]"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="一审法院" prop="YISFY">
          <el-input
            v-model.trim="submitForm.YISFY"
            placeholder="请输入一审法院"
            maxlength="100"
            clearable
            class="!w-[360px]"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="一审主办人" prop="YISZBR">
          <el-input
            v-model.trim="submitForm.YISZBR"
            placeholder="请输入一审主办人"
            maxlength="50"
            clearable
            class="!w-[360px]"
          />
        </el-form-item>
      </el-col>
      <!-- 二审信息 -->
      <el-col :span="12">
        <el-form-item label="二审案号" prop="ERSAH">
          <el-input
            v-model.trim="submitForm.ERSAH"
            placeholder="请输入二审案号"
            maxlength="50"
            clearable
            class="!w-[360px]"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="二审法院" prop="ERSFY">
          <el-input
            v-model.trim="submitForm.ERSFY"
            placeholder="请输入二审法院"
            maxlength="100"
            clearable
            class="!w-[360px]"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="二审结果" prop="ERSJG">
          <el-input
            v-model.trim="submitForm.ERSJG"
            placeholder="请输入二审结果"
            maxlength="200"
            clearable
            class="!w-[360px]"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="二审主办人" prop="ERSZBR">
          <el-input
            v-model.trim="submitForm.ERSZBR"
            placeholder="请输入二审主办人"
            maxlength="50"
            clearable
            class="!w-[360px]"
          />
        </el-form-item>
      </el-col>
      <!-- 再审信息 -->
      <el-col :span="12">
        <el-form-item label="再审案号" prop="ZSAH">
          <el-input
            v-model.trim="submitForm.ZSAH"
            placeholder="请输入再审案号"
            maxlength="50"
            clearable
            class="!w-[360px]"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="再审法院" prop="ZSFY">
          <el-input
            v-model.trim="submitForm.ZSFY"
            placeholder="请输入再审法院"
            maxlength="100"
            clearable
            class="!w-[360px]"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="再审主办人" prop="ZSZBR">
          <el-input
            v-model.trim="submitForm.ZSZBR"
            placeholder="请输入再审主办人"
            maxlength="50"
            clearable
            class="!w-[360px]"
          />
        </el-form-item>
      </el-col>
      <!-- 生效信息 -->
      <el-col :span="12">
        <el-form-item label="生效案号" prop="SXAH">
          <el-input
            v-model.trim="submitForm.SXAH"
            placeholder="请输入生效案号"
            maxlength="50"
            clearable
            class="!w-[360px]"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="生效法院" prop="SXFY">
          <el-input
            v-model.trim="submitForm.SXFY"
            placeholder="请输入生效法院"
            maxlength="100"
            clearable
            class="!w-[360px]"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="生效主办人" prop="SXZBR">
          <el-input
            v-model.trim="submitForm.SXZBR"
            placeholder="请输入生效主办人"
            maxlength="50"
            clearable
            class="!w-[360px]"
          />
        </el-form-item>
      </el-col>
      <!-- 其他信息 -->
      <el-col :span="24">
        <el-form-item label="备注" prop="BZ">
          <el-input
            v-model.trim="submitForm.BZ"
            placeholder="请输入备注信息"
            type="textarea"
            maxlength="1000"
            :rows="3"
            clearable
            class="!w-[100%]"
          />
        </el-form-item>
      </el-col>

      <el-col :span="24">
        <el-form-item label="跨三分离情况" prop="SKSFLQK">
          <el-input
            v-model.trim="submitForm.SKSFLQK"
            placeholder="请输入跨三分离情况"
            type="textarea"
            maxlength="1000"
            :rows="3"
            clearable
            class="!w-[100%]"
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
    </el-row>
    <el-row
      v-for="(e, i) in submitForm.PERSONLIST"
      :key="i"
      :gutter="0"
      style="margin: 10px 0"
    >
      <el-icon class="delete-person" v-show="props.mode !== 'view'" size="16">
        <Delete style="color: red; cursor: pointer" @click="delPerson(i)" />
      </el-icon>
      <el-col :span="24">
        <div class="org-title flex items-center pl-[16px] mb-[16px]">
          相关人员{{ i + 1 }}
        </div>
      </el-col>
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
            class="!w-[360px]"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="住址" prop="LIVE_ADDRESS">
          <el-input
            v-model.trim="e.LIVE_ADDRESS"
            placeholder="请输入住址"
            maxlength="200"
            clearable
            class="!w-[360px]"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="籍贯" prop="NATIVE_ADDRESS">
          <el-input
            v-model.trim="e.NATIVE_ADDRESS"
            placeholder="请输入籍贯"
            maxlength="200"
            clearable
            class="!w-[360px]"
          />
        </el-form-item>
      </el-col>
    </el-row>
    <el-row v-show="props.mode !== 'view'" :gutter="0" class="w-[744px]">
      <el-col :span="24" @click="addPerson" class="add-person">
        <img :src="addImage" alt="" class="w-[16px] h-[16px] mr-[8px]" />
        <div>添加人员</div>
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
.delete-person {
  position: absolute;
  top: 95px;
  right: 0;
}
.add-person {
  margin: 0px 35px 24px 0;
  height: 32px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 0px 20px;
  gap: 4px;
  box-sizing: border-box;
  border: 1px dashed #cccccc;
  div {
    font-size: 14px;
    font-weight: normal;
    line-height: 100%;
    text-align: center;
    display: flex;
    align-items: center;
    letter-spacing: 0px;
    color: #666666;
  }
}
</style>
