import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview)
      }
    }
  }, [photoPreview])

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      setPhotoPreview(null)
      return
    }

    setPhotoPreview((currentPreview) => {
      if (currentPreview) {
        URL.revokeObjectURL(currentPreview)
      }

      return URL.createObjectURL(file)
    })
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

        <form className="profile-form">
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
                />
                <span>kg</span>
              </div>
            </label>
          </div>

          <button type="button" className="primary-action">
            스타일 분석 시작
          </button>
        </form>
      </section>
    </main>
  )
}

export default App
