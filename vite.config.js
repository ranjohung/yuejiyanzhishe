import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

// CLI 编译入口（项目统一用 Vite + uni CLI，不再使用 HBuilderX）
// 平台通过 -p 参数切换：mp-weixin / h5 / app
export default defineConfig({
  plugins: [uni()],
  server: {
    port: 8080
  }
})
