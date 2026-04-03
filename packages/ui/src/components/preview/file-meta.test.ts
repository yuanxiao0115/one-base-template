import { describe, expect, it } from 'vite-plus/test';
import { resolveFilePreviewMeta } from './file-meta';

function createMockFile(name: string, type = ''): File {
  return {
    name,
    type,
    size: 1024,
    lastModified: 1700000000000
  } as File;
}

describe('file-meta', () => {
  it('应能从带 query/hash 的 URL 识别扩展名并推导文件名', () => {
    const meta = resolveFilePreviewMeta({
      source: {
        url: 'https://example.com/files/%E6%B5%8B%E8%AF%95.PDF?token=1#p=2'
      }
    });

    expect(meta.engine).toBe('pdf');
    expect(meta.extension).toBe('pdf');
    expect(meta.fileName).toBe('测试.PDF');
    expect(meta.sourceType).toBe('url');
  });

  it('mimeType 应优先于扩展名参与识别', () => {
    const meta = resolveFilePreviewMeta({
      source: {
        url: '/files/archive.zip'
      },
      mimeType: 'application/pdf'
    });

    expect(meta.engine).toBe('pdf');
    expect(meta.extension).toBe('zip');
    expect(meta.mimeType).toBe('application/pdf');
  });

  it('应支持 File 输入分支并优先读取 File 名称', () => {
    const meta = resolveFilePreviewMeta({
      source: {
        file: createMockFile('方案.DOCX', 'application/octet-stream')
      },
      fileName: ''
    });

    expect(meta.engine).toBe('office-docx');
    expect(meta.fileName).toBe('方案.DOCX');
    expect(meta.sourceType).toBe('file');
    expect(meta.sourceFingerprint).toContain('方案.DOCX');
  });

  it('应支持 OFD 识别', () => {
    const meta = resolveFilePreviewMeta({
      source: {
        file: createMockFile('材料.ofd')
      }
    });

    expect(meta.engine).toBe('ofd');
    expect(meta.extension).toBe('ofd');
  });

  it('未知类型应回退为 unsupported', () => {
    const meta = resolveFilePreviewMeta({
      source: {
        file: createMockFile('bundle.7z', 'application/x-7z-compressed')
      }
    });

    expect(meta.engine).toBe('unsupported');
    expect(meta.extension).toBe('7z');
  });

  it('图片 mimeType 应识别为 image', () => {
    const meta = resolveFilePreviewMeta({
      source: {
        file: createMockFile('头像.bin', 'image/png')
      }
    });

    expect(meta.engine).toBe('image');
    expect(meta.mimeType).toBe('image/png');
  });
});
