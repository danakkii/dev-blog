<template>
  <div class="academic-wrapper">
    <header class="header">
      <nav class="nav">
        <a href="/" class="logo">Jungi Lee</a>
        <div class="nav-links">
          <a href="#about">About</a>
          <a href="#publications">Publications</a>
          <a href="#education">Education</a>
          <a href="#experience">Experience</a>
        </div>
      </nav>
    </header>

    <main class="main-content">
      <section id="about" class="section profile-section">
        <div class="profile-layout">
          <img src="/profile.png" alt="Jungi Lee" class="profile-pic" />
          <div class="profile-info">
            <h1 class="name">Jungi Lee</h1>
            <p class="role">Ph.D. Student in Industrial Engineering</p>
            <p class="univ">Seoul National University (SNU)</p>
            <p class="bio">
             I am a Ph.D. student in Industrial Engineering at Seoul National University (SNU), advised by Prof. Pilsung Kang. My academic journey began with a Bachelor's in Mechatronics at Chungnam National University (advised by Prof. Mooncheol Won), followed by a Master's in Electrical and Electronics Engineering at UNIST under the guidance of Prof. Jongeun Lee.
<br><br>
My core strength lies in this multidisciplinary foundation—spanning hardware systems, lightweight AI architectures, and industrial software development. I specialize in designing resource-efficient Anomaly Detection and Computer Vision models. I excel at bridging the gap between theoretical research and real-world industrial applications, ensuring high performance even under strict latency and memory constraints.
            </p>
            
            <div class="links">
              <a href="mailto:jungi_lee@snu.ac.kr">Email</a>
              <span class="dot">·</span>
              <a href="https://scholar.google.com/citations?user=agcDKakAAAAJ&hl=ko" target="_blank">Google Scholar</a>
              <span class="dot">·</span>
              <a href="https://www.linkedin.com/in/jungi-lee-01a5472ba/" target="_blank">LinkedIn</a>
            </div>
          </div>
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">Recent News</h2>
        <ul class="news-list">
          <li v-for="(pub, index) in publications?.slice(0, 2)" :key="'news-'+index">
            <span class="news-date">{{ pub.year }}</span>
            <span class="news-text">
              Paper "<strong>{{ pub.title }}</strong>" accepted at {{ pub.venue }}.
            </span>
          </li>
          <li v-if="!publications || publications.length === 0" class="empty-text">
            Updates will be posted here.
          </li>
        </ul>
      </section>

      <section id="publications" class="section">
        <h2 class="section-title">Publications</h2>
        
        <div v-if="pending" class="empty-text">Loading publications...</div>
        <div v-else class="pub-list">
          <div v-for="pub in publications" :key="pub.title" class="pub-item">
            <div class="pub-year">{{ pub.year }}</div>
            <div class="pub-details">
              <h3 class="pub-title">{{ pub.title }}</h3>
              <p class="pub-authors" v-html="highlightName(pub.authors)"></p>
              <p class="pub-venue">{{ pub.venue }}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="education" class="section">
        <h2 class="section-title">Education</h2>
        <div class="career-list">
          <div class="career-item">
            <div class="career-year">Sep 2025 - Present</div>
            <div class="career-details">
              <h4 class="career-role">Ph.D. in Industrial Engineering</h4>
              <p class="career-org">Seoul National University (SNU), Seoul, Republic of Korea</p>
              <ul class="detail-list">
                <li><strong>Advised by:</strong> Prof. Pilsung Kang</li>
                <li><strong>Research Field:</strong> Computer Vision, Anomaly Detection</li>
              </ul>
            </div>
          </div>
          
          <div class="career-item">
            <div class="career-year">Feb 2019 - Feb 2021</div>
            <div class="career-details">
              <h4 class="career-role">Master’s Degree in Electrical and Electronics Engineering</h4>
              <p class="career-org">Ulsan National Institute of Science and Technology (UNIST), Ulsan, Republic of Korea</p>
              <ul class="detail-list">
                <li><strong>GPA:</strong> 3.94 / 4.3</li>
                <li><strong>Advised by:</strong> Prof. Jongeun Lee</li>
                <li><strong>Research Field:</strong> Lightweight Deep Learning Model Architecture, Compiler, Coarse-Grained Reconfigurable Architecture</li>
                <li><strong>Thesis:</strong> NP-CGRA: Extending CGRAs for Efficient Processing of Light-weight Deep Neural Networks</li>
              </ul>
            </div>
          </div>

          <div class="career-item">
            <div class="career-year">Mar 2013 - Feb 2019</div>
            <div class="career-details">
              <h4 class="career-role">Bachelor’s Degree in Mechatronics</h4>
              <p class="career-org">Chungnam National University (CNU), Daejeon, Republic of Korea</p>
              <ul class="detail-list">
                <li><strong>GPA:</strong> 4.07 / 4.5</li>
                <li><strong>Advised by:</strong> Prof. Mooncheol Won</li>
                <li><strong>Thesis:</strong> Sign Language Translator Using MLP</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="experience" class="section">
        <h2 class="section-title">Experience</h2>
        <div class="career-list">
          <div class="career-item">
            <div class="career-year">Feb 2021 - Aug 2025</div>
            <div class="career-details">
              <h4 class="career-role">AI Research Scientist (Research Director)</h4>
              <p class="career-org">ELROILAB Inc., Seoul, Republic of Korea</p>
              <ul class="detail-list">
                <li><strong>Develop:</strong> Hyperspectral foreign object sorter, labeling/training SW, and real-time foreign object detection algorithm</li>
                <li><strong>Research:</strong> Hyperspectral image classification, anomaly detection, learning with noisy labels, and preprocessing for robustness</li>
              </ul>
            </div>
          </div>

          <div class="career-item">
            <div class="career-year">Dec 2017 - Feb 2018</div>
            <div class="career-details">
              <h4 class="career-role">Software Engineer Intern</h4>
              <p class="career-org">Korea Institute of Machinery and Materials (KIMM), Daejeon, Republic of Korea</p>
              <ul class="detail-list">
                <li><strong>Develop:</strong> Prototype of AGV robot based on line-tracer</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer class="footer">
      <p>© {{ new Date().getFullYear() }} Jungi Lee. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup>
const supabase = useSupabaseClient()

// 1. Jungi Lee 이름만 굵게(Bold) 만들어주는 자동 변환 함수
const highlightName = (authorsString) => {
  if (!authorsString) return '';
  // 'Jungi Lee'라는 텍스트를 찾아서 <strong> 태그로 감싸줍니다.
  return authorsString.replace(/Jungi Lee/g, '<strong>Jungi Lee</strong>');
}

// 2. Supabase 연동 (authors 컬럼 추가 요청)
const { data: publications, pending } = await useAsyncData('publications', async () => {
  const { data } = await supabase
    .from('publications')
    .select('title, year, venue, authors') // authors 필드 추가!
    .order('year', { ascending: false })

  if (data) {
    return data.map(pub => ({
      ...pub,
      year: pub.year ? String(pub.year).substring(0, 4) : ''
    }))
  }
  
  return []
})
</script>

<style scoped>
/* 폰트 임포트 */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

/* 레이아웃 안정화 */
.academic-wrapper {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #1a1a1a;
  background-color: #ffffff;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  width: 100%;
  box-sizing: border-box;
}

*, *::before, *::after { box-sizing: inherit; }

/* Header & Nav */
.header {
  border-bottom: 1px solid #eaeaea;
  padding: 1.5rem 0;
  position: sticky;
  top: 0;
  background: rgba(255, 255, 255, 0.98);
  z-index: 10;
}

.nav {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo { font-size: 1.1rem; font-weight: 700; color: #111; text-decoration: none; letter-spacing: -0.02em; white-space: nowrap; }
.nav-links { white-space: nowrap; }
.nav-links a { margin-left: 1.5rem; color: #555; text-decoration: none; font-size: 0.95rem; font-weight: 500; }
.nav-links a:hover { color: #000; }

/* Main Content Layout */
.main-content {
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
  padding: 4rem 24px;
}

.section { margin-bottom: 5rem; }

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111;
  border-bottom: 1px solid #eaeaea;
  padding-bottom: 0.75rem;
  margin-bottom: 2rem;
  letter-spacing: -0.01em;
}

/* Profile Section */
.profile-layout {
  display: flex;
  gap: 2.5rem;
  align-items: flex-start;
  flex-wrap: nowrap;
}

.profile-pic {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
  filter: blur(0.4px);
}

.profile-info {
  min-width: 0; 
  flex-grow: 1;
}

.name { font-size: 2.5rem; font-weight: 700; margin: 0 0 0.25rem 0; letter-spacing: -0.03em; line-height: 1.2; }
.role { font-size: 1.1rem; font-weight: 500; color: #333; margin: 0; }
.univ { font-size: 1rem; color: #666; margin: 0 0 1rem 0; }
.bio { font-size: 0.95rem; color: #444; margin-bottom: 1.5rem; max-width: 100%; }

.links { display: flex; gap: 0.75rem; align-items: center; font-size: 0.9rem; flex-wrap: wrap; }
.links a { color: #0066cc; text-decoration: none; font-weight: 500; }
.links a:hover { text-decoration: underline; }
.dot { color: #ccc; }

/* News & Publications */
.news-list { list-style: none; padding: 0; margin: 0; }
.news-list li { margin-bottom: 1rem; display: flex; gap: 1.5rem; font-size: 0.95rem; flex-wrap: nowrap; }
.news-date { color: #888; font-weight: 500; min-width: 50px; flex-shrink: 0; }
.news-text { color: #222; }

.pub-item { display: flex; gap: 1.5rem; margin-bottom: 2rem; flex-wrap: nowrap; }
.pub-year { font-size: 1rem; font-weight: 500; color: #888; min-width: 50px; flex-shrink: 0; }
.pub-title { font-size: 1.05rem; font-weight: 600; color: #111; margin: 0 0 0.25rem 0; line-height: 1.4; }
.pub-authors { font-size: 0.95rem; color: #444; margin: 0 0 0.25rem 0; }
.pub-venue { font-size: 0.95rem; color: #0066cc; font-style: italic; margin: 0; }

/* Education & Experience */
.career-item { display: flex; gap: 1.5rem; margin-bottom: 2.5rem; flex-wrap: nowrap; }
.career-year { font-size: 0.95rem; font-weight: 500; color: #888; min-width: 140px; flex-shrink: 0; }
.career-role { font-size: 1.05rem; font-weight: 600; color: #111; margin: 0 0 0.25rem 0; }
.career-org { font-size: 0.95rem; color: #555; margin: 0 0 0.5rem 0; font-style: italic; }

.detail-list {
  list-style-type: disc;
  padding-left: 1.2rem;
  margin: 0;
  color: #444;
  font-size: 0.9rem;
}
.detail-list li { margin-bottom: 0.4rem; line-height: 1.5; }
.detail-list strong { color: #222; font-weight: 600; }

.empty-text { color: #888; font-size: 0.9rem; font-style: italic; }
.footer { text-align: center; padding: 3rem 0; color: #888; font-size: 0.85rem; border-top: 1px solid #eaeaea; }

/* Mobile View */
@media (max-width: 600px) {
  .nav-links { display: block; }
  .nav-links a { margin-left: 0.8rem; font-size: 0.85rem; }
  .logo { font-size: 1rem; }

  .profile-layout { flex-direction: row; align-items: flex-start; text-align: left; gap: 1.5rem; }
  .profile-pic { width: 90px; height: 90px; }
  
  .name { font-size: 1.8rem; }
  .role { font-size: 1rem; }
  .bio { font-size: 0.9rem; margin-bottom: 1rem; }
  .links { flex-wrap: wrap; gap: 0.5rem; font-size: 0.85rem; justify-content: flex-start; }

  .career-item, .pub-item, .news-list li { gap: 1rem; }
  .career-year { min-width: 90px; font-size: 0.85rem; }
  .pub-year, .news-date { min-width: 45px; font-size: 0.9rem; }
  
  .detail-list { padding-left: 1rem; font-size: 0.85rem; }
}
</style>