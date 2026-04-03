<script setup lang="ts">
import { reactive, ref } from "vue";
import useTable from "@/hooks/table";
import { api } from "../../api/dispute-statistics";
import { api as caseApi } from "../../api/case";
import { Close } from "@element-plus/icons-vue";
import { formatTime } from "@one-base-template/utils";

let columns = ref([]);
const tableShow = ref<boolean>(false);
const tableList = ref([]);
const tableCurrentPage = ref<number>(1);
const tableTotal = ref<number>(0);
const visiable = ref(false);
const caseDetailInfo = ref({});
const casePersonList = ref([]);
const caseObjList = ref([]);
const searchForm = ref({
  prop: "",
  order: ""
});
const soureSystem = reactive([
  {
    name: "调解",
    code: "TJ"
  },
  {
    name: "命案",
    code: "MA"
  },
  {
    name: "治安防控",
    code: "ZAFK"
  },
  {
    name: "涉法涉诉",
    code: "SFSS"
  },
  {
    name: "信访",
    code: "XF"
  },
  {
    name: "治安防控预警",
    code: "ZAFKYJ"
  }
]);
const formatSource = source => {
  let str = "";
  str = soureSystem.filter(e => e.code === source)[0]?.name;
  return str;
};
const tableRef = ref();
//列表接口请求
const getList = async () => {
  try {
    loading.value = true;
    columns.value = [
      {
        label: "区域",
        prop: "NAME",
        minWidth: 110,
        fixed: "left"
      }
    ];
    const { code, data }: response = await api.list(searchForm.value);
    if (code === 1) {
      data.labs.forEach(e => {
        columns.value.push({
          label: e.TYPE_NAME_1,
          prop: e.TYPE_NAME_1,
          slot: e.TYPE_NAME_1,
          minWidth: 150,
          sortable: "custom",
          sortBy: e.TYPE_NAME_1
        });
      });
      dataList.value = data.list;
    }
    loading.value = false;
  } catch (e) {
    loading.value = false;
  }
};
async function exportTable() {
  const res = await api.exportTable();
  const blob = new Blob([res]);
  if ("download" in document.createElement("a")) {
    const elink = document.createElement("a");
    elink.download = `纠纷类型对比_${new Date().getTime()}.xlsx`;
    elink.style.display = "none";
    elink.href = URL.createObjectURL(blob);
    document.body.appendChild(elink);
    elink.click();
    URL.revokeObjectURL(elink.href);
    document.body.removeChild(elink);
  }
}
const handleSortChange = ({ column, prop, order }) => {
  searchForm.value.prop = prop;
  searchForm.value.order = order === "ascending" ? "asc" : "desc";
  getList();
};
const tableOpt = reactive({
  searchApi: getList, //搜索api
  paginationFlag: false //是否分页
});
const { loading, dataList } = useTable(tableOpt, tableRef);
const params = reactive({ COUNTY_CODE: "", CASE_TYPE: "", page: 1, size: 10 });
const getCellStyle = ({ row, column }) => {
  // 仅对可点击的单元格（非第一列）添加小手光标
  if (column.rawColumnKey !== 0) {
    return { cursor: "pointer" };
  }
  return {};
};
const handleCellClick = async (row, column) => {
  if (column.rawColumnKey !== 0) {
    params.COUNTY_CODE = row.CODE;
    params.CASE_TYPE = column.label;
    const res = await caseApi.list(params);
    tableList.value = res.data.list;
    tableTotal.value = res.data.total;
    tableShow.value = true;
  }
};
async function handleTableCurrentChange(val) {
  tableCurrentPage.value = val;
  params.page = val;
  const { data } = await caseApi.list(params);
  tableList.value = data.list;
  tableTotal.value = data.total;
}
const seeDetail = async row => {
  const res: response = await caseApi.detail({
    ID: row.ID,
    SOURCE_SYSTEM: row.SOURCE_SYSTEM
  });
  caseDetailInfo.value = res.data.caseDetail;
  casePersonList.value = res.data.persionList;
  caseObjList.value = res.data.evidenceList || [];
  visiable.value = true;
};
</script>

<template>
  <ObPageContainer padding="0" overflow="hidden">
    <ObTableBox title="纠纷类型对比" :showSearchBar="false">
      <el-button
        style="float: right; margin: 0 10px 10px 0"
        @click="exportTable"
      >
        导出
      </el-button>
      <ObTable
        ref="tableRef"
        align-whole="left"
        showOverflowTooltip
        table-layout="auto"
        :loading="loading"
        :data="dataList"
        :columns="columns"
        :cell-style="getCellStyle"
        @sort-change="handleSortChange"
        @cell-click="handleCellClick"
      />
    </ObTableBox>
    <!-- 列表弹窗 -->
    <el-dialog
      v-model="tableShow"
      title="事件列表"
      width="1200px"
      append-to-body
    >
      <el-table
        :data="tableList"
        border
        fit
        stripe
        style="width: 100%"
        :header-cell-style="{ background: '#f5f7fa', color: 'rgb(51, 51, 51)' }"
      >
        <el-table-column
          prop="CREATE_TIME"
          label="时间"
          align="center"
          min-width="120"
        >
          <template #default="scope">
            <span>{{
              scope.row.CREATE_TIME ? formatTime(scope.row.CREATE_TIME) : "-"
            }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="PERSON_NAMES"
          label="涉事人员"
          align="center"
          min-width="150"
          show-overflow-tooltip
        />
        <el-table-column
          label="地点"
          align="center"
          min-width="200"
          show-overflow-tooltip
        >
          <template #default="scope">
            <span>
              {{
                scope.row.ADDRESS ||
                [
                  scope.row.COUNTY_NAME,
                  scope.row.TOWN_NAME,
                  scope.row.COMMUNITY_NAME
                ]
                  .filter(Boolean)
                  .join("") ||
                "-"
              }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          prop="CASE_TYPE"
          label="类型"
          align="center"
          min-width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="DESCRIPTION"
          label="事件描述"
          align="center"
          min-width="250"
          show-overflow-tooltip
        />
        <el-table-column
          prop="CASE_LEVEL"
          label="涉事级别"
          align="center"
          min-width="100"
        />
        <el-table-column label="操作" align="center" width="60">
          <template #default="scope">
            <el-button
              class="reset-margin"
              link
              type="primary"
              @click="seeDetail(scope.row)"
            >
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        layout="total, prev, pager, next"
        :page-size="10"
        :current-page="tableCurrentPage"
        :total="tableTotal"
        size="small"
        style="margin-top: 10px"
        @current-change="handleTableCurrentChange"
      />
    </el-dialog>

    <!-- 详情弹窗 -->
    <el-dialog v-model="visiable" title="详情" width="1000px" append-to-body>
      <el-row>
        <el-col :span="12">
          <div class="name">
            事件地址：<span>{{
              caseDetailInfo?.PROVINCE_NAME +
              caseDetailInfo?.CITY_NAME +
              caseDetailInfo?.COUNTY_NAME +
              caseDetailInfo?.TOWN_NAME +
              caseDetailInfo?.COMMUNITY_NAME +
              caseDetailInfo?.ADDRESS
            }}</span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="name">
            事件部门：<span>{{ caseDetailInfo?.COMMUNITY_NAME || "" }}</span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="name">
            事件来源系统：<span>{{
              formatSource(caseDetailInfo?.SOURCE_SYSTEM)
            }}</span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="name">
            事件时间：<span>{{
              formatTime(caseDetailInfo?.CREATE_TIME) || ""
            }}</span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="name">
            事件级别：<span>{{ caseDetailInfo?.CASE_LEVEL || "" }}</span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="name">
            事件类型：<span>{{ caseDetailInfo?.CASE_TYPE || "" }}</span>
          </div>
        </el-col>
        <el-col :span="24">
          <div class="name">
            事件描述：<span>{{ caseDetailInfo?.DESCRIPTION || "" }}</span>
          </div>
        </el-col>
      </el-row>

      <div style="font-size: 18px; font-weight: 600; padding: 15px 0">
        涉案人员
      </div>
      <el-table
        :data="casePersonList"
        border
        fit
        stripe
        style="width: 100%"
        :header-cell-style="{ background: '#f5f7fa', color: 'rgb(51, 51, 51)' }"
      >
        <el-table-column prop="NAME" label="名称" align="center" />
        <el-table-column prop="IDCARD_NUM" label="身份证号" align="center" />
        <el-table-column prop="PHONE_NUM" label="手机号" align="center" />
        <el-table-column label="人员性别" align="center">
          <template #default="scope">
            <span>{{
              scope.row.SEX === "1" ? "男" : scope.row.SEX === "2" ? "女" : ""
            }}</span>
          </template>
        </el-table-column>
      </el-table>

      <div style="font-size: 18px; font-weight: 600; padding: 15px 0">
        涉案物品
      </div>
      <el-table
        :data="caseObjList"
        border
        fit
        stripe
        style="width: 100%"
        :header-cell-style="{ background: '#f5f7fa', color: 'rgb(51, 51, 51)' }"
      >
        <el-table-column prop="TYPE" label="物品类型" align="center" />
        <el-table-column prop="NAME" label="物品名称" align="center" />
        <el-table-column
          prop="DESCRIPTION"
          label="物品描述"
          align="center"
          show-overflow-tooltip
        />
      </el-table>
    </el-dialog>
  </ObPageContainer>
</template>
