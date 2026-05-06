function chunkText(text: string, maxLen = 4000): string[] {
  if (text.length <= maxLen) return [text]
  const chunks: string[] = []
  let current = ''
  for (const para of text.split('\n\n')) {
    if (current.length + para.length + 2 > maxLen && current.trim()) {
      chunks.push(current)
      current = para
    } else {
      current += (current ? '\n\n' : '') + para
    }
  }
  if (current.trim()) chunks.push(current)
  return chunks
}

async function gtranslate(text: string): Promise<string> {
  if (!text.trim()) return text
  const params = new URLSearchParams({ client: 'gtx', sl: 'ko', tl: 'en', dt: 't', q: text })
  const res = await fetch('https://translate.googleapis.com/translate_a/single?' + params.toString())
  if (!res.ok) return text
  const data = await res.json() as [[string, string][]]
  return data[0].map(c => c[0]).join('')
}

export default defineEventHandler(async (event) => {
  const { text } = await readBody<{ text: string }>(event)
  if (!text?.trim()) return { translated: '' }

  const chunks = chunkText(text)
  const results = await Promise.all(chunks.map(gtranslate))
  return { translated: results.join('\n\n') }
})
