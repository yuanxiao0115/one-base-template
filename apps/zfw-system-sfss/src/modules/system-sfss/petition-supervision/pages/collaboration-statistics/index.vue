<script setup lang="ts">
import { reactive, ref, watch, nextTick } from "vue";
import dayjs from "dayjs";
import useTable from "@/hooks/table";
import { infoColumns as columns } from "./columns";
import { api } from "../../api/ai-contrast";
import Search from "./Search.vue";
import WsfqDialogs from "./WsfqDialogs.vue";

defineOptions({
  name: "petition-collaboration-statistics"
});
const tableRef = ref();
const dialogsRef = ref<any>();
const currentSortColumn = ref(""); // 当前排序列
const currentSortOrder = ref(""); // 当前排序顺序

const colorMarkFields = [
  "公安-检察协同率",
  "检察办案率",
  "检察-法院协同率",
  "法院一审结案率",
  "总协同率",
  "到市访漏排率",
  "赴省访漏排率",
  "进京访漏排率",
  "涉法涉诉量",
  "信访量"
];
const defaultDate = dayjs().format("YYYY-MM-DD");
const searchForm = reactive({
  key: "202503111613_10_d9ed",
  DISTRICT_CODE: "130100000000",
  END_DATE: defaultDate,
  START_DATE: defaultDate
});
const getRegionCode = (item: any) => item?.["子级区划编码"];
const getRegionName = (item: any) => item?.["子级区划名称"];
const isTotalRow = (item: any) => {
  const regionCode = getRegionCode(item);
  const regionName = getRegionName(item);
  return (
    (regionCode && regionCode === searchForm.DISTRICT_CODE) ||
    regionName === "总计"
  );
};
const formatPercent = (value: any) => {
  if (value === undefined || value === null || value === "") return "";
  const str = String(value).trim();
  if (!str) return "";
  if (str.includes("%")) return str;
  return `${str}%`;
};
const normalizeEmptyToZero = (row: any) => {
  if (!row) return;
  colorMarkFields.forEach(field => {
    const v = row[field];
    if (v === undefined || v === null) {
      row[field] = 0;
      return;
    }
    if (typeof v === "string" && v.trim() === "") {
      row[field] = 0;
    }
  });
};
const tableOpt = reactive({
  searchApi: async params => {
    const res: any = await api.listCmict(params);
    const code = res?.code ?? 200;
    const data = Array.isArray(res?.data)
      ? res.data
      : Array.isArray(res)
        ? res
        : [];
    return { ...res, code, data };
  },
  searchForm: searchForm,
  paginationFlag: false
});
const {
  loading,
  dataList,
  onSearch: originalOnSearch
} = useTable(tableOpt, tableRef);
// 包装 onSearch 方法，确保在搜索完成后进行着色
const onSearch = async () => {
  await originalOnSearch();
  if (Array.isArray(dataList.value)) {
    dataList.value.forEach(item => normalizeEmptyToZero(item));
  }
  nextTick(() => {
    updateCellColors();
  });
};
const handleSearch = (params: any) => {
  if (params?.START_DATE && params?.END_DATE) {
    searchForm.START_DATE = params.START_DATE;
    searchForm.END_DATE = params.END_DATE;
  }
  onSearch();
};
const handleReset = () => {
  searchForm.START_DATE = defaultDate;
  searchForm.END_DATE = defaultDate;
  onSearch();
};
const updateCellColors = () => {
  // 先清空所有行的所有颜色标记
  if (!Array.isArray(dataList.value)) return;
  dataList.value.forEach((item: any) => {
    item.sortColors = {};
  });

  // 如果没有数据则返回
  if (!dataList.value || dataList.value.length === 0) return;

  dataList.value.forEach((item: any) => {
    if (isTotalRow(item)) {
      item["子级区划名称"] = "总计";
    }
  });

  const totalRows = dataList.value.filter(item => isTotalRow(item));
  const deptRows = dataList.value.filter(
    item => getRegionName(item) === "市直部门"
  );
  const specialSet = new Set([...totalRows, ...deptRows]);
  const normalRows = dataList.value.filter(item => !specialSet.has(item));
  const nextList = [...normalRows, ...deptRows, ...totalRows];
  const needReorder = dataList.value.some(
    (row, index) => row !== nextList[index]
  );
  if (needReorder) {
    dataList.value = nextList;
  }
  const getRankValue = (row: any, fieldName: string) => {
    const key = `${fieldName}排名`;
    if (row?.[key] === undefined || row?.[key] === null || row?.[key] === "") {
      return null;
    }
    return row[key];
  };
  const eligibleRows = (needReorder ? nextList : dataList.value).filter(
    (item: any) => {
      if (!item) return false;
      const name = getRegionName(item);
      if (name === "市直部门") return false;
      if (isTotalRow(item)) return false;
      return true;
    }
  );

  colorMarkFields.forEach(fieldName => {
    eligibleRows.forEach((row: any) => {
      const rankValue = getRankValue(row, fieldName);
      if (rankValue === null) return;
      let colorClass = "";
      if (rankValue >= 1 && rankValue <= 5) {
        colorClass = "sort-green";
      } else if (rankValue >= 6 && rankValue <= 11) {
        colorClass = "sort-blue";
      } else if (rankValue >= 12 && rankValue <= 18) {
        colorClass = "sort-orange";
      } else if (rankValue >= 19 && rankValue <= 23) {
        colorClass = "sort-red";
      }

      if (!row.sortColors) row.sortColors = {};
      row.sortColors[fieldName] = colorClass;
    });
  });
};

// 获取单元格背景颜色 - 支持所有字段
const getCellStyle = ({ row, column }: any) => {
  const fieldName = column.property;

  // 检查该字段是否有颜色标记
  if (row.sortColors && row.sortColors[fieldName]) {
    const colorClass = row.sortColors[fieldName];
    const colorMap = {
      "sort-green":
        "linear-gradient(90deg, rgba(0, 180, 42, 0.2) 0%, rgba(0, 180, 42, 0) 100%)", // 绿色
      "sort-blue":
        "linear-gradient(90deg, rgba(15, 121, 233, 0.2) -25%, rgba(15, 121, 233, 0) 100%)", // 蓝色
      "sort-orange":
        "linear-gradient(90deg, rgba(255, 154, 46, 0.2) 0%, rgba(255, 154, 46, 0) 100%)", // 橙黄色
      "sort-red":
        "linear-gradient(90deg, rgba(247, 101, 96, 0.2) 0%, rgba(247, 101, 96, 0) 100%)" // 红色
    };
    return {
      background: colorMap[colorClass] || ""
    };
  }
  return {};
};

const handleSortChange = ({ prop, order }: any) => {
  if (!prop || !order) {
    currentSortColumn.value = "";
    currentSortOrder.value = "";
    return;
  }

  currentSortColumn.value = prop;
  currentSortOrder.value = order;

  const list = Array.isArray(dataList.value) ? [...dataList.value] : [];
  const totalRows = list.filter(item => isTotalRow(item));
  totalRows.forEach((item: any) => {
    item["子级区划名称"] = "总计";
  });
  const deptRows = list.filter(item => getRegionName(item) === "市直部门");
  const specialSet = new Set([...totalRows, ...deptRows]);
  const normalRows = list.filter(item => !specialSet.has(item));
  const factor = order === "ascending" ? 1 : -1;

  normalRows.sort((a, b) => {
    const va = Number(a?.[prop]);
    const vb = Number(b?.[prop]);

    if (!isNaN(va) && !isNaN(vb)) {
      if (va === vb) return 0;
      return va > vb ? factor : -factor;
    }

    const sa = a?.[prop] ?? "";
    const sb = b?.[prop] ?? "";
    if (sa === sb) return 0;
    return sa > sb ? factor : -factor;
  });

  dataList.value = [...normalRows, ...deptRows, ...totalRows];
  nextTick(() => {
    updateCellColors();
  });
};
async function exportTable() {
  const res = await api.exportTableNew({
    deptCode: "130100000000",
    startDate: searchForm.START_DATE,
    endDate: searchForm.END_DATE
  });
  const blob = new Blob([res]);
  if ("download" in document.createElement("a")) {
    const elink = document.createElement("a");
    elink.download = `数据分析_${new Date().getTime()}.xlsx`;
    elink.style.display = "none";
    elink.href = URL.createObjectURL(blob);
    document.body.appendChild(elink);
    elink.click();
    URL.revokeObjectURL(elink.href);
    document.body.removeChild(elink);
  }
}
watch(
  () => dataList.value,
  newVal => {
    if (newVal && newVal.length > 0) {
      nextTick(() => {
        updateCellColors();
      });
    }
  },
  { immediate: true }
);
</script>

<template>
  <ObPageContainer padding="0" overflow="hidden">
    <ObTableBox title="协同统计分析" :showSearchBar="false">
      <template v-slot="{ size }">
        <div class="table-content">
          <Search
            :default-date="defaultDate"
            @search="handleSearch"
            @reset="handleReset"
            @export="exportTable"
          />
          <ObTable
            ref="tableRef"
            class="wsfq-table"
            align-whole="left"
            showOverflowTooltip
            table-layout="auto"
            :size="size"
            :loading="loading"
            :data="dataList"
            :columns="columns"
            :cell-style="getCellStyle"
            @sort-change="handleSortChange"
          >
            <template #公安-检察协同率="{ row }">
              <div class="cell-with-dot">
                <span
                  class="dot"
                  :class="row.sortColors?.['公安-检察协同率'] || ''"
                />
                <span class="value">{{
                  formatPercent(row["公安-检察协同率"]) || 0
                }}</span>
              </div>
            </template>
            <template #检察办案率="{ row }">
              <div class="cell-with-dot">
                <span class="dot" :class="row.sortColors?.['检察办案率'] || ''" />
                <span class="value">{{ formatPercent(row["检察办案率"]) || 0 }}</span>
              </div>
            </template>
            <template #检察-法院协同率="{ row }">
              <div class="cell-with-dot">
                <span
                  class="dot"
                  :class="row.sortColors?.['检察-法院协同率'] || ''"
                />
                <span class="value">{{
                  formatPercent(row["检察-法院协同率"]) || 0
                }}</span>
              </div>
            </template>
            <template #法院一审结案率="{ row }">
              <div class="cell-with-dot">
                <span class="dot" :class="row.sortColors?.['法院一审结案率'] || ''" />
                <span class="value">{{
                  formatPercent(row["法院一审结案率"]) || 0
                }}</span>
              </div>
            </template>
            <template #总协同率="{ row }">
              <div class="cell-with-dot">
                <span class="dot" :class="row.sortColors?.['总协同率'] || ''" />
                <span class="value">{{ formatPercent(row["总协同率"]) || 0 }}</span>
              </div>
            </template>
            <template #到市访漏排率="{ row }">
              <div class="cell-with-dot is-clickable">
                <span class="dot" :class="row.sortColors?.['到市访漏排率'] || ''" />
                <span
                  class="value"
                  @click="
                    dialogsRef?.openTable(
                      '003-01',
                      row,
                      searchForm.START_DATE,
                      searchForm.END_DATE
                    )
                  "
                >
                  {{ formatPercent(row["到市访漏排率"]) || 0 }}
                </span>
              </div>
            </template>
            <template #赴省访漏排率="{ row }">
              <div class="cell-with-dot is-clickable">
                <span class="dot" :class="row.sortColors?.['赴省访漏排率'] || ''" />
                <span
                  class="value"
                  @click="
                    dialogsRef?.openTable(
                      '003-02',
                      row,
                      searchForm.START_DATE,
                      searchForm.END_DATE
                    )
                  "
                >
                  {{ formatPercent(row["赴省访漏排率"]) || 0 }}
                </span>
              </div>
            </template>
            <template #进京访漏排率="{ row }">
              <div class="cell-with-dot is-clickable">
                <span class="dot" :class="row.sortColors?.['进京访漏排率'] || ''" />
                <span
                  class="value"
                  @click="
                    dialogsRef?.openTable(
                      '003-03',
                      row,
                      searchForm.START_DATE,
                      searchForm.END_DATE
                    )
                  "
                >
                  {{ formatPercent(row["进京访漏排率"]) || 0 }}
                </span>
              </div>
            </template>
            <template #涉法涉诉量="{ row }">
              <div class="cell-with-dot is-clickable">
                <span class="dot" :class="row.sortColors?.['涉法涉诉量'] || ''" />
                <span
                  class="value"
                  @click="
                    dialogsRef?.showTable(
                      row,
                      '004',
                      searchForm.START_DATE,
                      searchForm.END_DATE
                    )
                  "
                >
                  {{ row["涉法涉诉量"] || 0 }}
                </span>
              </div>
            </template>
            <template #信访量="{ row }">
              <div class="cell-with-dot is-clickable">
                <span class="dot" :class="row.sortColors?.['信访量'] || ''" />
                <span
                  class="value"
                  @click="
                    dialogsRef?.showTable(
                      row,
                      '003',
                      searchForm.START_DATE,
                      searchForm.END_DATE
                    )
                  "
                >
                  {{ row["信访量"] || 0 }}
                </span>
              </div>
            </template>
          </ObTable>
        </div>
      </template>
    </ObTableBox>
  </ObPageContainer>
  <WsfqDialogs ref="dialogsRef" />
</template>

<style scoped lang="scss">
.table-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.wsfq-table {
  flex: 1;
  min-height: 0;
}

// 小圆点样式
.cell-with-dot {
  display: flex;
  align-items: center;
  gap: 8px;

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;

    &.sort-green {
      background: #00b42a;
    }

    &.sort-blue {
      background: #0f79e9;
    }

    &.sort-orange {
      background: #ff9a2e;
    }

    &.sort-red {
      background: #f76560;
    }
  }

  .value {
    flex: 1;
  }
}

.is-clickable {
  cursor: pointer;
}
</style>
