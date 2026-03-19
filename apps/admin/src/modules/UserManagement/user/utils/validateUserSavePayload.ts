import type { UserOrgPostRecord, UserOrgRecord, UserSavePayload } from '../types';

function normalizeText(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  return '';
}

function ensureOrgExists(userOrgs: UserOrgRecord[]) {
  if (userOrgs.length === 0) {
    throw new Error('请至少配置一个组织岗位');
  }
}

function ensureOrgId(org: UserOrgRecord, orgIndex: number, seenOrgIds: Set<string>) {
  const orgId = normalizeText(org.orgId);
  if (!orgId) {
    throw new Error(`第${orgIndex + 1}条组织信息缺少组织`);
  }
  if (seenOrgIds.has(orgId)) {
    throw new Error(`第${orgIndex + 1}条组织信息重复，请勿重复选择同一组织`);
  }
  seenOrgIds.add(orgId);
}

function ensurePostsValid(posts: UserOrgPostRecord[], orgIndex: number) {
  if (posts.length === 0) {
    throw new Error(`第${orgIndex + 1}条组织信息至少需要一个岗位`);
  }

  const seenPostIds = new Set<string>();
  let validPostCount = 0;

  posts.forEach((post, postIndex) => {
    const postId = normalizeText(post.postId);
    if (!postId) {
      return;
    }

    validPostCount += 1;

    if (seenPostIds.has(postId)) {
      throw new Error(`第${orgIndex + 1}条组织信息中第${postIndex + 1}个岗位重复`);
    }

    seenPostIds.add(postId);
  });

  if (validPostCount === 0) {
    throw new Error(`第${orgIndex + 1}条组织信息至少需要一个岗位`);
  }
}

export function validateUserSavePayload(payload: UserSavePayload) {
  const userOrgs = Array.isArray(payload.userOrgs) ? payload.userOrgs : [];
  ensureOrgExists(userOrgs);

  const seenOrgIds = new Set<string>();
  userOrgs.forEach((org, orgIndex) => {
    ensureOrgId(org, orgIndex, seenOrgIds);
    const postVos = Array.isArray(org.postVos) ? org.postVos : [];
    ensurePostsValid(postVos, orgIndex);
  });
}
