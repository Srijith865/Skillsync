import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import dotenv from 'dotenv'

dotenv.config()

function serverlessApiPlugin(): Plugin {
  return {
    name: 'serverless-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.startsWith('/api/analyze') && req.method === 'POST') {
          console.log('[vite-api] Received POST /api/analyze');
          let body = ''
          req.on('data', chunk => { body += chunk })
          req.on('end', async () => {
            console.log('[vite-api] Request body received, length:', body.length);
            try {
              const parsedBody = body ? JSON.parse(body) : {}
              const vReq: any = {
                method: req.method,
                headers: req.headers,
                body: parsedBody,
                query: {},
              }
              const vRes: any = {
                statusCode: 200,
                setHeader(name: string, val: string) {
                  res.setHeader(name, val)
                  return this
                },
                status(code: number) {
                  this.statusCode = code
                  res.statusCode = code
                  return this
                },
                json(data: any) {
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify(data))
                },
                end(data?: any) {
                  res.end(data)
                }
              }

              const { default: handler } = await server.ssrLoadModule('./api/analyze.ts')
              await handler(vReq, vRes)
            } catch (err: any) {
              console.error('Local API middleware error:', err)
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: err.message }))
            }
          })
          return
        }
        next()
      })
    }
  }
}

export default defineConfig({
  plugins: [react(), serverlessApiPlugin()],
  server: {
    port: 5173,
  },
})
