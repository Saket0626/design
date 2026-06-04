import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'runtime-config',
        configureServer(server) {
          server.middlewares.use('/runtime-config.js', (_req, res) => {
            const config = {
              VITE_SUPABASE_URL: env.VITE_SUPABASE_URL ?? '',
              VITE_SUPABASE_ANON_KEY: env.VITE_SUPABASE_ANON_KEY ?? '',
            }
            res.setHeader('Content-Type', 'application/javascript; charset=utf-8')
            res.end(`window.__RUNTIME_CONFIG__=${JSON.stringify(config)};`)
          })
        },
      },
    ],
  }
})
