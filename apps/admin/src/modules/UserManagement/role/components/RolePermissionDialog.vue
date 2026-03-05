<script setup lang="ts">
  import { computed, ref, watch } from "vue";
  import type { TreeInstance } from "element-plus";
  import { type PermissionTreeNode, roleApi } from "../api";

  const props = defineProps<{
    modelValue: boolean;
    roleId: string;
    roleName: string;
  }>();

  const emit = defineEmits<{
    (event: "update:modelValue", value: boolean): void;
    (event: "saved"): void;
  }>();

  const visible = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit("update:modelValue", value),
  });

  const treeRef = ref<TreeInstance>();
  const loading = ref(false);
  const submitting = ref(false);
  const treeData = ref<PermissionTreeNode[]>([]);

  const expandedAll = ref(true);
  const checkedAll = ref(false);

  const treeProps = {
    children: "children",
    label: "resourceName",
  };

  function getAllPermissionIds(list: PermissionTreeNode[]): string[] {
    const result: string[] = [];

    const walk = (nodes: PermissionTreeNode[]) => {
      nodes.forEach((node) => {
        if (node.id) {
          result.push(node.id);
        }
        if (Array.isArray(node.children) && node.children.length > 0) {
          walk(node.children);
        }
      });
    };

    walk(list);
    return result;
  }

  function setExpanded(flag: boolean) {
    const nodesMap = treeRef.value?.store.nodesMap || {};
    Object.keys(nodesMap).forEach((key) => {
      const currentNode = nodesMap[key];
      if (currentNode) {
        currentNode.expanded = flag;
      }
    });
  }

  function setChecked(flag: boolean) {
    if (flag) {
      const allIds = getAllPermissionIds(treeData.value);
      treeRef.value?.setCheckedKeys(allIds);
      return;
    }

    treeRef.value?.setCheckedKeys([]);
  }

  async function loadDialogData() {
    if (!props.roleId) {
      return;
    }

    loading.value = true;
    checkedAll.value = false;
    expandedAll.value = true;

    try {
      const [permissionIdRes, treeRes] = await Promise.all([
        roleApi.getRolePermissionIds({ roleId: props.roleId }),
        roleApi.getPermissionTree(),
      ]);

      if (permissionIdRes.code !== 200) {
        throw new Error(permissionIdRes.message || "加载角色权限失败");
      }

      if (treeRes.code !== 200) {
        throw new Error(treeRes.message || "加载权限树失败");
      }

      treeData.value = treeRes.data;

      const checkedKeys = permissionIdRes.data;
      treeRef.value?.setCheckedKeys([]);
      treeRef.value?.setCheckedKeys(checkedKeys);
      setExpanded(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "加载角色权限失败";
      message.error(errorMessage);
    } finally {
      loading.value = false;
    }
  }

  async function save() {
    if (!props.roleId) {
      message.warning("请先选择角色");
      return;
    }

    const checkedKeys = treeRef.value?.getCheckedKeys(false) || [];
    const halfCheckedKeys = treeRef.value?.getHalfCheckedKeys() || [];
    const permissionIdList = [...new Set([...checkedKeys, ...halfCheckedKeys].map((item) => String(item)))];

    submitting.value = true;
    try {
      const response = await roleApi.updateRolePermissions({
        roleId: props.roleId,
        permissionIdList,
      });

      if (response.code !== 200) {
        throw new Error(response.message || "保存角色权限失败");
      }

      message.success("保存角色权限成功");
      emit("saved");
      visible.value = false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "保存角色权限失败";
      message.error(errorMessage);
    } finally {
      submitting.value = false;
    }
  }

  watch(
    () => visible.value,
    (value) => {
      if (!value) {
        return;
      }
      void loadDialogData();
    }
  );

  watch(
    () => expandedAll.value,
    (value) => {
      setExpanded(value);
    }
  );

  watch(
    () => checkedAll.value,
    (value) => {
      setChecked(value);
    }
  );
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="`菜单权限配置 - ${props.roleName || '--'}`"
    width="760px"
    append-to-body
    destroy-on-close
  >
    <div v-loading="loading" class="role-permission-dialog">
      <div class="role-permission-dialog__toolbar">
        <el-checkbox v-model="expandedAll">展开/折叠</el-checkbox>
        <el-checkbox v-model="checkedAll">全选/全不选</el-checkbox>
      </div>

      <el-scrollbar class="role-permission-dialog__tree">
        <el-tree ref="treeRef" node-key="id" :data="treeData" :props="treeProps" show-checkbox default-expand-all />
      </el-scrollbar>
    </div>

    <template #footer>
      <div class="role-permission-dialog__footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="save">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
  .role-permission-dialog__toolbar {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 12px;
  }

  .role-permission-dialog__tree {
    max-height: 60vh;
    border: 1px solid var(--el-border-color-light);
    border-radius: 4px;
    padding: 8px;
  }

  .role-permission-dialog__footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
</style>
