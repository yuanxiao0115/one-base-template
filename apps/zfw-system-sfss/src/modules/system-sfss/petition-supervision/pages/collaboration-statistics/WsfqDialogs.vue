<script setup lang="ts">
import { ref } from "vue";
import { Close } from "@element-plus/icons-vue";
import { api } from "../../api/ai-contrast";

const tableShow = ref(false);
const tableFlag = ref<string>("");
const tableList = ref<any[]>([]);
const tableCurrentPage = ref(1);
const tableTotal = ref(0);
const tableList1 = ref<any[]>([]);
const tableTotal1 = ref(0);
const tableCurrentPage1 = ref(1);
const visiable1 = ref(false);
const visiable2 = ref(false);
const detailInfo = ref<any>({});

const lostQuery = ref<Record<string, any> | null>(null);

const lostQueryList = ref<Record<string, any> | null>(null);

const formatDate10 = (value: unknown) => {
  if (value === undefined || value === null || value === "") return "";
  const str = String(value);
  return str.length >= 10 ? str.slice(0, 10) : str;
};

async function showTable(
  row: any,
  flag: string,
  startDate?: string,
  endDate?: string
) {
  const code = row?.["子级区划编码"];
  lostQueryList.value = {
    key: "202503111613_10_d9ed",
    DISTRICT_CODE: code,
    END_DATE: endDate || "",
    SOURCE_SYSTEM: flag,
    START_DATE: startDate || "",
    EVENT_LEVEL: "",
    EventStatus: "",
    EventType: "",
    currentPage: 1,
    pageSize: 10
  };
  tableFlag.value = flag;
  const res = await api.getCaseList(lostQueryList.value);
  tableList.value = res.data.records;
  tableTotal.value = res.data.totalCount;
  tableShow.value = true;
  tableCurrentPage.value = 1;
}

async function handleTableCurrentChange(val: number) {
  tableCurrentPage.value = val;
  const params = {
    ...lostQueryList.value,
    currentPage: tableCurrentPage.value
  };
  const res = await api.getCaseList(params);
  tableList.value = res.data.records;
  tableTotal.value = res.data.totalCount;
}

function handleCloseTable() {
  tableList.value = [];
  tableTotal.value = 0;
  tableCurrentPage.value = 1;
  tableShow.value = false;
}

const getTableList = async (page = 1) => {
  const params: Record<string, any> = {
    ...(lostQuery.value || {}),
    currentPage: page,
    pageSize: 10
  };
  const res = await api.lostList(params);
  if (res.code === 200) {
    tableList1.value = res.data.records;
    tableTotal1.value = res.data.totalCount;
    visiable1.value = true;
  }
};

const openTable = async (
  code: string,
  row: any,
  startDate?: string,
  endDate?: string
) => {
  tableCurrentPage1.value = 1;
  const districtCode =
    row?.["子级区划编码"] ?? row?.DISTRICT_CODE ?? row?.DEPTCODE ?? "";
  lostQuery.value = {
    key: "202503111613_10_d9ed",
    DISTRICT_CODE: districtCode,
    END_DATE: endDate || "",
    SOURCE_SYSTEM: code,
    START_DATE: startDate || ""
  };
  await getTableList(1);
};

async function handleTableCurrentChange1(val: number) {
  tableCurrentPage1.value = val;
  await getTableList(val);
}

const seeDetail = async (row: any) => {
  const res = await api.getCaseDetail({
    key: "202503111613_10_d9ed",
    caseID: row.ID
  });
  if (res.code === 200) {
    detailInfo.value = res.data[0];
    visiable2.value = true;
  }
};

defineExpose({
  showTable,
  openTable
});
</script>

<template>
  <div>
    <div v-if="tableShow" class="view-order" style="height: 600px">
      <div class="closeBtn" @click="handleCloseTable">
        <el-icon size="24">
          <Close />
        </el-icon>
      </div>
      <div class="view-order-title">
        {{
          tableFlag === "004"
            ? "涉法涉诉列表"
            : tableFlag === "003"
              ? "信访列表"
              : "列表"
        }}
      </div>
      <div
        class="view-order-table expertTable"
        style="display: flex; max-height: 530px"
      >
        <el-table
          v-if="tableFlag === '004'"
          :data="tableList"
          border
          fit
          stripe
          style="width: 100%"
        >
          <el-table-column
            prop="日期"
            show-overflow-tooltip
            label="日期"
            align="center"
            :formatter="(_row, _column, cellValue) => formatDate10(cellValue)"
          />
          <el-table-column
            prop="姓名"
            show-overflow-tooltip
            label="姓名"
            align="center"
          />
          <el-table-column
            prop="来源系统"
            label="来源"
            align="center"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              {{
                row["来源系统"] === "004-03"
                  ? "法院"
                  : row["来源系统"] === "004-02"
                    ? "检察"
                    : row["来源系统"] === "004-01"
                      ? "公安"
                      : ""
              }}
            </template>
          </el-table-column>
          <el-table-column
            prop="地点"
            label="地点"
            show-overflow-tooltip
            align="center"
          />
          <el-table-column
            prop="事件描述"
            label="事件描述"
            align="center"
            show-overflow-tooltip
          />
        </el-table>
        <el-table
          v-if="tableFlag === '003'"
          :data="tableList"
          border
          fit
          stripe
          style="width: 100%"
        >
          <el-table-column
            prop="日期"
            show-overflow-tooltip
            label="信访日期"
            align="center"
            :formatter="(_row, _column, cellValue) => formatDate10(cellValue)"
          />
          <el-table-column
            prop="姓名"
            label="姓名"
            align="center"
            show-overflow-tooltip
          />
          <el-table-column
            prop="地点"
            label="地点"
            show-overflow-tooltip
            align="center"
          />
          <el-table-column
            prop="事件描述"
            label="事件描述"
            align="center"
            show-overflow-tooltip
          />
        </el-table>
      </div>
      <div style="position: absolute; bottom: 30px; right: 10px">
        <el-pagination
          layout="total, prev, pager, next"
          :page-size="10"
          :current-page="tableCurrentPage"
          :total="tableTotal"
          size="small"
          @current-change="handleTableCurrentChange"
        />
      </div>
    </div>
    <el-dialog
      v-model="visiable1"
      title="信访列表"
      width="1000px"
      append-to-body
    >
      <el-table
        :data="tableList1"
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
          :formatter="(_row, _column, cellValue) => formatDate10(cellValue)"
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
      <div class="pagePart">
        <el-pagination
          layout="total, prev, pager, next"
          :page-size="10"
          :current-page="tableCurrentPage1"
          :total="tableTotal1"
          size="small"
          @current-change="handleTableCurrentChange1"
        />
      </div>
    </el-dialog>
    <el-dialog v-model="visiable2" title="详情" width="800px" append-to-body>
      <el-row>
        <el-col :span="12">
          <div class="name">
            姓名：<span>{{ detailInfo["信访人员姓名"] }}</span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="name">
            电话：<span>{{ detailInfo["信访人员电话"] }}</span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="name">
            身份证号：<span>{{ detailInfo["信访人员身份证号"] }}</span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="name">
            行政区划：<span>{{ detailInfo["信访行政区划"] }}</span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="name">
            信访人数：<span>{{ detailInfo["信访人数"] }}</span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="name">
            信访类别：<span>{{ detailInfo["信访类型"] }}</span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="name">
            信访日期：<span>{{ detailInfo["信访日期"] }}</span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="name">
            初/重：<span>{{ detailInfo["初/重"] }}</span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="name">
            责任单位(乡镇)：<span>{{ detailInfo["信访责任单位(乡镇)"] }}</span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="name">
            住址：<span>{{ detailInfo["信访人员住址"] }}</span>
          </div>
        </el-col>
        <el-col :span="24">
          <div class="name">
            主要诉求：<span>{{ detailInfo["主要诉求"] }}</span>
          </div>
        </el-col>
        <el-col :span="24">
          <div class="name">
            备注：<span>{{ detailInfo["初/重"] }}</span>
          </div>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.view-order {
  width: 75%;
  background: #fff;
  height: 250px;
  box-shadow: 1px 1px 19px 0px rgba(149, 149, 149, 0.5);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 130px;
  left: 20%;
  z-index: 100;
  border: 2px solid #000;

  &-title {
    height: 52px;
    padding: 0 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #eeeeee;
    font-size: 18px;
    color: #1d2129;
    width: 100%;
  }

  &-table {
    padding: 16px 24px;
    width: 100%;
    flex: 1;
    overflow-y: auto;
    scrollbar-width: thin;
  }

  .closeBtn {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 20px;
    height: 20px;
    cursor: pointer;
  }
}
.pagePart {
  height: 60px;
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
</style>
