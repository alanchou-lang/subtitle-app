'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname()

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* header */}
      <header className="bg-white border-b border-[#e2e0db] px-10 h-[52px] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.16em] text-[#9a9590] uppercase">
          <span className="text-[#58544e]">知識衛星</span>
          <span className="w-[3px] h-[3px] rounded-full bg-[#c9c6c0]" />
          <span>Subtitle Correction System</span>
        </div>
        <span className="font-mono text-[10px] text-[#9a9590] tracking-[0.08em]">INTERNAL TOOL · v0.1</span>
      </header>

      {/* nav */}
      <nav className="bg-white border-b border-[#e2e0db] px-10 flex">
        <Link href="/correction"
          className={`px-5 py-3 text-[13px] font-medium border-b-2 -mb-[1px] transition-all flex items-center gap-2 ${path === '/correction' ? 'text-[#1a56db] border-[#1a56db]' : 'text-[#9a9590] border-transparent hover:text-[#58544e]'}`}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          </svg>
          字幕校正
        </Link>
        <Link href="/glossary"
          className={`px-5 py-3 text-[13px] font-medium border-b-2 -mb-[1px] transition-all flex items-center gap-2 ${path === '/glossary' ? 'text-[#1a56db] border-[#1a56db]' : 'text-[#9a9590] border-transparent hover:text-[#58544e]'}`}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
          術語資料庫
        </Link>
      </nav>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-[#e2e0db] py-3 flex justify-center">
        <span className="font-mono text-[10px] text-[#9a9590] tracking-[0.1em]">知識衛星字幕校正系統 · 內部使用</span>
      </footer>
    </div>
  )
}
