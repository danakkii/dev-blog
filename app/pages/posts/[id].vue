<template>
  <div class="post-detail-wrapper">
    <nav class="navbar">
      <div class="nav-content">
        <NuxtLink to="/" class="back-button">&lsaquo; Back to Home</NuxtLink>
      </div>
    </nav>

    <main class="main-content">
      <div v-if="pending" class="loading">Loading...</div>
      
      <article v-else-if="post" class="post-article">
        <header class="post-header">
          <span class="post-date">{{ formatDate(post.created_at) }}</span>
          <h1 class="post-title">{{ post.title }}</h1>
        </header>
        
        <div class="post-body markdown-body" v-html="parsedContent"></div>
      </article>

      <div v-else class="error">
        포스트를 찾을 수 없습니다.
      </div>

      <section class="comments-section">
        <h2 class="comments-title">Feedback.</h2>
        <div ref="giscusContainer" class="giscus-wrapper"></div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { marked } from 'marked' // 마크다운 변환기 불러오기

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

// Supabase에서 가져온 content를 마크다운(HTML)으로 변환
const parsedContent = computed(() => {
  if (!post.value || !post.value.content) return ''
  return marked(post.value.content)
})

const giscusContainer = ref(null)

onMounted(() => {
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
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Noto+Sans+KR:wght@400;600;700;900&display=swap');

.post-detail-wrapper {
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  background-color: #f5f5f7;
  color: #1d1d1f;
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}

.navbar { position: sticky; top: 0; background: rgba(245, 245, 247, 0.8); backdrop-filter: blur(20px); z-index: 100; border-bottom: 1px solid #e5e5ea; }
.nav-content { max-width: 800px; margin: 0 auto; padding: 15px 24px; }
.back-button { color: #0066cc; text-decoration: none; font-weight: 600; font-size: 1.1rem; }

.main-content { max-width: 800px; margin: 0 auto; padding: 60px 24px; }
.post-header { margin-bottom: 40px; text-align: center; }
.post-date { color: #86868b; font-weight: 600; font-size: 1rem; }
.post-title { font-size: 3rem; font-weight: 800; letter-spacing: -0.04em; margin: 15px 0 0 0; line-height: 1.2; }

/* 마크다운 본문 디자인 (이미지 반응형 처리) */
.markdown-body { 
  font-size: 1.15rem; 
  line-height: 1.8; 
  color: #333; 
  margin-bottom: 80px; 
}
/* ✨ 핵심: 이미지가 글씨 영역을 벗어나지 않게 자동으로 줄여줌 */
:deep(.markdown-body img) { 
  max-width: 100%; 
  height: auto; 
  border-radius: 12px; 
  margin: 20px 0; 
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}
:deep(.markdown-body h1), :deep(.markdown-body h2), :deep(.markdown-body h3) {
  margin-top: 2em;
  margin-bottom: 0.5em;
  font-weight: 700;
  letter-spacing: -0.02em;
}
:deep(.markdown-body p) { margin-bottom: 1.2em; }
:deep(.markdown-body pre) { background: #1c1c1e; color: #fff; padding: 15px; border-radius: 8px; overflow-x: auto; margin: 20px 0; }
:deep(.markdown-body code) { font-family: monospace; background: #e5e5ea; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }
:deep(.markdown-body pre code) { background: none; padding: 0; }

.comments-section { border-top: 1px solid #e5e5ea; padding-top: 60px; }
.comments-title { font-size: 2rem; font-weight: 800; margin-bottom: 30px; letter-spacing: -0.03em; }

@media (max-width: 768px) {
  .post-title { font-size: 2rem; }
  .markdown-body { font-size: 1.05rem; }
}
</style>