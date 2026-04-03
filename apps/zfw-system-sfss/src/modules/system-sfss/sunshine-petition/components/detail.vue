<template>
  <div style="width: 100%">
    <el-row>
      <el-col :span="12">
        <div class="name">
          姓名：<span>{{ props.detailData.NAME || "" }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          电话：<span>{{ props.detailData.PHONE_NUM || "" }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          身份证号：<span>{{ props.detailData.IDCARD_NUM || "" }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          行政区划：<span>{{ props.detailData.DISTRICT_NAME || "" }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          信访人数：<span>{{ props.detailData.PERSON_COUNT || "" }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          信访类别：<span>{{ props.detailData.TYPE || "" }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          信访日期：<span>{{ props.detailData.DATE || "" }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          初/重：<span>{{ props.detailData.OCCURRENCE_TYPE || "" }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div v-if="!props.isJing" class="name">
          责任单位：<span>{{ props.detailData.RESPONSIBLE_DEPT || "" }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          责任单位(乡镇)：<span>{{ props.detailData.TOWN || "" }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          住址：<span>{{ props.detailData.ADDRESS || "" }}</span>
        </div>
      </el-col>
      <el-col :span="24">
        <div class="name">
          主要诉求：<span>{{ props.detailData.APPEAL || "" }}</span>
        </div>
      </el-col>
      <el-col :span="24">
        <div class="name">
          备注：<span>{{ props.detailData.REMARK || "" }}</span>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script setup lang="ts">
const props = defineProps({
  detailData: {
    type: Object,
    required: true
  },
  isJing: Boolean
});
</script>
<style scoped lang="scss">
.name {
  font-size: 14px;
  color: #333;
  line-height: 30px;
  font-weight: 550;
  span {
    font-weight: normal;
  }
}
</style>
