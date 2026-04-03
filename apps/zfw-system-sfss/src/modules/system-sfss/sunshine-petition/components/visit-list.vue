<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import useTable from "@/hooks/table";
import useDrawer from "@/hooks/drawer";
import { visitColumns as columns } from "./columns";
import { cloneDeep } from "@one-base-template/utils";
import { petitionApi } from "../api";
import { message } from "@one-base-template/ui";
import detail from "./detail.vue";
import EditInfoForm from "./edit-info-form.vue";
import ChatModel from "@/components/ChatModel/index.vue";
import { UploadFilled } from "@element-plus/icons-vue";

type VisitType = "shi" | "sheng" | "jing";

const props = defineProps<{ visitType: VisitType; title: string }>();

const tableRef = ref();
const searchRef = ref();
const uploadRef = ref();
const submitRef = ref();
const countyData = ref([]);
const open = ref(false);
const detailData = ref({});
const typeData = ref([]);
const chatType = ref("1");
const meg = ref("");
const chatModalVisible = ref(false);
const searchForm = reactive({
  NAME: "",
  PHONE_NUM: "",
  IDCARD_NUM: "",
  prop: "",
  order: "",
  TYPE_ID: ""
});

const sourceMap: Record<VisitType, string> = {
  shi: "DS",
  sheng: "FS",
  jing: "JJ"
};
const templateMap: Record<VisitType, string> = {
  shi: "shi.xlsx",
  sheng: "sheng.xlsx",
  jing: "jing.xlsx"
};
const downloadNameMap: Record<VisitType, string> = {
  shi: "信访基础表(市)导入模板.xlsx",
  sheng: "信访基础表(省)导入模板.xlsx",
  jing: "信访基础表(京)导入模板.xlsx"
};

const source = sourceMap[props.visitType];
const isJJ = computed(() => props.visitType === "jing");

const formData = {
  NAME: "",
  IDCARD_NUM: "",
  PHONE_NUM: "",
  ADDRESS: "",
  DISTRICT_CODE: "",
  DISTRICT_NAME: "",
  TOWN: "",
  PERSON_COUNT: "",
  TYPE: "",
  DATE: "",
  APPEAL: "",
  OCCURRENCE_TYPE: "",
  RESPONSIBLE_DEPT: "",
  REMARK: "",
  SOURCE: source,
  TYPE_ID: ""
};
const submitForm = reactive({ ...formData });

const tableSearch = e => {
  searchForm.NAME = e;
  onSearch();
};

const handleSortChange = ({ prop, order }) => {
  searchForm.prop = prop;
  searchForm.order = order === "ascending" ? "asc" : "desc";
  onSearch();
};

const initData = async () => {
  try {
    const res: response = await petitionApi.districtList("130100000000");
    countyData.value = res.data;
    const treeRes: response = await petitionApi.tree();
    typeData.value = treeRes.data;
  } catch (error) {
    console.error("初始化数据加载失败:", error);
  }
};
initData();

/** 导入参数 */
const upload = reactive({
  open: false,
  title: "导入",
  isUploading: false,
  headers: { Authorization: "Bearer " }
});

function openUploadDialog() {
  upload.open = true;
}

const importTemplate = async () => {
  try {
    const timestamp = Date.now();
    const templateFile = templateMap[props.visitType];
    const response = await fetch(`/${templateFile}?t=${timestamp}`);
    if (!response.ok) throw new Error("文件加载失败");
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = downloadNameMap[props.visitType];
    document.body.appendChild(anchor);
    anchor.click();
    setTimeout(() => {
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    message("模板下载失败，请检查文件是否存在", { type: "error" });
  }
};

async function handleFileUploadProgress() {
  upload.isUploading = true;
}

async function handleFileSuccess(response, file) {
  upload.open = false;
  upload.isUploading = false;
  uploadRef.value.handleRemove(file);
  onSearch();
}

const handleExceed = () => {
  message("一次只能上传一个文件", { type: "error" });
};

const onBeforeUploadExcel = file => {
  const ext = file.name.slice(file.name.lastIndexOf("."));
  const isExcel = [".xlsx", ".xls"].includes(ext);
  const isLt20M = file.size / 1024 / 1024 <= 20;
  if (!isExcel) {
    message("上传文件只能是xls/xlsx格式", { type: "error" });
  }
  if (!isLt20M) {
    message("上传文件大小不能超过20M", { type: "error" });
  }
  return isExcel && isLt20M;
};

async function importExcel(param) {
  const { code } =
    props.visitType === "jing"
      ? await petitionApi.importJJ({ file: param.file })
      : await petitionApi.importSS({ file: param.file, source });
  try {
    if (code === 200) {
      message("导入成功!", { type: "success" });
    }
  } catch (e) {
    // ignore
  }
}

async function submitFileForm() {
  uploadRef.value.submit();
}

const getPettionList = async () => {
  try {
    loading.value = true;
    const params = {
      ...searchForm,
      page: pagination.currentPage,
      size: pagination.pageSize,
      SOURCE: source
    };
    Object.keys(params).forEach(key => {
      if (
        params[key] === "" ||
        params[key] === null ||
        params[key] === undefined
      ) {
        delete params[key];
      }
    });
    const { code, data } = await petitionApi.list(params);
    if (code === 1) {
      dataList.value = data.list || [];
      pagination.total = data.total;
      pagination.pageSize = 10;
    }
    loading.value = false;
  } catch (e) {
    loading.value = false;
  }
};

const tableOpt = reactive({
  searchApi: getPettionList,
  searchForm: searchForm,
  paginationFlag: true
});

const {
  loading,
  dataList,
  pagination,
  onSearch,
  resetForm,
  handleSizeChange,
  handleCurrentChange
} = useTable(tableOpt, tableRef);

const drawerOpt = reactive({
  title: props.title,
  submitForm: submitForm,
  addApi: petitionApi.add,
  updateApi: petitionApi.update,
  beforeSubmit: () => {
    return cloneDeep(submitForm);
  },
  refresh: () => {
    visible.value = false;
    Object.assign(submitForm, formData);
    onSearch();
  }
});

const { visible, openDrawer, mode, Mode, submit, closeDrawer } = useDrawer(
  drawerOpt,
  submitRef
);

const drawerTitle = computed(() => props.title);
const crudMode = computed(() => {
  if (mode.value === Mode.Add) {
    return "create";
  }
  if (mode.value === Mode.Update) {
    return "edit";
  }
  return "detail";
});

function openDrawerFn(type, row) {
  if (type === Mode.Add) {
    Object.assign(submitForm, formData);
  } else {
    Object.assign(submitForm, row);
  }
  openDrawer(type, row);
}

const handleClose = () => {
  Object.assign(submitForm, formData);
  closeDrawer();
};

const openAI = row => {
  meg.value = row.IDCARD_NUM;
  chatType.value = "2";
  chatModalVisible.value = true;
};

const seeDetail = row => {
  detailData.value = row;
  open.value = true;
};
</script>

<template>
  <ObPageContainer padding="0" overflow="hidden">
    <ObTableBox
      :title="props.title"
      placeholder="请输入姓名搜索"
      :columns="columns"
      @search="tableSearch"
      @resetForm="resetForm(searchRef)"
    >
      <template #buttons>
        <el-button type="primary" @click="openDrawerFn(Mode.Add)">
          新增
        </el-button>
        <el-button
          :loading="upload.isUploading"
          @click="openUploadDialog"
        >
          导入
        </el-button>
      </template>
      <template v-slot="{ size, dynamicColumns }">
        <ObTable
          ref="tableRef"
          align-whole="left"
          showOverflowTooltip
          table-layout="auto"
          :loading="loading"
          :size="size"
          :data="dataList"
          :columns="dynamicColumns"
          :pagination="pagination"
          :paginationSmall="size === 'small' ? true : false"
          @page-size-change="handleSizeChange"
          @page-current-change="handleCurrentChange"
          @sort-change="handleSortChange"
        >
          <template #operation="{ row }">
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              @click="openDrawerFn(Mode.Update, row)"
            >
              编辑
            </el-button>
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              @click="seeDetail(row)"
            >
              查看
            </el-button>
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              @click="openAI(row)"
            >
              画像
            </el-button>
          </template>
        </ObTable>
      </template>
      <template #drawer>
        <el-form
          ref="searchRef"
          label-position="top"
          :model="searchForm"
          class="search-form bg-bg_color w-[99/100] !p-[0px]"
        >
          <el-form-item label="姓名" prop="NAME">
            <el-input
              v-model.trim="searchForm.NAME"
              placeholder="请输入姓名"
              maxlength="50"
              clearable
              class="!w-[360px]"
            />
          </el-form-item>
          <el-form-item label="证件号码" prop="IDCARD_NUM">
            <el-input
              v-model.trim="searchForm.IDCARD_NUM"
              placeholder="请输入证件号码"
              maxlength="50"
              clearable
              class="!w-[360px]"
            />
          </el-form-item>
          <el-form-item label="电话" prop="PHONE_NUM">
            <el-input
              v-model.trim="searchForm.PHONE_NUM"
              placeholder="请输入电话"
              maxlength="50"
              clearable
              class="!w-[360px]"
            />
          </el-form-item>
          <el-form-item label="区县" prop="DISTRICT_CODE">
            <el-select
              v-model="searchForm.DISTRICT_CODE"
              placeholder="请选择区县"
              clearable
            >
              <el-option
                v-for="(item, index) in countyData"
                :key="index"
                :label="item.name"
                :value="item.code"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="信访类别" prop="TYPE_ID">
            <el-tree-select
              v-model="searchForm.TYPE_ID"
              :data="typeData"
              :render-after-expand="false"
              :props="{ label: 'NAME', value: 'ID' }"
              value-key="ID"
              clearable
            />
          </el-form-item>
        </el-form>
      </template>
    </ObTableBox>
  </ObPageContainer>

  <ObCrudContainer
    v-model="visible"
    container="drawer"
    :mode="crudMode"
    :title="drawerTitle"
    :drawer-size="824"
    :show-footer="mode !== Mode.View"
    confirm-text="保存"
    @confirm="submit"
    @cancel="handleClose"
    @close="handleClose"
  >
    <EditInfoForm
      v-if="visible"
      ref="submitRef"
      v-model="submitForm"
      :mode="mode"
      :is-jing="isJJ"
      :disabled="mode === 'view'"
    />
  </ObCrudContainer>

  <el-dialog
    v-model="upload.open"
    :title="upload.title"
    width="400px"
    append-to-body
  >
    <el-upload
      ref="uploadRef"
      :limit="1"
      accept=".xlsx, .xls"
      :headers="upload.headers"
      action="#"
      :disabled="upload.isUploading"
      :before-upload="onBeforeUploadExcel"
      :on-progress="handleFileUploadProgress"
      :http-request="importExcel"
      :on-success="handleFileSuccess"
      :on-exceed="handleExceed"
      :auto-upload="false"
      drag
    >
      <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      <template #tip>
        <div class="el-upload__tip text-center">
          <span>仅允许导入一张xls、xlsx格式文件,且不超过20M</span>
          <el-link
            type="primary"
            :underline="false"
            style="font-size: 12px; vertical-align: baseline"
            @click="importTemplate"
          >
            下载模板
          </el-link>
        </div>
      </template>
    </el-upload>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="submitFileForm">确 定</el-button>
        <el-button @click="upload.open = false">取 消</el-button>
      </div>
    </template>
  </el-dialog>

  <el-dialog v-model="open" title="详情" width="800px" append-to-body>
    <detail :detail-data="detailData" :is-jing="isJJ" />
  </el-dialog>

  <ChatModel
    v-model="chatModalVisible"
    title="政数小灵"
    :meg="meg"
    :type="chatType"
    :close-on-click-modal="false"
  />
</template>

<style scoped lang="scss">
.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}
</style>
