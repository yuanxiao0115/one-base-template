<script setup lang="ts">
import { reactive, ref } from 'vue';
import useTable from '@/hooks/table';
import { gaColumns as columns } from './columns';
import { gaApi } from './api';
import { message } from '@one-base-template/ui';
import detail from './detail.vue';
import ChatModel from '@/components/ChatModel/index.vue';
import { UploadFilled } from '@element-plus/icons-vue';

const tableRef = ref();
const searchRef = ref();
const uploadRef = ref();
const visiable = ref(false);
const detailData = ref({});
const chatType = ref('1');
const meg = ref('');
const chatModalVisible = ref(false);
const searchForm = reactive({
  XM: ''
});
const tableSearch = (e) => {
  searchForm.XM = e;
  onSearch();
};
/** 导入参数 */
const upload = reactive({
  open: false,
  title: '导入',
  isUploading: false, // 是否禁用上传
  headers: { Authorization: 'Bearer ' }
});

function openUploadDialog() {
  upload.open = true;
}
/**
 * 下载模板
 */
const importTemplate = async () => {
  try {
    const timestamp = Date.now();
    const response = await fetch(`/pettion-ga.xlsx?t=${timestamp}`);
    if (!response.ok) throw new Error('文件加载失败');
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = '涉法涉诉(公安)导入模板.xlsx';
    document.body.appendChild(anchor);
    anchor.click();
    setTimeout(() => {
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    message(`模板下载失败，请检查文件是否存在`, { type: 'error' });
  }
};
//文件上传
async function handleFileUploadProgress(file) {
  upload.isUploading = true;
}
async function handleFileSuccess(response, file, fileList) {
  upload.open = false;
  upload.isUploading = false;
  uploadRef.value.handleRemove(file);
  onSearch();
}
const handleExceed = () => {
  message(`一次只能上传一个文件`, { type: 'error' });
};
const onBeforeUploadExcel = (file) => {
  const isExcel = file.name.slice(file.name.lastIndexOf('.')) === '.xlsx' || 'xls';
  const isLt20M = file.size / 1024 / 1024 <= 20;
  if (!isExcel) {
    message('上传文件只能是xls/xlsx格式', { type: 'error' });
  }
  if (!isLt20M) {
    message('上传文件大小不能超过500KB', { type: 'error' });
  }
  return isExcel && isLt20M;
};
async function importExcel(param) {
  const { code } = await gaApi.import({ file: param.file });
  try {
    if (code === 200) {
      message('导入成功!', { type: 'success' });
    }
  } catch (e) {
    console.log(e);
  }
}
async function submitFileForm() {
  uploadRef.value.submit();
}
//列表接口请求
const getPettionList = async () => {
  try {
    loading.value = true;
    const params = {
      ...searchForm,
      page: pagination.currentPage,
      size: pagination.pageSize
    };
    for (const key in params) {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key];
      }
    }
    const { code, data } = await gaApi.list(params);
    if (code === 1) {
      dataList.value = data.list;
      pagination.total = data.total;
      pagination.pageSize = 10;
    }
    loading.value = false;
  } catch (e) {
    loading.value = false;
  }
};
const tableOpt = reactive({
  searchApi: getPettionList, //搜索api
  searchForm: searchForm, //搜索表单
  paginationFlag: true //是否分页
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

const seeDetail = (row) => {
  detailData.value = row;
  visiable.value = true;
};

const openAI = (row) => {
  meg.value = row.ZJHM;
  chatType.value = '2';
  chatModalVisible.value = true;
};
</script>

<template>
  <ObPageContainer padding="0" overflow="hidden">
    <ObTableBox
      title="涉法涉诉(公安)"
      placeholder="请输入姓名搜索"
      :columns="columns"
      @search="tableSearch"
      @resetForm="resetForm(searchRef)"
    >
      <template #buttons>
        <el-button :loading="upload.isUploading" @click="openUploadDialog">导入</el-button>
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
        >
          <template #operation="{ row }">
            <!-- <el-button
                class="reset-margin"
                link
                type="primary"
                :size="size"
                @click="openDrawerFn(Mode.Update, row)"
              >
                编辑
              </el-button> -->
            <el-button class="reset-margin" link type="primary" :size="size" @click="seeDetail(row)">
              查看
            </el-button>
            <el-button class="reset-margin" link type="primary" :size="size" @click="openAI(row)">
              画像
            </el-button>
            <!-- <el-popconfirm
                :title="`是否确认删除名称为${row.lableName}的这条数据`"
                @confirm="handleDelete(row)"
              >
                <template #reference>
                  <el-button class="reset-margin" link type="danger" :size="size">
                    删除
                  </el-button>
                </template>
              </el-popconfirm> -->
          </template>
        </ObTable>
      </template>
      <!-- <template #drawer>
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
          </el-form>
        </template> -->
    </ObTableBox>
  </ObPageContainer>
  <!-- 导入弹窗 -->
  <el-dialog v-model="upload.open" :title="upload.title" width="400px" append-to-body>
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
            >下载模板</el-link
          >
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
  <!-- 详情弹窗 -->
  <el-dialog v-model="visiable" title="详情" width="800px" append-to-body>
    <detail :detailData="detailData" :type="'GA'" />
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
