import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '字幕自動校正 · 知識衛星',
  description: '知識衛星字幕校正系統',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body className="min-h-screen bg-white font-sans">{children}</body>
    </html>
  )
}
