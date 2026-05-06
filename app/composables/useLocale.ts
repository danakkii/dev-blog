export function useLocale() {
  const lang = useState<'ko' | 'en'>('locale', () => 'ko')

  const toggleLang = () => {
    lang.value = lang.value === 'ko' ? 'en' : 'ko'
    if (import.meta.client) {
      localStorage.setItem('blog-lang', lang.value)
    }
  }

  const initLang = () => {
    if (import.meta.client) {
      const saved = localStorage.getItem('blog-lang')
      if (saved === 'en' || saved === 'ko') lang.value = saved
    }
  }

  return { lang, toggleLang, initLang }
}
