'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const ALLOWED_DOMAIN = process.env.NEXT_PUBLIC_ALLOWED_DOMAIN || 'sat.cool'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const domain = email.split('@')[1]?.toLowerCase()
    if (domain !== ALLOWED_DOMAIN) {
      setError(`請使用 @${ALLOWED_DOMAIN} 公司信箱`)
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/correction` },
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* header */}
      <header className="border-b border-[#e2e0db] px-10 h-[52px] flex items-center justify-between">
        <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.16em] text-[#9a9590] uppercase">
          <span className="text-[#58544e]">知識衛星</span>
          <span className="w-[3px] h-[3px] rounded-full bg-[#c9c6c0]" />
          <span>Subtitle Correction System</span>
        </div>
        <span className="font-mono text-[10px] text-[#9a9590] tracking-[0.08em]">INTERNAL TOOL · v0.1</span>
      </header>

      {/* grid bg */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(#1a56db 1px,transparent 1px),linear-gradient(90deg,#1a56db 1px,transparent 1px)', backgroundSize: '48px 48px' }} />

      {/* center */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 relative z-10">
        <div className="w-full max-w-[420px] bg-white border-[1.5px] border-[#e2e0db] rounded-xl overflow-hidden">
          {!sent ? (
            <>
              <div className="px-9 pt-8 pb-7 border-b border-[#e2e0db]">
                <div className="font-mono text-[11px] text-[#1a56db] tracking-[0.16em] uppercase mb-2">Staff Access</div>
                <div className="font-serif text-[22px] font-bold text-[#111010] mb-1">登入工作台</div>
                <div className="font-mono text-[11px] text-[#9a9590] leading-relaxed">
                  限知識衛星內部成員使用<br />請輸入公司 Email 取得登入連結
                </div>
              </div>
              <form onSubmit={handleSubmit} className="px-9 py-7 flex flex-col gap-4">
                <div>
                  <div className="font-mono text-[10px] text-[#9a9590] tracking-[0.1em] uppercase mb-2">公司 Email</div>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder={`yourname@${ALLOWED_DOMAIN}`}
                    className="w-full bg-white border-[1.5px] border-[#e2e0db] rounded-lg text-[#111010] font-mono text-[12px] px-4 py-3 outline-none transition-colors focus:border-[#1a56db] placeholder:text-[#9a9590]"
                    required
                  />
                  {error && (
                    <div className="mt-2 font-mono text-[11px] text-red-600 flex items-center gap-2">
                      <span>✕</span><span>{error}</span>
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 border border-[#a08040] rounded-[3px] text-[#c8a96e] font-mono text-[11px] tracking-[0.16em] uppercase transition-all hover:bg-[rgba(200,169,110,0.08)] hover:border-[#c8a96e] disabled:border-[#e2e0db] disabled:text-[#9a9590] disabled:cursor-not-allowed"
                >
                  {loading ? '發送中...' : '發送登入連結'}
                </button>
                <div className="bg-[#f6f5f3] border border-[#e2e0db] rounded-lg px-4 py-3 font-mono text-[10px] text-[#9a9590] leading-relaxed flex gap-2">
                  <span className="text-[#a08040]">✦</span>
                  <span>Magic Link 將發送至你的信箱，連結 15 分鐘內有效。無需設定密碼。</span>
                </div>
              </form>
            </>
          ) : (
            <div className="px-9 py-10 flex flex-col items-center gap-4 text-center">
              <div className="w-[52px] h-[52px] border border-[#a08040] rounded-lg flex items-center justify-content-center text-xl text-[#c8a96e]">✉</div>
              <div className="font-serif text-[18px] font-bold text-[#111010]">連結已發送</div>
              <div className="font-mono text-[12px] text-[#1a56db] bg-[#eff4ff] border border-[#c3d4fa] rounded-lg px-4 py-2">{email}</div>
              <div className="font-mono text-[11px] text-[#9a9590] leading-relaxed">請前往信箱點擊登入連結<br />連結 15 分鐘內有效</div>
              <button onClick={() => setSent(false)} className="font-mono text-[10px] text-[#9a9590] underline underline-offset-2 cursor-pointer bg-none border-none mt-1 hover:text-[#c8a96e]">
                沒收到？重新發送
              </button>
            </div>
          )}
        </div>
      </div>

      <footer className="border-t border-[#e2e0db] py-4 flex justify-center">
        <span className="font-mono text-[10px] text-[#9a9590] tracking-[0.1em]">知識衛星字幕校正系統 · 內部使用</span>
      </footer>
    </div>
  )
}
