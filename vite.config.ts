import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), dts()],
  build: {
    lib: {
      // エントリーポイント（index.ts）を指定
      // なお、src/index.tsの場合、d.tsにtype定義が出力されない。
      entry: resolve(__dirname, 'lib/index.ts'),
      name: 'restar-ai-ts',
      fileName: 'index',
      // formats: ['es', 'umd'] // モダンなESMと、汎用的なUMD両方出すわん デフォルトで両方出す模様
    },
    rollupOptions: {
      // react と react-dom はライブラリに含めず、使う側に持ってもらうわん
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    }
  }
})
