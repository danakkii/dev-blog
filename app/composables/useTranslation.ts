const _cache = new Map<string, string>()

function guardMarkdown(text: string): { clean: string; blocks: string[] } {
  const blocks: string[] = []
  const clean = text
    .replace(/```[\s\S]*?```/g, m => { blocks.push(m); return `§b${blocks.length - 1}b§` })
    .replace(/`[^`\n]+`/g, m => { blocks.push(m); return `§b${blocks.length - 1}b§` })
  return { clean, blocks }
}

function unguardMarkdown(text: string, blocks: string[]): string {
  return text.replace(/§b(\d+)b§/g, (_, i) => blocks[+i] ?? '')
}

export function useTranslation() {
  const translate = async (text: string): Promise<string> => {
    if (!text?.trim()) return text
    if (_cache.has(text)) return _cache.get(text)!
    const { clean, blocks } = guardMarkdown(text)
    const { translated } = await $fetch<{ translated: string }>('/api/translate', {
      method: 'POST',
      body: { text: clean },
    })
    const result = unguardMarkdown(translated, blocks)
    _cache.set(text, result)
    return result
  }
  return { translate }
}
