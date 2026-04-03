<script setup lang="ts">
import { reactive, ref, onMounted } from "vue";
import { api } from "../../api/visit-contrast";
const emptySvgUrl = new URL("@/assets/svg/empty.svg", import.meta.url).href;

const loading = ref(false);
const pickerDate = ref("");

//列表数据
const dataList = ref([]);
//是否显示列表弹窗
const visiable1 = ref(false);
//弹窗列表数据
const tableList = ref([]);
const tableTotal = ref(0);

const searchForm = reactive({
  START_DATE: "2025-01-01",
  END_DATE: "2025-12-31",
  key: "202503111613_10_d9ed"
});

const dialogTableParams = reactive({
  DISTRICT_CODE: "",
  SOURCE_SYSTEM: "",
  APPEAL_TYPE: "",
  IS_RECORDED: "",
  currentPage: 1,
  pageSize: 10,
  START_DATE: searchForm.START_DATE,
  END_DATE: searchForm.END_DATE,
  key: "202503111613_10_d9ed"
});
//是否显示详情弹窗
const visiable2 = ref(false);
const detailInfo = ref({});
const columns = [
  { type: "index", label: "序号", width: 80, align: "center" },
  { prop: "子级区划名称", label: "县市区", align: "center" },
  {
    label: "到市访",
    align: "center",
    children: [
      { prop: "到市访初访量", label: "初访量", sortable: "custom", align: "center" },
      { prop: "到市访重访量", label: "重访量", sortable: "custom", align: "center" },
      { prop: "到市访录入量", label: "系统录入量", sortable: "custom", align: "center" },
      { prop: "到市访漏排率", label: "漏排率", sortable: "custom", align: "center" }
    ]
  },
  {
    label: "赴省访",
    align: "center",
    children: [
      { prop: "赴省访初访量", label: "初访量", sortable: "custom", align: "center" },
      { prop: "count5", label: "赴省访重访量", sortable: "custom", align: "center" },
      { prop: "赴省访录入量", label: "系统录入量", sortable: "custom", align: "center" },
      { prop: "赴省访漏排率", label: "漏排率", sortable: "custom", align: "center" }
    ]
  },
  {
    label: "进京访",
    align: "center",
    children: [
      { prop: "进京访初访量", label: "初访量", sortable: "custom", align: "center" },
      { prop: "进京访重访量", label: "重访量", sortable: "custom", align: "center" },
      { prop: "进京访录入量", label: "系统录入量", sortable: "custom", align: "center" },
      { prop: "进京访漏排率", label: "漏排率", sortable: "custom", align: "center" }
    ]
  }
];

onMounted(() => {
  getList();
});

function dateChange(val) {
  if (val) {
    searchForm.START_DATE = val + "-01";
    const [year, month] = searchForm.START_DATE.split("-").map(Number);
    const nextMonthFirstDay = new Date(year, month, 1);
    const lastDay = new Date(nextMonthFirstDay.getTime() - 24 * 60 * 60 * 1000);
    const formattedLastDay = String(lastDay.getDate()).padStart(2, "0");
    searchForm.END_DATE = `${year}-${String(month).padStart(2, "0")}-${formattedLastDay}`;
  }
  getList();
}
//列表接口请求
const getList = async () => {
  try {
    loading.value = true;
    const { code, data }: any = await api.list(searchForm);
    if (code === 200) {
      data.forEach(item => {
        if (
          item.子级区划名称 === "合计" ||
          item.子级区划名称 === "市直部门" ||
          item.子级区划名称 === "其他"
        ) {
          item.isTotalRow = true;
        }
      });
      dataList.value = data;
    }
    loading.value = false;
  } catch (e) {
    loading.value = false;
  }
};
//弹窗列表请求
const getDialogList = async () => {
  try {
    loading.value = true;
    const { code, data }: any = await api.xfsjlbList(dialogTableParams);
    if (code === 200) {
      if (dialogTableParams.IS_RECORDED == "是") {
        intableList.value = data.records;
        tableTotal.value = data.totalCount;
        open.value = true;
      } else {
        tableList.value = data.records;
        tableTotal.value = data.totalCount;
        visiable1.value = true;
      }
    }
  } finally {
    loading.value = false;
  }
};
const open = ref(false);
const intableList = ref([]);

const openDialogTable = async (
  DISTRICT_CODE,
  SOURCE_SYSTEM,
  APPEAL_TYPE,
  IS_RECORDED
) => {
  dialogTableParams.currentPage = 1;
  dialogTableParams.DISTRICT_CODE = DISTRICT_CODE;
  dialogTableParams.SOURCE_SYSTEM = SOURCE_SYSTEM;
  dialogTableParams.APPEAL_TYPE = APPEAL_TYPE;
  dialogTableParams.IS_RECORDED = IS_RECORDED;
  let START_DATE = "2025-01-01";
  let END_DATE = "2025-12-31";
  if (searchForm.START_DATE && searchForm.START_DATE != "") {
    START_DATE = searchForm.START_DATE;
    END_DATE = searchForm.END_DATE;
  }
  dialogTableParams.START_DATE = START_DATE;
  dialogTableParams.END_DATE = END_DATE;
  getDialogList();
};

async function exportTable() {
  const res: any = await api.exportTable(searchForm);
  const blob = new Blob([res]);
  if ("download" in document.createElement("a")) {
    const elink = document.createElement("a");
    elink.download = `信访专题对比_${new Date().getTime()}.xlsx`;
    elink.style.display = "none";
    elink.href = URL.createObjectURL(blob);
    document.body.appendChild(elink);
    elink.click();
    URL.revokeObjectURL(elink.href);
    document.body.removeChild(elink);
  }
}
const seeDetail = async row => {
  loading.value = true;
  try {
    const { code, data }: any = await api.detail({
      caseID: row.ID,
      key: "202503111613_10_d9ed"
    });
    if (code === 200) {
      detailInfo.value = data[0];
    }
    visiable2.value = true;
  } finally {
    loading.value = false;
  }
};
const soltHandle = column => {
  //不参与排序的数组
  let freeGood = [];
  //参与排序的数组
  let elseFree = [];
  //fieldName 为对应列的prop
  let fieldName = column.prop;
  let sortingType = column.order;
  //降序
  if (sortingType == "descending") {
    dataList.value.forEach(item => {
      //在整个tableData中找到不参与排序的所有数据
      if (item.isTotalRow) {
        //不参与排序的所有数据加到数组中
        freeGood.push(item);
      } else {
        //参与排序的数据
        elseFree.push(item);
      }
    });
    dataList.value = elseFree.sort((a, b) => {
      // 处理百分比字符串排序
      if (typeof a[fieldName] === "string" && a[fieldName].includes("%")) {
        return parseFloat(b[fieldName]) - parseFloat(a[fieldName]);
      }
      if (typeof a[fieldName] == "string") {
        return b[fieldName].localeCompare(a[fieldName]);
      } else if (typeof a[fieldName] == "number") {
        return b[fieldName] - a[fieldName];
      }
    });
    dataList.value = [...dataList.value, ...freeGood];
  } else {
    dataList.value.forEach(item => {
      //在整个tableData中找到不参与排序的所有数据
      if (item.isTotalRow) {
        //不参与排序的所有数据加到数组中
        freeGood.push(item);
      } else {
        //参与排序的数据
        elseFree.push(item);
      }
    });
    dataList.value = elseFree.sort((a, b) => {
      // 处理百分比字符串排序
      if (typeof a[fieldName] === "string" && a[fieldName].includes("%")) {
        return parseFloat(a[fieldName]) - parseFloat(b[fieldName]);
      }
      if (typeof a[fieldName] == "string") {
        return a[fieldName].localeCompare(b[fieldName]);
      } else if (typeof a[fieldName] == "number") {
        return a[fieldName] - b[fieldName];
      }
    });
    dataList.value = [...dataList.value, ...freeGood];
  }
};
</script>

<template>
  <ObPageContainer padding="0" overflow="hidden">
    <ObTableBox title="信访专题对比" :showSearchBar="false">
      <div class="topic-toolbar">
        <el-date-picker
          v-model="pickerDate"
          type="month"
          value-format="YYYY-MM"
          format="YYYY-MM "
          placeholder="请选择时间"
          :editable="false"
          class="!w-[360px]"
          @change="dateChange"
        />
        <el-button type="primary" @click="getList">搜索</el-button>
        <el-button class="topic-export-btn" @click="exportTable">导出</el-button>
      </div>
      <ObTable
        align-whole="left"
        showOverflowTooltip
        table-layout="auto"
        adaptive
        :loading="loading"
        :data="dataList"
        :columns="columns"
        :header-cell-style="{ background: '#f5f7fa', color: 'rgb(51, 51, 51)' }"
        @sort-change="soltHandle"
      >
        <template #到市访初访量="{ row }">
          <span
            class="topic-clickable"
            @click="openDialogTable(row.子级区划编码, '003-01', '初件', '')"
          >
            {{ row.到市访初访量 }}
          </span>
        </template>
        <template #到市访重访量="{ row }">
          <span
            class="topic-clickable"
            @click="openDialogTable(row.子级区划编码, '003-01', '重件', '')"
          >
            {{ row.到市访重访量 }}
          </span>
        </template>
        <template #到市访录入量="{ row }">
          <span
            class="topic-clickable"
            @click="openDialogTable(row.子级区划编码, '003-01', '', '是')"
          >
            {{ row.到市访录入量 }}
          </span>
        </template>
        <template #到市访漏排率="{ row }">
          <span
            class="topic-clickable"
            @click="openDialogTable(row.子级区划编码, '003-01', '', '否')"
          >
            {{ row.到市访漏排率 }}
          </span>
        </template>

        <template #赴省访初访量="{ row }">
          <span
            class="topic-clickable"
            @click="openDialogTable(row.子级区划编码, '003-02', '初件', '')"
          >
            {{ row.赴省访初访量 }}
          </span>
        </template>
        <template #count5="{ row }">
          <span
            class="topic-clickable"
            @click="openDialogTable(row.子级区划编码, '003-02', '重件', '')"
          >
            {{ row.赴省访重访量 }}
          </span>
        </template>
        <template #赴省访录入量="{ row }">
          <span
            class="topic-clickable"
            @click="openDialogTable(row.子级区划编码, '003-02', '', '是')"
          >
            {{ row.赴省访录入量 }}
          </span>
        </template>
        <template #赴省访漏排率="{ row }">
          <span
            class="topic-clickable"
            @click="openDialogTable(row.子级区划编码, '003-02', '', '否')"
          >
            {{ row.赴省访漏排率 }}
          </span>
        </template>

        <template #进京访初访量="{ row }">
          <span
            class="topic-clickable"
            @click="openDialogTable(row.子级区划编码, '003-03', '初件', '')"
          >
            {{ row.进京访初访量 }}
          </span>
        </template>
        <template #进京访重访量="{ row }">
          <span
            class="topic-clickable"
            @click="openDialogTable(row.子级区划编码, '003-03', '重件', '')"
          >
            {{ row.进京访重访量 }}
          </span>
        </template>
        <template #进京访录入量="{ row }">
          <span
            class="topic-clickable"
            @click="openDialogTable(row.子级区划编码, '003-03', '', '是')"
          >
            {{ row.进京访录入量 }}
          </span>
        </template>
        <template #进京访漏排率="{ row }">
          <span
            class="topic-clickable"
            @click="openDialogTable(row.子级区划编码, '003-03', '', '否')"
          >
            {{ row.进京访漏排率 }}
          </span>
        </template>
        <template #empty>
          <div class="table-empty">
            <img :src="emptySvgUrl" alt="暂无数据" class="empty-img" />
            <p class="empty-text">暂无数据</p>
          </div>
        </template>
      </ObTable>
    </ObTableBox>
  </ObPageContainer>
    <!-- 信访列表 -->
    <el-dialog
      v-model="visiable1"
      title="信访列表"
      width="1000px"
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
          prop="信访日期"
          label="信访日期"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="姓名"
          label="姓名"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="身份证号"
          label="身份证号"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="区划名称"
          label="行政区划"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="上访类型"
          label="初/重"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="信访类别"
          label="信访类别"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="诉求"
          label="主要诉求"
          align="center"
          min-width="160"
          show-overflow-tooltip
        />
        <el-table-column label="操作" align="center" width="100">
          <template #default="{ row }">
            <el-button
              class="reset-margin"
              link
              type="primary"
              @click="seeDetail(row)"
            >
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        layout="total, prev, pager, next"
        :page-size="dialogTableParams.pageSize"
        :current-page="dialogTableParams.currentPage"
        :total="tableTotal"
        size="small"
        @current-change="getDialogList"
      />
    </el-dialog>
    <!-- 详情弹窗 -->
    <el-dialog v-model="visiable2" title="详情" width="800px" append-to-body>
      <el-row>
        <el-col :span="12">
          <div class="name">
            姓名：<span>{{ detailInfo.信访人员姓名 }}</span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="name">
            电话：<span>{{ detailInfo.信访人员电话 }}</span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="name">
            身份证号：<span>{{ detailInfo.信访人员身份证号 }}</span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="name">
            行政区划：<span>{{ detailInfo.信访行政区划 }}</span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="name">
            信访人数：<span>{{ detailInfo.信访人数 }}</span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="name">
            信访类别：<span>{{ detailInfo.信访类型 }}</span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="name">
            信访日期：<span>{{ detailInfo.信访日期 }}</span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="name">
            初/重：<span>{{ detailInfo['初/重'] }}</span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="name">
            责任单位(乡镇)：<span>{{ detailInfo['信访责任单位(乡镇)'] }}</span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="name">
            住址：<span>{{ detailInfo.信访人员住址 }}</span>
          </div>
        </el-col>
        <el-col :span="24">
          <div class="name">
            主要诉求：<span>{{ detailInfo.主要诉求 }}</span>
          </div>
        </el-col>
        <el-col :span="24">
          <div class="name">
            备注：<span>{{ detailInfo.备注 }}</span>
          </div>
        </el-col>
      </el-row>
    </el-dialog>
    <!-- 录入量列表 -->
    <el-dialog
      v-model="open"
      title="网上枫桥列表"
      width="1000px"
      append-to-body
    >
      <el-table
        :data="intableList"
        border
        fit
        stripe
        style="width: 100%"
        :header-cell-style="{ background: '#f5f7fa', color: 'rgb(51, 51, 51)' }"
      >
        <el-table-column
          prop="信访日期"
          label="时间"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="姓名"
          label="姓名"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="手机号"
          label="联系电话"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="住址"
          label="地点"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="信访类别"
          label="类型"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="诉求"
          label="主要诉求"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column label="操作" align="center" width="100">
          <template #default="{ row }">
            <el-button
              class="reset-margin"
              link
              type="primary"
              @click="seeDetail(row)"
            >
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    <el-pagination
      layout="total, prev, pager, next"
      :page-size="dialogTableParams.pageSize"
      :current-page="dialogTableParams.currentPage"
      :total="tableTotal"
      size="small"
      @current-change="getDialogList"
    />
  </el-dialog>
</template>
<style scoped lang="scss">
.topic-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.topic-export-btn {
  margin-left: auto;
}

.topic-clickable {
  cursor: pointer;
}

.name {
  color: #000;
  line-height: 30px;
  font-weight: 600;
  span {
    color: #333;
    font-weight: normal;
  }
}
</style>
