<template>
  <div class="apple-wrapper">
    <nav class="navbar">
      <div class="nav-content">
        <a href="/" class="nav-logo">Dana Kim</a>
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
            <a href="mailto:본인메일@gmail.com" target="_blank" class="social-btn">Gmail</a>
            <a href="https://www.linkedin.com/in/본인링크드인주소" target="_blank" class="social-btn">LinkedIn</a>
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
                <span class="company">Teamremited (팀리미티드)</span>
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
                <span class="company">Teamremited (팀리미티드)</span>
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
                <span class="company">Elroilab (엘로이랩)</span>
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
          <h2 class="section-title dark-text animate-on-scroll">Latest Logs.</h2>
          
          <div v-if="pending" class="loading">데이터를 동기화 중입니다...</div>
          
          <div v-else class="post-grid">
            <div v-if="!posts || posts.length === 0" class="empty-state animate-on-scroll">
              아직 작성된 로그가 없습니다.
            </div>
            
            <article v-for="post in posts" :key="post.id" class="post-card animate-on-scroll">
              <div class="post-header">
                <span class="post-date">{{ formatDate(post.created_at) }}</span>
              </div>
              <h3 class="post-title">{{ post.title }}</h3>
              <p class="post-content">{{ getPreviewText(post.content) }}</p>
              <NuxtLink :to="`/posts/${post.id}`" class="read-more">
                더 알아보기 <span>&rsaquo;</span>
              </NuxtLink>
            </article>
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

// 마크다운 특수문자(#, *, -, 이미지 등)를 제거하고 순수 텍스트만 뽑아내는 함수
const getPreviewText = (text) => {
  if (!text) return ''
  return text
    .replace(/#+\s/g, '') // 헤더 제거
    .replace(/(\*\*|__)(.*?)\1/g, '$2') // 볼드 제거
    .replace(/(\*|_)(.*?)\1/g, '$2') // 이탤릭 제거
    .replace(/!\[.*?\]\(.*?\)/g, '') // 이미지 링크 제거
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // 일반 링크 제거
    .replace(/`{1,3}[^`\n]*`{1,3}/g, '') // 인라인 코드 및 코드 블록 제거
    .replace(/\n/g, ' ') // 줄바꿈을 공백으로 변경
    .trim()
}

const giscusContainer = ref(null)

onMounted(() => {
  // Giscus 셋업
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

  // 애플 스타일 스크롤 애니메이션 (Intersection Observer)
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
      }
    })
  }, { threshold: 0.15 }) // 요소가 15% 보일 때 작동

  // animate-on-scroll 클래스를 가진 모든 요소 관찰 시작
  document.querySelectorAll('.animate-on-scroll').forEach((el) => {
    observer.observe(el)
  })
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Noto+Sans+KR:wght@400;600;700;900&display=swap');

.apple-wrapper { font-family: 'Inter', 'Noto Sans KR', sans-serif; background-color: #000; color: #f5f5f7; overflow-x: hidden; }
*, *::before, *::after { box-sizing: inherit; }

/* 🌟 스크롤 애니메이션 기본 상태 (투명하고 아래로 살짝 내려가 있음) */
.animate-on-scroll {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 0.8s cubic-bezier(0.25, 1, 0.5, 1), transform 0.8s cubic-bezier(0.25, 1, 0.5, 1);
}

/* 🌟 스크롤해서 보이면 적용되는 상태 (선명해지고 제자리로 올라옴) */
.animate-on-scroll.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Navbar */
.navbar { position: fixed; top: 0; width: 100%; background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(20px); z-index: 1000; border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
.nav-content { max-width: 1000px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 15px 24px; }
.nav-logo { color: #f5f5f7; text-decoration: none; font-weight: 700; font-size: 1.1rem; }
.nav-links { display: flex; gap: 24px; }
.nav-links a { color: #c8c8cc; text-decoration: none; font-size: 0.9rem; font-weight: 500; transition: 0.3s; }
.nav-links a:hover { color: #fff; }

.section { display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 100vh; padding: 80px 24px; text-align: center; }
.section-title { font-size: 3.5rem; font-weight: 800; letter-spacing: -0.04em; margin-bottom: 60px; }

/* Hero */
.hero { background: radial-gradient(circle at center, #1a1a1a 0%, #000000 70%); margin-top: 40px; }
.eyebrow { color: #f56900; font-size: 1.2rem; font-weight: 700; letter-spacing: 0.1em; margin-bottom: 20px; }
.hero-title { font-size: 5.5rem; font-weight: 800; line-height: 1.1; letter-spacing: -0.04em; margin: 0 0 30px 0; }
.gradient-text { background: linear-gradient(90deg, #ff2a85, #8a2387, #e94057); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.hero-subtitle { font-size: 1.3rem; color: #86868b; font-weight: 600; word-break: keep-all; margin-bottom: 40px; }

/* Social Links */
.social-links { display: flex; gap: 15px; justify-content: center; flex-wrap: wrap; margin-top: 20px;}
.social-btn { 
  display: inline-block; padding: 10px 24px; border-radius: 30px; 
  background: rgba(255,255,255,0.1); color: #fff; text-decoration: none; 
  font-weight: 600; font-size: 0.95rem; transition: all 0.3s ease;
  border: 1px solid rgba(255,255,255,0.2);
}
.social-btn:hover { background: #fff; color: #000; transform: translateY(-2px); }

/* Philosophy */
.philosophy { background-color: #000; min-height: 60vh; }
.text-container { max-width: 800px; }
.section-heading { font-size: 4rem; font-weight: 800; line-height: 1.2; letter-spacing: -0.04em; margin-bottom: 30px; }
.section-desc { font-size: 1.2rem; color: #a1a1a6; line-height: 1.6; font-weight: 500; word-break: keep-all; }

/* Experience */
.experience-section { background-color: #0a0a0c; }
.experience-container { max-width: 900px; width: 100%; text-align: left; }
.timeline-card { background: #1c1c1e; border-radius: 24px; padding: 40px; margin-bottom: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
.card-header h3 { font-size: 1.8rem; margin: 0 0 10px 0; color: #fff; }
.company { font-size: 1.1rem; color: #ff2a85; font-weight: 600; margin-right: 15px; }
.period { color: #86868b; font-size: 0.95rem; }
.achievements { margin-top: 20px; padding-left: 20px; color: #c8c8cc; line-height: 1.6; }
.achievements li { margin-bottom: 8px; }

/* Skills */
.skills-section { background-color: #111; min-height: 80vh; }
.skills-container { max-width: 1000px; width: 100%; }
.grid-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
.spec-card { border-radius: 24px; padding: 40px; text-align: left; display: flex; flex-direction: column; min-height: 250px; }
.dark-card { background: #1c1c1e; color: #f5f5f7; }
.light-card { background: #f5f5f7; color: #1d1d1f; }
.spec-card h3 { font-size: 1.5rem; font-weight: 800; margin: 0 0 15px 0; }
.spec-card p { font-size: 1.1rem; margin: 0; opacity: 0.8; line-height: 1.5; }
.card-note { font-size: 0.9rem; font-weight: 600; margin-top: auto; color: #86868b; }

/* Logs */
.blog-section { background-color: #f5f5f7; color: #1d1d1f; }
.blog-container { max-width: 1000px; width: 100%; text-align: left; }
.dark-text { color: #1d1d1f; text-align: center; }
.post-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; }
.post-card { background: #fff; border-radius: 24px; padding: 40px; display: flex; flex-direction: column; transition: transform 0.3s, box-shadow 0.3s; }
.post-card:hover { transform: translateY(-5px); box-shadow: 0 15px 30px rgba(0,0,0,0.1); }
.post-date { font-size: 0.9rem; font-weight: 700; color: #86868b; margin-bottom: 15px; display: block; }
.post-title { font-size: 1.5rem; font-weight: 800; margin: 0 0 15px 0; letter-spacing: -0.03em; }

/* 🌟 포스트 1줄 미리보기 강제 적용 */
.post-content { 
  color: #515154; 
  font-size: 1.05rem;
  line-height: 1.6; 
  margin-bottom: 30px; 
  white-space: nowrap; 
  overflow: hidden; 
  text-overflow: ellipsis; 
}

.read-more { text-decoration: none; color: #0066cc; font-size: 1.1rem; font-weight: 600; display: flex; align-items: center; }
.read-more span { font-size: 1.5rem; margin-left: 5px; transition: 0.2s; }
.read-more:hover span { margin-left: 10px; }

/* Guestbook */
.guestbook-section { background-color: #000; min-height: 60vh; }
.guestbook-container { max-width: 800px; width: 100%; }
.guestbook-desc { color: #86868b; margin-bottom: 40px; font-size: 1.1rem; }
.giscus-wrapper { width: 100%; }

.footer { text-align: center; padding: 40px 0; background: #000; color: #86868b; border-top: 1px solid #222; }

/* Mobile */
@media (max-width: 768px) {
  .nav-content { padding: 12px 15px; }
  .nav-links { display: none; }
  .hero-title { font-size: 3.5rem; }
  .section-heading { font-size: 2.5rem; }
  .section-desc { font-size: 1.1rem; }
  .section-title { font-size: 2.5rem; }
  .timeline-card, .spec-card, .post-card { padding: 25px; }
}
</style>