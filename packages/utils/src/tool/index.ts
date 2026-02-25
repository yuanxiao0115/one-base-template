/**
 * 通用工具函数
 * @description 从admin项目迁移的通用工具函数
 */

/**
 * 根据身份证计算年龄
 * @param idcard - 身份证号
 * @returns 年龄
 *
 * @example
 * ```typescript
 * getAgeByIdCard('110101199001011234') // => 34 (假设当前是2024年)
 * ```
 */
export function getAgeByIdCard(idcard: string): number | null {
  if (!idcard || idcard.length < 14) return null

  const myDate = new Date()
  const month = myDate.getMonth() + 1
  const day = myDate.getDate()

  let age = myDate.getFullYear() - parseInt(idcard.substring(6, 10)) - 1

  if (
    parseInt(idcard.substring(10, 12)) < month ||
    (parseInt(idcard.substring(10, 12)) === month && parseInt(idcard.substring(12, 14)) <= day)
  ) {
    age++
  }

  return age
}

/**
 * 根据生日计算年龄
 * @param birthDateString - 生日字符串
 * @returns 年龄
 *
 * @example
 * ```typescript
 * getAgeByBirthDay('1990-01-01') // => 34 (假设当前是2024年)
 * ```
 */
export function getAgeByBirthDay(birthDateString: string): number {
  const birthDate = new Date(birthDateString)
  const today = new Date()

  let age = today.getFullYear() - birthDate.getFullYear()

  if (
    today.getMonth() < birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
  ) {
    age--
  }

  return age
}

/**
 * 过滤空值属性
 * @param params - 参数对象
 * @returns 过滤后的参数对象
 *
 * @example
 * ```typescript
 * filterNull({ name: 'test', value: '', count: null })
 * // => { name: 'test' }
 * ```
 */
export function filterNull<T extends Record<string, any>>(params: T): Partial<T> {
  const result = { ...params }

  function filter(obj: any): any {
    for (const key in obj) {
      if (obj[key] instanceof Object && !Array.isArray(obj[key])) {
        filter(obj[key])
      } else if (obj[key] === null || obj[key] === undefined || obj[key] === '') {
        delete obj[key]
      }
    }
    return obj
  }

  return filter(result)
}

/**
 * 为数组项添加序号
 * @param data - 数据数组
 * @param currentPage - 当前页码
 * @param pageSize - 每页大小
 * @returns 添加序号后的数组
 *
 * @example
 * ```typescript
 * const data = [{ name: 'A' }, { name: 'B' }]
 * addIndex(data, 2, 10)
 * // => [{ name: 'A', index: 11 }, { name: 'B', index: 12 }]
 * ```
 */
export function addIndex<T extends Record<string, any>>(
  data: T[],
  currentPage: number,
  pageSize: number,
): (T & { index: number })[] {
  return data.map((item, index) => ({
    ...item,
    index: (currentPage - 1) * pageSize + index + 1,
  }))
}

/**
 * 获取两个数组的差异项
 * @param arr1 - 第一个数组
 * @param arr2 - 第二个数组
 * @param compareKey - 比较的键名，默认为'name'
 * @returns arr1中存在但arr2中不存在的项
 *
 * @example
 * ```typescript
 * const arr1 = [{ name: 'A' }, { name: 'B' }]
 * const arr2 = [{ name: 'A' }]
 * getDifferentArr(arr1, arr2) // => [{ name: 'B' }]
 * ```
 */
export function getDifferentArr<T extends Record<string, any>>(
  arr1: T[],
  arr2: T[],
  compareKey: string = 'name',
): T[] {
  return arr1.filter((item1) => !arr2.some((item2) => item2[compareKey] === item1[compareKey]))
}

/**
 * 检查Blob文件类型
 * @param response - 响应数据
 * @returns Promise<{ json: boolean; data?: any }>
 *
 * @example
 * ```typescript
 * const result = await checkBlobFile(response)
 * if (result.json) {
 *   console.log('JSON数据:', result.data)
 * } else {
 *   console.log('文件流数据')
 * }
 * ```
 */
export function checkBlobFile(response: any): Promise<{ json: boolean; data?: any }> {
  return new Promise((resolve) => {
    const fileReader = new FileReader()
    fileReader.readAsText(response)
    fileReader.onload = function () {
      try {
        const jsonData = JSON.parse(fileReader.result as string)
        if (jsonData?.code) {
          resolve({ json: true, data: jsonData })
        } else {
          resolve({ json: false })
        }
      } catch {
        // 解析成对象失败，说明是正常的文件流
        resolve({ json: false })
      }
    }
  })
}

/**
 * 下载文件
 * @param blob - 文件Blob对象
 * @param fileName - 文件名
 *
 * @example
 * ```typescript
 * const blob = new Blob(['Hello World'], { type: 'text/plain' })
 * downloadFile(blob, 'hello.txt')
 * ```
 */
export function downloadFile(blob: Blob, fileName: string): void {
  // 兼容IE
  if ((navigator as any).msSaveBlob) {
    ;(navigator as any).msSaveBlob(blob, fileName)
  } else {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.style.display = 'none'
    link.href = url
    link.target = '_blank'
    link.setAttribute('download', decodeURIComponent(fileName))
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }
}

/**
 * 获取当前租户ID
 * @returns 租户ID
 *
 * @example
 * ```typescript
 * const tenantId = getCurrentTenantId()
 * ```
 */
export function getCurrentTenantId(): string | null {
  // 这里需要根据实际的存储方式来实现
  // 暂时返回null，实际使用时需要替换为具体的实现
  return null
}

/**
 * 在数据中添加租户ID
 * @param data - 数据对象
 * @param keyName - 租户ID字段名，默认为'tenantId'
 * @returns 添加租户ID后的数据
 *
 * @example
 * ```typescript
 * const data = { name: 'test' }
 * addTenantIdInData(data) // => { name: 'test', tenantId: 'xxx' }
 * ```
 */
export function addTenantIdInData<T extends Record<string, any>>(
  data: T,
  keyName: string = 'tenantId',
): T & Record<string, any> {
  const tenantId = getCurrentTenantId()
  if (tenantId) {
    ;(data as any)[keyName] = tenantId
  }
  return data
}

/**
 * 判断是否为图片元素
 * @param element - DOM元素
 * @returns 是否为图片元素
 */
export function isImgElement(element: any): boolean {
  return element && element.tagName && element.tagName.toLowerCase() === 'img'
}

/**
 * 阻止默认事件的工具函数
 * @description 阻止F12、右键菜单、选中、拖拽等默认行为
 */
export function addPreventDefault(): void {
  // 阻止通过键盘F12快捷键打开浏览器开发者工具面板
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'F12') {
      ev.preventDefault()
    }
  })

  // 阻止浏览器默认的右键菜单弹出
  document.addEventListener('contextmenu', (ev) => {
    ev.preventDefault()
  })

  // 阻止页面元素选中
  document.addEventListener('selectstart', (ev) => {
    ev.preventDefault()
  })

  // 阻止图片拖拽
  document.addEventListener('dragstart', (ev) => {
    if (isImgElement(ev.target)) {
      ev.preventDefault()
    }
  })
}
