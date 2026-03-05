import type { AppUser, BackendAdapter, LoginPayload } from "@one-base-template/core";

const USER_STORAGE_KEY = "template_auth_user";

function normalizeStorageNamespace(namespace: string): string {
  const value = namespace.trim();
  return value || "template";
}

function buildUserKey(storageNamespace: string): string {
  return `${normalizeStorageNamespace(storageNamespace)}:${USER_STORAGE_KEY}`;
}

function readStoredUser(storageNamespace: string): AppUser | null {
  const raw = localStorage.getItem(buildUserKey(storageNamespace));
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as AppUser;
  } catch {
    localStorage.removeItem(buildUserKey(storageNamespace));
    return null;
  }
}

function writeStoredUser(storageNamespace: string, user: AppUser) {
  localStorage.setItem(buildUserKey(storageNamespace), JSON.stringify(user));
}

function clearStoredUser(storageNamespace: string) {
  localStorage.removeItem(buildUserKey(storageNamespace));
}

export function createTemplateMockAdapter(params: { storageNamespace: string; tokenKey: string }): BackendAdapter {
  const { storageNamespace, tokenKey } = params;

  return {
    auth: {
      async login(payload: LoginPayload) {
        const username = typeof payload.username === "string" ? payload.username.trim() : "";
        const password = typeof payload.password === "string" ? payload.password.trim() : "";

        if (!(username && password)) {
          throw new Error("账号或密码不能为空");
        }

        const user: AppUser = {
          id: "template-user",
          name: username,
          nickName: username,
          roles: ["admin"],
          permissions: ["*"],
        };

        writeStoredUser(storageNamespace, user);
        localStorage.setItem(tokenKey, `template-token-${Date.now()}`);
      },
      async logout() {
        clearStoredUser(storageNamespace);
        localStorage.removeItem(tokenKey);
      },
      async fetchMe() {
        const stored = readStoredUser(storageNamespace);
        if (!stored) {
          throw new Error("未登录");
        }
        return stored;
      },
    },
    menu: {
      async fetchMenuTree() {
        return [];
      },
    },
  };
}
