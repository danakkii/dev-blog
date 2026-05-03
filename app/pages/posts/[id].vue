<template>
  <div class="post-detail-wrapper">
    <nav class="navbar">
      <div class="nav-content">
        <NuxtLink to="/" class="nav-logo">>>_ DanaKim</NuxtLink>
        <div class="nav-links">
          <NuxtLink to="/" exact-active-class="nav-active">Home</NuxtLink>
          <NuxtLink to="/blog" active-class="nav-active" class="nav-active">Blog</NuxtLink>
        </div>
      </div>
    </nav>

    <div class="page-layout">
      <main class="main-content">
        <div v-if="pending" class="loading">Loading...</div>

        <article v-else-if="post" class="post-article">
          <header class="post-header">
            <div class="post-meta">
              <time class="post-date">{{ formatDate(post.created_at) }}</time>
              <span class="meta-sep">·</span>
              <span class="read-time">{{ readingTime }} min read</span>
              <span v-if="isAdminViewer" class="meta-sep">·</span>
              <span v-if="isAdminViewer" class="view-count">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                {{ formatViews(viewCount) }}
              </span>
            </div>
            <h1 class="post-title">{{ post.title }}</h1>
            <div class="post-divider"></div>
          </header>

          <div ref="markdownBodyEl" class="post-body markdown-body" v-html="parsedContent"></div>
        </article>

        <div v-else class="error">포스트를 찾을 수 없습니다.</div>

        <section class="comments-section">
          <div class="comments-divider"></div>
          <h2 class="comments-title">Feedback.</h2>
          <div ref="giscusContainer" class="giscus-wrapper"></div>
        </section>
      </main>

      <!-- TOC Sidebar -->
      <aside v-if="toc.length > 1" class="toc-sidebar">
        <p class="toc-title">On this page</p>
        <nav>
          <ul class="toc-list">
            <li
              v-for="item in toc"
              :key="item.id"
              :class="['toc-item', `level-${item.level}`, { 'toc-active': activeHeading === item.id }]"
            >
              <a :href="`#${item.id}`" @click.prevent="scrollTo(item.id)">{{ item.text }}</a>
            </li>
          </ul>
        </nav>
      </aside>
    </div>

    <footer class="post-footer">
      <NuxtLink to="/blog" class="footer-back">← All Posts</NuxtLink>
    </footer>

    <!-- Scroll to top -->
    <Transition name="scroll-btn">
      <button v-if="showScrollTop" class="scroll-top-btn" @click="scrollToTop" aria-label="맨 위로">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="18 15 12 9 6 15"/>
        </svg>
      </button>
    </Transition>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { marked } from 'marked'
import hljs from 'highlight.js'

const toHeadingId = (raw) =>
  'h-' + raw
    .replace(/[*_`~\[\]]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-가-힣]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

marked.use({
  gfm: true,
  breaks: true,
  renderer: {
    code({ text, lang }) {
      const escHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      if (lang === 'mermaid') {
        return `<pre><code class="language-mermaid">${escHtml(text)}</code></pre>`
      }
      const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext'
      try {
        const highlighted = hljs.highlight(text, { language, ignoreIllegals: true }).value
        return `<pre><code class="language-${language} hljs">${highlighted}</code></pre>\n`
      } catch {
        return `<pre><code class="language-plaintext hljs">${escHtml(text)}</code></pre>\n`
      }
    },
    heading({ text, depth, raw }) {
      const rawText = raw.replace(/^#{1,6}\s+/, '').replace(/\s+$/, '')
      const id = toHeadingId(rawText)
      return `<h${depth} id="${id}">${text}</h${depth}>\n`
    }
  }
})

const route = useRoute()
const supabase = useSupabaseClient()

const { data: post, pending } = await useAsyncData(`post-${route.params.id}`, async () => {
  const { data } = await supabase
    .from('post')
    .select('*')
    .eq('id', route.params.id)
    .single()
  return data
})

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, '0')}. ${String(date.getDate()).padStart(2, '0')}.`
}

const processMermaid = (html) => html.replace(
  /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g,
  (_, encoded) => {
    const code = encoded
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
      .trim()
    return `<div class="mermaid-block">${code}</div>`
  }
)

const YT_RE = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
const VIMEO_RE = /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)/

const processVideoEmbeds = (html) => {
  const toEmbed = (url) => {
    const yt = url.match(YT_RE)
    if (yt) return `<div class="video-embed"><iframe src="https://www.youtube.com/embed/${yt[1]}" frameborder="0" allowfullscreen loading="lazy"></iframe></div>`
    const vi = url.match(VIMEO_RE)
    if (vi) return `<div class="video-embed"><iframe src="https://player.vimeo.com/video/${vi[1]}" frameborder="0" allowfullscreen loading="lazy"></iframe></div>`
    return null
  }
  // GFM auto-links: <p><a href="URL">URL</a></p>
  html = html.replace(/<p>\s*<a [^>]*href="([^"]+)"[^>]*>[^<]*<\/a>\s*<\/p>/g, (match, url) => toEmbed(url) ?? match)
  // Plain text URL on its own line: <p>URL</p>
  html = html.replace(/<p>\s*(https?:\/\/[^\s<]+)\s*<\/p>/g, (match, url) => toEmbed(url) ?? match)
  return html
}

const parsedContent = computed(() => {
  if (!post.value?.content) return ''
  let html = marked.parse(post.value.content)
  html = processMermaid(html)
  html = processVideoEmbeds(html)
  return html
})

const readingTime = computed(() => {
  if (!post.value?.content) return 1
  const text = post.value.content
  // 한글 음절: 분당 약 500자
  const koreanChars = (text.match(/[가-힣]/g) || []).length
  // 영문 단어: 분당 약 200단어
  const englishWords = text.replace(/[가-힣]/g, '').trim().split(/\s+/).filter(Boolean).length
  const minutes = koreanChars / 500 + englishWords / 200
  return Math.max(1, Math.round(minutes))
})

const toc = computed(() => {
  if (!post.value?.content) return []
  const headings = []
  let inCodeBlock = false
  for (const line of post.value.content.split('\n')) {
    if (/^(`{3,}|~{3,})/.test(line)) { inCodeBlock = !inCodeBlock; continue }
    if (inCodeBlock) continue
    const m = line.match(/^(#{1,3})\s+(.+)$/)
    if (m) {
      headings.push({
        level: m[1].length,
        text: m[2].replace(/[*_`~\[\]]/g, '').trim(),
        id: toHeadingId(m[2])
      })
    }
  }
  return headings
})

const activeHeading = ref('')
const markdownBodyEl = ref(null)
const giscusContainer = ref(null)
const showScrollTop = ref(false)
const viewCount = ref(post.value?.views ?? 0)
const isAdminViewer = ref(false)
const ADMIN_AUTH_KEY = 'devblog-admin-authenticated'

const formatViews = (n) => {
  if (!n) return '0'
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  return String(n)
}

watch(() => post.value?.views, (v) => { if (v != null) viewCount.value = v })

const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

const onScroll = () => { showScrollTop.value = window.scrollY > 400 }

const addCopyButtons = () => {
  if (!markdownBodyEl.value) return
  markdownBodyEl.value.querySelectorAll('pre').forEach(pre => {
    if (pre.querySelector('.copy-btn')) return
    const btn = document.createElement('button')
    btn.className = 'copy-btn'
    btn.setAttribute('aria-label', 'copy code')
    btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><span>Copy</span>`
    btn.addEventListener('click', async () => {
      const code = pre.querySelector('code')?.innerText ?? pre.innerText
      try {
        await navigator.clipboard.writeText(code)
        btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>Copied!</span>`
        btn.classList.add('copied')
      } catch {
        btn.querySelector('span').textContent = 'Failed'
      }
      setTimeout(() => {
        btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><span>Copy</span>`
        btn.classList.remove('copied')
      }, 2000)
    })
    pre.appendChild(btn)
  })
}

const scrollTo = (id) => {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const renderMermaid = async () => {
  if (!markdownBodyEl.value) return
  const nodes = [...markdownBodyEl.value.querySelectorAll('.mermaid-block:not([data-done])')]
  if (!nodes.length) return
  const { default: mermaid } = await import('mermaid')
  mermaid.initialize({ startOnLoad: false, theme: 'neutral', securityLevel: 'loose' })
  for (const node of nodes) {
    try {
      const id = 'mmd-' + Math.random().toString(36).slice(2, 8)
      const { svg } = await mermaid.render(id, node.textContent.trim())
      node.innerHTML = svg
      node.setAttribute('data-done', '1')
    } catch (e) {
      node.innerHTML = `<pre style="color:#c0392b;font-size:0.82rem;padding:12px;background:#fff0f0;border-radius:6px">Mermaid error: ${e.message}</pre>`
    }
  }
}

onMounted(async () => {
  isAdminViewer.value = localStorage.getItem(ADMIN_AUTH_KEY) === '1'

  window.addEventListener('scroll', onScroll, { passive: true })

  if (post.value?.id) {
    const { data } = await supabase.rpc('increment_post_views', { post_id: post.value.id })
    if (data != null) viewCount.value = data
  }

  if (giscusContainer.value) {
    const script = document.createElement('script')
    script.src = 'https://giscus.app/client.js'
    script.setAttribute('data-repo', 'danakkii/dev-blog')
    script.setAttribute('data-repo-id', 'R_kgDORV26yw')
    script.setAttribute('data-category', 'General')
    script.setAttribute('data-category-id', 'DIC_kwDORV26y84C29dY')
    script.setAttribute('data-mapping', 'pathname')
    script.setAttribute('data-strict', '0')
    script.setAttribute('data-reactions-enabled', '1')
    script.setAttribute('data-emit-metadata', '0')
    script.setAttribute('data-input-position', 'bottom')
    script.setAttribute('data-theme', 'light')
    script.setAttribute('data-lang', 'ko')
    script.crossOrigin = 'anonymous'
    script.async = true
    giscusContainer.value.appendChild(script)
  }

  await nextTick()
  await renderMermaid()
  addCopyButtons()

  // Track active TOC heading via IntersectionObserver
  if (toc.value.length > 1 && markdownBodyEl.value) {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) activeHeading.value = entry.target.id
        }
      },
      { rootMargin: '-10% 0px -80% 0px' }
    )
    markdownBodyEl.value
      .querySelectorAll('h1[id], h2[id], h3[id]')
      .forEach(el => observer.observe(el))
  }
})

onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+KR:wght@400;500;600;700;900&family=JetBrains+Mono:wght@400;500&display=swap');

* { box-sizing: border-box; }

.post-detail-wrapper {
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  background-color: #fafaf8;
  color: #1d1d1f;
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

/* Navbar */
.navbar {
  position: sticky;
  top: 0;
  background: rgba(250, 250, 248, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  z-index: 100;
  border-bottom: 1px solid #e0e0e0;
}
.nav-content {
  max-width: 1060px;
  margin: 0 auto;
  padding: 14px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.nav-logo {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.95rem;
  font-weight: 500;
  color: #1d1d1f;
  text-decoration: none;
  letter-spacing: 0.02em;
}
.nav-links { display: flex; gap: 20px; }
.nav-links a {
  font-size: 0.85rem;
  color: #6e6e73;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.15s;
}
.nav-links a:hover { color: #1d1d1f; }
.nav-links a.nav-active { color: #1d1d1f; font-weight: 600; }

/* Page layout: article + TOC sidebar */
.page-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 210px;
  gap: 56px;
  max-width: 1060px;
  margin: 0 auto;
  padding: 60px 24px 40px;
  align-items: start;
  min-width: 0;
}

/* Main content */
.main-content { min-width: 0; }
.loading { color: #8a8a8e; padding: 80px 0; text-align: center; font-size: 0.95rem; }
.error { color: #8a8a8e; padding: 80px 0; text-align: center; font-size: 0.95rem; }

/* Post header */
.post-header { margin-bottom: 48px; }
.post-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.post-date {
  font-size: 0.8rem;
  color: #8a8a8e;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.meta-sep { color: #c0c0c0; font-size: 0.75rem; }
.read-time { font-size: 0.8rem; color: #8a8a8e; font-weight: 500; }
.view-count {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
  color: #8a8a8e;
  font-weight: 500;
}
.post-title {
  font-size: 2.4rem;
  font-weight: 800;
  letter-spacing: -0.04em;
  margin: 0 0 32px 0;
  line-height: 1.2;
  color: #111;
  word-break: break-word;
}
.post-divider { height: 1px; background: #e0e0e0; }

/* Markdown body */
.markdown-body {
  font-size: 1.05rem;
  line-height: 1.85;
  color: #2c2c2e;
  padding: 40px 0 60px;
  min-width: 0;
  overflow-wrap: break-word;
  word-break: break-word;
}

:deep(.markdown-body h1) {
  font-size: 1.8rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  margin: 2.5em 0 0.6em;
  color: #111;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 0.3em;
  word-break: break-word;
}
:deep(.markdown-body h2) {
  font-size: 1.4rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 2.2em 0 0.6em;
  color: #111;
  word-break: break-word;
}
:deep(.markdown-body h3) {
  font-size: 1.15rem;
  font-weight: 700;
  margin: 1.8em 0 0.5em;
  color: #1d1d1f;
  word-break: break-word;
}
:deep(.markdown-body p) { margin-bottom: 1.4em; }
:deep(.markdown-body a) { color: #0066cc; text-decoration: underline; text-underline-offset: 3px; }
:deep(.markdown-body a:hover) { color: #004499; }
:deep(.markdown-body strong) { font-weight: 700; color: #111; }
:deep(.markdown-body em) { font-style: italic; }
:deep(.markdown-body ul), :deep(.markdown-body ol) { padding-left: 1.6em; margin-bottom: 1.4em; }
:deep(.markdown-body li) { margin-bottom: 0.5em; }
:deep(.markdown-body blockquote) {
  border-left: 3px solid #0066cc;
  margin: 1.5em 0;
  padding: 0.5em 0 0.5em 1.2em;
  color: #6e6e73;
  font-style: italic;
}
:deep(.markdown-body hr) { border: none; border-top: 1px solid #e0e0e0; margin: 2em 0; }
:deep(.markdown-body img) {
  max-width: 100%;
  height: auto;
  border-radius: 10px;
  margin: 24px 0;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  display: block;
}
:deep(.markdown-body pre) {
  background: #1a1a1e;
  color: #e8e8ed;
  padding: 20px 22px;
  border-radius: 10px;
  overflow-x: auto;
  margin: 1.6em 0;
  font-size: 0.88rem;
  line-height: 1.7;
  border: 1px solid #2a2a2e;
  max-width: 100%;
  position: relative;
}
:deep(.markdown-body pre .copy-btn) {
  position: absolute;
  top: 10px;
  right: 10px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: rgba(255,255,255,0.07);
  color: #8a8a9a;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 0.72rem;
  font-family: 'JetBrains Mono', monospace;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s, background 0.15s, color 0.15s;
  white-space: nowrap;
}
:deep(.markdown-body pre:hover .copy-btn) { opacity: 1; }
:deep(.markdown-body pre .copy-btn:hover) {
  background: rgba(255,255,255,0.14);
  color: #e8e8ed;
}
:deep(.markdown-body pre .copy-btn.copied) {
  background: rgba(74,222,128,0.15);
  color: #4ade80;
  border-color: rgba(74,222,128,0.25);
  opacity: 1;
}
:deep(.markdown-body code) {
  font-family: 'JetBrains Mono', monospace;
  background: #f0f0f0;
  color: #c0392b;
  padding: 2px 7px;
  border-radius: 5px;
  font-size: 0.87em;
  word-break: break-all;
}
:deep(.markdown-body pre code) {
  background: none;
  color: inherit;
  padding: 0;
  border-radius: 0;
  font-size: inherit;
  word-break: normal;
}
:deep(.markdown-body pre code.hljs) {
  background: transparent;
  padding: 0;
  font-size: inherit;
  color: inherit;
}
:deep(.markdown-body table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5em 0;
  font-size: 0.95em;
  display: block;
  overflow-x: auto;
}
:deep(.markdown-body th) {
  background: #f0f0f0;
  font-weight: 700;
  padding: 10px 14px;
  border: 1px solid #dedede;
  text-align: left;
  white-space: nowrap;
}
:deep(.markdown-body td) { padding: 10px 14px; border: 1px solid #dedede; }

/* TOC Sidebar */
.toc-sidebar {
  position: sticky;
  top: 80px;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  padding: 8px 0;
}
.toc-sidebar::-webkit-scrollbar { width: 4px; }
.toc-sidebar::-webkit-scrollbar-track { background: transparent; }
.toc-sidebar::-webkit-scrollbar-thumb { background: #e8e8e6; border-radius: 4px; }

.toc-title {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #8a8a8e;
  margin: 0 0 14px 0;
  font-family: 'JetBrains Mono', monospace;
}
.toc-list { list-style: none; padding: 0; margin: 0; }
.toc-item { margin-bottom: 2px; }
.toc-item a {
  display: block;
  font-size: 0.8rem;
  color: #8a8a8e;
  text-decoration: none;
  line-height: 1.5;
  padding: 3px 0 3px 0;
  transition: color 0.15s;
  border-left: 2px solid transparent;
  padding-left: 8px;
  word-break: break-word;
}
.toc-item a:hover { color: #1d1d1f; }
.toc-item.level-1 a { font-weight: 600; }
.toc-item.level-2 a { padding-left: 8px; }
.toc-item.level-3 a { padding-left: 20px; font-size: 0.76rem; }
.toc-item.toc-active a {
  color: #0066cc;
  border-left-color: #0066cc;
  font-weight: 600;
}

/* Comments */
.comments-section { padding-top: 40px; }
.comments-divider { height: 1px; background: #e0e0e0; margin-bottom: 40px; }
.comments-title {
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 24px;
  letter-spacing: -0.02em;
  color: #1d1d1f;
}

/* Footer */
.post-footer {
  max-width: 1060px;
  margin: 0 auto;
  padding: 24px 24px 48px;
  border-top: 1px solid #e0e0e0;
}
.footer-back {
  color: #6e6e73;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  transition: color 0.15s;
}
.footer-back:hover { color: #0066cc; }

:deep(.markdown-body .mermaid-block) {
  margin: 1.8em 0;
  text-align: center;
  overflow-x: auto;
}
:deep(.markdown-body .mermaid-block svg) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}

/* Tablet: hide TOC sidebar */
@media (max-width: 960px) {
  .page-layout {
    grid-template-columns: 1fr;
    max-width: 760px;
    gap: 0;
  }
  .toc-sidebar { display: none; }
  .nav-content { max-width: 760px; }
  .post-footer { max-width: 760px; }
}

/* Mobile */
@media (max-width: 600px) {
  .page-layout { padding: 40px 20px 32px; }
  .post-title { font-size: 1.7rem; }
  .markdown-body { font-size: 0.98rem; }
  :deep(.markdown-body h1) { font-size: 1.4rem; }
  :deep(.markdown-body h2) { font-size: 1.2rem; }
  :deep(.markdown-body h3) { font-size: 1.05rem; }
}

/* Scroll to top button */
.scroll-top-btn {
  position: fixed;
  bottom: 36px;
  right: 36px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #1d1d1f;
  color: #fff;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
  transition: background 0.15s, transform 0.15s;
  z-index: 200;
}
.scroll-top-btn:hover {
  background: #0066cc;
  transform: translateY(-3px);
}

.scroll-btn-enter-active,
.scroll-btn-leave-active { transition: opacity 0.2s, transform 0.2s; }
.scroll-btn-enter-from,
.scroll-btn-leave-to { opacity: 0; transform: translateY(10px); }

@media (max-width: 600px) {
  .scroll-top-btn { bottom: 24px; right: 20px; width: 40px; height: 40px; }
}
</style>
