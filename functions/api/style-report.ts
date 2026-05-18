type Env = {
  OPENAI_API_KEY?: string
  POLAR_ACCESS_TOKEN?: string
  POLAR_SERVER?: string
  POLAR_PRODUCT_ID?: string
}

type PagesContext = {
  request: Request
  env: Env
}

type StyleReportRequest = {
  heightCm?: number
  fitPreference?: string
  notes?: string
  photoDataUrl?: string | null
  checkoutId?: string
}

const defaultProductId = 'e590c0f8-6a71-4316-a315-63f7c3a2f56a'

const developerPrompt = [
  '당신은 전문 퍼스널 스타일리스트입니다.',
  '사용자의 선택 입력과 선택적으로 제공된 의상/전신 사진을 참고하여 맞춤형 의류 스타일 컨설팅 보고서를 작성해주세요.',
  '보고서에는 다음 내용을 포함해주세요.',
  '1. 실루엣 및 핏 분석',
  '2. 퍼스널 컬러 추천',
  '3. 어울리는 스타일 및 패션 아이템 추천',
  '4. 피해야 할 스타일',
  '5. 코디 팁',
  '친절하고 전문적인 톤으로 작성해주세요.',
  '의학적 진단, 건강 조언, 다이어트/체중 감량 조언, 신체 평가, 민감한 속성 추정, 나이 추정, 신원 식별은 절대 하지 마세요.',
  '사진이 있더라도 얼굴을 식별하거나 변형하지 말고, 이미지 생성/편집/딥페이크/페이스스왑 관련 내용은 제공하지 마세요.',
  '만 18세 이상 사용자를 대상으로 한 일반 의류 스타일링 조언만 제공하세요.',
].join('\n')

export async function onRequestPost({ request, env }: PagesContext) {
  try {
    if (!env.OPENAI_API_KEY) {
      return json({ error: 'OPENAI_API_KEY 환경 변수가 설정되어 있지 않습니다.' }, 500)
    }

    if (!env.POLAR_ACCESS_TOKEN) {
      return json({ error: 'POLAR_ACCESS_TOKEN 환경 변수가 설정되어 있지 않습니다.' }, 500)
    }

    let body: StyleReportRequest

    try {
      body = (await request.json()) as StyleReportRequest
    } catch {
      return json({ error: '요청 형식이 올바르지 않습니다.' }, 400)
    }

    const heightCm = Number(body.heightCm)
    const fitPreference =
      typeof body.fitPreference === 'string' ? body.fitPreference.trim().slice(0, 80) : ''
    const checkoutId = typeof body.checkoutId === 'string' ? body.checkoutId.trim() : ''

    if (!Number.isFinite(heightCm) || heightCm < 120 || heightCm > 230) {
      return json({ error: '키는 120cm에서 230cm 사이로 입력해 주세요.' }, 400)
    }

    if (!fitPreference) {
      return json({ error: '선호하는 핏을 선택해 주세요.' }, 400)
    }

    if (!checkoutId) {
      return json({ error: '결제 완료 후 리포트를 생성할 수 있습니다.' }, 402)
    }

    const isPaid = await verifyPaidCheckout({
      checkoutId,
      env,
    })

    if (!isPaid) {
      return json({ error: '결제 완료 내역을 확인하지 못했습니다.' }, 402)
    }

    const notes = typeof body.notes === 'string' ? body.notes.trim().slice(0, 1000) : ''
    const policyError = validateAllowedStyleRequest(`${fitPreference}\n${notes}`)

    if (policyError) {
      return json({ error: policyError }, 400)
    }

    const userPrompt = [
      `키 ${heightCm}cm`,
      `선호 핏: ${fitPreference}`,
      notes ? `추가 스타일 정보: ${notes}` : '',
    ]
      .filter(Boolean)
      .join('\n')

    const content: Array<Record<string, string>> = [
      {
        type: 'input_text',
        text: userPrompt,
      },
    ]

    if (body.photoDataUrl) {
      content.push({
        type: 'input_image',
        image_url: body.photoDataUrl,
      })
    }

    const openAiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5.4-mini',
        input: [
          {
            role: 'developer',
            content: [
              {
                type: 'input_text',
                text: developerPrompt,
              },
            ],
          },
          {
            role: 'user',
            content,
          },
        ],
        text: {
          format: {
            type: 'text',
          },
          verbosity: 'medium',
        },
        reasoning: {
          effort: 'medium',
          summary: 'auto',
        },
        tools: [],
        store: false,
      }),
    })

    const payload = await parseJsonResponse(openAiResponse)

    if (!openAiResponse.ok) {
      return json(
        {
          error:
            getErrorMessage(payload) ??
            'OpenAI API에서 스타일 보고서를 생성하지 못했습니다.',
        },
        openAiResponse.status,
      )
    }

    const reportText = extractOutputText(payload)

    if (!reportText) {
      return json({ error: 'OpenAI 응답에서 보고서 텍스트를 찾지 못했습니다.' }, 502)
    }

    return json({ reportText })
  } catch (error) {
    return json(
      {
        error:
          error instanceof Error
            ? error.message
            : '스타일 보고서를 생성하는 중 오류가 발생했습니다.',
      },
      500,
    )
  }
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

function extractOutputText(payload: unknown) {
  if (!payload || typeof payload !== 'object') {
    return ''
  }

  if ('output_text' in payload && typeof payload.output_text === 'string') {
    return payload.output_text.trim()
  }

  if (!('output' in payload) || !Array.isArray(payload.output)) {
    return ''
  }

  return payload.output
    .flatMap((item) => {
      if (!item || typeof item !== 'object' || !('content' in item)) {
        return []
      }

      return Array.isArray(item.content) ? item.content : []
    })
    .map((content) => {
      if (!content || typeof content !== 'object') {
        return ''
      }

      if ('text' in content && typeof content.text === 'string') {
        return content.text
      }

      return ''
    })
    .filter(Boolean)
    .join('\n\n')
    .trim()
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

function validateAllowedStyleRequest(text: string) {
  const normalizedText = text.toLowerCase()
  const disallowedPatterns = [
    /미성년|아동|어린이|초등학생|중학생|고등학생|teen|minor|child/,
    /다이어트|체중\s?감량|살\s?빼|bmi|비만|저체중|건강|의학|의료|질병|진단|처방|섭식/,
    /성인|야한|누드|nsfw|adult|onlyfans/,
    /딥페이크|페이스\s?스왑|face\s?swap|deepfake|얼굴\s?합성/,
    /투자|코인|암호화폐|도박|베팅|복권|의약품|담배|전자담배|주류/,
  ]

  if (disallowedPatterns.some((pattern) => pattern.test(normalizedText))) {
    return 'Polar 정책 준수를 위해 일반 의류 스타일링 범위를 벗어난 요청은 처리할 수 없습니다.'
  }

  return ''
}

async function verifyPaidCheckout({ checkoutId, env }: { checkoutId: string; env: Env }) {
  const polarResponse = await fetch(`${polarBaseUrl(env)}/checkouts/${checkoutId}`, {
    headers: {
      Authorization: `Bearer ${env.POLAR_ACCESS_TOKEN}`,
      Accept: 'application/json',
    },
  })
  const payload = await parseJsonResponse(polarResponse)

  if (!polarResponse.ok) {
    return false
  }

  return isPaidCheckout(payload) && JSON.stringify(payload).includes(env.POLAR_PRODUCT_ID || defaultProductId)
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
