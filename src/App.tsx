import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import './App.css'

function App() {
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [notes, setNotes] = useState('')
  const [report, setReport] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview)
      }
    }
  }, [photoPreview])

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      setPhotoFile(null)
      setPhotoPreview(null)
      return
    }

    setPhotoFile(file)
    setPhotoPreview((currentPreview) => {
      if (currentPreview) {
        URL.revokeObjectURL(currentPreview)
      }

      return URL.createObjectURL(file)
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setReport('')

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

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error ?? '스타일 보고서를 생성하지 못했습니다.')
      }

      setReport(payload.reportText)
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
    <main className="app-shell">
      <section className="intro-panel" aria-labelledby="page-title">
        <div className="brand-mark" aria-hidden="true">
          PS
        </div>
        <p className="eyebrow">Personal Stylist Studio</p>
        <h1 id="page-title">내 체형에 맞는 스타일 추천을 시작해요</h1>
        <p className="intro-copy">
          전신 사진과 기본 신체 정보를 입력하면 어울리는 핏, 실루엣, 코디
          방향을 분석할 수 있어요.
        </p>

        <div className="preview-stack" aria-hidden="true">
          <div className="outfit-card jacket"></div>
          <div className="outfit-card shirt"></div>
          <div className="outfit-card pants"></div>
        </div>
      </section>

      <section className="form-panel" aria-label="프로필 입력">
        <div className="form-heading">
          <p className="step-label">Step 1</p>
          <h2>프로필 입력</h2>
        </div>

        <form className="profile-form" onSubmit={handleSubmit}>
          <label className="photo-upload">
            <input type="file" accept="image/*" onChange={handlePhotoChange} />
            {photoPreview ? (
              <img src={photoPreview} alt="업로드한 본인 사진 미리보기" />
            ) : (
              <>
                <span className="upload-icon" aria-hidden="true">
                  +
                </span>
                <span className="upload-title">본인 사진 업로드</span>
                <span className="upload-help">정면 전신 사진을 권장해요</span>
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
            {isLoading ? '보고서 생성 중' : '스타일 분석 시작'}
          </button>
        </form>

        {report ? (
          <article className="report-panel" aria-label="스타일 컨설팅 보고서">
            <div>
              <p className="step-label">Report</p>
              <h3>스타일 컨설팅 보고서</h3>
            </div>
            <div className="report-text">{report}</div>
          </article>
        ) : null}
      </section>
    </main>
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

export default App
