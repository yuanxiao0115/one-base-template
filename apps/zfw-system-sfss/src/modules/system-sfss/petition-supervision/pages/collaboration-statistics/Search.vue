<script setup lang="ts">
import { reactive, onMounted } from "vue";
import dayjs from "dayjs";

const props = defineProps<{
  defaultDate?: string;
}>();

const emit = defineEmits(["search", "reset", "export"]);

const form = reactive({
  timeType: "day",
  year: "",
  month: "",
  day: ""
});

const disabledYear = (time: Date) => {
  return dayjs(time).year() >= dayjs().year();
};

onMounted(() => {
  const base = props.defaultDate ? dayjs(props.defaultDate) : dayjs();
  const normalizedBase = base.isValid() ? base : dayjs();
  form.year = normalizedBase.subtract(1, "year").format("YYYY");
  form.month = normalizedBase.format("YYYY-MM");
  form.day = normalizedBase.format("YYYY-MM-DD");
});

const handleSearch = () => {
  let startDate = "";
  let endDate = "";

  if (form.timeType === "year" && form.year) {
    const base = dayjs(form.year, "YYYY");
    startDate = base.startOf("year").format("YYYY-MM-DD");
    endDate = base.endOf("year").format("YYYY-MM-DD");
  } else if (form.timeType === "month" && form.month) {
    const base = dayjs(form.month, "YYYY-MM");
    startDate = base.startOf("month").format("YYYY-MM-DD");
    endDate = base.endOf("month").format("YYYY-MM-DD");
  } else if (form.timeType === "day") {
    startDate = form.day;
    endDate = form.day;
  }

  emit("search", {
    START_DATE: startDate,
    END_DATE: endDate
  });
};

const handleReset = () => {
  const base = props.defaultDate ? dayjs(props.defaultDate) : dayjs();
  const normalizedBase = base.isValid() ? base : dayjs();
  form.timeType = "day";
  form.year = normalizedBase.subtract(1, "year").format("YYYY");
  form.month = normalizedBase.format("YYYY-MM");
  form.day = normalizedBase.format("YYYY-MM-DD");
  emit("reset");
};

const handleExport = () => {
  emit("export");
};

</script>

<template>
  <div class="bg-bg_color p-[16px] pb-[5px] mb-[10px] rounded">
    <el-form :model="form" inline class="flex items-center mt-[4px]">
      <el-form-item label="统计时间">
        <div class="flex items-center">
          <el-radio-group
            v-model="form.timeType"
            class="mr-4"
            @change="handleSearch"
          >
            <el-radio-button label="year">按年</el-radio-button>
            <el-radio-button label="month">按月</el-radio-button>
            <el-radio-button label="day">按日</el-radio-button>
          </el-radio-group>

          <el-date-picker
            v-if="form.timeType === 'year'"
            v-model="form.year"
            type="year"
            placeholder="选择年份"
            value-format="YYYY"
            style="width: 150px"
            :clearable="false"
            :disabled-date="disabledYear"
          />

          <template v-if="form.timeType === 'month'">
            <el-date-picker
              v-model="form.month"
              type="month"
              placeholder="选择月份"
              value-format="YYYY-MM"
              style="width: 150px"
              :clearable="false"
            />
          </template>

          <el-date-picker
            v-if="form.timeType === 'day'"
            v-model="form.day"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            style="width: 150px"
            :clearable="false"
          />
        </div>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="btn">
      <div class="legend">
        <div></div>
        1~5
        <div style="background-color: #0f79e9"></div>
        6~11
        <div style="background-color: #ff9a2e"></div>
        12~18
        <div style="background-color: #f76560"></div>
        19~23
      </div>
      <div>
        <el-button @click="handleExport">导出</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.btn {
  width: 100%;
  height: 55px;
  background-color: #fff;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  .legend {
    width: 90%;
    display: flex;
    justify-content: left;
    align-items: center;
    & > div {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background-color: #00b42a;
      margin: 0 10px;
    }
  }
}
</style>
