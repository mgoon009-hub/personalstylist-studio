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

export async function onRequestGet({ request, env }: PagesContext) {
  if (!env.POLAR_ACCESS_TOKEN) {
    return json({ error: 'POLAR_ACCESS_TOKEN 환경 변수가 설정되어 있지 않습니다.' }, 500)
  }

  const checkoutId = new URL(request.url).searchParams.get('checkout_id')?.trim()

  if (!checkoutId) {
    return json({ error: 'checkout_id가 필요합니다.' }, 400)
  }

  const polarResponse = await fetch(`${polarBaseUrl(env)}/checkouts/${checkoutId}`, {
    headers: {
      Authorization: `Bearer ${env.POLAR_ACCESS_TOKEN}`,
      Accept: 'application/json',
    },
  })
  const payload = await parseJsonResponse(polarResponse)

  if (!polarResponse.ok) {
    return json(
      {
        error:
          getErrorMessage(payload) ?? 'Polar Checkout 상태를 확인하지 못했습니다.',
      },
      polarResponse.status,
    )
  }

  const expectedProductId = env.POLAR_PRODUCT_ID || defaultProductId

  return json({
    paid: isPaidCheckout(payload) && containsProduct(payload, expectedProductId),
  })
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
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

function polarBaseUrl(env: Env) {
  return env.POLAR_SERVER === 'sandbox'
    ? 'https://sandbox-api.polar.sh/v1'
    : 'https://api.polar.sh/v1'
}

function isPaidCheckout(payload: unknown) {
  const status = [
    getString(payload, 'status'),
    getString(payload, 'payment_status'),
    getString(payload, 'checkout_status'),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return /paid|confirmed|complete|completed|succeeded|success/.test(status)
}

function containsProduct(payload: unknown, productId: string) {
  const serializedPayload = JSON.stringify(payload)
  return serializedPayload.includes(productId)
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
