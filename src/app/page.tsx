'use client'
import { useState, useEffect } from 'react'
import AppShell from '@/components/AppShell'
import { supabase } from '@/lib/supabase'

const STEPS = ['這是哪個專案？', '上傳字幕檔', '有額外術語嗎？', '校正結果']
const STEP_ICONS = [
  <svg key="1" viewBox="0 0 24 24" fill="white" className="w-7 h-7"><path d="M20 6h-8l-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2z"/></svg>,
  <svg key="2" viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  <svg key="3" viewBox="0 0 24 24" fill="white" className="w-7 h-7"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/></svg>,
  <svg key="4" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7"><polyline points="20 6 9 17 4 12"/></svg>,
]

export default function CorrectionPage() {
  const [step, setStep] = useState(1)
  const [project, setProject] = useState('')
  const [owner, setOwner] = useState('')
  const [raw, setRaw] = useState('')
  const [fileName, setFileName] = useState('')
  const [terms, setTerms] = useState<string[]>([])
  const [termInput, setTermInput] = useState('')
  const [masterTerms, setMasterTerms] = useState<string[]>([])
  const [corrected, setCorrected] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'result' | 'original'>('result')

  useEffect(() => {
    async function loadMaster() {
      const { data } = await supabase.from('glossary').select('correct_term').eq('scope', 'master')
      if (data) setMasterTerms(data.map((g: any) => g.correct_term))
    }
    loadMaster()
  }, [])

  function handleFile(f: File) {
    setFileName(f.name)
    const reader = new FileReader()
    reader.onload = e => setRaw(e.target?.result as string || '')
    reader.readAsText(f, 'UTF-8')
  }

  function addTerm() {
    const v = termInput.trim()
    if (!v || terms.includes(v)) return
    setTerms([...terms, v])
    setTermInput('')
  }

  async function runCorrection() {
    if (!raw.trim()) { setError('請先輸入字幕內容'); return }
    setLoading(true); setError('')
    const allTerms = Array.from(new Set([...terms, ...masterTerms]))
    const isVTT = raw.trimStart().startsWith('WEBVTT')
    const fmt = isVTT ? 'VTT' : 'SRT'
    const termTxt = allTerms.length ? `\n\n術語（保持原樣）：${allTerms.join('、')}` : ''
    const sys = `你是專業字幕校正師 L，專門處理線上課程的繁體中文字幕檔。

【核心校正規則】
1. 移除所有中文與英文標點（，。！？；：「」『』、…—～()（）[]【】），保留英文字母與數字
2. 每行最多 19 個字，超過必須斷行，禁止在名詞/動詞片語/英文單字中間斷開
3. 斷句在語意自然停頓處
4. 英文與數字前後空半格
5. 刪除口頭禪：就是 然後 那個 嗯 啊 對對對 哦 喔
6. 重複詞只保留一次，口誤刪除錯誤版本
7. 每一條字幕只能呈現單行，不可拆成雙行

【輸出規範】
- 完整保留 ${fmt} 格式含標頭與時間碼
- 只修改文字，時間碼不動
- 直接輸出校正完成的 ${fmt}，不加說明`

    try {
      const res = await fetch('/api/correct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ system: sys, content: `${project ? `專案：${project}\n` : ''}${termTxt}\n\n${raw}` }),
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setCorrected(data.result)
      setStep(4)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function download() {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const name = [project, owner, today].filter(Boolean).join('_') || 'subtitle'
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([corrected], { type: 'text/plain;charset=utf-8' }))
    a.download = `${name}.vtt`
    a.click()
  }

  function reset() {
    setStep(1); setProject(''); setOwner(''); setRaw(''); setFileName('')
    setTerms([]); setCorrected(''); setError('')
  }

  const origLines = raw.split('\n').length
  const newLines = corrected.split('\n').length

  return (
    <AppShell>
      <div className="flex flex-col items-center px-6 py-12">
        <div className="text-center mb-9">
          <div className="font-mono text-[11px] tracking-[0.2em] text-[#1a56db] uppercase mb-3">知識衛星 · Subtitle Correction System</div>
          <div className="font-serif text-[52px] font-bold text-[#111010] leading-tight">字幕自動校正</div>
        </div>

        <div className="flex items-center mb-10">
          {[1,2,3,4].map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`rounded-full transition-all ${step === s ? 'w-3 h-3 bg-[#1a56db]' : step > s ? 'w-2.5 h-2.5 bg-[#1a56db] opacity-40' : 'w-2.5 h-2.5 bg-[#e2e0db]'}`} />
              {i < 3 && <div className={`w-11 h-[1.5px] ${step > s ? 'bg-[#1a56db] opacity-40' : 'bg-[#e2e0db]'}`} />}
            </div>
          ))}
        </div>

        <div className="w-full max-w-[620px] bg-white border-[1.5px] border-[#e2e0db] rounded-2xl overflow-hidden shadow-[0_2px_20px_rgba(0,0,0,0.06)]">
          <div className="bg-[#f6f5f3] border-b border-[#e2e0db] px-10 py-7 flex items-center gap-5">
            <div className={`w-[60px] h-[60px] rounded-2xl flex items-center justify-center flex-shrink-0 ${step === 4 && corrected ? 'bg-[#059669]' : 'bg-[#1a56db]'}`}>
              {STEP_ICONS[step - 1]}
            </div>
            <div>
              <div className="font-mono text-[11px] text-[#1a56db] tracking-[0.16em] uppercase mb-1 font-medium">STEP 0{step}</div>
              <div className="font-serif text-[24px] font-bold text-[#111010] leading-tight">{STEPS[step - 1]}</div>
            </div>
          </div>

          <div className="px-10 py-7">
            {step === 1 && (
              <div className="flex flex-col gap-4">
                <p className="text-[13px] text-[#9a9590] leading-relaxed">輸入專案名稱與負責人，術語記錄會依此分類存檔。</p>
                <div>
                  <label className="block font-mono text-[10px] text-[#9a9590] tracking-[0.08em] uppercase mb-1.5">專案名稱</label>
                  <input type="text" value={project} onChange={e => setProject(e.target.value)}
                    placeholder="例：［2026-36］瓦基 AI"
                    className="w-full bg-white border-[1.5px] border-[#e2e0db] rounded-lg text-[14px] px-4 py-3 outline-none focus:border-[#1a56db] transition-colors placeholder:text-[#9a9590]" />
                </div>
                <div>
                  <label className="block font-mono text-[10px] text-[#9a9590] tracking-[0.08em] uppercase mb-1.5">負責人</label>
                  <input type="text" value={owner} onChange={e => setOwner(e.target.value)}
                    placeholder="例：Alan"
                    className="w-full bg-white border-[1.5px] border-[#e2e0db] rounded-lg text-[14px] px-4 py-3 outline-none focus:border-[#1a56db] transition-colors placeholder:text-[#9a9590]" />
                </div>
                <div className="bg-[#f6f5f3] border border-[#e2e0db] rounded-lg px-4 py-3 flex gap-2">
                  <span className="text-[14px]">💡</span>
                  <div className="font-mono text-[11px] text-[#9a9590] leading-relaxed">建議格式：［年份-流水號］專案簡稱<br />範例：［2026-36］瓦基 AI</div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-4">
                <p className="text-[13px] text-[#9a9590] leading-relaxed">支援 .vtt 或 .srt 格式，也可直接貼上字幕內容。</p>
                {!fileName ? (
                  <label className="border-2 border-dashed border-[#c9c6c0] rounded-xl py-9 px-5 flex flex-col items-center gap-2 cursor-pointer transition-all hover:border-[#1a56db] hover:bg-[#eff4ff]">
                    <input type="file" accept=".vtt,.srt" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
                    <div className="w-10 h-10 bg-white border-[1.5px] border-[#e2e0db] rounded-xl flex items-center justify-center text-lg">↑</div>
                    <span className="text-[14px] font-medium text-[#58544e]">拖曳或點擊上傳</span>
                    <span className="font-mono text-[11px] text-[#9a9590]">.vtt 或 .srt 格式</span>
                  </label>
                ) : (
                  <div className="bg-[#eff4ff] border-[1.5px] border-[#c3d4fa] rounded-xl px-4 py-3 flex items-center gap-3">
                    <span className="bg-[#1a56db] text-white font-mono text-[10px] font-medium px-2 py-1 rounded-md flex-shrink-0">{fileName.split('.').pop()?.toUpperCase()}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-medium text-[#111010] truncate">{fileName}</div>
                      <div className="font-mono text-[10px] text-[#9a9590] mt-0.5">{raw.split('\n').length} 行</div>
                    </div>
                    <button onClick={() => { setFileName(''); setRaw('') }} className="text-[#9a9590] hover:text-[#111010] text-[16px]">✕</button>
                  </div>
                )}
                <div className="flex items-center gap-3 my-1">
                  <div className="flex-1 h-px bg-[#e2e0db]" />
                  <span className="font-mono text-[10px] text-[#9a9590] tracking-[0.08em]">OR</span>
                  <div className="flex-1 h-px bg-[#e2e0db]" />
                </div>
                <textarea value={raw} onChange={e => setRaw(e.target.value)}
                  placeholder={'WEBVTT\n\n00:00:01.000 --> 00:00:04.000\n大家好歡迎來到今天的課程...'}
                  className="w-full bg-[#f6f5f3] border-[1.5px] border-[#e2e0db] rounded-lg font-mono text-[12px] px-4 py-3 h-32 resize-none outline-none focus:border-[#1a56db] leading-relaxed placeholder:text-[#9a9590]" />
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col gap-4">
                <p className="text-[13px] text-[#9a9590] leading-relaxed">加入要特別保留的術語、品牌名或人名。術語庫中的 master 術語會自動套用。</p>
                <div className="flex gap-2">
                  <input type="text" value={termInput} onChange={e => setTermInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addTerm()}
                    placeholder="如：Final Cut Pro、林小明老師..."
                    className="flex-1 bg-white border-[1.5px] border-[#e2e0db] rounded-lg text-[13px] px-4 py-3 outline-none focus:border-[#1a56db] transition-colors placeholder:text-[#9a9590]" />
                  <button onClick={addTerm} className="bg-[#f6f5f3] border-[1.5px] border-[#e2e0db] rounded-lg text-[13px] font-medium text-[#58544e] px-4 py-3 hover:border-[#1a56db] hover:text-[#1a56db] transition-all whitespace-nowrap">＋ 新增</button>
                </div>
                {terms.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {terms.map((t, i) => (
                      <span key={i} className="bg-[#eff4ff] border border-[#c3d4fa] rounded-full px-3 py-1 text-[12px] text-[#1a56db] flex items-center gap-1.5">
                        {t}<button onClick={() => setTerms(terms.filter((_, j) => j !== i))} className="opacity-50 hover:opacity-100 text-[12px]">✕</button>
                      </span>
                    ))}
                  </div>
                )}
                {masterTerms.length > 0 && (
                  <div className="bg-[#f6f5f3] border border-[#e2e0db] rounded-lg px-4 py-3">
                    <div className="font-mono text-[10px] text-[#9a9590] mb-2">術語庫自動套用（{masterTerms.length} 筆）</div>
                    <div className="flex flex-wrap gap-1.5">
                      {masterTerms.map((t, i) => (
                        <span key={i} className="bg-white border border-[#e2e0db] rounded-full px-2.5 py-0.5 text-[11px] text-[#58544e]">{t}</span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="bg-[#f6f5f3] border border-[#e2e0db] rounded-lg px-4 py-3 flex gap-2">
                  <span className="text-[14px]">💡</span>
                  <div className="font-mono text-[11px] text-[#9a9590] leading-relaxed">術語會優先保留原始寫法，按 Enter 快速新增。</div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="flex flex-col gap-4">
                {loading && <div className="font-mono text-[12px] text-[#9a9590]">正在套用校正規則，請稍候...</div>}
                {error && <div className="font-mono text-[12px] text-red-600">錯誤：{error}</div>}
                {corrected && (
                  <>
                    <div className="bg-[#ecfdf5] border border-[#6ee7b7] rounded-lg px-4 py-3 flex items-center gap-3">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#059669"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5l-4-4 1.41-1.41L11 13.67l6.59-6.59L19 8.5l-8 8z"/></svg>
                      <div>
                        <div className="text-[13px] text-[#065f46] font-medium">校正完成！</div>
                        <div className="font-mono text-[11px] text-[#6b7280] mt-0.5">共 {newLines} 行 · 套用 {masterTerms.length + terms.length} 個術語</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[['原始行數', origLines], ['校正後行數', newLines], ['格式', 'VTT']].map(([l, v]) => (
                        <div key={String(l)} className="bg-[#f6f5f3] border border-[#e2e0db] rounded-lg px-4 py-3">
                          <div className="font-mono text-[22px] font-medium text-[#111010]">{v}</div>
                          <div className="font-mono text-[10px] text-[#9a9590] mt-0.5 uppercase tracking-[0.06em]">{l}</div>
                        </div>
                      ))}
                    </div>
                    <div className="flex bg-[#f6f5f3] border border-[#e2e0db] rounded-lg p-1 gap-0.5">
                      {(['result', 'original'] as const).map(t => (
                        <button key={t} onClick={() => setActiveTab(t)}
                          className={`flex-1 py-2 text-[12px] font-medium rounded-md transition-all ${activeTab === t ? 'bg-white text-[#111010] shadow-sm' : 'text-[#9a9590]'}`}>
                          {t === 'result' ? '校正結果' : '原始內容'}
                        </button>
                      ))}
                    </div>
                    <div className="bg-[#f6f5f3] border border-[#e2e0db] rounded-lg p-4 font-mono text-[12px] text-[#58544e] whitespace-pre-wrap max-h-72 overflow-y-auto leading-loose">
                      {activeTab === 'result' ? corrected : raw}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="px-10 py-5 bg-[#f6f5f3] border-t border-[#e2e0db] flex items-center justify-between">
            {step === 4 ? (
              <>
                <button onClick={reset} className="text-[13px] text-[#9a9590] hover:text-[#111010] transition-colors">重新開始</button>
                <div className="flex gap-2">
                  <button onClick={() => navigator.clipboard.writeText(corrected)}
                    className="bg-white border-[1.5px] border-[#e2e0db] rounded-lg text-[13px] font-medium text-[#58544e] px-5 py-2.5 hover:border-[#c9c6c0] transition-all">複製</button>
                  <button onClick={download}
                    className="bg-[#1a56db] border-none rounded-lg text-[13px] font-medium text-white px-5 py-2.5 hover:bg-[#1648c2] transition-all">下載 .vtt</button>
                </div>
              </>
            ) : (
              <>
                {step > 1
                  ? <button onClick={() => setStep(s => s - 1)} className="text-[13px] text-[#9a9590] hover:text-[#111010] transition-colors">← 上一步</button>
                  : <span />}
                <button
                  onClick={() => step < 3 ? setStep(s => s + 1) : runCorrection()}
                  disabled={loading}
                  className="bg-[#111010] border-none rounded-lg text-[14px] font-medium text-white px-6 py-3 hover:bg-[#2d2a27] transition-all disabled:bg-[#c9c6c0] disabled:cursor-not-allowed">
                  {step === 3 ? (loading ? '校正中...' : '開始校正 →') : '下一步 →'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
