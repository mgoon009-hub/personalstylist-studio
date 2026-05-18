import { defineConfig } from 'vite'
import type { Plugin, ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), localPagesFunctions()],
})

function localPagesFunctions(): Plugin {
  return {
    name: 'local-pages-functions',
    configureServer(server: ViteDevServer) {
      server.middlewares.use('/api/checkout', async (
        request: IncomingMessage,
        response: ServerResponse,
      ) => {
        if (request.method === 'OPTIONS') {
          writeResponse(response, new Response(null, { status: 204 }))
          return
        }

        if (request.method !== 'POST') {
          writeResponse(response, Response.json({ error: '지원하지 않는 요청입니다.' }, { status: 405 }))
          return
        }

        try {
          const { onRequestPost } = await import('./functions/api/checkout')
          const body = await readRequestBody(request)
          const apiResponse = await onRequestPost({
            request: new Request('http://localhost/api/checkout', {
              method: 'POST',
              headers: requestHeaders(request),
              body,
            }),
            env: loadLocalEnv(),
          })

          writeResponse(response, apiResponse)
        } catch (error) {
          writeResponse(response, localErrorResponse(error))
        }
      })

      server.middlewares.use('/api/checkout-status', async (
        request: IncomingMessage,
        response: ServerResponse,
      ) => {
        if (request.method === 'OPTIONS') {
          writeResponse(response, new Response(null, { status: 204 }))
          return
        }

        if (request.method !== 'GET') {
          writeResponse(response, Response.json({ error: '지원하지 않는 요청입니다.' }, { status: 405 }))
          return
        }

        try {
          const { onRequestGet } = await import('./functions/api/checkout-status')
          const apiResponse = await onRequestGet({
            request: new Request(`http://localhost/api/checkout-status${request.url ?? ''}`, {
              method: 'GET',
              headers: requestHeaders(request),
            }),
            env: loadLocalEnv(),
          })

          writeResponse(response, apiResponse)
        } catch (error) {
          writeResponse(response, localErrorResponse(error))
        }
      })

      server.middlewares.use('/api/style-report', async (
        request: IncomingMessage,
        response: ServerResponse,
      ) => {
        if (request.method === 'OPTIONS') {
          writeResponse(response, new Response(null, { status: 204 }))
          return
        }

        if (request.method !== 'POST') {
          writeResponse(response, Response.json({ error: '지원하지 않는 요청입니다.' }, { status: 405 }))
          return
        }

        try {
          const { onRequestPost } = await import('./functions/api/style-report')
          const body = await readRequestBody(request)
          const apiResponse = await onRequestPost({
            request: new Request('http://localhost/api/style-report', {
              method: 'POST',
              headers: requestHeaders(request),
              body,
            }),
            env: loadLocalEnv(),
          })

          writeResponse(response, apiResponse)
        } catch (error) {
          writeResponse(response, localErrorResponse(error))
        }
      })
    },
  }
}

function localErrorResponse(error: unknown) {
  return Response.json(
    {
      error:
        error instanceof Error
          ? error.message
          : '로컬 API 실행 중 오류가 발생했습니다.',
    },
    { status: 500 },
  )
}

function readRequestBody(request: IncomingMessage) {
  return new Promise<Buffer>((resolveBody, rejectBody) => {
    const chunks: Buffer[] = []

    request.on('data', (chunk: Buffer) => chunks.push(chunk))
    request.on('end', () => resolveBody(Buffer.concat(chunks)))
    request.on('error', rejectBody)
  })
}

function requestHeaders(request: IncomingMessage) {
  const headers = new Headers()

  for (const [key, value] of Object.entries(request.headers)) {
    if (Array.isArray(value)) {
      headers.set(key, value.join(', '))
    } else if (typeof value === 'string') {
      headers.set(key, value)
    }
  }

  return headers
}

function loadLocalEnv() {
  const env: Record<string, string> = { ...process.env } as Record<string, string>

  try {
    const vars = readFileSync(resolve(import.meta.dirname, '.dev.vars'), 'utf8')

    for (const line of vars.split(/\r?\n/)) {
      const trimmedLine = line.trim()

      if (!trimmedLine || trimmedLine.startsWith('#')) {
        continue
      }

      const separatorIndex = trimmedLine.indexOf('=')

      if (separatorIndex === -1) {
        continue
      }

      const key = trimmedLine.slice(0, separatorIndex).trim()
      const value = trimmedLine.slice(separatorIndex + 1).trim()

      env[key] = value
    }
  } catch {
    return env
  }

  return env
}

async function writeResponse(serverResponse: ServerResponse, fetchResponse: Response) {
  serverResponse.statusCode = fetchResponse.status

  fetchResponse.headers.forEach((value, key) => {
    serverResponse.setHeader(key, value)
  })

  const responseBody = Buffer.from(await fetchResponse.arrayBuffer())
  serverResponse.end(responseBody)
}
