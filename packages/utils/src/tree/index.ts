/**
 * 树形数据处理工具函数
 * @description 提供树形数据的查找、过滤、遍历、转换等功能
 */

/**
 * 树节点基础接口
 */
export interface TreeNode {
  id: string | number
  children?: TreeNode[]
  [key: string]: any
}

/**
 * 菜单节点接口（业务特定）
 */
export interface MenuNode extends TreeNode {
  name: string
  isHide: number
  children?: MenuNode[]
}

/**
 * 过滤树形数据
 * @param tree - 树形数据数组
 * @param predicate - 过滤条件函数
 * @returns 过滤后的树形数据
 *
 * @example
 * ```typescript
 * const tree = [
 *   { id: 1, name: 'A', children: [{ id: 2, name: 'B' }] }
 * ]
 * filterTree(tree, node => node.name.includes('A'))
 * // => [{ id: 1, name: 'A', children: [] }]
 * ```
 */
export function filterTree<T extends TreeNode>(tree: T[], predicate: (node: T) => boolean): T[] {
  return tree.reduce((acc, node) => {
    if (predicate(node)) {
      const newNode = { ...node }
      if (node.children) {
        newNode.children = filterTree(node.children as T[], predicate)
      }
      acc.push(newNode)
    } else if (node.children) {
      const filteredChildren = filterTree(node.children as T[], predicate)
      if (filteredChildren.length > 0) {
        acc.push({ ...node, children: filteredChildren })
      }
    }
    return acc
  }, [] as T[])
}

/**
 * 根据ID查找树节点
 * @param tree - 树形数据数组
 * @param id - 节点ID
 * @returns 找到的节点或null
 *
 * @example
 * ```typescript
 * const tree = [{ id: 1, children: [{ id: 2 }] }]
 * findNodeById(tree, 2) // => { id: 2 }
 * ```
 */
export function findNodeById<T extends TreeNode>(tree: T[], id: string | number): T | null {
  for (const node of tree) {
    if (node.id === id) {
      return node
    }
    if (node.children) {
      const found = findNodeById(node.children as T[], id)
      if (found) return found
    }
  }
  return null
}

/**
 * 查找节点及其父节点路径
 * @param tree - 树形数据数组
 * @param id - 节点ID
 * @returns 从根到目标节点的路径数组
 *
 * @example
 * ```typescript
 * const tree = [{ id: 1, children: [{ id: 2 }] }]
 * findNodePath(tree, 2) // => [{ id: 1, children: [...] }, { id: 2 }]
 * ```
 */
export function findNodePath<T extends TreeNode>(tree: T[], id: string | number): T[] {
  for (const node of tree) {
    if (node.id === id) {
      return [node]
    }
    if (node.children) {
      const path = findNodePath(node.children as T[], id)
      if (path.length > 0) {
        return [node, ...path]
      }
    }
  }
  return []
}

/**
 * 遍历树形数据
 * @param tree - 树形数据数组
 * @param callback - 遍历回调函数
 * @param parent - 父节点（可选）
 * @param level - 当前层级（可选）
 *
 * @example
 * ```typescript
 * traverseTree(tree, (node, parent, level) => {
 *   console.log(`Level ${level}: ${node.name}`)
 * })
 * ```
 */
export function traverseTree<T extends TreeNode>(
  tree: T[],
  callback: (node: T, parent?: T, level?: number) => void,
  parent?: T,
  level = 0,
): void {
  tree.forEach((node) => {
    callback(node, parent, level)
    if (node.children) {
      traverseTree(node.children as T[], callback, node, level + 1)
    }
  })
}

/**
 * 树形数据转扁平数组
 * @param tree - 树形数据数组
 * @param childrenKey - 子节点键名，默认为'children'
 * @returns 扁平化后的数组
 *
 * @example
 * ```typescript
 * const tree = [{ id: 1, children: [{ id: 2 }] }]
 * treeToFlat(tree) // => [{ id: 1 }, { id: 2 }]
 * ```
 */
export function treeToFlat<T extends TreeNode>(
  tree: T[],
  childrenKey: string = 'children',
): Omit<T, 'children'>[] {
  const result: Omit<T, 'children'>[] = []

  function flatten(nodes: T[]) {
    nodes.forEach((node) => {
      const { [childrenKey]: children, ...rest } = node
      result.push(rest as Omit<T, 'children'>)
      if (children && Array.isArray(children)) {
        flatten(children as T[])
      }
    })
  }

  flatten(tree)
  return result
}

/**
 * 扁平数组转树形数据
 * @param flatArray - 扁平数组
 * @param options - 配置选项
 * @returns 树形数据数组
 *
 * @example
 * ```typescript
 * const flat = [
 *   { id: 1, parentId: null, name: 'A' },
 *   { id: 2, parentId: 1, name: 'B' }
 * ]
 * flatToTree(flat) // => [{ id: 1, name: 'A', children: [{ id: 2, name: 'B' }] }]
 * ```
 */
export function flatToTree<T extends Record<string, any>>(
  flatArray: T[],
  options: {
    idKey?: string
    parentIdKey?: string
    childrenKey?: string
    rootValue?: any
  } = {},
): T[] {
  const {
    idKey = 'id',
    parentIdKey = 'parentId',
    childrenKey = 'children',
    rootValue = null,
  } = options

  const tree: T[] = []
  const map = new Map<any, T>()

  // 创建映射
  flatArray.forEach((item) => {
    map.set(item[idKey], { ...item, [childrenKey]: [] })
  })

  // 构建树形结构
  flatArray.forEach((item) => {
    const node = map.get(item[idKey])!
    const parentId = item[parentIdKey]

    if (parentId === rootValue || parentId === undefined) {
      tree.push(node)
    } else {
      const parent = map.get(parentId)
      if (parent) {
        parent[childrenKey].push(node)
      }
    }
  })

  return tree
}

/**
 * 过滤可见菜单（业务特定）
 * @param list - 菜单列表
 * @returns 过滤后的可见菜单
 *
 * @example
 * ```typescript
 * const menus = [
 *   { id: 1, name: 'Menu1', isHide: 0, children: [
 *     { id: 2, name: 'Menu2', isHide: 1 }
 *   ]}
 * ]
 * filterVisibleMenu(menus) // => [{ id: 1, name: 'Menu1', isHide: 0, children: [] }]
 * ```
 */
export function filterVisibleMenu(list: MenuNode[]): MenuNode[] {
  const result: MenuNode[] = []

  function dfs(nodes: MenuNode[], target: MenuNode[]) {
    nodes?.forEach((item) => {
      if (item.isHide === 0) {
        const newItem = { ...item }
        if (item.children?.length) {
          const children: MenuNode[] = []
          dfs(item.children, children)
          newItem.children = children
        }
        target.push(newItem)
      }
    })
  }

  dfs(list, result)
  return result
}

/**
 * 获取树的最大深度
 * @param tree - 树形数据数组
 * @returns 最大深度
 *
 * @example
 * ```typescript
 * const tree = [{ id: 1, children: [{ id: 2, children: [{ id: 3 }] }] }]
 * getTreeDepth(tree) // => 3
 * ```
 */
export function getTreeDepth<T extends TreeNode>(tree: T[]): number {
  if (!tree || tree.length === 0) return 0

  let maxDepth = 1

  tree.forEach((node) => {
    if (node.children && node.children.length > 0) {
      const childDepth = getTreeDepth(node.children as T[])
      maxDepth = Math.max(maxDepth, childDepth + 1)
    }
  })

  return maxDepth
}

/**
 * 获取树的所有叶子节点
 * @param tree - 树形数据数组
 * @returns 叶子节点数组
 *
 * @example
 * ```typescript
 * const tree = [{ id: 1, children: [{ id: 2 }, { id: 3 }] }]
 * getLeafNodes(tree) // => [{ id: 2 }, { id: 3 }]
 * ```
 */
export function getLeafNodes<T extends TreeNode>(tree: T[]): T[] {
  const leafNodes: T[] = []

  traverseTree(tree, (node) => {
    if (!node.children || node.children.length === 0) {
      leafNodes.push(node)
    }
  })

  return leafNodes
}

/**
 * 提取菜单树中的每一项uniqueId
 * @param tree - 树形数据
 * @returns 每一项uniqueId组成的数组
 *
 * @example
 * ```typescript
 * const tree = [{ uniqueId: '1', children: [{ uniqueId: '1-1' }] }]
 * extractPathList(tree) // => ['1', '1-1']
 * ```
 */
export function extractPathList(tree: any[]): (number | string)[] {
  if (!Array.isArray(tree)) {
    console.warn('tree must be an array')
    return []
  }
  if (!tree || tree.length === 0) return []

  const expandedPaths: (number | string)[] = []

  function traverse(nodes: any[]) {
    for (const node of nodes) {
      expandedPaths.push(node.uniqueId)
      const hasChildren = node.children && node.children.length > 0
      if (hasChildren) {
        traverse(node.children)
      }
    }
  }

  traverse(tree)
  return expandedPaths
}

/**
 * 如果父级下children的length为1，删除children并自动组建唯一uniqueId
 * @param tree - 树形数据
 * @param pathList - 每一项的id组成的数组
 * @returns 组件唯一uniqueId后的树
 *
 * @example
 * ```typescript
 * const tree = [{ children: [{ name: 'single' }] }]
 * deleteChildren(tree) // 删除只有一个子节点的children属性
 * ```
 */
export function deleteChildren(tree: any[], pathList: any[] = []): any[] {
  if (!Array.isArray(tree)) {
    console.warn('menuTree must be an array')
    return []
  }
  if (!tree || tree.length === 0) return []

  for (const [key, node] of tree.entries()) {
    if (node.children && node.children.length === 1) {
      delete node.children
    }
    node.id = key
    node.parentId = pathList.length ? pathList[pathList.length - 1] : null
    node.pathList = [...pathList, node.id]
    node.uniqueId = node.pathList.length > 1 ? node.pathList.join('-') : node.pathList[0]

    const hasChildren = node.children && node.children.length > 0
    if (hasChildren) {
      deleteChildren(node.children, node.pathList)
    }
  }

  return tree
}

/**
 * 创建层级关系
 * @param tree - 树形数据
 * @param pathList - 每一项的id组成的数组
 * @returns 创建层级关系后的树
 *
 * @example
 * ```typescript
 * const tree = [{ name: 'root', children: [{ name: 'child' }] }]
 * buildHierarchyTree(tree) // 为每个节点添加id、parentId、pathList等属性
 * ```
 */
export function buildHierarchyTree(tree: any[], pathList: any[] = []): any[] {
  if (!Array.isArray(tree)) {
    console.warn('tree must be an array')
    return []
  }
  if (!tree || tree.length === 0) return []

  for (const [key, node] of tree.entries()) {
    node.id = key
    node.parentId = pathList.length ? pathList[pathList.length - 1] : null
    node.pathList = [...pathList, node.id]

    const hasChildren = node.children && node.children.length > 0
    if (hasChildren) {
      buildHierarchyTree(node.children, node.pathList)
    }
  }

  return tree
}

/**
 * 广度优先遍历，根据唯一uniqueId找当前节点信息
 * @param tree - 树形数据
 * @param uniqueId - 唯一uniqueId
 * @returns 当前节点信息
 *
 * @example
 * ```typescript
 * const tree = [{ uniqueId: '1', children: [{ uniqueId: '1-1' }] }]
 * getNodeByUniqueId(tree, '1-1') // => { uniqueId: '1-1' }
 * ```
 */
export function getNodeByUniqueId(tree: any[], uniqueId: number | string): any {
  if (!Array.isArray(tree)) {
    console.warn('menuTree must be an array')
    return null
  }
  if (!tree || tree.length === 0) return null

  const item = tree.find((node) => node.uniqueId === uniqueId)
  if (item) return item

  const childrenList = tree
    .filter((node) => node.children)
    .map((i) => i.children)
    .flat(1)

  return getNodeByUniqueId(childrenList, uniqueId)
}

/**
 * 向当前唯一uniqueId节点中追加字段
 * @param tree - 树形数据
 * @param uniqueId - 唯一uniqueId
 * @param fields - 需要追加的字段
 * @returns 追加字段后的树
 *
 * @example
 * ```typescript
 * const tree = [{ uniqueId: '1', name: 'test' }]
 * appendFieldByUniqueId(tree, '1', { active: true })
 * // tree[0] => { uniqueId: '1', name: 'test', active: true }
 * ```
 */
export function appendFieldByUniqueId(
  tree: any[],
  uniqueId: number | string,
  fields: object,
): any[] {
  if (!Array.isArray(tree)) {
    console.warn('menuTree must be an array')
    return []
  }
  if (!tree || tree.length === 0) return []

  for (const node of tree) {
    const hasChildren = node.children && node.children.length > 0
    if (
      node.uniqueId === uniqueId &&
      Object.prototype.toString.call(fields) === '[object Object]'
    ) {
      Object.assign(node, fields)
    }
    if (hasChildren) {
      appendFieldByUniqueId(node.children, uniqueId, fields)
    }
  }

  return tree
}

/**
 * 构造树型结构数据
 * @param data - 数据源
 * @param id - id字段，默认id
 * @param parentId - 父节点字段，默认parentId
 * @param children - 子节点字段，默认children
 * @returns 构造后的树
 *
 * @example
 * ```typescript
 * const data = [
 *   { id: 1, parentId: null, name: 'root' },
 *   { id: 2, parentId: 1, name: 'child1' },
 *   { id: 3, parentId: 1, name: 'child2' }
 * ]
 * handleTree(data) // => [{ id: 1, children: [{ id: 2 }, { id: 3 }] }]
 * ```
 */
export function handleTree(data: any[], id?: string, parentId?: string, children?: string): any[] {
  if (!Array.isArray(data)) {
    console.warn('data must be an array')
    return []
  }

  const config = {
    id: id || 'id',
    parentId: parentId || 'parentId',
    childrenList: children || 'children',
  }

  const childrenListMap: any = {}
  const nodeIds: any = {}
  const tree = []

  for (const d of data) {
    const parentId = d[config.parentId]
    if (childrenListMap[parentId] == null) {
      childrenListMap[parentId] = []
    }
    nodeIds[d[config.id]] = d
    childrenListMap[parentId].push(d)
  }

  for (const d of data) {
    const parentId = d[config.parentId]
    if (nodeIds[parentId] == null) {
      tree.push(d)
    }
  }

  for (const t of tree) {
    adaptToChildrenList(t)
  }

  function adaptToChildrenList(o: Record<string, any>) {
    if (childrenListMap[o[config.id]] !== null) {
      o[config.childrenList] = childrenListMap[o[config.id]]
    }
    if (o[config.childrenList]) {
      for (const c of o[config.childrenList]) {
        adaptToChildrenList(c)
      }
    }
  }

  return tree
}

/**
 * 构造权限树
 * @param data - 数据源
 * @param parentId - 父级ID，默认为'0'
 * @returns 构造后的权限树
 *
 * @example
 * ```typescript
 * const data = [
 *   { id: '1', resourceName: 'root', children: [] },
 *   { id: '2', resourceName: 'child', children: [] }
 * ]
 * recursionBuildTree(data) // 构造TreeSelect数据格式
 * ```
 */
export function recursionBuildTree(data: any[], parentId: string = '0'): any[] {
  if (!data.length) return []

  for (let i = 0; i < data.length; i++) {
    data[i].title = data[i].resourceName
    data[i].expand = true
    data[i]._showChildren = true // 设置 data 属性 _showChildren，默认会展开子数据
    data[i].value = data[i].id
    data[i].parentId = parentId // 父级部门ID
    if (data[i].children.length) {
      recursionBuildTree(data[i].children, data[i].id)
    }
  }

  return data
}

/**
 * 获取扁平化菜单
 * @param list - 菜单列表
 * @param level - 层级，默认为1
 * @returns 扁平化菜单
 *
 * @example
 * ```typescript
 * const tree = [{ id: 1, children: [{ id: 2 }] }]
 * getFlatMenu(tree) // => [{ id: 1, level: 1 }, { id: 2, level: 2 }]
 * ```
 */
export function getFlatMenu(list: any[], level: number = 1): any[] {
  const cList = JSON.parse(JSON.stringify(list)) // 深拷贝
  const menu: any[] = []

  function dfs(cList: any[], level: number = 1, parentIdList: any[] = []) {
    cList.forEach((item) => {
      if (level === 1) {
        item.parentIdList = [item.parentId]
      } else {
        item.parentIdList = parentIdList.concat([item.parentId])
      }
      item.level = level
      menu.push(item)
      if (item?.children?.length) {
        level++
        dfs(item?.children || [], level, item.parentIdList)
      }
    })
  }

  dfs(cList, level, [])
  return menu
}

/**
 * 获取有权限的扁平化菜单
 * @param list - 菜单列表
 * @returns 有权限的扁平化菜单
 *
 * @example
 * ```typescript
 * const tree = [{ id: 1, isHide: 0, children: [{ id: 2, isHide: 1 }] }]
 * getAuthedFlatMenu(tree) // => [{ id: 1, isHide: 0 }]
 * ```
 */
export function getAuthedFlatMenu(list: any[]): any[] {
  const cList = JSON.parse(JSON.stringify(list)) // 深拷贝
  const menu: any[] = []

  function dfs(cList: any[]) {
    cList.forEach((item) => {
      if (item.isHide === 0) {
        menu.push(item)
        if (item?.children?.length) {
          dfs(item?.children || [])
        }
      }
    })
  }

  dfs(cList)
  return menu
}

/**
 * 根据标签ID获取菜单
 * @param tabList - 标签列表
 * @param tabId - 标签ID
 * @returns 菜单项
 *
 * @example
 * ```typescript
 * const tabList = [{ id: '1', children: [{ id: '2' }] }]
 * getMenuByTabId(tabList, '2') // => { id: '2' }
 * ```
 */
export function getMenuByTabId(tabList: any[], tabId: string): any {
  let menu: any = []

  function dfs(arr: any[]) {
    arr.forEach((item) => {
      if (item.id === tabId) {
        menu = item
        return
      } else if (item.children?.length) {
        dfs(item.children)
      }
    })
  }

  dfs(tabList)
  return menu
}
