'use client'
import { useState, useEffect } from 'react'
import AppShell from '@/components/AppShell'
import { supabase, type GlossaryItem } from '@/lib/supabase'

const CATS = ['全部', '人名', '品牌', '術語', '口頭禪', '其他'] as const
const CAT_COLORS: Record<string, string> = {
  人名: 'bg-amber-50 text-amber-800',
  品牌: 'bg-blue-50 text-blue-700',
  術語: 'bg-emerald-50 text-emerald-700',
  口頭禪: 'bg-pink-50 text-pink-800',
  其他: 'bg-gray-100 text-gray-600',
}

export default function GlossaryPage() {
  const [items, setItems] = useState<GlossaryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('全部')
  const [modal, setModal] = useState<'add' | 'edit' | 'delete' | null>(null)
  const [editing, setEditing] = useState<GlossaryItem | null>(null)
  const [deleting, setDeleting] = useState<GlossaryItem | null>(null)
  const [form, setForm] = useState({ correct_term: '', category: '術語', scope: 'master', notes: '' })
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true); setError('')
    const { data, error } = await supabase.from('glossary').select('*').order('created_at', { ascending: false })
    if (error) { setError(error.message); setLoading(false); return }
    setItems(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = items.filter(g => {
    const matchCat = filterCat === '全部' || g.category === filterCat
    const q = search.toLowerCase()
    const matchQ = !q || g.correct_term.toLowerCase().includes(q) || (g.notes || '').toLowerCase().includes(q)
    return matchCat && matchQ
  })

  function openAdd() {
    setForm({ correct_term: '', category: '術語', scope: 'master', notes: '' })
    setEditing(null); setModal('add')
  }
  function openEdit(item: GlossaryItem) {
    setForm({ correct_term: item.correct_term, category: item.category, scope: item.scope, notes: item.notes || '' })
    setEditing(item); setModal('edit')
  }
  function openDelete(item: GlossaryItem) { setDeleting(item); setModal('delete') }

  async function save() {
    if (!form.correct_term.trim()) return
    setSaving(true)
    if (modal === 'edit' && editing) {
      await supabase.from('glossary').update({ correct_term: form.correct_term, category: form.category, scope: form.scope, notes: form.notes }).eq('id', editing.id)
    } else {
      await supabase.from('glossary').insert([{ correct_term: form.correct_term, category: form.category, scope: form.scope, notes: form.notes }])
    }
    setSaving(false); setModal(null); load()
  }

  async function del() {
    if (!deleting) return
    setSaving(true)
    await supabase.from('glossary').delete().eq('id', deleting.id)
    setSaving(false); setModal(null); load()
  }

  return (
    <AppShell>
      <div className="flex flex-col items-center px-6 py-10">
        <div className="w-full max-w-[860px]">
          {/* header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="font-serif text-[28px] font-bold text-[#111010]">術語資料庫</div>
              <div className="font-mono text-[11px] text-[#9a9590] mt-1">管理跨專案術語 · 校正時自動套用</div>
            </div>
            <button onClick={openAdd}
              className="bg-[#1a56db] text-white rounded-lg text-[13px] font-medium px-4 py-2.5 flex items-center gap-2 hover:bg-[#1648c2] transition-all">
              <span className="text-[16px] leading-none">＋</span> 新增術語
            </button>
          </div>

          {/* search + filter */}
          <div className="flex gap-2 mb-5 items-center">
            <div className="flex-1 relative">
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜尋術語..."
                className="w-full bg-white border-[1.5px] border-[#e2e0db] rounded-lg text-[13px] pl-10 pr-4 py-2.5 outline-none focus:border-[#1a56db] transition-colors placeholder:text-[#9a9590]" />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9a9590]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="6"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <div className="flex gap-1.5">
              {CATS.map(c => (
                <button key={c} onClick={() => setFilterCat(c)}
                  className={`px-3.5 py-2 rounded-full text-[12px] border-[1.5px] transition-all font-medium ${filterCat === c ? 'bg-[#eff4ff] border-[#c3d4fa] text-[#1a56db]' : 'bg-white border-[#e2e0db] text-[#58544e] hover:border-[#1a56db] hover:text-[#1a56db]'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* table */}
          <div className="border-[1.5px] border-[#e2e0db] rounded-xl overflow-hidden">
            <div className="grid grid-cols-[2fr_1fr_1.5fr_1fr_auto] bg-[#f6f5f3] border-b border-[#e2e0db] px-4 py-2.5 gap-3">
              {['正確寫法', '分類', '備註', '範圍', ''].map(h => (
                <div key={h} className="font-mono text-[10px] text-[#9a9590] tracking-[0.08em] uppercase">{h}</div>
              ))}
            </div>
            <div className="max-h-[420px] overflow-y-auto">
              {loading && (
                <div className="flex flex-col items-center py-12 gap-3 text-[#9a9590]">
                  <div className="text-3xl">⏳</div>
                  <div className="font-mono text-[12px]">載入中...</div>
                </div>
              )}
              {error && (
                <div className="flex flex-col items-center py-12 gap-3 text-[#9a9590]">
                  <div className="text-3xl">⚠️</div>
                  <div className="font-mono text-[12px]">載入失敗：{error}</div>
                </div>
              )}
              {!loading && !error && filtered.length === 0 && (
                <div className="flex flex-col items-center py-12 gap-3 text-[#9a9590]">
                  <div className="text-3xl">📭</div>
                  <div className="font-mono text-[12px] text-center">沒有符合的術語<br />試試其他關鍵字或分類</div>
                </div>
              )}
              {!loading && filtered.map(g => (
                <div key={g.id} className="grid grid-cols-[2fr_1fr_1.5fr_1fr_auto] px-4 py-3 gap-3 border-b border-[#e2e0db] last:border-0 items-center hover:bg-[#f6f5f3] transition-colors">
                  <div className="text-[13px] text-[#111010] font-medium truncate">{g.correct_term}</div>
                  <div><span className={`inline-block px-2.5 py-0.5 rounded-full font-mono text-[10px] font-medium ${CAT_COLORS[g.category]}`}>{g.category}</span></div>
                  <div className="font-mono text-[12px] text-[#58544e] truncate">{g.notes || '—'}</div>
                  <div className={`font-mono text-[10px] ${g.scope === 'master' ? 'text-[#1a56db]' : 'text-[#9a9590]'}`}>
                    {g.scope === 'master' ? '🌐 master' : `📁 ${g.scope}`}
                  </div>
                  <div className="flex gap-1.5 justify-end">
                    <button onClick={() => openEdit(g)} className="p-1.5 rounded-md hover:bg-[#e2e0db] transition-colors group">
                      <svg className="w-4 h-4 fill-[#9a9590] group-hover:fill-[#1a56db]" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button onClick={() => openDelete(g)} className="p-1.5 rounded-md hover:bg-red-50 transition-colors group">
                      <svg className="w-4 h-4 fill-[#9a9590] group-hover:fill-red-600" viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6h14zM10 11v6M14 11v6"/></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* add/edit modal */}
      {(modal === 'add' || modal === 'edit') && (
        <div className="fixed inset-0 bg-black/35 flex items-center justify-center z-50" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-[480px] overflow-hidden shadow-xl">
            <div className="px-7 pt-6 pb-5 border-b border-[#e2e0db] flex items-center justify-between">
              <div className="font-serif text-[20px] font-bold text-[#111010]">{modal === 'add' ? '新增術語' : '編輯術語'}</div>
              <button onClick={() => setModal(null)} className="text-[#9a9590] hover:text-[#111010] text-lg p-1 rounded-md hover:bg-[#f6f5f3]">✕</button>
            </div>
            <div className="px-7 py-6 flex flex-col gap-4">
              {[
                { label: '正確寫法 *', key: 'correct_term', type: 'input', placeholder: '如：Final Cut Pro' },
              ].map(f => (
                <div key={f.key}>
                  <div className="font-mono text-[10px] text-[#9a9590] tracking-[0.08em] uppercase mb-1.5">{f.label}</div>
                  <input value={(form as any)[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    className="w-full bg-white border-[1.5px] border-[#e2e0db] rounded-lg text-[13px] px-4 py-2.5 outline-none focus:border-[#1a56db] transition-colors placeholder:text-[#9a9590]" />
                </div>
              ))}
              <div>
                <div className="font-mono text-[10px] text-[#9a9590] tracking-[0.08em] uppercase mb-1.5">分類</div>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-white border-[1.5px] border-[#e2e0db] rounded-lg text-[13px] px-4 py-2.5 outline-none focus:border-[#1a56db] cursor-pointer">
                  {['術語', '人名', '品牌', '口頭禪', '其他'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <div className="font-mono text-[10px] text-[#9a9590] tracking-[0.08em] uppercase mb-1.5">範圍</div>
                <select value={form.scope} onChange={e => setForm({ ...form, scope: e.target.value })}
                  className="w-full bg-white border-[1.5px] border-[#e2e0db] rounded-lg text-[13px] px-4 py-2.5 outline-none focus:border-[#1a56db] cursor-pointer">
                  <option value="master">master（跨所有課程）</option>
                  <option value="project">專案（本次課程）</option>
                </select>
              </div>
              <div>
                <div className="font-mono text-[10px] text-[#9a9590] tracking-[0.08em] uppercase mb-1.5">備註（選填）</div>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="說明用途或注意事項..."
                  className="w-full bg-[#f6f5f3] border-[1.5px] border-[#e2e0db] rounded-lg font-mono text-[12px] px-4 py-2.5 h-20 resize-none outline-none focus:border-[#1a56db] leading-relaxed placeholder:text-[#9a9590]" />
              </div>
            </div>
            <div className="px-7 py-4 bg-[#f6f5f3] border-t border-[#e2e0db] flex justify-end gap-2">
              <button onClick={() => setModal(null)} className="bg-white border-[1.5px] border-[#e2e0db] rounded-lg text-[13px] font-medium text-[#58544e] px-5 py-2.5 hover:border-[#c9c6c0]">取消</button>
              <button onClick={save} disabled={saving}
                className="bg-[#1a56db] rounded-lg text-[13px] font-medium text-white px-5 py-2.5 hover:bg-[#1648c2] disabled:bg-[#c9c6c0] disabled:cursor-not-allowed transition-all">
                {saving ? '儲存中...' : '儲存'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* delete modal */}
      {modal === 'delete' && deleting && (
        <div className="fixed inset-0 bg-black/35 flex items-center justify-center z-50" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-[420px] overflow-hidden shadow-xl">
            <div className="px-7 pt-6 pb-5 border-b border-[#e2e0db] flex items-center justify-between">
              <div className="font-serif text-[20px] font-bold text-[#111010]">確認刪除</div>
              <button onClick={() => setModal(null)} className="text-[#9a9590] hover:text-[#111010] text-lg p-1">✕</button>
            </div>
            <div className="px-7 py-6">
              <div className="w-12 h-12 bg-red-50 border border-red-200 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 fill-red-600" viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6h14zM10 11v6M14 11v6"/></svg>
              </div>
              <div className="text-center text-[13px] text-[#58544e] leading-relaxed">
                確定要刪除術語<br />
                <span className="font-bold text-[#111010]">「{deleting.correct_term}」</span>？<br />
                此操作無法還原。
              </div>
            </div>
            <div className="px-7 py-4 bg-[#f6f5f3] border-t border-[#e2e0db] flex justify-end gap-2">
              <button onClick={() => setModal(null)} className="bg-white border-[1.5px] border-[#e2e0db] rounded-lg text-[13px] font-medium text-[#58544e] px-5 py-2.5">取消</button>
              <button onClick={del} disabled={saving}
                className="bg-red-600 rounded-lg text-[13px] font-medium text-white px-5 py-2.5 hover:bg-red-700 disabled:opacity-50 transition-all">
                {saving ? '刪除中...' : '確認刪除'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}
export const dynamic = 'force-dynamic'
