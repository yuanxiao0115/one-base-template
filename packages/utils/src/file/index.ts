/**
 * 文件处理工具函数
 * @description 提供文件上传、下载、转换等功能
 */

/**
 * 文件类型枚举
 */
export enum FileType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  ARCHIVE = 'archive',
  OTHER = 'other',
}

/**
 * 文件信息接口
 */
export interface FileInfo {
  name: string
  size: number
  type: string
  lastModified: number
  extension: string
  category: FileType
}

/**
 * 获取文件信息
 * @param file - 文件对象
 * @returns 文件信息
 *
 * @example
 * ```typescript
 * const fileInfo = getFileInfo(file)
 * console.log(fileInfo.name, fileInfo.size, fileInfo.category)
 * ```
 */
export function getFileInfo(file: File): FileInfo {
  const extension = getFileExtension(file.name)
  const category = getFileCategory(file.type, extension)

  return {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
    extension,
    category,
  }
}

/**
 * 获取文件扩展名
 * @param fileName - 文件名
 * @returns 扩展名（不含点号）
 *
 * @example
 * ```typescript
 * getFileExtension('document.pdf') // => 'pdf'
 * getFileExtension('image.jpg') // => 'jpg'
 * ```
 */
export function getFileExtension(fileName: string): string {
  const lastDotIndex = fileName.lastIndexOf('.')
  return lastDotIndex > 0 ? fileName.slice(lastDotIndex + 1).toLowerCase() : ''
}

/**
 * 获取文件分类
 * @param mimeType - MIME类型
 * @param extension - 文件扩展名
 * @returns 文件分类
 *
 * @example
 * ```typescript
 * getFileCategory('image/jpeg', 'jpg') // => FileType.IMAGE
 * getFileCategory('application/pdf', 'pdf') // => FileType.DOCUMENT
 * ```
 */
export function getFileCategory(mimeType: string, extension: string): FileType {
  // 图片类型
  if (
    mimeType.startsWith('image/') ||
    ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(extension)
  ) {
    return FileType.IMAGE
  }

  // 视频类型
  if (
    mimeType.startsWith('video/') ||
    ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'].includes(extension)
  ) {
    return FileType.VIDEO
  }

  // 音频类型
  if (
    mimeType.startsWith('audio/') ||
    ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma'].includes(extension)
  ) {
    return FileType.AUDIO
  }

  // 文档类型
  if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf'].includes(extension)) {
    return FileType.DOCUMENT
  }

  // 压缩包类型
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(extension)) {
    return FileType.ARCHIVE
  }

  return FileType.OTHER
}

/**
 * 格式化文件大小
 * @param bytes - 字节数
 * @param decimals - 小数位数
 * @returns 格式化后的文件大小
 *
 * @example
 * ```typescript
 * formatFileSize(1024) // => '1 KB'
 * formatFileSize(1048576) // => '1 MB'
 * formatFileSize(1073741824, 2) // => '1.00 GB'
 * ```
 */
export function formatFileSize(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * 验证文件类型
 * @param file - 文件对象
 * @param allowedTypes - 允许的文件类型
 * @returns 是否通过验证
 *
 * @example
 * ```typescript
 * validateFileType(file, ['image/jpeg', 'image/png'])
 * validateFileType(file, ['.jpg', '.png', '.gif'])
 * ```
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  const extension = '.' + getFileExtension(file.name)

  return allowedTypes.some((type) => {
    if (type.startsWith('.')) {
      return type.toLowerCase() === extension.toLowerCase()
    }
    return file.type === type
  })
}

/**
 * 验证文件大小
 * @param file - 文件对象
 * @param maxSize - 最大文件大小（字节）
 * @returns 是否通过验证
 *
 * @example
 * ```typescript
 * validateFileSize(file, 5 * 1024 * 1024) // 5MB
 * ```
 */
export function validateFileSize(file: File, maxSize: number): boolean {
  return file.size <= maxSize
}

/**
 * 读取文件为文本
 * @param file - 文件对象
 * @param encoding - 编码格式
 * @returns Promise<文本内容>
 *
 * @example
 * ```typescript
 * const text = await readFileAsText(file)
 * console.log(text)
 * ```
 */
export function readFileAsText(file: File, encoding: string = 'UTF-8'): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file, encoding)
  })
}

/**
 * 读取文件为DataURL
 * @param file - 文件对象
 * @returns Promise<DataURL>
 *
 * @example
 * ```typescript
 * const dataUrl = await readFileAsDataURL(file)
 * img.src = dataUrl
 * ```
 */
export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

/**
 * 读取文件为ArrayBuffer
 * @param file - 文件对象
 * @returns Promise<ArrayBuffer>
 *
 * @example
 * ```typescript
 * const buffer = await readFileAsArrayBuffer(file)
 * ```
 */
export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = () => reject(reader.error)
    reader.readAsArrayBuffer(file)
  })
}

/**
 * 下载文件
 * @param blob - Blob对象或URL
 * @param fileName - 文件名
 *
 * @example
 * ```typescript
 * const blob = new Blob(['Hello World'], { type: 'text/plain' })
 * downloadFile(blob, 'hello.txt')
 *
 * downloadFile('https://example.com/file.pdf', 'document.pdf')
 * ```
 */
export function downloadFile(blob: Blob | string, fileName: string): void {
  const link = document.createElement('a')

  if (typeof blob === 'string') {
    link.href = blob
  } else {
    link.href = URL.createObjectURL(blob)
  }

  link.download = fileName
  link.style.display = 'none'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  if (typeof blob !== 'string') {
    URL.revokeObjectURL(link.href)
  }
}

/**
 * 压缩图片
 * @param file - 图片文件
 * @param options - 压缩选项
 * @returns Promise<压缩后的Blob>
 *
 * @example
 * ```typescript
 * const compressedBlob = await compressImage(file, {
 *   maxWidth: 800,
 *   maxHeight: 600,
 *   quality: 0.8
 * })
 * ```
 */
export function compressImage(
  file: File,
  options: {
    maxWidth?: number
    maxHeight?: number
    quality?: number
    outputType?: string
  } = {},
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const { maxWidth = 1920, maxHeight = 1080, quality = 0.8, outputType = 'image/jpeg' } = options

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // 计算压缩后的尺寸
      let { width, height } = img

      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      if (height > maxHeight) {
        width = (width * maxHeight) / height
        height = maxHeight
      }

      canvas.width = width
      canvas.height = height

      // 绘制图片
      ctx?.drawImage(img, 0, 0, width, height)

      // 转换为Blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('图片压缩失败'))
          }
        },
        outputType,
        quality,
      )
    }

    img.onerror = () => reject(new Error('图片加载失败'))
    img.src = URL.createObjectURL(file)
  })
}

/**
 * 获取图片尺寸
 * @param file - 图片文件
 * @returns Promise<{width: number, height: number}>
 *
 * @example
 * ```typescript
 * const { width, height } = await getImageDimensions(file)
 * console.log(`图片尺寸: ${width}x${height}`)
 * ```
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      })
      URL.revokeObjectURL(img.src)
    }

    img.onerror = () => {
      reject(new Error('无法加载图片'))
      URL.revokeObjectURL(img.src)
    }

    img.src = URL.createObjectURL(file)
  })
}

/**
 * 文件转换为Base64
 * @param file - 文件对象
 * @returns Promise<Base64字符串>
 *
 * @example
 * ```typescript
 * const base64 = await fileToBase64(file)
 * ```
 */
export function fileToBase64(file: File): Promise<string> {
  return readFileAsDataURL(file).then((dataUrl) => {
    return dataUrl.split(',')[1] // 移除data:image/jpeg;base64,前缀
  })
}

/**
 * Base64转换为Blob
 * @param base64 - Base64字符串
 * @param mimeType - MIME类型
 * @returns Blob对象
 *
 * @example
 * ```typescript
 * const blob = base64ToBlob(base64String, 'image/jpeg')
 * ```
 */
export function base64ToBlob(base64: string, mimeType: string = ''): Blob {
  const byteCharacters = atob(base64)
  const byteNumbers = new Array(byteCharacters.length)

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }

  const byteArray = new Uint8Array(byteNumbers)
  return new Blob([byteArray], { type: mimeType })
}

/**
 * 获取文件URL
 * @param url - 文件路径
 * @param baseUrl - 基础URL
 * @returns 完整的文件URL
 *
 * @example
 * ```typescript
 * getLinkUrl('/uploads/file.pdf', 'https://cdn.example.com')
 * // => 'https://cdn.example.com/uploads/file.pdf'
 *
 * getLinkUrl('https://example.com/file.pdf')
 * // => 'https://example.com/file.pdf'
 * ```
 */
export function getLinkUrl(url: string, baseUrl?: string): string {
  if (!url) return ''

  if (url.includes('http')) {
    return url
  }

  // 兼容不同环境的环境变量获取
  let envFileUrl = ''
  try {
    // Vite环境
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      envFileUrl = (import.meta as any).env?.VITE_APP_FILE_URL || ''
    }
    // Node.js环境
    else if (typeof process !== 'undefined' && process.env) {
      envFileUrl = process.env.VITE_APP_FILE_URL || ''
    }
  } catch (e) {
    // 忽略环境变量获取错误
  }

  const base = baseUrl || envFileUrl || ''
  return base + url
}

/**
 * 从URL中获取文件扩展名（从admin迁移）
 * @param url - 文件URL
 * @returns 文件扩展名（不含点号）
 *
 * @example
 * ```typescript
 * getFileExtensionFromUrl('https://example.com/file.pdf') // => 'pdf'
 * getFileExtensionFromUrl('image.jpg?v=123') // => 'jpg'
 * getFileExtensionFromUrl('document') // => ''
 * ```
 */
export function getFileExtensionFromUrl(url: string): string {
  if (!url) return ''

  // 移除查询参数和锚点
  const cleanUrl = url.split('?')[0].split('#')[0]

  // 获取文件名部分
  const fileName = cleanUrl.split('/').pop() || ''

  // 获取扩展名
  const lastDotIndex = fileName.lastIndexOf('.')
  if (lastDotIndex === -1 || lastDotIndex === fileName.length - 1) {
    return ''
  }

  return fileName.slice(lastDotIndex + 1).toLowerCase()
}

/**
 * 检查文件是否为图片类型
 * @param file - 文件对象或文件名
 * @returns 是否为图片
 *
 * @example
 * ```typescript
 * isImageFile('photo.jpg') // => true
 * isImageFile('document.pdf') // => false
 * ```
 */
export function isImageFile(file: File | string): boolean {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico']

  let extension = ''
  if (typeof file === 'string') {
    extension = getFileExtension(file)
  } else {
    extension = getFileExtension(file.name)
  }

  return imageExtensions.includes(extension.toLowerCase())
}

/**
 * 检查文件是否为视频类型
 * @param file - 文件对象或文件名
 * @returns 是否为视频
 *
 * @example
 * ```typescript
 * isVideoFile('movie.mp4') // => true
 * isVideoFile('audio.mp3') // => false
 * ```
 */
export function isVideoFile(file: File | string): boolean {
  const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v', '3gp']

  let extension = ''
  if (typeof file === 'string') {
    extension = getFileExtension(file)
  } else {
    extension = getFileExtension(file.name)
  }

  return videoExtensions.includes(extension.toLowerCase())
}

/**
 * 检查文件是否为音频类型
 * @param file - 文件对象或文件名
 * @returns 是否为音频
 *
 * @example
 * ```typescript
 * isAudioFile('song.mp3') // => true
 * isAudioFile('video.mp4') // => false
 * ```
 */
export function isAudioFile(file: File | string): boolean {
  const audioExtensions = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a']

  let extension = ''
  if (typeof file === 'string') {
    extension = getFileExtension(file)
  } else {
    extension = getFileExtension(file.name)
  }

  return audioExtensions.includes(extension.toLowerCase())
}

/**
 * 检查文件是否为文档类型
 * @param file - 文件对象或文件名
 * @returns 是否为文档
 *
 * @example
 * ```typescript
 * isDocumentFile('report.pdf') // => true
 * isDocumentFile('image.jpg') // => false
 * ```
 */
export function isDocumentFile(file: File | string): boolean {
  const documentExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf']

  let extension = ''
  if (typeof file === 'string') {
    extension = getFileExtension(file)
  } else {
    extension = getFileExtension(file.name)
  }

  return documentExtensions.includes(extension.toLowerCase())
}

/**
 * 生成唯一文件名
 * @param originalName - 原始文件名
 * @param timestamp - 是否添加时间戳
 * @returns 唯一文件名
 *
 * @example
 * ```typescript
 * generateUniqueFileName('photo.jpg') // => 'photo_1640995200000.jpg'
 * generateUniqueFileName('document.pdf', false) // => 'document_abc123.pdf'
 * ```
 */
export function generateUniqueFileName(originalName: string, timestamp: boolean = true): string {
  const extension = getFileExtension(originalName)
  const nameWithoutExt = originalName.slice(0, originalName.lastIndexOf('.'))

  const suffix = timestamp ? Date.now().toString() : Math.random().toString(36).substring(2, 8)

  return extension ? `${nameWithoutExt}_${suffix}.${extension}` : `${nameWithoutExt}_${suffix}`
}

/**
 * 批量下载文件
 * @param files - 文件列表
 * @param delay - 下载间隔（毫秒）
 *
 * @example
 * ```typescript
 * const files = [
 *   { url: 'file1.pdf', name: 'document1.pdf' },
 *   { url: 'file2.jpg', name: 'image1.jpg' }
 * ]
 * batchDownload(files, 1000)
 * ```
 */
export function batchDownload(
  files: Array<{ url: string; name: string }>,
  delay: number = 500,
): void {
  files.forEach((file, index) => {
    setTimeout(() => {
      downloadFile(file.url, file.name)
    }, index * delay)
  })
}
