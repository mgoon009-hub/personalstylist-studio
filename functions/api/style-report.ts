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
  notes?: string
  photoDataUrl?: string | null
}

const developerPrompt = [
  '당신은 전문 퍼스널 스타일리스트입니다.',
  '사용자의 사진과 신체 정보를 분석하여 맞춤형 스타일 컨설팅 보고서를 작성해주세요.',
  '보고서에는 다음 내용을 포함해주세요.',
  '1. 체형분석',
  '2. 퍼스널 컬러 추천',
  '3. 어울리는 스타일 및 패션 아이템 추천',
  '4. 피해야 할 스타일',
  '5. 코디 팁',
  '친절하고 전문적인 톤으로 작성해주세요.',
  '의학적 진단, 다이어트 처방, 건강 조언은 하지 말고 옷의 핏과 스타일링 중심으로 답변하세요.',
].join('\n')

const hairstylePrompt = [
  '너는 최고의 헤어스타일리스트야.',
  '3x3 그리드 이미지로, 첨부한 사진 속 사람에게 가장 잘 어울리는 헤어스타일 9개를 생성해줘.',
  '각 칸에는 헤어스타일 이름과 짧은 설명을 한국어로 넣어줘.',
  '첨부한 사람의 얼굴, 이목구비, 표정, 피부톤, 얼굴형은 절대 바꾸지 말고 기존 얼굴 그대로 유지해.',
  '머리카락의 길이, 볼륨, 앞머리, 가르마, 질감, 컬러 톤 등 헤어스타일만 바꿔줘.',
  '자연스럽고 실제 미용실 상담 자료처럼 깔끔한 3x3 비교 보드로 만들어줘.',
].join('\n')

export async function onRequestPost({ request, env }: PagesContext) {
  try {
    if (!env.OPENAI_API_KEY) {
      return json({ error: 'OPENAI_API_KEY 환경 변수가 설정되어 있지 않습니다.' }, 500)
    }

    let body: StyleReportRequest

    try {
      body = (await request.json()) as StyleReportRequest
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

    const notes = typeof body.notes === 'string' ? body.notes.trim().slice(0, 1000) : ''
    const userPrompt = [`키 ${heightCm}, 몸무게 ${weightKg}`, notes]
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
        store: true,
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

    if (!body.photoDataUrl) {
      return json({
        reportText,
        hairstyleError: '사진이 없어 헤어스타일 이미지는 생성하지 않았습니다.',
      })
    }

    const hairstyleResult = await createHairstyleGridImage({
      apiKey: env.OPENAI_API_KEY,
      photoDataUrl: body.photoDataUrl,
    })

    return json({
      reportText,
      ...hairstyleResult,
    })
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

async function createHairstyleGridImage({
  apiKey,
  photoDataUrl,
}: {
  apiKey: string
  photoDataUrl: string
}) {
  const imageBlob = await dataUrlToBlob(photoDataUrl)
  const form = new FormData()

  form.append('image', imageBlob, `portrait.${extensionForType(imageBlob.type)}`)
  form.append('prompt', hairstylePrompt)
  form.append('model', 'gpt-image-1.5')
  form.append('n', '1')
  form.append('size', 'auto')
  form.append('quality', 'auto')
  form.append('background', 'auto')
  form.append('moderation', 'auto')
  form.append('input_fidelity', 'high')

  const imageResponse = await fetch('https://api.openai.com/v1/images/edits', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: form,
  })

  const payload = await parseJsonResponse(imageResponse)

  if (!imageResponse.ok) {
    return {
      hairstyleError: getErrorMessage(payload) ?? '헤어스타일 이미지를 생성하지 못했습니다.',
    }
  }

  const b64Json = payload.data?.[0]?.b64_json

  if (typeof b64Json !== 'string' || !b64Json) {
    return {
      hairstyleError: 'OpenAI 이미지 응답에서 생성 이미지를 찾지 못했습니다.',
    }
  }

  return {
    hairstyleImageDataUrl: `data:image/png;base64,${b64Json}`,
  }
}

async function dataUrlToBlob(dataUrl: string) {
  const response = await fetch(dataUrl)
  return response.blob()
}

function extensionForType(type: string) {
  if (type === 'image/png') {
    return 'png'
  }

  if (type === 'image/webp') {
    return 'webp'
  }

  return 'jpg'
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
