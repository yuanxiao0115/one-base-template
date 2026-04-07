---
outline: [2, 3]
---

# ObAccountCenterPanel（账号中心面板）

`ObAccountCenterPanel` 用于后台顶栏账号区，统一封装头像显示、用户信息弹窗、修改密码弹窗与退出登录菜单。

## Props

| 属性                  | 类型                             | 默认值                             | 说明                                          |
| --------------------- | -------------------------------- | ---------------------------------- | --------------------------------------------- |
| `user`                | `AccountCenterUser \| null`      | `null`                             | 当前登录用户                                  |
| `showProfileDialog`   | `boolean`                        | `true`                             | 是否显示“用户信息”菜单                        |
| `showChangePassword`  | `boolean`                        | `true`                             | 是否显示“修改密码”菜单                        |
| `showPersonalization` | `boolean`                        | `true`                             | 是否显示“个性设置”菜单                        |
| `uploadAvatar`        | `AccountCenterUploadAvatar`      | `undefined`                        | 头像上传函数；不传时“用户信息”菜单隐藏        |
| `checkPassword`       | `AccountCenterCheckPassword`     | `undefined`                        | 旧密码校验函数；不传时“修改密码”菜单隐藏      |
| `changePassword`      | `AccountCenterChangePassword`    | `undefined`                        | 修改密码函数；不传时“修改密码”菜单隐藏        |
| `encryptPassword`     | `AccountCenterEncryptPassword`   | 原文透传                           | 提交前密码加密函数（可传 `sm4EncryptBase64`） |
| `passwordPattern`     | `RegExp`                         | 组件内默认复杂度规则               | 新密码正则                                    |
| `passwordRuleMessage` | `string`                         | 组件内默认文案                     | 新密码规则提示文案                            |
| `isAvatarHidden`      | `AccountCenterIsAvatarHidden`    | `() => false`                      | 判断用户是否隐藏头像                          |
| `setAvatarHidden`     | `AccountCenterSetAvatarHidden`   | `() => false`                      | 设置头像隐藏状态                              |
| `avatarUrlResolver`   | `AccountCenterAvatarUrlResolver` | 内置 `/cmict/file/user/avatar/...` | 头像 URL 生成函数                             |
| `resolveSuccess`      | `AccountCenterResolveSuccess`    | `code === 200/0`                   | 后端成功码判定函数                            |

## Emits

| 事件名                 | 参数 | 说明                                     |
| ---------------------- | ---- | ---------------------------------------- |
| `logout`               | -    | 点击“退出登录”                           |
| `open-personalization` | -    | 点击“个性设置”                           |
| `refresh-user`         | -    | 用户信息更新后，通知父层刷新当前用户信息 |

## 示例

```vue
<script setup lang="ts">
import { useAuthStore } from '@one-base-template/core';
import authAccountService from '@/services/auth/auth-account-service';
import { isAvatarHidden, setAvatarHidden } from '@/services/auth/auth-avatar-preference-service';
import { sm4EncryptBase64 } from '@/services/security/crypto';

const authStore = useAuthStore();

async function uploadAvatar(payload: { file: File; userId: string }) {
  const formData = new FormData();
  formData.append('file', payload.file);
  formData.append('userId', payload.userId);
  return authAccountService.uploadAvatar(formData);
}
</script>

<template>
  <ObAccountCenterPanel
    :user="authStore.user"
    :upload-avatar="uploadAvatar"
    :check-password="authAccountService.checkPassword"
    :change-password="authAccountService.changePassword"
    :encrypt-password="sm4EncryptBase64"
    :is-avatar-hidden="isAvatarHidden"
    :set-avatar-hidden="setAvatarHidden"
    @refresh-user="authStore.fetchMe"
    @open-personalization="openThemeDrawer"
    @logout="handleLogout"
  />
</template>
```

## 相关类型

类型导出入口：`@one-base-template/ui`。

- `AccountCenterUser`
- `AccountCenterUploadAvatar`
- `AccountCenterCheckPassword`
- `AccountCenterChangePassword`
- `AccountCenterResolveSuccess`
