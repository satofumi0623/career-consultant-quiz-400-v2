import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'production' ? '/career-consultant-quiz-400-v2/' : '/',
}))
