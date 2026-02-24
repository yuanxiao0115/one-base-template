import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import fs from 'fs'

// 自定义插件：重命名 CSS 文件
const renameCssPlugin = () => {
  return {
    name: 'rename-css',
    writeBundle() {
      const distDir = resolve(__dirname, 'dist')

      // 检查 assets 目录
      const assetsDir = resolve(distDir, 'assets')
      if (fs.existsSync(assetsDir)) {
        const assetCssFiles = fs.readdirSync(assetsDir).filter((file) => file.endsWith('.css'))

        if (assetCssFiles.length > 0) {
          const originalPath = resolve(assetsDir, assetCssFiles[0])
          const newPath = resolve(distDir, 'index.css')

          if (fs.existsSync(originalPath)) {
            fs.copyFileSync(originalPath, newPath)
            console.log(`CSS file copied from assets/${assetCssFiles[0]} to index.css`)
          }
        }
      }

      // 处理根目录的 CSS 文件
      const cssFiles = fs
        .readdirSync(distDir)
        .filter((file) => file.endsWith('.css') && file !== 'index.css')

      // 如果找到其他 CSS 文件，重命名为 index.css
      if (cssFiles.length > 0) {
        const originalPath = resolve(distDir, cssFiles[0])
        const newPath = resolve(distDir, 'index.css')

        if (fs.existsSync(originalPath)) {
          // 如果 index.css 已存在，先删除原文件
          if (fs.existsSync(newPath)) {
            fs.unlinkSync(originalPath)
            console.log(`Removed duplicate CSS file: ${cssFiles[0]}`)
          } else {
            fs.renameSync(originalPath, newPath)
            console.log(`CSS file renamed from ${cssFiles[0]} to index.css`)
          }
        }
      }

      // 清理 assets 目录（如果为空）
      if (fs.existsSync(assetsDir)) {
        const remainingFiles = fs.readdirSync(assetsDir)
        if (remainingFiles.length === 0) {
          fs.rmdirSync(assetsDir)
          console.log('Removed empty assets directory')
        }
      }
    },
  }
}

export default defineConfig({
  plugins: [vue(), renameCssPlugin()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'OneTag',
      fileName: (format) =>
        `index.${format === 'es' ? 'js' : format === 'umd' ? 'umd.cjs' : format}`,
    },
    rollupOptions: {
      external: ['vue', 'vue-router', 'pinia'],
      output: {
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter',
          pinia: 'Pinia',
        },
        exports: 'named', // 使用命名导出，避免混合导出警告
      },
      // 排除测试文件
      input: {
        index: resolve(__dirname, 'src/index.ts'),
      },
      // 保守的 Tree Shaking 配置
      treeshake: true,
    },
    emptyOutDir: true,
    cssCodeSplit: false,
    // 禁用 source map 生成，隐藏源码
    sourcemap: false,
    // 启用压缩
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 移除所有 console
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        // 移除未使用的代码
        dead_code: true,
        // 移除未使用的变量
        unused: true,
        // 压缩条件表达式
        conditionals: true,
        // 压缩比较表达式
        comparisons: true,
        // 压缩布尔值
        booleans: true,
        // 压缩循环
        loops: true,
        // 内联函数
        inline: true,
      },
      mangle: {
        // 混淆所有变量名
        toplevel: true,
        // 混淆属性名（谨慎使用）
        properties: false,
      },
      format: {
        // 移除所有注释
        comments: false,
        // 移除多余的分号
        semicolons: false,
      },
    },
    // 启用 gzip 压缩报告
    reportCompressedSize: true,
    // CSS 压缩选项
    cssMinify: 'lightningcss',
  },
  css: {
    // CSS 预处理器配置
    preprocessorOptions: {},
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
