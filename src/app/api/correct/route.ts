import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { system, content } = await req.json()

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 8000,
        system,
        messages: [{ role: 'user', content }],
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('Anthropic error:', JSON.stringify(data))
      return NextResponse.json({ error: data?.error?.message || 'API error' }, { status: 500 })
    }

    const result = data.content?.[0]?.text || ''
    return NextResponse.json({ result })
  } catch (e: any) {
    console.error('Route error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
