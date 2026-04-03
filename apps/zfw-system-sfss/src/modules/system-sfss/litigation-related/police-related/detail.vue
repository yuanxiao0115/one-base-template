<template>
  <div style="width: 100%">
    <el-row v-if="props.type === 'FY'">
      <el-col :span="12">
        <div class="name">
          日期:<span>{{ props.detailData.RQ ? props.detailData.RQ : "" }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          信访人名称:<span>{{
            props.detailData.XFRMC ? props.detailData.XFRMC : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          初/重:<span>{{
            props.detailData.CZ ? props.detailData.CZ : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          类型:<span>{{ props.detailData.LX ? props.detailData.LX : "" }}</span>
        </div>
      </el-col>
      <el-col :span="24">
        <div class="name">
          信访诉求:<span>{{
            props.detailData.XFSQ ? props.detailData.XFSQ : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          责任单位:<span>{{
            props.detailData.ZRDW ? props.detailData.ZRDW : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          责任领导:<span>{{
            props.detailData.ZRLD ? props.detailData.ZRLD : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          包联领导:<span>{{
            props.detailData.BLLD ? props.detailData.BLLD : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="24">
        <div class="name">
          办理情况（写明化解情况）:<span>{{
            props.detailData.TYPE ? props.detailData.TYPE : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="24">
        <div class="name">
          是否进行过评查（写明哪个单位评查，时间、评查结果）:<span>{{
            props.detailData.SFJXGPC ? props.detailData.SFJXGPC : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="24">
        <div class="name">
          案件进展（审理中、拟终结、拟再审、已再审、已终结、息诉罢访等）:<span
            >{{ props.detailData.AJJZ ? props.detailData.AJJZ : "" }}</span
          >
        </div>
      </el-col>
      <el-col :span="24">
        <div class="name">
          拟终结进度/拟再审进度:<span>{{
            props.detailData.NZJJD ? props.detailData.NZJJD : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="24">
        <div class="name">
          是否属于未判先访，未穷尽法律救济途径前信访:<span>{{
            props.detailData.SFSYWPXF ? props.detailData.SFSYWPXF : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          月份:<span>{{ props.detailData.YF ? props.detailData.YF : "" }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          案件生效日期:<span>{{
            props.detailData.AJSXRQ ? props.detailData.AJSXRQ : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="24">
        <div class="name">
          未曾立案、裁定不予受理、驳回起诉、行政拆迁、涉众经济纠纷等（属于那种情况）:<span
            >{{ props.detailData.SYNZQK ? props.detailData.SYNZQK : "" }}</span
          >
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          是否隐患排查:<span>{{
            props.detailData.SFYHPC ? props.detailData.SFYHPC : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="24">
        <div class="name">
          全流程调解:<span>{{
            props.detailData.QLCTJ ? props.detailData.QLCTJ : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="24">
        <div class="name">
          判后答疑:<span>{{
            props.detailData.PHDY ? props.detailData.PHDY : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="24">
        <div class="name">
          风险研判:<span>{{
            props.detailData.FXYP ? props.detailData.FXYP : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          人数:<span>{{ props.detailData.RS ? props.detailData.RS : "" }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          证件号码:<span>{{
            props.detailData.ZJHM ? props.detailData.ZJHM : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          联系方式:<span>{{
            props.detailData.LXFS ? props.detailData.LXFS : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          住所地:<span>{{
            props.detailData.ZSD ? props.detailData.ZSD : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          籍贯:<span>{{ props.detailData.JG ? props.detailData.JG : "" }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          被反映案号:<span>{{
            props.detailData.BFYAH ? props.detailData.BFYAH : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          被反映或省院庭室:<span>{{
            props.detailData.BFYHSYTS ? props.detailData.BFYHSYTS : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          分类:<span>{{ props.detailData.FL ? props.detailData.FL : "" }}</span>
        </div>
      </el-col>

      <el-col :span="24">
        <div class="name">
          一级案由:<span>{{
            props.detailData.YIJAY ? props.detailData.YIJAY : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="24">
        <div class="name">
          二级案由:<span>{{
            props.detailData.ERJAY ? props.detailData.ERJAY : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="24">
        <div class="name">
          三级案由:<span>{{
            props.detailData.SANJAY ? props.detailData.SANJAY : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="24">
        <div class="name">
          四级案由:<span>{{
            props.detailData.SIJAY ? props.detailData.SIJAY : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="24">
        <div class="name">
          具体案由:<span>{{
            props.detailData.JTAY ? props.detailData.JTAY : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          一审案号:<span>{{
            props.detailData.YISAH ? props.detailData.YISAH : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          一审法院:<span>{{
            props.detailData.YISFY ? props.detailData.YISFY : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="24">
        <div class="name">
          一审主办人:<span>{{
            props.detailData.YISZBR ? props.detailData.YISZBR : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          二审案号:<span>{{
            props.detailData.ERSAH ? props.detailData.ERSAH : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          二审法院:<span>{{
            props.detailData.ERSFY ? props.detailData.ERSFY : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          二审主办人:<span>{{
            props.detailData.ERSZBR ? props.detailData.ERSZBR : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="24">
        <div class="name">
          二审结果:<span>{{
            props.detailData.ERSJG ? props.detailData.ERSJG : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          再审案号:<span>{{
            props.detailData.ZSAH ? props.detailData.ZSAH : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          再审法院:<span>{{
            props.detailData.ZSFY ? props.detailData.ZSFY : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          再审主办人:<span>{{
            props.detailData.ZSZBR ? props.detailData.ZSZBR : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          生效案号:<span>{{
            props.detailData.SXAH ? props.detailData.SXAH : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          生效法院:<span>{{
            props.detailData.SXFY ? props.detailData.SXFY : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          生效主办人:<span>{{
            props.detailData.SXZBR ? props.detailData.SXZBR : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="24">
        <div class="name">
          备注:<span>{{ props.detailData.BZ ? props.detailData.BZ : "" }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          跨三分离情况（跨省、市、区）:<span>{{
            props.detailData.SKSFLQK ? props.detailData.SKSFLQK : ""
          }}</span>
        </div>
      </el-col>
    </el-row>
    <el-row v-if="props.type === 'GA'">
      <el-col :span="12">
        <div class="name">
          信访件编号：<span>{{
            props.detailData.XFJBH ? props.detailData.XFJBH : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          信访形式：<span>{{
            props.detailData.XFXS ? props.detailData.XFXS : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          姓名：<span>{{
            props.detailData.XM ? props.detailData.XM : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          身份证号：<span>{{
            props.detailData.SFZH ? props.detailData.SFZH : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          电话：<span>{{
            props.detailData.SJHM ? props.detailData.SJHM : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          信访日期：<span>{{
            props.detailData.XFRQ ? props.detailData.XFRQ : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="24">
        <div class="name">
          住址：<span>{{
            props.detailData.ZH ? props.detailData.ZH : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          问题发生地：<span>{{
            props.detailData.WTFSD ? props.detailData.WTFSD : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="24">
        <div class="name">
          信访内容：<span>{{
            props.detailData.TYPE ? props.detailData.TYPE : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          异常动态：<span>{{
            props.detailData.YCDT ? props.detailData.YCDT : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          问题发生日期：<span>{{
            props.detailData.WTFSRQ ? props.detailData.WTFSRQ : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          信访人数：<span>{{
            props.detailData.XFRS ? props.detailData.XFRS : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="24">
        <div class="name">
          信访诉求：<span>{{
            props.detailData.XFSQ ? props.detailData.XFSQ : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="24">
        <div class="name">
          案情摘要：<span>{{
            props.detailData.AQZY ? props.detailData.AQZY : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          公安业务分类：<span>{{
            props.detailData.GAYWFL ? props.detailData.GAYWFL : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          登记单位：<span>{{
            props.detailData.DJDW ? props.detailData.DJDW : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          档案编号：<span>{{
            props.detailData.DABH ? props.detailData.DABH : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          转往处：<span>{{
            props.detailData.ZWC ? props.detailData.ZWC : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          办理方式：<span>{{
            props.detailData.BLFS ? props.detailData.BLFS : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          具体承办单位：<span>{{
            props.detailData.JTCBDW ? props.detailData.JTCBDW : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          信访件状态：<span>{{
            props.detailData.XFJZT ? props.detailData.XFJZT : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          办结状态：<span>{{
            props.detailData.BJZT ? props.detailData.BJZT : ""
          }}</span>
        </div> </el-col
      ><el-col :span="12">
        <div class="name">
          限办时间：<span>{{
            props.detailData.XBSJ ? props.detailData.XBSJ : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          责任部门：<span>{{
            props.detailData.ZRBM ? props.detailData.ZRBM : ""
          }}</span>
        </div> </el-col
      ><el-col :span="12">
        <div class="name">
          办结时间：<span>{{
            props.detailData.BJSJ ? props.detailData.BJSJ : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          登记时间：<span>{{
            props.detailData.DJSJ ? props.detailData.DJSJ : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          信访事项编号：<span>{{
            props.detailData.XFSJBH ? props.detailData.XFSJBH : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          警种名称：<span>{{
            props.detailData.JZMC ? props.detailData.JZMC : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          信访目的(登记单位)：<span>{{
            props.detailData.XFMD ? props.detailData.XFMD : ""
          }}</span>
        </div>
      </el-col>
    </el-row>
    <el-row v-if="props.type === 'JC'">
      <el-col :span="12">
        <div class="name">
          条码：<span>{{
            props.detailData.TM ? props.detailData.TM : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          信访人姓名：<span>{{
            props.detailData.XFRMC ? props.detailData.XFRMC : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          证件号码：<span>{{
            props.detailData.ZJHM ? props.detailData.ZJHM : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          联系方式：<span>{{
            props.detailData.LXFS ? props.detailData.LXFS : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          信访日期：<span>{{
            props.detailData.DJRQ ? props.detailData.DJRQ : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          信访类型：<span>{{
            props.detailData.XFLX ? props.detailData.XFLX : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          是否重复：<span>{{
            props.detailData.SFCF ? props.detailData.SFCF : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          信访方式：<span>{{
            props.detailData.SFFSH ? props.detailData.SFFSH : ""
          }}</span>
        </div>
      </el-col>
      <!-- <el-col :span="12">
        <div class="name">
          致检察长：<span>{{
            props.detailData.ZJCZ ? props.detailData.ZJCZ : ""
          }}</span>
        </div>
      </el-col> -->
      <el-col :span="12">
        <div class="name">
          案件名称：<span>{{
            props.detailData.AJMC ? props.detailData.AJMC : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          案发地:<span>{{
            props.detailData.AFD ? props.detailData.AFD : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          接收单位:<span>{{
            props.detailData.JSDW ? props.detailData.JSDW : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          信访次数：<span>{{
            props.detailData.XFCS ? props.detailData.XFCS : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          承办单位：<span>{{
            props.detailData.CBDW ? props.detailData.CBDW : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          登记人：<span>{{
            props.detailData.DJR ? props.detailData.DJR : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          分流/办理情况：<span>{{
            props.detailData.BLQK ? props.detailData.BLQK : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          承办人：<span>{{
            props.detailData.CBR ? props.detailData.CBR : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          推送日期：<span>{{
            props.detailData.SLRQ ? props.detailData.SLRQ : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          部门受案号：<span>{{
            props.detailData.BMSAH ? props.detailData.BMSAH : ""
          }}</span>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="name">
          被信访人姓名：<span>{{
            props.detailData.BXFRXM ? props.detailData.BXFRXM : ""
          }}</span>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script setup lang="ts">
import { formatTime } from "@one-base-template/utils";

const props = defineProps({
  detailData: Object,
  type: String
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
