type Env = {
  OPENAI_API_KEY?: string
}

type PagesContext = {
  request: Request
  env: Env
}

type StyleReportRequest = {
  heightCm?: number
  weightKg?: number
  photoDataUrl?: string | null
}

const reportSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'summary',
    'bodyShapeInsight',
    'fitRecommendations',
    'colorRecommendations',
    'outfitIdeas',
    'avoid',
  ],
  properties: {
    summary: { type: 'string' },
    bodyShapeInsight: { type: 'string' },
    fitRecommendations: {
      type: 'array',
      minItems: 3,
      maxItems: 5,
      items: { type: 'string' },
    },
    colorRecommendations: {
      type: 'array',
      minItems: 3,
      maxItems: 5,
      items: { type: 'string' },
    },
    outfitIdeas: {
      type: 'array',
      minItems: 3,
      maxItems: 5,
      items: { type: 'string' },
    },
    avoid: {
      type: 'array',
      minItems: 2,
      maxItems: 4,
      items: { type: 'string' },
    },
  },
}

export async function onRequestPost({ request, env }: PagesContext) {
  if (!env.OPENAI_API_KEY) {
    return json({ error: 'OPENAI_API_KEY 환경 변수가 설정되어 있지 않습니다.' }, 500)
  }

  let body: StyleReportRequest

  try {
    body = await request.json()
  } catch {
    return json({ error: '요청 형식이 올바르지 않습니다.' }, 400)
  }

  const heightCm = Number(body.heightCm)
  const weightKg = Number(body.weightKg)

  if (!Number.isFinite(heightCm) || heightCm < 120 || heightCm > 230) {
    return json({ error: '키는 120cm에서 230cm 사이로 입력해 주세요.' }, 400)
  }

  if (!Number.isFinite(weightKg) || weightKg < 30 || weightKg > 200) {
    return json({ error: '몸무게는 30kg에서 200kg 사이로 입력해 주세요.' }, 400)
  }

  const textPrompt = [
    '한국어로 개인 스타일 컨설팅 보고서를 작성해 주세요.',
    '사용자의 사진과 신체 정보를 참고하되, 민감한 신체 평가나 단정적인 표현은 피하고 실용적인 의류 선택 중심으로 답변하세요.',
    `키: ${heightCm}cm`,
    `몸무게: ${weightKg}kg`,
  ].join('\n')

  const content: Array<Record<string, string>> = [
    {
      type: 'input_text',
      text: textPrompt,
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
      model: 'gpt-5.2',
      instructions:
        'You are a careful personal stylist. Return only the requested JSON. Do not provide medical, diet, or health advice.',
      input: [
        {
          role: 'user',
          content,
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'style_consulting_report',
          strict: true,
          schema: reportSchema,
        },
      },
    }),
  })

  const payload = await openAiResponse.json()

  if (!openAiResponse.ok) {
    return json(
      {
        error:
          payload.error?.message ??
          'OpenAI API에서 스타일 보고서를 생성하지 못했습니다.',
      },
      openAiResponse.status,
    )
  }

  try {
    return json({ report: JSON.parse(payload.output_text) })
  } catch {
    return json({ error: 'OpenAI 응답을 보고서 형식으로 변환하지 못했습니다.' }, 502)
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
