<template>
  <div class="wrapper">
    <nav class="navbar">
      <div class="nav-inner">
        <NuxtLink to="/" class="nav-logo">>>_ DanaKim</NuxtLink>
        <div class="nav-links">
          <NuxtLink to="/" exact-active-class="nav-active">Home</NuxtLink>
          <NuxtLink to="/blog" active-class="nav-active">Blog</NuxtLink>
        </div>
      </div>
    </nav>

    <main class="main">

      <!-- About -->
      <section id="about" class="section about-section">
        <p class="about-label">Data Analytics Engineer</p>
        <h1 class="about-name">Dana Kim</h1>
        <p class="about-bio">Building end-to-end data systems — from ingestion pipelines to real-time APIs and LLM-powered automation, turning large-scale data into reliable infrastructure.</p>
        <p class="about-bio-ko">데이터가 실제 문제를 해결하는 시스템이 될 때까지 설계합니다.</p>
        <div class="social-row">
          <a href="mailto:danakkii22@gmail.com" target="_blank" class="social-link">Gmail</a>
          <span class="sep">·</span>
          <a href="https://www.linkedin.com/in/dana-kim-24a547325/" target="_blank" class="social-link">LinkedIn</a>
          <span class="sep">·</span>
          <a href="https://github.com/danakkii" target="_blank" class="social-link">GitHub</a>
        </div>
      </section>

      <div class="divider"></div>

      <!-- Career -->
      <section id="career" class="section">
        <h2 class="section-title">Career</h2>
        <div class="career-list">

          <div class="career-item">
            <div class="career-meta">
              <span class="career-company">Teamremited</span>
              <span class="career-period">2025.09 – 2026.03</span>
            </div>
            <h3 class="career-role">Data Analytics Engineer</h3>
            <ul class="career-bullets">
              <li>전사 최초 영수증 분석용 데이터마트 구축 (2,000만 건, Airflow 기반)</li>
              <li>벡터 DB(Qdrant) 활용 30만 건 상점명 정규화 및 지도 시각화</li>
              <li>CS 문의 패턴 분석 및 LLM RAG 챗봇 도입으로 일 평균 CS 30% 절감</li>
              <li>FastAPI 기반 실시간 API 및 Redis 기반 일 10만 장 중복 검증 시스템 구축</li>
            </ul>
          </div>

          <div class="career-item">
            <div class="career-meta">
              <span class="career-company">Teamremited</span>
              <span class="career-period">2024.12 – 2025.09</span>
            </div>
            <h3 class="career-role">Back-end Developer</h3>
            <ul class="career-bullets">
              <li>소셜 로그인 플로우 재설계로 데이터 정합성 보장 및 가입 전환율 1.5배 향상</li>
              <li>홈 화면 병목 쿼리 최적화로 접근 시간 5초 이상 단축</li>
              <li>AI 코드 리뷰 자동화 적용으로 리뷰 속도 30% 향상</li>
            </ul>
          </div>

          <div class="career-item">
            <div class="career-meta">
              <span class="career-company">Elroilab</span>
              <span class="career-period">2023.06 – 2024.12</span>
            </div>
            <h3 class="career-role">AI Application Engineer</h3>
            <ul class="career-bullets">
              <li>Gaussian Noise 기법 활용 DDCNN 모델 최적화로 이상치 탐지 성능 35% 향상</li>
              <li>AI 모델 학습용 라벨링 작업 자동화 시스템 개발</li>
            </ul>
          </div>

        </div>
      </section>

      <div class="divider"></div>

      <!-- Tech -->
      <section id="tech" class="section">
        <h2 class="section-title">Tech</h2>
        <div class="tech-table">
          <div class="tech-row">
            <span class="tech-category">Data & Pipeline</span>
            <span class="tech-tags">BigQuery · Airflow · Redis · MongoDB · Qdrant</span>
          </div>
          <div class="tech-row">
            <span class="tech-category">Backend & AI</span>
            <span class="tech-tags">Python · FastAPI · Node.js · PyTorch</span>
          </div>
          <div class="tech-row">
            <span class="tech-category">Infra & Analytics</span>
            <span class="tech-tags">Docker · Kubernetes · Grafana · Metabase</span>
          </div>
        </div>
      </section>

      <div class="divider"></div>

      <!-- Latest Blog -->
      <section id="latest" class="section">
        <div class="latest-header">
          <h2 class="section-title">Latest Posts</h2>
          <NuxtLink to="/blog" class="view-all">All posts →</NuxtLink>
        </div>

        <div v-if="pending" class="loading">불러오는 중...</div>

        <div v-else class="post-list">
          <p v-if="!latestPosts || latestPosts.length === 0" class="empty">아직 작성된 글이 없습니다.</p>

          <NuxtLink
            v-for="post in latestPosts"
            :key="post.id"
            :to="`/posts/${post.id}`"
            class="post-item"
          >
            <time class="post-date">{{ formatDate(post.created_at) }}</time>
            <h3 class="post-title">{{ post.title }}</h3>
            <p class="post-excerpt">{{ getPreviewText(post.content) }}</p>
            <span class="post-arrow">Read more →</span>
          </NuxtLink>
        </div>
      </section>

      <div class="divider"></div>

      <!-- Guestbook -->
      <section id="guestbook" class="section">
        <h2 class="section-title">Guestbook</h2>
        <p class="guestbook-desc">방문해 주셔서 감사합니다. 자유롭게 발자취를 남겨주세요.</p>
        <div ref="giscusContainer"></div>
      </section>

    </main>

    <footer class="footer">
      <p>© {{ new Date().getFullYear() }} Dana Kim</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

useSeoMeta({
  title: 'Dana Kim — Data Analytics Engineer',
  description: 'Building end-to-end data systems — from ingestion pipelines to real-time APIs and LLM-powered automation.',
  ogTitle: 'Dana Kim — Data Analytics Engineer',
  ogDescription: 'Building end-to-end data systems — from ingestion pipelines to real-time APIs and LLM-powered automation.',
  ogUrl: 'https://dana-kim.vercel.app',
})

const supabase = useSupabaseClient()

const { data: latestPosts, pending } = await useAsyncData('latest-posts', async () => {
  const { data } = await supabase
    .from('post')
    .select('id, created_at, title, content')
    .order('created_at', { ascending: false })
    .limit(3)
  return data || []
})

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, '0')}. ${String(date.getDate()).padStart(2, '0')}.`
}

const getPreviewText = (text) => {
  if (!text) return ''
  return text
    .replace(/#+\s/g, '')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/`{1,3}[^`\n]*`{1,3}/g, '')
    .replace(/\n/g, ' ')
    .trim()
    .slice(0, 160)
}

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
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+KR:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

* { box-sizing: border-box; }

.wrapper {
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  background: #fafaf8;
  color: #1d1d1f;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
  min-width: 0;
}

/* Nav */
.navbar {
  position: sticky;
  top: 0;
  background: rgba(250, 250, 248, 0.9);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid #e8e8e6;
  z-index: 100;
}
.nav-inner {
  max-width: 760px;
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

/* Main */
.main {
  max-width: 760px;
  margin: 0 auto;
  padding: 0 24px;
  min-width: 0;
}

/* Section */
.section { padding: 64px 0; }
.section-title {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #8a8a8e;
  margin: 0 0 36px 0;
  font-family: 'JetBrains Mono', monospace;
}
.divider { height: 1px; background: #e8e8e6; }

/* About */
.about-section { padding-top: 72px; }
.about-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: #8a8a8e;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-family: 'JetBrains Mono', monospace;
  margin: 0 0 14px 0;
}
.about-name {
  font-size: 2.6rem;
  font-weight: 800;
  letter-spacing: -0.04em;
  color: #111;
  margin: 0 0 24px 0;
  line-height: 1.1;
}
.about-bio {
  font-size: 0.97rem;
  color: #3a3a3e;
  line-height: 1.85;
  margin: 0 0 14px 0;
  max-width: 600px;
}
.about-bio-ko {
  font-size: 0.88rem;
  color: #8a8a8e;
  font-style: italic;
  margin: 0 0 28px 0;
}
.social-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.social-link {
  font-size: 0.85rem;
  font-weight: 600;
  color: #1d1d1f;
  text-decoration: none;
  border-bottom: 1px solid #c8c8c8;
  padding-bottom: 1px;
  transition: border-color 0.15s, color 0.15s;
}
.social-link:hover { color: #0066cc; border-color: #0066cc; }
.sep { color: #c8c8c8; font-size: 0.75rem; }

/* Career */
.career-list { display: flex; flex-direction: column; gap: 36px; }
.career-item { padding-left: 16px; border-left: 2px solid #e8e8e6; }
.career-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}
.career-company {
  font-size: 0.82rem;
  font-weight: 700;
  color: #0066cc;
  letter-spacing: 0.02em;
}
.career-period {
  font-size: 0.8rem;
  color: #8a8a8e;
  font-family: 'JetBrains Mono', monospace;
}
.career-role {
  font-size: 1.1rem;
  font-weight: 700;
  color: #111;
  margin: 0 0 12px 0;
  letter-spacing: -0.01em;
}
.career-bullets {
  margin: 0;
  padding-left: 1.2em;
  color: #4a4a4e;
  font-size: 0.92rem;
  line-height: 1.7;
}
.career-bullets li { margin-bottom: 5px; }

/* Tech */
.tech-table { display: flex; flex-direction: column; gap: 0; border-top: 1px solid #e8e8e6; }
.tech-row {
  display: flex;
  align-items: baseline;
  gap: 24px;
  padding: 16px 0;
  border-bottom: 1px solid #e8e8e6;
}
.tech-category {
  font-size: 0.82rem;
  font-weight: 700;
  color: #1d1d1f;
  min-width: 140px;
  flex-shrink: 0;
}
.tech-tags {
  font-size: 0.9rem;
  color: #4a4a4e;
  line-height: 1.5;
}

/* Latest Posts */
.latest-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 36px;
}
.latest-header .section-title { margin-bottom: 0; }
.view-all {
  font-size: 0.82rem;
  font-weight: 600;
  color: #0066cc;
  text-decoration: none;
  transition: opacity 0.15s;
}
.view-all:hover { opacity: 0.7; }
.loading { font-size: 0.9rem; color: #8a8a8e; padding: 24px 0; }
.empty { font-size: 0.9rem; color: #8a8a8e; padding: 24px 0; }

.post-list { display: flex; flex-direction: column; gap: 12px; }
.post-item {
  display: block;
  text-decoration: none;
  color: inherit;
  padding: 22px 24px;
  background: #fff;
  border: 1px solid #e8e8e6;
  border-radius: 12px;
  position: relative;
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
  overflow: hidden;
}
.post-item::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  background: #0066cc;
  transform: scaleY(0);
  transition: transform 0.2s ease;
  transform-origin: center;
  border-radius: 3px 0 0 3px;
}
.post-item:hover::before { transform: scaleY(1); }
.post-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.07);
  border-color: #d0d0d0;
}
.post-date {
  display: block;
  font-size: 0.75rem;
  color: #8a8a8e;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 8px;
}
.post-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #111;
  margin: 0 0 8px 0;
  letter-spacing: -0.02em;
  line-height: 1.35;
  transition: color 0.15s;
}
.post-item:hover .post-title { color: #0066cc; }
.post-excerpt {
  font-size: 0.88rem;
  color: #6e6e73;
  line-height: 1.6;
  margin: 0 0 10px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.post-arrow {
  font-size: 0.78rem;
  font-weight: 700;
  color: #0066cc;
  opacity: 0;
  display: inline-block;
  transition: opacity 0.15s, transform 0.2s;
  letter-spacing: 0.02em;
}
.post-item:hover .post-arrow { opacity: 1; transform: translateX(4px); }

/* Guestbook */
.guestbook-desc {
  font-size: 0.9rem;
  color: #8a8a8e;
  margin: -20px 0 32px 0;
}

/* Footer */
.footer {
  max-width: 760px;
  margin: 0 auto;
  padding: 32px 24px;
  border-top: 1px solid #e8e8e6;
  font-size: 0.82rem;
  color: #aaa;
}

/* Mobile */
@media (max-width: 600px) {
  .about-name { font-size: 1.8rem; }
  .section { padding: 48px 0; }
  .about-section { padding-top: 48px; }
  .tech-row { flex-direction: column; gap: 6px; }
  .tech-category { min-width: unset; }
  .career-item { padding-left: 12px; }
  .post-item { padding: 16px 18px; }
}
</style>
