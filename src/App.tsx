import { useMemo, useState } from 'react'
import {
  calculateSimulation,
  formatNumber,
  formatYen,
} from './calculator'
import {
  deleteSavedRecord,
  formatSavedAt,
  listSavedRecords,
  saveRecord,
} from './storage'
import type { HearingInput, SavedRecord, Scenario } from './types'
import './App.css'

const DEFAULT_HEARING: HearingInput = {
  workingDays: 22,
  receiptsPerMonth: 300,
  newPatientsPerMonth: 0,
  patientsOver50: 60,
  chairs: 3,
  dr: 1,
  dh: 3,
  da: 2,
  basicExamPerDay: 5,
  precisionExamPerDay: 3,
  sptPatientsPerDay: 5,
  cancelRatePercent: 10,
  recallRatePercent: 90,
  insurancePercent: 80,
  selfPayPercent: 20,
  oralManagementStrong: true,
}

const SCENARIO_OPTIONS: { value: Scenario; label: string; examLabel: string }[] = [
  {
    value: 'increase-precision',
    label: '① 精密検査を増やす場合',
    examLabel: '精密検査の増加人数',
  },
  {
    value: 'basic-to-precision',
    label: '② 基本→精密検査に変える場合',
    examLabel: '基本→精密に変更する人数',
  },
]

function parseNumber(value: string): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function App() {
  const [clinicName, setClinicName] = useState('')
  const [hearing, setHearing] = useState<HearingInput>(DEFAULT_HEARING)
  const [scenario, setScenario] = useState<Scenario>('increase-precision')
  const [examPersonCount, setExamPersonCount] = useState(1)
  const [hypofunctionPersonCount, setHypofunctionPersonCount] = useState(1)
  const [showHistory, setShowHistory] = useState(false)
  const [historySearch, setHistorySearch] = useState('')
  const [savedRecords, setSavedRecords] = useState<SavedRecord[]>([])
  const [saveMessage, setSaveMessage] = useState('')

  const activeScenario = SCENARIO_OPTIONS.find((item) => item.value === scenario)!

  const filteredRecords = useMemo(() => {
    const keyword = historySearch.trim()
    if (!keyword) return savedRecords
    return savedRecords.filter((record) => record.clinicName.includes(keyword))
  }, [historySearch, savedRecords])

  const result = useMemo(
    () =>
      calculateSimulation(
        hearing,
        { examPersonCount, hypofunctionPersonCount },
        scenario,
      ),
    [examPersonCount, hearing, hypofunctionPersonCount, scenario],
  )

  const updateHearing = <K extends keyof HearingInput>(
    key: K,
    value: HearingInput[K],
  ) => {
    setHearing((current) => ({ ...current, [key]: value }))
  }

  const refreshSavedRecords = () => {
    setSavedRecords(listSavedRecords())
  }

  const handleSave = () => {
    const trimmedName = clinicName.trim()
    if (!trimmedName) {
      setSaveMessage('医院名を入力してください')
      return
    }

    saveRecord({
      id: crypto.randomUUID(),
      clinicName: trimmedName,
      savedAt: new Date().toISOString(),
      hearing,
      scenario,
      examPersonCount,
      hypofunctionPersonCount,
    })
    refreshSavedRecords()
    setSaveMessage(`${trimmedName} を保存しました`)
  }

  const handleLoadRecord = (record: SavedRecord) => {
    setClinicName(record.clinicName)
    setHearing(record.hearing)
    setScenario(record.scenario)
    setExamPersonCount(record.examPersonCount)
    setHypofunctionPersonCount(record.hypofunctionPersonCount)
    setShowHistory(false)
    setSaveMessage(`${record.clinicName} を読み込みました`)
  }

  const handleDeleteRecord = (id: string) => {
    deleteSavedRecord(id)
    refreshSavedRecords()
  }

  const handleToggleHistory = () => {
    setShowHistory((current) => {
      const next = !current
      if (next) refreshSavedRecords()
      return next
    })
  }

  return (
    <div className="app">
      <header className="header">
        <h1>導入効果診断シート</h1>
        <p>ヒアリング入力とシミュレーションを同時に行えます</p>
      </header>

      <section className="panel save-panel">
        <label className="field clinic-field">
          <span>医院名</span>
          <input
            type="text"
            value={clinicName}
            placeholder="例：〇〇歯科医院"
            onChange={(event) => setClinicName(event.target.value)}
          />
        </label>

        <div className="save-actions">
          <button type="button" className="action-button primary" onClick={handleSave}>
            保存
          </button>
          <button
            type="button"
            className={`action-button ${showHistory ? 'active' : ''}`}
            onClick={handleToggleHistory}
          >
            過去データ
          </button>
        </div>

        {saveMessage ? <p className="save-message">{saveMessage}</p> : null}

        {showHistory ? (
          <div className="history-panel">
            <label className="field">
              <span>医院名で検索</span>
              <input
                type="search"
                value={historySearch}
                placeholder="医院名の一部を入力"
                onChange={(event) => setHistorySearch(event.target.value)}
              />
            </label>

            {filteredRecords.length === 0 ? (
              <p className="history-empty">保存データはありません</p>
            ) : (
              <ul className="history-list">
                {filteredRecords.map((record) => (
                  <li key={record.id} className="history-item">
                    <button
                      type="button"
                      className="history-load"
                      onClick={() => handleLoadRecord(record)}
                    >
                      <strong>{record.clinicName}</strong>
                      <span>{formatSavedAt(record.savedAt)}</span>
                    </button>
                    <button
                      type="button"
                      className="history-delete"
                      aria-label={`${record.clinicName}を削除`}
                      onClick={() => handleDeleteRecord(record.id)}
                    >
                      削除
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </section>

      <main className="layout">
        <section className="panel hearing-panel">
          <h2>ヒアリング項目</h2>
          <div className="field-grid">
            <label className="field">
              <span>① 診療日数</span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={hearing.workingDays || ''}
                onChange={(event) =>
                  updateHearing('workingDays', parseNumber(event.target.value))
                }
              />
            </label>

            <label className="field">
              <span>② レセプト枚数/月</span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={hearing.receiptsPerMonth || ''}
                onChange={(event) =>
                  updateHearing('receiptsPerMonth', parseNumber(event.target.value))
                }
              />
            </label>

            <label className="field">
              <span>③ 新規患者数/月</span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={hearing.newPatientsPerMonth || ''}
                onChange={(event) =>
                  updateHearing(
                    'newPatientsPerMonth',
                    parseNumber(event.target.value),
                  )
                }
              />
            </label>

            <label className="field">
              <span>④ 50歳以上の患者</span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={hearing.patientsOver50 || ''}
                onChange={(event) =>
                  updateHearing('patientsOver50', parseNumber(event.target.value))
                }
              />
            </label>

            <label className="field">
              <span>⑤ チェア数</span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={hearing.chairs || ''}
                onChange={(event) =>
                  updateHearing('chairs', parseNumber(event.target.value))
                }
              />
            </label>

            <label className="field">
              <span>⑥ DR</span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={hearing.dr || ''}
                onChange={(event) =>
                  updateHearing('dr', parseNumber(event.target.value))
                }
              />
            </label>

            <label className="field">
              <span>⑦ DH</span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={hearing.dh || ''}
                onChange={(event) =>
                  updateHearing('dh', parseNumber(event.target.value))
                }
              />
            </label>

            <label className="field">
              <span>⑧ DA</span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={hearing.da || ''}
                onChange={(event) =>
                  updateHearing('da', parseNumber(event.target.value))
                }
              />
            </label>

            <label className="field">
              <span>⑨ 基本検査/日</span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={hearing.basicExamPerDay || ''}
                onChange={(event) =>
                  updateHearing('basicExamPerDay', parseNumber(event.target.value))
                }
              />
            </label>

            <label className="field">
              <span>⑩ 精密検査/日</span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={hearing.precisionExamPerDay || ''}
                onChange={(event) =>
                  updateHearing(
                    'precisionExamPerDay',
                    parseNumber(event.target.value),
                  )
                }
              />
            </label>

            <label className="field">
              <span>⑪ SPT患者/日</span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={hearing.sptPatientsPerDay || ''}
                onChange={(event) =>
                  updateHearing('sptPatientsPerDay', parseNumber(event.target.value))
                }
              />
            </label>

            <label className="field">
              <span>⑫ キャンセル率（%）</span>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                max={100}
                value={hearing.cancelRatePercent || ''}
                onChange={(event) =>
                  updateHearing(
                    'cancelRatePercent',
                    parseNumber(event.target.value),
                  )
                }
              />
            </label>

            <label className="field">
              <span>⑬ リコール率（%）</span>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                max={100}
                value={hearing.recallRatePercent || ''}
                onChange={(event) =>
                  updateHearing(
                    'recallRatePercent',
                    parseNumber(event.target.value),
                  )
                }
              />
            </label>

            <div className="field field-split">
              <span>⑭ 保険と自費割合</span>
              <div className="split-inputs">
                <label>
                  保険
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={100}
                    value={hearing.insurancePercent || ''}
                    onChange={(event) =>
                      updateHearing(
                        'insurancePercent',
                        parseNumber(event.target.value),
                      )
                    }
                  />
                  <span className="suffix">%</span>
                </label>
                <label>
                  自費
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={100}
                    value={hearing.selfPayPercent || ''}
                    onChange={(event) =>
                      updateHearing(
                        'selfPayPercent',
                        parseNumber(event.target.value),
                      )
                    }
                  />
                  <span className="suffix">%</span>
                </label>
              </div>
            </div>

            <div className="field">
              <span>⑮ 口管強</span>
              <div className="toggle-group">
                <button
                  type="button"
                  className={hearing.oralManagementStrong ? 'active' : ''}
                  onClick={() => updateHearing('oralManagementStrong', true)}
                >
                  あり
                </button>
                <button
                  type="button"
                  className={!hearing.oralManagementStrong ? 'active' : ''}
                  onClick={() => updateHearing('oralManagementStrong', false)}
                >
                  なし
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="panel simulation-panel">
          <h2>シミュレーション</h2>

          <div className="scenario-group">
            {SCENARIO_OPTIONS.map((option) => (
              <label key={option.value} className="scenario-option">
                <input
                  type="radio"
                  name="scenario"
                  value={option.value}
                  checked={scenario === option.value}
                  onChange={() => setScenario(option.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>

          <div className="slider-block">
            <div className="slider-header">
              <span>{activeScenario.examLabel}</span>
              <strong>{examPersonCount}人/日</strong>
            </div>
            <input
              type="range"
              min={0}
              max={10}
              step={1}
              value={examPersonCount}
              onChange={(event) => setExamPersonCount(Number(event.target.value))}
            />
          </div>

          <div className="slider-block">
            <div className="slider-header">
              <span>口腔機能低下症の増加人数</span>
              <strong>{hypofunctionPersonCount}人/日</strong>
            </div>
            <input
              type="range"
              min={0}
              max={10}
              step={1}
              value={hypofunctionPersonCount}
              onChange={(event) =>
                setHypofunctionPersonCount(Number(event.target.value))
              }
            />
          </div>

          <div className="breakdown">
            <div className="breakdown-row">
              <span>
                {scenario === 'increase-precision' ? '精密検査' : '基本→精密'}
              </span>
              <span>{formatYen(result.examRevenue)}/月</span>
            </div>
            <div className="breakdown-row">
              <span>口腔機能低下症</span>
              <span>{formatYen(result.hypofunctionRevenue)}/月</span>
            </div>
            <div className="breakdown-row muted">
              <span>診療点数（合計）</span>
              <span>
                {formatNumber(result.examPoints + result.hypofunctionPoints)}点
              </span>
            </div>
          </div>

          <div className="result-card">
            <p className="result-label">月増収</p>
            <p className="result-value">{formatYen(result.monthlyTotal)}</p>
            <p className="result-label">年増収</p>
            <p className="result-value yearly">{formatYen(result.yearlyTotal)}</p>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
