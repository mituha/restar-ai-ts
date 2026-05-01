import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), dts({
    tsconfigPath: './tsconfig.app.json',
    include: ['src'],
    insertTypesEntry: true,
    bundleTypes: true
  })],
  build: {
    lib: {
      // エントリーポイント（index.ts）を指定
      // なお、src/index.tsの場合、d.tsにtype定義が出力されない。
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'restar-ai-ts',
      fileName: 'index',
      // formats: ['es', 'umd'] // モダンなESMと、汎用的なUMD両方出すわん デフォルトで両方出す模様
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'lucide-react',
        /^ai(\/.*)?$/,
        /^@ai-sdk(\/.*)?$/
      ],
      output: [
        {
          format: 'es',
          entryFileNames: 'index.js',
          preserveModules: false,
        },
        {
          format: 'umd',
          name: 'restar-ai-ts',
          entryFileNames: 'index.umd.cjs',
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
            'react/jsx-runtime': 'jsxRuntime',
            'react/jsx-dev-runtime': 'jsxDevRuntime',
            'lucide-react': 'Lucide',
            'ai': 'Ai',
            '@ai-sdk/google': 'AiGoogle',
            '@ai-sdk/openai': 'AiOpenai'
          }
        }
      ]
    },
    minify: true
  }
})
