import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      input: {
        // 팝업 페이지 엔트리 포인트 설정
        popup: resolve(__dirname, 'popup.html'),
        // 만약 옵션 페이지도 있다면 추가: options: resolve(__dirname, 'options.html'),
        // 백그라운드 스크립트가 있다면 별도 처리가 필요하지만 일단 UI부터
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  }
})
