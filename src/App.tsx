import { useCallback, useEffect, useState } from 'react'
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
    copy: '키와 선호 핏을 기반으로 의류 실루엣과 스타일 방향을 파악합니다.',
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

const reportHeroImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDDiZGGQBCX8Pa4gtTvsqDE6c8iJIRSII9s_cT_EIqDOuaMolbE18_Q-wNydx-gQq8yfIyrz3e880gyfqwS278fUEqpU5cK_j4dDz9ys3rTXMizkYtpnZ1x-15NKnHllOaogYvZXVIg-oTUilpbhq_lya9AerJviTxtWH88x3XFfQzwpd6R4yzgIxjgttdcXumtKiw1gevbDA-AdaHFpRgbzNN7xvm9SDXnUTRZhIsJfDF8uOcCBtdjofKmTQ6WT375OmO4mIBpWes'

const reportPickImages = [
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCrqcpQKvWF_p9hZRT2hSOZW0BlWQ0d6W6nJPSUEHm6xAI3R4_qTpu-qRk7FfKUCy6z6v-Pi-WbDLbQQUhiQNCinXty2bkB0zUDkC4jFu4qZw9U9WwCPMEEx9E52psSBFzIaEIdjZp--NKCESAbP4Q1Wr51UFBSOs0eYL052oXf8ZDKJQt0aa5JXOkkzMEc4P57mEZobh2fqDgyBdTZXPXHq27fxsKhULZvGxC0yRBCYUQEOlTt7c77pWTsc58M5Rcb0AnRFR1GklM',
  },
  {
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuALm9xIWhirQiltaCtgghhsQOSjOgpOtX61ekHna3jP1Rmn7cuvLhBUqqfdRZRkNoz0TBYKWfA8PFqt6Ks2KtOGNgbO9e9lQG-cnsCved4xZvXAk5btenO5IigyoilGnAoctTbdN8VfIqSaD5xI-WsJBTxHott6tqpYPn1mknrcEhDtRJlc5czCvs2RHxAi3Dm38CK90r8vvUFZuN0gQI2cWTj1cz8VWVaozx2ueEBclCAfMpf1ZvrsZ0zYl1g68jyao7GRV4Bcbmw',
  },
]

const fitIcons = ['checkroom', 'unfold_more', 'architecture']

const colorTokens = [
  { name: 'Deep Navy', color: '#0f172a', keywords: ['네이비', 'navy'] },
  { name: 'Soft Ivory', color: '#f8f5f2', keywords: ['아이보리', '크림', 'ivory'] },
  { name: 'Cool Silver', color: '#d1d5db', keywords: ['실버', 'silver'] },
  { name: 'Charcoal', color: '#45464d', keywords: ['차콜', 'charcoal'] },
  { name: 'Mist Blue', color: '#bec6e0', keywords: ['블루', 'blue'] },
  { name: 'Clean White', color: '#ffffff', keywords: ['화이트', 'white'] },
  { name: 'Soft Beige', color: '#d8c8ad', keywords: ['베이지', 'beige'] },
  { name: 'Deep Black', color: '#111111', keywords: ['블랙', 'black'] },
  { name: 'Olive Khaki', color: '#68705b', keywords: ['카키', '올리브', 'khaki'] },
  { name: 'Burgundy', color: '#6f1d2f', keywords: ['버건디', 'burgundy'] },
]

type ReportProfile = {
  height: string
  fitPreference: string
  notes: string
  photoPreview: string | null
}

type View = 'home' | 'report'

type PendingReportRequest = {
  payload: {
    heightCm: number
    fitPreference: string
    notes: string
    photoDataUrl: string | null
  }
  profile: ReportProfile
}

type ReportInsights = {
  title: string
  summary: string
  tags: string[]
  fitIntro: string
  fitItems: Array<{
    icon: string
    title: string
    copy: string
  }>
  picks: Array<{
    title: string
    meta: string
    image: string
  }>
  palette: Array<{
    name: string
    color: string
  }>
  paletteCopy: string
}

function App() {
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [height, setHeight] = useState('')
  const [fitPreference, setFitPreference] = useState('')
  const [notes, setNotes] = useState('')
  const [report, setReport] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false)
  const [view, setView] = useState<View>('home')
  const [reportProfile, setReportProfile] = useState<ReportProfile | null>(null)
  const [isCheckingPayment, setIsCheckingPayment] = useState(false)

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

    if (!height || !fitPreference) {
      setError('키와 선호하는 핏을 입력해 주세요.')
      return
    }

    if (photoFile && photoFile.size > 4 * 1024 * 1024) {
      setError('사진은 4MB 이하 파일을 사용해 주세요.')
      return
    }

    setIsLoading(true)

    try {
      const photoDataUrl = photoFile ? await readFileAsDataUrl(photoFile) : null
      const pendingReport: PendingReportRequest = {
        payload: {
          heightCm: Number(height),
          fitPreference,
          notes: notes.trim(),
          photoDataUrl,
        },
        profile: {
          height,
          fitPreference,
          notes: notes.trim(),
          photoPreview: photoDataUrl ?? photoPreview,
        },
      }

      sessionStorage.setItem('stylist.pendingReport', JSON.stringify(pendingReport))

      const checkoutResponse = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          successUrl: `${window.location.origin}${window.location.pathname}?checkout_id={CHECKOUT_ID}`,
          returnUrl: `${window.location.origin}${window.location.pathname}`,
        }),
      })
      const checkoutPayload = await parseJsonResponse(checkoutResponse)

      if (!checkoutResponse.ok) {
        throw new Error(checkoutPayload.error ?? '결제 페이지를 생성하지 못했습니다.')
      }

      window.location.href = checkoutPayload.url
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

  const createReportFromPending = useCallback(async (
    pendingReport: PendingReportRequest,
    checkoutId: string,
  ) => {
    const response = await fetch('/api/style-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...pendingReport.payload,
        checkoutId,
      }),
    })
    const payload = await parseJsonResponse(response)

    if (!response.ok) {
      throw new Error(payload.error ?? '스타일 보고서를 생성하지 못했습니다.')
    }

    setReport(payload.reportText)
    setReportProfile(pendingReport.profile)
    setView('report')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const completePaidReport = useCallback(async (checkoutId: string) => {
    setIsCheckingPayment(true)
    setError('')

    try {
      const storedPendingReport = sessionStorage.getItem('stylist.pendingReport')

      if (!storedPendingReport) {
        throw new Error('결제는 확인됐지만 생성할 리포트 입력값을 찾지 못했습니다.')
      }

      const pendingReport = JSON.parse(storedPendingReport) as PendingReportRequest
      const statusResponse = await fetch(
        `/api/checkout-status?checkout_id=${encodeURIComponent(checkoutId)}`,
      )
      const statusPayload = await parseJsonResponse(statusResponse)

      if (!statusResponse.ok || !statusPayload.paid) {
        throw new Error(statusPayload.error ?? '결제 완료 상태를 확인하지 못했습니다.')
      }

      await createReportFromPending(pendingReport, checkoutId)
      sessionStorage.removeItem('stylist.pendingReport')
      window.history.replaceState({}, document.title, window.location.pathname)
    } catch (paymentError) {
      setError(
        paymentError instanceof Error
          ? paymentError.message
          : '결제 확인 중 오류가 발생했습니다.',
      )
      document.getElementById('style-diagnosis')?.scrollIntoView()
    } finally {
      setIsCheckingPayment(false)
    }
  }, [createReportFromPending])

  useEffect(() => {
    const checkoutId = new URLSearchParams(window.location.search).get('checkout_id')

    if (!checkoutId) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      void completePaidReport(checkoutId)
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [completePaidReport])

  if (view === 'report' && reportProfile && report) {
    return (
      <>
        <TopBar
          onBrandClick={() => {
            setView('home')
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        />
        <ReportPage
          profile={reportProfile}
          report={report}
          onBack={() => {
            setView('home')
            window.setTimeout(() => {
              document.getElementById('style-diagnosis')?.scrollIntoView()
            }, 0)
          }}
        />
        <SiteFooter />
      </>
    )
  }

  return (
    <>
      <TopBar />

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
              사진과 기본 정보를 입력하면 AI가 의류 핏, 색감, 코디 방향을
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
                <span>선호 핏</span>
                <div className="input-unit">
                  <select
                    value={fitPreference}
                    onChange={(event) => setFitPreference(event.target.value)}
                  >
                    <option value="">선택</option>
                    <option value="정돈된 레귤러 핏">레귤러</option>
                    <option value="여유 있는 세미 오버핏">세미 오버</option>
                    <option value="단정한 슬림/스트레이트 핏">슬림/스트레이트</option>
                    <option value="편안한 루즈 핏">루즈</option>
                  </select>
                </div>
              </label>
            </div>

            <label className="field">
              <span>추가 정보</span>
              <textarea
                placeholder="예: 평소 스타일, 선호 색상, 고민되는 핏"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </label>

            <p className="compliance-note">
              만 18세 이상 일반 의류 스타일링 전용입니다. 의료, 건강, 다이어트,
              성인 콘텐츠, 얼굴 합성/이미지 생성 요청은 처리하지 않습니다.
            </p>

            {error ? <p className="form-error">{error}</p> : null}

            <button type="submit" className="primary-action" disabled={isLoading || isCheckingPayment}>
              {isLoading
                ? '결제 페이지 준비 중'
                : isCheckingPayment
                  ? '결제 확인 중'
                  : '결제하고 리포트 생성하기'}
            </button>
          </form>

        </section>
      </main>

      <SiteFooter />
    </>
  )
}

function TopBar({ onBrandClick }: { onBrandClick?: () => void }) {
  return (
    <header className="top-bar">
      <button className="icon-button" type="button" aria-label="메뉴 열기">
        <span className="material-symbols-outlined" aria-hidden="true">
          menu
        </span>
      </button>
      <a
        className="brand-name"
        href="#top"
        aria-label="STYLIST.AI 홈"
        onClick={(event) => {
          if (onBrandClick) {
            event.preventDefault()
            onBrandClick()
          }
        }}
      >
        STYLIST.AI
      </a>
      <button className="icon-button" type="button" aria-label="계정 보기">
        <span className="material-symbols-outlined" aria-hidden="true">
          account_circle
        </span>
      </button>
    </header>
  )
}

function ReportPage({
  profile,
  report,
  onBack,
}: {
  profile: ReportProfile
  report: string
  onBack: () => void
}) {
  const insights = buildReportInsights(report, profile)
  const heroSource = profile.photoPreview ?? reportHeroImage

  return (
    <main className="report-page" id="top">
      <section className="report-hero" aria-labelledby="report-title">
        <div className="report-hero-copy">
          <p className="section-label">Personal Analysis</p>
          <h1 id="report-title">{insights.title}</h1>
          <p>{insights.summary}</p>
          <div className="report-tags" aria-label="스타일 키워드">
            {insights.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>
        <figure className="report-portrait">
          <img src={heroSource} alt="스타일 분석 이미지" />
        </figure>
      </section>

      <section className="report-section fit-section">
        <div className="report-section-heading">
          <div>
            <p className="section-label">The Fit Guide</p>
            <h2>Best Silhouette</h2>
          </div>
          <p>{insights.fitIntro}</p>
        </div>
        <div className="fit-grid">
          {insights.fitItems.map((item) => (
            <article className="fit-card" key={item.title}>
              <span className="material-symbols-outlined" aria-hidden="true">
                {item.icon}
              </span>
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="report-section">
        <p className="section-label">Selections</p>
        <h2>Curated Picks</h2>
        <div className="pick-grid">
          {insights.picks.map((pick) => (
            <article className="pick-card" key={pick.title}>
              <img src={pick.image} alt={`${pick.title} 추천 룩`} />
              <div>
                <h3>{pick.title}</h3>
                <p>{pick.meta}</p>
              </div>
              <span className="material-symbols-outlined" aria-hidden="true">
                arrow_forward
              </span>
            </article>
          ))}
        </div>
      </section>

      <section className="report-section palette-panel">
        <p className="section-label">Personal Color</p>
        <h2>Color Palette</h2>
        <div className="palette-grid">
          {insights.palette.map((color) => (
            <div className="palette-chip" key={color.name}>
              <span style={{ background: color.color }}></span>
              <p>{color.name}</p>
            </div>
          ))}
        </div>
        <p className="palette-copy">{insights.paletteCopy}</p>
      </section>

      <section className="report-section ai-report">
        <p className="section-label">Full Report</p>
        <h2>AI Styling Notes</h2>
        <div className="report-text">{report}</div>
      </section>

      <section className="report-actions" aria-label="리포트 작업">
        <button className="report-primary-button" type="button" onClick={() => window.print()}>
          Report 저장하기
        </button>
        <button className="report-secondary-button" type="button" onClick={onBack}>
          다시 진단하기
        </button>
      </section>

      <button className="report-fab" type="button" aria-label="AI 스타일 상담">
        <span className="material-symbols-outlined" aria-hidden="true">
          auto_awesome
        </span>
      </button>
    </main>
  )
}

function SiteFooter() {
  return (
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
  )
}

function buildReportInsights(report: string, profile: ReportProfile): ReportInsights {
  const sections = extractSections(report)
  const bodySection = findSection(sections, ['체형', '분석']) || report
  const styleSection = findSection(sections, ['어울리는', '스타일', '아이템', '추천']) || report
  const colorSection = findSection(sections, ['퍼스널', '컬러', '색']) || report
  const tipSection = findSection(sections, ['코디', '팁']) || styleSection
  const title = buildReportTitle(bodySection, styleSection, profile)
  const summary = summarizeFromText(bodySection, report)
  const tags = buildTags([bodySection, styleSection, tipSection].join('\n'))
  const fitItems = buildFitItems(styleSection, tipSection)
  const picks = buildPicks(styleSection)
  const palette = buildPalette(colorSection)

  return {
    title,
    summary,
    tags,
    fitIntro: summarizeFromText(tipSection, styleSection),
    fitItems,
    picks,
    palette,
    paletteCopy: summarizeFromText(colorSection, report),
  }
}

function extractSections(report: string) {
  const sections: Array<{ heading: string; body: string }> = []
  const lines = report.split(/\r?\n/)
  let currentHeading = 'overview'
  let currentBody: string[] = []

  for (const line of lines) {
    const heading = line
      .replace(/^[-*\s#]+/, '')
      .replace(/^\d+[).]\s*/, '')
      .trim()

    if (heading && heading.length < 80 && /분석|컬러|추천|스타일|아이템|피해야|코디|팁|총평/i.test(heading)) {
      if (currentBody.length) {
        sections.push({ heading: currentHeading, body: currentBody.join('\n').trim() })
      }

      currentHeading = heading
      currentBody = []
    } else {
      currentBody.push(line)
    }
  }

  if (currentBody.length) {
    sections.push({ heading: currentHeading, body: currentBody.join('\n').trim() })
  }

  return sections
}

function findSection(sections: Array<{ heading: string; body: string }>, keywords: string[]) {
  const matchedSection = sections.find((section) =>
    keywords.some((keyword) => section.heading.includes(keyword)),
  )

  return matchedSection?.body.trim() ?? ''
}

function buildReportTitle(bodySection: string, styleSection: string, profile: ReportProfile) {
  const height = Number(profile.height)
  const source = `${bodySection}\n${styleSection}\n${profile.fitPreference}`.toLowerCase()

  if (/롱|길어|슬림|스트레이트|lean|column/.test(source) || height >= 175) {
    return 'LEAN COLUMN'
  }

  if (/오버핏|세미오버|루즈|볼륨|volume/.test(source)) {
    return 'BALANCED VOLUME'
  }

  if (/미니멀|테일러드|자켓|슬랙스|구조|균형|직선/.test(source)) {
    return 'STRUCTURAL BALANCE'
  }

  return 'PERSONAL FIT MAP'
}

function summarizeFromText(primaryText: string, fallbackText: string) {
  const sentences = normalizeReportText(primaryText || fallbackText)
    .split(/(?<=[.!?。]|다\.|요\.)\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 18)

  return sentences.slice(0, 2).join(' ') || normalizeReportText(fallbackText).slice(0, 180)
}

function normalizeReportText(text: string) {
  return text
    .replace(/\*\*/g, '')
    .replace(/^[-*]\s+/gm, '')
    .replace(/^\d+[).]\s+/gm, '')
    .replace(/#{1,6}\s*/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function buildTags(source: string) {
  const tagRules = [
    { keyword: /미니멀|깔끔|단정/, tag: '#미니멀' },
    { keyword: /세미\s?핏|세미오버|여유/, tag: '#세미핏' },
    { keyword: /테일러드|자켓|블레이저/, tag: '#테일러드' },
    { keyword: /하이웨이스트|허리선|허리/, tag: '#허리선강조' },
    { keyword: /톤온톤|컬러|배색/, tag: '#컬러밸런스' },
    { keyword: /슬랙스|스트레이트|일자/, tag: '#스트레이트라인' },
    { keyword: /레이어|아우터|겹쳐/, tag: '#레이어링' },
  ]

  const tags = tagRules
    .filter((rule) => rule.keyword.test(source))
    .map((rule) => rule.tag)
    .slice(0, 3)

  return tags.length ? tags : ['#AI분석', '#개인맞춤', '#스타일리포트']
}

function buildFitItems(styleSection: string, tipSection: string) {
  const candidates = [...extractListItems(styleSection), ...extractListItems(tipSection)]
    .filter((item) => item.title.length > 1 && item.copy.length > 8)
    .slice(0, 3)

  if (candidates.length >= 3) {
    return candidates.map((item, index) => ({
      icon: fitIcons[index] ?? 'checkroom',
      ...item,
    }))
  }

  return splitSentences(normalizeReportText(`${styleSection} ${tipSection}`))
    .slice(0, 3)
    .map((sentence, index) => ({
      icon: fitIcons[index] ?? 'checkroom',
      title: inferCardTitle(sentence, index),
      copy: sentence,
    }))
}

function extractListItems(text: string) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^[-*]\s+|^\d+[).]\s+/.test(line))
    .map((line) => {
      const cleanedLine = line.replace(/^[-*]\s+|^\d+[).]\s+/, '').replace(/\*\*/g, '').trim()
      const [rawTitle, ...rest] = cleanedLine.split(/[:：-]/)
      const title = rawTitle.trim()
      const copy = rest.join(' ').trim() || cleanedLine

      return {
        title: title.length > 20 ? inferCardTitle(cleanedLine, 0) : title,
        copy,
      }
    })
}

function splitSentences(text: string) {
  return text
    .split(/(?<=[.!?。]|다\.|요\.)\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 18)
}

function inferCardTitle(sentence: string, index: number) {
  if (/자켓|블레이저|아우터/.test(sentence)) return '아우터 방향'
  if (/슬랙스|팬츠|데님|하의/.test(sentence)) return '하의 실루엣'
  if (/셔츠|니트|상의/.test(sentence)) return '상의 밸런스'
  if (/컬러|톤|배색/.test(sentence)) return '컬러 조합'
  if (/허리|비율/.test(sentence)) return '비율 보정'

  return ['핏 전략', '실루엣 전략', '코디 전략'][index] ?? '스타일 전략'
}

function buildPicks(styleSection: string) {
  const items = extractListItems(styleSection).slice(0, 2)

  if (items.length) {
    return items.map((item, index) => ({
      title: item.title,
      meta: item.copy.slice(0, 56),
      image: reportPickImages[index]?.image ?? reportPickImages[0].image,
    }))
  }

  return splitSentences(normalizeReportText(styleSection))
    .slice(0, 2)
    .map((sentence, index) => ({
      title: inferCardTitle(sentence, index),
      meta: sentence.slice(0, 56),
      image: reportPickImages[index]?.image ?? reportPickImages[0].image,
    }))
}

function buildPalette(colorSection: string) {
  const matchedColors = colorTokens.filter((token) =>
    token.keywords.some((keyword) => colorSection.toLowerCase().includes(keyword.toLowerCase())),
  )

  return (matchedColors.length ? matchedColors : colorTokens.slice(0, 5))
    .slice(0, 5)
    .map(({ name, color }) => ({ name, color }))
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
