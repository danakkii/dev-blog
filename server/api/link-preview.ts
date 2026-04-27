export default defineEventHandler(async (event) => {
  const { url } = getQuery(event)

  if (!url || typeof url !== 'string') {
    return { title: null }
  }

  try {
    new URL(url)
  } catch {
    return { title: null }
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkPreview/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
      }
    })

    clearTimeout(timeout)

    if (!response.ok) return { title: null }

    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('text/html')) return { title: null }

    // 처음 15KB만 읽어서 title 추출
    const reader = response.body?.getReader()
    if (!reader) return { title: null }

    let html = ''
    while (html.length < 15000) {
      const { value, done } = await reader.read()
      if (done) break
      html += new TextDecoder().decode(value)
      // <title> 태그까지 찾으면 중단
      if (/<\/title>/i.test(html)) break
    }
    reader.cancel().catch(() => {})

    // og:title 우선, 없으면 <title>
    const ogTitle =
      html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i)?.[1]

    const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]

    const title = (ogTitle || titleTag || '').replace(/\s+/g, ' ').trim()
    return { title: title || null }
  } catch {
    return { title: null }
  }
})
