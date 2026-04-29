import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { system, content } = await req.json()

    const GEMINI_KEY = process.env.GEMINI_API_KEY!
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_KEY}`

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: content }] }],
        generationConfig: { maxOutputTokens: 8000, temperature: 0.1 },
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('Gemini error:', JSON.stringify(data))
      return NextResponse.json({ error: data?.error?.message || 'API error' }, { status: 500 })
    }

    const result = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    return NextResponse.json({ result })
  } catch (e: any) {
    console.error('Route error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
