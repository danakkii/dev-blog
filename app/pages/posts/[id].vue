<template>
  <div class="post-detail-wrapper">
    <nav class="navbar">
      <div class="nav-content">
        <NuxtLink to="/" class="back-button">
          <span class="back-arrow">←</span> Dana Kim's Blog
        </NuxtLink>
      </div>
    </nav>

    <main class="main-content">
      <div v-if="pending" class="loading">Loading...</div>

      <article v-else-if="post" class="post-article">
        <header class="post-header">
          <div class="post-meta">
            <time class="post-date">{{ formatDate(post.created_at) }}</time>
            <span class="meta-sep">·</span>
            <span class="read-time">{{ readingTime }} min read</span>
          </div>
          <h1 class="post-title">{{ post.title }}</h1>
          <div class="post-divider"></div>
        </header>

        <div ref="markdownBodyEl" class="post-body markdown-body" v-html="parsedContent"></div>
      </article>

      <div v-else class="error">
        포스트를 찾을 수 없습니다.
      </div>

      <section class="comments-section">
        <div class="comments-divider"></div>
        <h2 class="comments-title">Feedback.</h2>
        <div ref="giscusContainer" class="giscus-wrapper"></div>
      </section>
    </main>

    <footer class="post-footer">
      <NuxtLink to="/" class="footer-back">← All Posts</NuxtLink>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { marked } from 'marked'

marked.use({ gfm: true, breaks: true })

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

// mermaid 코드 블럭을 렌더링 가능한 div로 교체
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

const parsedContent = computed(() => {
  if (!post.value?.content) return ''
  return processMermaid(marked.parse(post.value.content))
})

const readingTime = computed(() => {
  if (!post.value?.content) return 1
  const words = post.value.content.trim().split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
})

const markdownBodyEl = ref(null)
const giscusContainer = ref(null)

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
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+KR:wght@400;500;600;700;900&family=JetBrains+Mono:wght@400;500&display=swap');

.post-detail-wrapper {
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  background-color: #fafaf8;
  color: #1d1d1f;
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
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
.nav-content { max-width: 760px; margin: 0 auto; padding: 14px 24px; }
.back-button {
  color: #1d1d1f;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: color 0.15s;
}
.back-button:hover { color: #0066cc; }
.back-arrow { font-size: 1.1rem; }

/* Main content */
.main-content { max-width: 760px; margin: 0 auto; padding: 60px 24px 40px; }
.loading { color: #8a8a8e; padding: 80px 0; text-align: center; font-size: 0.95rem; }
.error { color: #8a8a8e; padding: 80px 0; text-align: center; font-size: 0.95rem; }

/* Post header */
.post-header { margin-bottom: 48px; }
.post-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}
.post-date {
  font-size: 0.8rem;
  color: #8a8a8e;
  font-weight: 600;
  font-family: 'JetBrains Mono', 'SF Mono', monospace;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.meta-sep { color: #c0c0c0; font-size: 0.75rem; }
.read-time {
  font-size: 0.8rem;
  color: #8a8a8e;
  font-weight: 500;
}
.post-title {
  font-size: 2.6rem;
  font-weight: 800;
  letter-spacing: -0.04em;
  margin: 0 0 32px 0;
  line-height: 1.2;
  color: #111;
}
.post-divider {
  height: 1px;
  background: #e0e0e0;
}

/* Markdown body */
.markdown-body {
  font-size: 1.05rem;
  line-height: 1.85;
  color: #2c2c2e;
  padding: 40px 0 60px;
}

:deep(.markdown-body h1) {
  font-size: 1.8rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  margin: 2.5em 0 0.6em;
  color: #111;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 0.3em;
}
:deep(.markdown-body h2) {
  font-size: 1.4rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 2.2em 0 0.6em;
  color: #111;
}
:deep(.markdown-body h3) {
  font-size: 1.15rem;
  font-weight: 700;
  margin: 1.8em 0 0.5em;
  color: #1d1d1f;
}
:deep(.markdown-body p) { margin-bottom: 1.4em; }
:deep(.markdown-body a) { color: #0066cc; text-decoration: underline; text-underline-offset: 3px; }
:deep(.markdown-body a:hover) { color: #004499; }
:deep(.markdown-body strong) { font-weight: 700; color: #111; }
:deep(.markdown-body em) { font-style: italic; }
:deep(.markdown-body ul), :deep(.markdown-body ol) {
  padding-left: 1.6em;
  margin-bottom: 1.4em;
}
:deep(.markdown-body li) { margin-bottom: 0.5em; }
:deep(.markdown-body blockquote) {
  border-left: 3px solid #0066cc;
  margin: 1.5em 0;
  padding: 0.5em 0 0.5em 1.2em;
  color: #6e6e73;
  font-style: italic;
}
:deep(.markdown-body hr) {
  border: none;
  border-top: 1px solid #e0e0e0;
  margin: 2em 0;
}
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
}
:deep(.markdown-body code) {
  font-family: 'JetBrains Mono', 'SF Mono', 'Fira Code', monospace;
  background: #f0f0f0;
  color: #c0392b;
  padding: 2px 7px;
  border-radius: 5px;
  font-size: 0.87em;
}
:deep(.markdown-body pre code) {
  background: none;
  color: inherit;
  padding: 0;
  border-radius: 0;
  font-size: inherit;
}
:deep(.markdown-body table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5em 0;
  font-size: 0.95em;
}
:deep(.markdown-body th) {
  background: #f0f0f0;
  font-weight: 700;
  padding: 10px 14px;
  border: 1px solid #dedede;
  text-align: left;
}
:deep(.markdown-body td) {
  padding: 10px 14px;
  border: 1px solid #dedede;
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

/* Post footer */
.post-footer {
  max-width: 760px;
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

@media (max-width: 768px) {
  .post-title { font-size: 1.8rem; }
  .markdown-body { font-size: 1rem; }
  :deep(.markdown-body h1) { font-size: 1.5rem; }
  :deep(.markdown-body h2) { font-size: 1.25rem; }
}
</style>