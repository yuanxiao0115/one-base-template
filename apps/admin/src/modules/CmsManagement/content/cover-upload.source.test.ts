import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

function readEditFormSource() {
  return readFileSync(new URL('./components/ContentEditForm.vue', import.meta.url), 'utf8');
}

function readFormRuleSource() {
  return readFileSync(new URL('./form.ts', import.meta.url), 'utf8');
}

describe('Cms content 封面上传 source', () => {
  it('封面字段应使用单图上传并限制 1 张', () => {
    const source = readEditFormSource();

    expect(source).toContain('<el-upload');
    expect(source).toContain('class="cover-upload"');
    expect(source).toContain(':limit="coverUploadLimit"');
    expect(source).toContain(':http-request="uploadCoverRequest"');
    expect(source).toContain(':on-success="handleCoverUploadSuccess"');
    expect(source).toContain(':on-remove="handleCoverRemove"');
    expect(source).not.toContain('prop="coverUrl">\n      <el-input');
  });

  it('coverUrl 校验文案应提示上传封面图片', () => {
    const source = readFormRuleSource();

    expect(source).toContain('message: "请上传封面图片"');
  });

  it('编辑表单应采用左右双区布局并减少分块边框', () => {
    const source = readEditFormSource();

    expect(source).toContain('class="content-form-shell"');
    expect(source).toContain('class="content-form-side content-form-side--meta"');
    expect(source).toContain('class="content-form-side content-form-side--body"');
    expect(source).toContain('class="content-form-section content-form-section--editor"');
    expect(source).toContain('class="content-form-section content-form-section--attachment"');
    expect(source).not.toContain('class="content-form-panel content-form-panel--basic"');
  });
});
