import { useEffect, useState } from 'react'
import type { ChangeEvent, DragEvent, FormEvent } from 'react'
import './App.css'

const heroImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCrGpWPWVDvNwaB0kou6_fcx9HRzIJIZNpM1UPfF01p9zIKkxza0t53Prq-ZJDfOeeTwqxrdD3tPWM0SSY3PUJQvWrU1ETEblZeSCvGobJVLQ_I6NxEoQA7UjqVACPQdP_2F1P0X83OxMcLhWJmQRIghJsnThfQfYdWl_QwJhlqc1FOP2ipi1MrnyFNsRosxkb8hkn_LlSsYuWFSHqHmhg2v_UvSo-nYFQKLMfsDjVNDnhQnKFy_ZVZgDnjoqmvq2sbTlHoKZ5aYdE'

const galleryItems = [
  {
    title: 'Minimalist Chic',
    copy: '체형을 보완하는 구조적인 실루엣',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAhLV0tR81rh68v27Vd4mru1D7_Jym-isTGd8tm7FKLmrFltW8xuOXFOWYPEfUGp5Q_V-InnL9ENNYvjzK8amqlZG8hHBuj-gMyv7krQGFmqMd77Z5kFwlScyveM2ezWl6oFPTEmQWAnfGbfXFTugx7-khVAGc6ucPT6ALTtVfuv67Ka47Pusu9dTz43G4rTxfImoPqYpSPfHdQtC8mDXqBM30VFl6rBlI6HtWttNb9CMxz0ic4IO_9VKBdcPaw_kDlBIm3HIB5wP0',
  },
  {
    title: 'Color Palette',
    copy: '피부톤에 어울리는 최적의 배색 제안',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBZkCL6O9DbEYy3aWUluEkLXN6_Ec8u5_W5SK-dLvjg_b40lHsY2aDJDCeecKY7QgnpxBDBk71sFQzobsxNHaPlkFhPMOr07qWIGRB0_hsFeNCQj42Pm_Wt3TYmmUSQbKR7nc_8cQiOhIcWbrYI54lS-fUMMCpHclFgTJkvOAEABuDRzKpuPhG6hF_tlpFuto1hu9UfDoMjryj4iivBDtGTjGbhkk3qdGX1Dtn6_EXp0Zj7d0UmSPAJMGQK61iTq3qeUen2-us0fsc',
  },
  {
    title: 'Wardrobe Strategy',
    copy: '지속 가능한 쇼핑을 위한 옷장 전략',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCT84k0ot974bokv3mGxdf0dtild0Jvbyy-wNm9xTTRvrXSySlCTlKBI_iJ2mUU1OXLO_AvViE6PiYBctRntB4LsLkICOzagPFiYAIlgyV0-jspIEJHJA4YxHQ963u0Lu1kBTpK9lhidAFkjk7zz-ALXOSJaCDPaSakXpLvNL059EYncmN-1uGeuBV_3Pz1DhPHsVDljeY8BwPTzfKZzlUJ1_aUsGVwfvo8wr_NKoTlT5GjMeNedGHnjPSihxjLuSPQQi4eMIfH1AE',
  },
]

const processSteps = [
  {
    icon: 'straighten',
    title: '데이터 입력',
    copy: '키와 몸무게를 기반으로 체형 비율과 실루엣 균형을 먼저 파악합니다.',
  },
  {
    icon: 'add_a_photo',
    title: '사진 업로드',
    copy: '전신 사진을 함께 분석해 어깨선, 핏, 분위기까지 더 정확하게 읽습니다.',
  },
  {
    icon: 'auto_awesome',
    title: 'AI 스타일 분석',
    copy: '스타일 데이터와 개인 정보를 조합해 바로 실행 가능한 리포트를 생성합니다.',
  },
]

function App() {
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [notes, setNotes] = useState('')
  const [report, setReport] = useState('')
  const [hairstyleImage, setHairstyleImage] = useState('')
  const [hairstyleError, setHairstyleError] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false)

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview)
      }
    }
  }, [photoPreview])

  function applyPhotoFile(file: File | undefined) {
    if (!file) {
      setPhotoFile(null)
      setPhotoPreview(null)
      return
    }

    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드할 수 있습니다.')
      return
    }

    setError('')
    setPhotoFile(file)
    setPhotoPreview((currentPreview) => {
      if (currentPreview) {
        URL.revokeObjectURL(currentPreview)
      }

      return URL.createObjectURL(file)
    })
  }

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    applyPhotoFile(event.target.files?.[0])
  }

  function handlePhotoDragOver(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    setIsDraggingPhoto(true)
  }

  function handlePhotoDragLeave(event: DragEvent<HTMLLabelElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsDraggingPhoto(false)
    }
  }

  function handlePhotoDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    setIsDraggingPhoto(false)
    applyPhotoFile(event.dataTransfer.files[0])
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setReport('')
    setHairstyleImage('')
    setHairstyleError('')

    if (!height || !weight) {
      setError('키와 몸무게를 입력해 주세요.')
      return
    }

    if (photoFile && photoFile.size > 4 * 1024 * 1024) {
      setError('사진은 4MB 이하 파일을 사용해 주세요.')
      return
    }

    setIsLoading(true)

    try {
      const photoDataUrl = photoFile ? await readFileAsDataUrl(photoFile) : null
      const response = await fetch('/api/style-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          heightCm: Number(height),
          weightKg: Number(weight),
          notes: notes.trim(),
          photoDataUrl,
        }),
      })

      const payload = await parseJsonResponse(response)

      if (!response.ok) {
        throw new Error(payload.error ?? '스타일 보고서를 생성하지 못했습니다.')
      }

      setReport(payload.reportText)
      setHairstyleImage(payload.hairstyleImageDataUrl ?? '')
      setHairstyleError(payload.hairstyleError ?? '')
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : '잠시 후 다시 시도해 주세요.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <header className="top-bar">
        <button className="icon-button" type="button" aria-label="메뉴 열기">
          <span className="material-symbols-outlined" aria-hidden="true">
            menu
          </span>
        </button>
        <a className="brand-name" href="#top" aria-label="STYLIST.AI 홈">
          STYLIST.AI
        </a>
        <button className="icon-button" type="button" aria-label="계정 보기">
          <span className="material-symbols-outlined" aria-hidden="true">
            account_circle
          </span>
        </button>
      </header>

      <main id="top">
        <section className="hero-section" aria-labelledby="hero-title">
          <img className="hero-image" src={heroImage} alt="" aria-hidden="true" />
          <div className="hero-scrim" aria-hidden="true"></div>
          <div className="hero-content">
            <h1 id="hero-title">당신의 숨겨진 스타일을 발견하세요</h1>
            <a className="primary-link" href="#style-diagnosis">
              지금 시작하기
            </a>
          </div>
        </section>

        <section className="challenge-section section-wrap">
          <p className="section-label">The Challenge</p>
          <h2>나에게 딱 맞는 옷을 찾는 것이 왜 이토록 힘들까요?</h2>
          <p>
            수많은 트렌드와 쏟아지는 브랜드 사이에서 진정한 나를 표현하는
            스타일을 찾기는 쉽지 않습니다. 사이즈의 불확실성과 어울리지 않는
            핏은 쇼핑을 즐거움이 아닌 스트레스로 만듭니다.
          </p>
        </section>

        <section className="process-section">
          <div className="section-wrap">
            <p className="section-label">Methodology</p>
            <h2>혁신적인 AI 스타일링 프로세스</h2>
            <div className="process-list">
              {processSteps.map((step) => (
                <article className="process-card" key={step.title}>
                  <span className="process-icon material-symbols-outlined" aria-hidden="true">
                    {step.icon}
                  </span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.copy}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="gallery-section" aria-labelledby="gallery-title">
          <div className="section-wrap">
            <p className="section-label">Style Report Preview</p>
            <h2 id="gallery-title">개인별 맞춤 큐레이션</h2>
          </div>
          <div className="gallery-rail" tabIndex={0} aria-label="스타일 리포트 예시">
            {galleryItems.map((item) => (
              <article className="gallery-card" key={item.title}>
                <img src={item.image} alt={`${item.title} 스타일 예시`} />
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="testimonial-section section-wrap">
          <span className="quote-mark" aria-hidden="true">
            99
          </span>
          <blockquote>
            <p>"쇼핑의 기준이 달라졌어요. 제 체형에 맞는 옷을 고르는 눈이 생겼습니다."</p>
            <cite>김지민, 패션 에디터</cite>
          </blockquote>
          <blockquote>
            <p>"AI의 분석력이 놀라워요. 제가 몰랐던 저만의 장점을 찾아주었죠."</p>
            <cite>이준혁, 아키텍트</cite>
          </blockquote>
        </section>

        <section
          className="diagnosis-section"
          id="style-diagnosis"
          aria-labelledby="diagnosis-title"
        >
          <div className="diagnosis-copy">
            <p className="section-label">Start Report</p>
            <h2 id="diagnosis-title">나만의 스타일 리포트 받기</h2>
            <p>
              사진과 기본 정보를 입력하면 AI가 체형, 핏, 색감, 헤어 무드까지
              하나의 리포트로 정리합니다.
            </p>
          </div>

          <form className="profile-form" onSubmit={handleSubmit}>
            <label
              className={`photo-upload${isDraggingPhoto ? ' is-dragging' : ''}`}
              onDragOver={handlePhotoDragOver}
              onDragLeave={handlePhotoDragLeave}
              onDrop={handlePhotoDrop}
            >
              <input type="file" accept="image/*" onChange={handlePhotoChange} />
              {photoPreview ? (
                <img src={photoPreview} alt="업로드한 본인 사진 미리보기" />
              ) : (
                <>
                  <span className="upload-icon material-symbols-outlined" aria-hidden="true">
                    add_a_photo
                  </span>
                  <span className="upload-title">사진 업로드</span>
                  <span className="upload-help">클릭하거나 파일을 끌어다 놓으세요</span>
                </>
              )}
            </label>

            <div className="field-grid">
              <label className="field">
                <span>키</span>
                <div className="input-unit">
                  <input
                    type="number"
                    inputMode="decimal"
                    min="120"
                    max="230"
                    placeholder="170"
                    value={height}
                    onChange={(event) => setHeight(event.target.value)}
                  />
                  <span>cm</span>
                </div>
              </label>

              <label className="field">
                <span>몸무게</span>
                <div className="input-unit">
                  <input
                    type="number"
                    inputMode="decimal"
                    min="30"
                    max="200"
                    placeholder="60"
                    value={weight}
                    onChange={(event) => setWeight(event.target.value)}
                  />
                  <span>kg</span>
                </div>
              </label>
            </div>

            <label className="field">
              <span>추가 정보</span>
              <textarea
                placeholder="예: 얼굴형, 평소 스타일, 선호 색상, 고민되는 핏"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </label>

            {error ? <p className="form-error">{error}</p> : null}

            <button type="submit" className="primary-action" disabled={isLoading}>
              {isLoading ? '리포트 생성 중' : '지금 무료 진단하기'}
            </button>
          </form>

          {report ? (
            <article className="report-panel" aria-label="스타일 컨설팅 보고서">
              <div>
                <p className="section-label">Report</p>
                <h3>스타일 컨설팅 보고서</h3>
              </div>

              {hairstyleImage ? (
                <figure className="hairstyle-result">
                  <img
                    src={hairstyleImage}
                    alt="사용자 얼굴을 유지한 9가지 헤어스타일 추천 이미지"
                  />
                  <figcaption>얼굴은 유지하고 헤어스타일만 바꾼 3x3 추천 보드</figcaption>
                </figure>
              ) : null}

              {hairstyleError ? <p className="form-error">{hairstyleError}</p> : null}

              <div className="report-text">{report}</div>
            </article>
          ) : null}
        </section>
      </main>

      <footer className="site-footer">
        <a className="brand-name" href="#top">
          STYLIST.AI
        </a>
        <nav aria-label="푸터 메뉴">
          <a href="#style-diagnosis">The Methodology</a>
          <a href="#gallery-title">Style Journal</a>
          <a href="#style-diagnosis">Privacy</a>
          <a href="#style-diagnosis">Terms</a>
        </nav>
        <p>© 2026 STYLIST.AI. ALL RIGHTS RESERVED.</p>
      </footer>
    </>
  )
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => resolve(String(reader.result)))
    reader.addEventListener('error', () => reject(reader.error))
    reader.readAsDataURL(file)
  })
}

async function parseJsonResponse(response: Response) {
  const responseText = await response.text()

  if (!responseText.trim()) {
    return {
      error:
        response.status === 404
          ? '스타일 진단 API를 찾지 못했습니다. 로컬 서버 설정을 확인해 주세요.'
          : '스타일 진단 API가 빈 응답을 반환했습니다.',
    }
  }

  try {
    return JSON.parse(responseText)
  } catch {
    return {
      error: '스타일 진단 API가 올바른 JSON 응답을 반환하지 않았습니다.',
    }
  }
}

export default App
