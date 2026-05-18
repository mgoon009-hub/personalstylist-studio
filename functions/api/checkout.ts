type Env = {
  POLAR_ACCESS_TOKEN?: string
  POLAR_SERVER?: string
  POLAR_PRODUCT_ID?: string
}

type PagesContext = {
  request: Request
  env: Env
}

const defaultProductId = 'e590c0f8-6a71-4316-a315-63f7c3a2f56a'

export async function onRequestPost({ request, env }: PagesContext) {
  if (!env.POLAR_ACCESS_TOKEN) {
    return json({ error: 'POLAR_ACCESS_TOKEN 환경 변수가 설정되어 있지 않습니다.' }, 500)
  }

  let body: {
    successUrl?: string
    returnUrl?: string
  }

  try {
    body = (await request.json()) as typeof body
  } catch {
    return json({ error: '요청 형식이 올바르지 않습니다.' }, 400)
  }

  const successUrl = safeUrl(body.successUrl)
  const returnUrl = safeUrl(body.returnUrl)

  if (!successUrl) {
    return json({ error: '결제 완료 후 돌아올 URL이 올바르지 않습니다.' }, 400)
  }

  const polarResponse = await fetch(`${polarBaseUrl(env)}/checkouts/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.POLAR_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      products: [env.POLAR_PRODUCT_ID || defaultProductId],
      success_url: successUrl,
      return_url: returnUrl || undefined,
      locale: 'ko',
      metadata: {
        product_scope: 'general_outfit_styling',
        ai_generation: 'text_only_report',
      },
    }),
  })

  const payload = await parseJsonResponse(polarResponse)

  if (!polarResponse.ok) {
    return json(
      {
        error:
          getErrorMessage(payload) ?? 'Polar Checkout 세션을 생성하지 못했습니다.',
      },
      polarResponse.status,
    )
  }

  const checkoutUrl = getString(payload, 'url')

  if (!checkoutUrl) {
    return json({ error: 'Polar Checkout URL을 찾지 못했습니다.' }, 502)
  }

  return json({ url: checkoutUrl })
}

export function onRequestOptions() {
  return new Response(null, {
    headers: corsHeaders(),
  })
}

function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: corsHeaders(),
  })
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

function polarBaseUrl(env: Env) {
  return env.POLAR_SERVER === 'sandbox'
    ? 'https://sandbox-api.polar.sh/v1'
    : 'https://api.polar.sh/v1'
}

function safeUrl(value: unknown) {
  if (typeof value !== 'string') {
    return ''
  }

  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : ''
  } catch {
    return ''
  }
}

async function parseJsonResponse(response: Response) {
  const responseText = await response.text()

  if (!responseText.trim()) {
    return null
  }

  try {
    return JSON.parse(responseText)
  } catch {
    return null
  }
}

function getString(payload: unknown, key: string) {
  if (!payload || typeof payload !== 'object' || !(key in payload)) {
    return ''
  }

  const value = payload[key as keyof typeof payload]
  return typeof value === 'string' ? value : ''
}

function getErrorMessage(payload: unknown) {
  if (!payload || typeof payload !== 'object' || !('error' in payload)) {
    return null
  }

  const { error } = payload

  if (!error || typeof error !== 'object' || !('message' in error)) {
    return null
  }

  return typeof error.message === 'string' ? error.message : null
}
