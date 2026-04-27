<template>
  <div class="apple-wrapper">
    <nav class="navbar">
      <div class="nav-content">
        <a href="/" class="nav-logo">>>_Dana Kim</a>
        <div class="nav-links">
          <a href="#philosophy">Philosophy</a>
          <a href="#experience">Experience</a>
          <a href="#skills">Tech Specs</a>
          <a href="#logs">Dev Logs</a>
        </div>
      </div>
    </nav>

    <main class="main-content">
      <section class="section hero">
        <div class="hero-content animate-on-scroll">
          <h2 class="eyebrow">Data Analytics Engineer</h2>
          <h1 class="hero-title">
            Dana Kim.<br />
            <span class="gradient-text">Data meets Impact.</span>
          </h1>
          <p class="hero-subtitle">예쁘게 정리된 데이터가 아닌, 실제 문제를 해결하는 시스템을 만듭니다.</p>

          <div class="social-links">
            <a href="mailto:danakkii22@gmail.com" target="_blank" class="social-btn">Gmail</a>
            <a href="https://www.linkedin.com/in/dana-kim-24a547325/" target="_blank" class="social-btn">LinkedIn</a>
            <a href="https://github.com/danakkii" target="_blank" class="social-btn">GitHub</a>
          </div>
        </div>
      </section>

      <section id="philosophy" class="section philosophy">
        <div class="text-container animate-on-scroll">
          <h2 class="section-heading">Architecting Data for<br/>Operational Excellence.</h2>
          <p class="section-desc">
            As a Data Analytics Engineer, I focus on the entire data lifecycle—from ingestion and processing to downstream utilization. Rather than merely building isolated data silos, I architect scalable pipelines that translate raw data into actionable intelligence.<br/><br/>
            By closely aligning data models with the operational realities of cross-functional teams, such as CS, Operations, and Marketing, I ensure high data availability and reliability. My ultimate goal is to operationalize data assets so they serve as a robust foundation for strategic decision-making and continuous business optimization.
          </p>
        </div>
      </section>

      <section id="experience" class="section experience-section">
        <div class="experience-container">
          <h2 class="section-title animate-on-scroll">Experience.</h2>
          <div class="timeline">
            <div class="timeline-card animate-on-scroll">
              <div class="card-header">
                <h3>Data Analytics Engineer</h3>
                <span class="company">Teamremited</span>
                <span class="period">2025.09 – Present</span>
              </div>
              <ul class="achievements">
                <li>전사 최초 영수증 분석용 데이터마트 구축 (2,000만 건, Airflow 기반)</li>
                <li>벡터 DB(Qdrant) 활용 30만 건 상점명 정규화 및 지도 시각화</li>
                <li>CS 문의 패턴 분석 및 LLM RAG 챗봇 도입으로 일 평균 CS 30% 절감</li>
                <li>FastAPI 기반 실시간 API 및 Redis 기반 일 10만 장 중복 검증 시스템 구축</li>
              </ul>
            </div>

            <div class="timeline-card animate-on-scroll">
              <div class="card-header">
                <h3>Back-end Developer</h3>
                <span class="company">Teamremited </span>
                <span class="period">2024.12 – 2025.09</span>
              </div>
              <ul class="achievements">
                <li>소셜 로그인 플로우 재설계로 데이터 정합성 보장 및 가입 전환율 1.5배 향상</li>
                <li>홈 화면 병목 쿼리 최적화로 접근 시간 5초 이상 단축</li>
                <li>AI 코드 리뷰 자동화 적용으로 리뷰 속도 30% 향상</li>
              </ul>
            </div>

            <div class="timeline-card animate-on-scroll">
              <div class="card-header">
                <h3>AI Application Engineer</h3>
                <span class="company">Elroilab </span>
                <span class="period">2023.06 – 2024.12</span>
              </div>
              <ul class="achievements">
                <li>Gaussian Noise 기법 활용 DDCNN 모델 최적화로 이상치 탐지 성능 35% 향상</li>
                <li>AI 모델 학습용 라벨링 작업 자동화 시스템 개발</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="skills" class="section skills-section">
        <div class="skills-container">
          <h2 class="section-title animate-on-scroll">Tech Specs.</h2>
          <div class="grid-cards">
            <div class="spec-card dark-card animate-on-scroll">
              <h3>Data & Pipeline</h3>
              <p>BigQuery, Airflow, Redis<br/>MongoDB, PostgreSQL</p>
              <span class="card-note">흐름을 제어하는 견고함.</span>
            </div>
            <div class="spec-card light-card animate-on-scroll">
              <h3>Backend & AI</h3>
              <p>Python, FastAPI, Node.js<br/>PyTorch, Qdrant</p>
              <span class="card-note">실제 문제를 푸는 로직.</span>
            </div>
            <div class="spec-card dark-card animate-on-scroll">
              <h3>Infra & Analytics</h3>
              <p>Docker, Kubernetes<br/>Grafana, Metabase</p>
              <span class="card-note">시각화와 확장의 완성.</span>
            </div>
          </div>
        </div>
      </section>

      <section id="logs" class="section blog-section">
        <div class="blog-container">
          <div class="blog-header animate-on-scroll">
            <h2 class="blog-section-title">Latest Logs.</h2>
            <p class="blog-desc">데이터와 개발에 관한 생각들을 기록합니다.</p>
          </div>

          <div v-if="pending" class="loading">데이터를 동기화 중입니다...</div>

          <div v-else class="post-list">
            <div v-if="!posts || posts.length === 0" class="empty-state animate-on-scroll">
              아직 작성된 로그가 없습니다.
            </div>

            <NuxtLink
              v-for="post in posts"
              :key="post.id"
              :to="`/posts/${post.id}`"
              class="post-item animate-on-scroll"
            >
              <time class="post-item-date">{{ formatDate(post.created_at) }}</time>
              <h3 class="post-item-title">{{ post.title }}</h3>
              <p class="post-item-excerpt">{{ getPreviewText(post.content) }}</p>
              <span class="post-item-arrow">Read more →</span>
            </NuxtLink>
          </div>
        </div>
      </section>

      <section class="section guestbook-section">
        <div class="guestbook-container animate-on-scroll">
          <h2 class="section-title">Guestbook.</h2>
          <p class="guestbook-desc">방문해 주셔서 감사합니다. 자유롭게 발자취를 남겨주세요!</p>
          <div ref="giscusContainer" class="giscus-wrapper"></div>
        </div>
      </section>
    </main>

    <footer class="footer">
      <p>Copyright © {{ new Date().getFullYear() }} Dana Kim. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const supabase = useSupabaseClient()

const { data: posts, pending } = await useAsyncData('posts', async () => {
  const { data } = await supabase
    .from('post')
    .select('id, created_at, title, content')
    .order('created_at', { ascending: false })
  return data
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
    script.setAttribute('data-theme', 'dark')
    script.setAttribute('data-lang', 'ko')
    script.crossOrigin = 'anonymous'
    script.async = true
    giscusContainer.value.appendChild(script)
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('visible')
    })
  }, { threshold: 0.15 })

  document.querySelectorAll('.animate-on-scroll').forEach((el) => observer.observe(el))
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Noto+Sans+KR:wght@400;600;700;900&display=swap');

.apple-wrapper { font-family: 'Inter', 'Noto Sans KR', sans-serif; background-color: #000; color: #f5f5f7; overflow-x: hidden; }
*, *::before, *::after { box-sizing: inherit; }

.animate-on-scroll { opacity: 0; transform: translateY(40px); transition: opacity 0.8s cubic-bezier(0.25, 1, 0.5, 1), transform 0.8s cubic-bezier(0.25, 1, 0.5, 1); }
.animate-on-scroll.visible { opacity: 1; transform: translateY(0); }

.navbar { position: fixed; top: 0; width: 100%; background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(20px); z-index: 1000; border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
.nav-content { max-width: 1000px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 15px 24px; }
.nav-logo { color: #f5f5f7; text-decoration: none; font-weight: 700; font-size: 1.1rem; }
.nav-links { display: flex; gap: 24px; }
.nav-links a { color: #c8c8cc; text-decoration: none; font-size: 0.9rem; font-weight: 500; transition: 0.3s; }
.nav-links a:hover { color: #fff; }

.section { display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 100vh; padding: 80px 24px; text-align: center; }
.section-title { font-size: 3.5rem; font-weight: 800; letter-spacing: -0.04em; margin-bottom: 60px; }

.hero { background: radial-gradient(circle at center, #1a1a1a 0%, #000000 70%); margin-top: 40px; }
.eyebrow { color: #f56900; font-size: 1.2rem; font-weight: 700; letter-spacing: 0.1em; margin-bottom: 20px; }
.hero-title { font-size: 5.5rem; font-weight: 800; line-height: 1.1; letter-spacing: -0.04em; margin: 0 0 30px 0; }
.gradient-text { background: linear-gradient(90deg, #ff2a85, #8a2387, #e94057); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.hero-subtitle { font-size: 1.3rem; color: #86868b; font-weight: 600; word-break: keep-all; margin-bottom: 40px; }

.social-links { display: flex; gap: 15px; justify-content: center; flex-wrap: wrap; margin-top: 20px;}
.social-btn { display: inline-block; padding: 10px 24px; border-radius: 30px; background: rgba(255,255,255,0.1); color: #fff; text-decoration: none; font-weight: 600; font-size: 0.95rem; transition: all 0.3s ease; border: 1px solid rgba(255,255,255,0.2); }
.social-btn:hover { background: #fff; color: #000; transform: translateY(-2px); }

.philosophy { background-color: #000; min-height: 60vh; }
.text-container { max-width: 800px; }
.section-heading { font-size: 4rem; font-weight: 800; line-height: 1.2; letter-spacing: -0.04em; margin-bottom: 30px; }
.section-desc { font-size: 1.2rem; color: #a1a1a6; line-height: 1.6; font-weight: 500; word-break: keep-all; }

.experience-section { background-color: #0a0a0c; }
.experience-container { max-width: 900px; width: 100%; text-align: left; }
.timeline-card { background: #1c1c1e; border-radius: 24px; padding: 40px; margin-bottom: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
.card-header h3 { font-size: 1.8rem; margin: 0 0 10px 0; color: #fff; }
.company { font-size: 1.1rem; color: #ff2a85; font-weight: 600; margin-right: 15px; }
.period { color: #86868b; font-size: 0.95rem; }
.achievements { margin-top: 20px; padding-left: 20px; color: #c8c8cc; line-height: 1.6; }
.achievements li { margin-bottom: 8px; }

.skills-section { background-color: #111; min-height: 80vh; }
.skills-container { max-width: 1000px; width: 100%; }
.grid-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
.spec-card { border-radius: 24px; padding: 40px; text-align: left; display: flex; flex-direction: column; min-height: 250px; }
.dark-card { background: #1c1c1e; color: #f5f5f7; }
.light-card { background: #f5f5f7; color: #1d1d1f; }
.spec-card h3 { font-size: 1.5rem; font-weight: 800; margin: 0 0 15px 0; }
.spec-card p { font-size: 1.1rem; margin: 0; opacity: 0.8; line-height: 1.5; }
.card-note { font-size: 0.9rem; font-weight: 600; margin-top: auto; color: #86868b; }

.blog-section { background-color: #fafaf8; color: #1d1d1f; min-height: auto; padding: 100px 24px; }
.blog-container { max-width: 760px; width: 100%; text-align: left; }
.blog-header { margin-bottom: 50px; }
.blog-section-title { font-size: 2.6rem; font-weight: 800; letter-spacing: -0.04em; color: #1d1d1f; margin: 0 0 10px 0; }
.blog-desc { color: #6e6e73; font-size: 1rem; margin: 0; }
.post-list { border-top: 1px solid #dedede; }
.post-item { display: block; text-decoration: none; color: inherit; padding: 28px 0 28px 16px; border-bottom: 1px solid #dedede; transition: padding-left 0.2s ease, background-color 0.15s ease; position: relative; }
.post-item::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: #0066cc; transform: scaleY(0); transition: transform 0.2s ease; transform-origin: center; }
.post-item:hover::before { transform: scaleY(1); }
.post-item:hover { padding-left: 24px; background-color: rgba(0, 102, 204, 0.025); }
.post-item-date { display: block; font-size: 0.76rem; color: #8a8a8e; font-weight: 600; margin-bottom: 10px; font-family: 'SF Mono', 'Fira Code', 'Courier New', monospace; letter-spacing: 0.07em; text-transform: uppercase; }
.post-item-title { font-size: 1.3rem; font-weight: 700; color: #1d1d1f; margin: 0 0 10px 0; letter-spacing: -0.02em; line-height: 1.35; transition: color 0.15s ease; }
.post-item:hover .post-item-title { color: #0066cc; }
.post-item-excerpt { font-size: 0.92rem; color: #6e6e73; line-height: 1.65; margin: 0 0 14px 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.post-item-arrow { font-size: 0.82rem; font-weight: 700; color: #0066cc; opacity: 0; display: inline-block; transition: opacity 0.15s ease, transform 0.2s ease; letter-spacing: 0.02em; }
.post-item:hover .post-item-arrow { opacity: 1; transform: translateX(4px); }
.empty-state { color: #8a8a8e; font-size: 1rem; padding: 40px 0; text-align: center; }

.guestbook-section { background-color: #000; min-height: 60vh; }
.guestbook-container { max-width: 800px; width: 100%; }
.guestbook-desc { color: #86868b; margin-bottom: 40px; font-size: 1.1rem; }
.giscus-wrapper { width: 100%; }

.footer { text-align: center; padding: 40px 0; background: #000; color: #86868b; border-top: 1px solid #222; }

@media (max-width: 768px) {
  .nav-content { padding: 12px 15px; }
  .nav-links { display: none; }
  .hero-title { font-size: 3.5rem; }
  .section-heading { font-size: 2.5rem; }
  .section-desc { font-size: 1.1rem; }
  .section-title { font-size: 2.5rem; }
  .timeline-card, .spec-card { padding: 25px; }
  .blog-section-title { font-size: 2rem; }
  .post-item { padding-left: 12px; }
  .post-item:hover { padding-left: 18px; }
  .post-item-title { font-size: 1.15rem; }
}
</style>
