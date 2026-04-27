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

    <div class="page-body">

      <!-- Left sidebar -->
      <aside class="sidebar">
        <p class="sidebar-title">Blog</p>
        <p class="sidebar-desc">데이터와 개발에 관한 생각들을 기록합니다.</p>

        <div class="sidebar-divider"></div>

        <p class="cat-label">Categories</p>
        <ul class="cat-list">
          <li
            v-for="cat in categories"
            :key="cat"
            :class="['cat-item', { active: selectedCategory === cat }]"
            @click="selectedCategory = cat"
          >
            <span class="cat-name">{{ cat }}</span>
            <span class="cat-count">{{ categoryCounts[cat] ?? 0 }}</span>
          </li>
        </ul>
      </aside>

      <!-- Main content -->
      <main class="main-content">

        <!-- Search -->
        <div class="search-wrap" :class="{ focused: searchFocused }">
          <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            v-model="searchQuery"
            class="search-input"
            type="search"
            placeholder="제목 또는 내용 검색..."
            @focus="searchFocused = true"
            @blur="searchFocused = false"
          />
          <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''" aria-label="clear">×</button>
        </div>

        <div v-if="pending" class="loading">불러오는 중...</div>

        <div v-else>
          <p v-if="isFiltering" class="result-count">
            <span v-if="filteredPosts.length">{{ filteredPosts.length }}개의 글</span>
            <span v-else>검색 결과가 없습니다.</span>
          </p>

          <div class="post-list">
            <p v-if="!filteredPosts.length && !isFiltering" class="empty">아직 작성된 글이 없습니다.</p>

            <NuxtLink
              v-for="post in filteredPosts"
              :key="post.id"
              :to="`/posts/${post.id}`"
              class="post-item"
            >
              <div class="post-item-top">
                <time class="post-date">{{ formatDate(post.created_at) }}</time>
                <span v-if="post.category" class="post-category">{{ post.category }}</span>
              </div>
              <h3 class="post-title" v-html="highlight(post.title)"></h3>
              <p class="post-excerpt" v-html="highlight(getPreviewText(post.content))"></p>
              <span class="post-arrow">Read more →</span>
            </NuxtLink>
          </div>
        </div>
      </main>

    </div>

    <footer class="footer">
      <p>© {{ new Date().getFullYear() }} Dana Kim</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const supabase = useSupabaseClient()
const selectedCategory = ref('All')
const searchQuery = ref('')
const searchFocused = ref(false)

const { data: posts, pending } = await useAsyncData('blog-posts', async () => {
  const { data, error } = await supabase
    .from('post')
    .select('id, created_at, title, content, category')
    .order('created_at', { ascending: false })
  if (error) {
    const { data: fallback } = await supabase
      .from('post')
      .select('id, created_at, title, content')
      .order('created_at', { ascending: false })
    return fallback || []
  }
  return data || []
})

const categories = computed(() => {
  const cats = new Set()
  posts.value?.forEach(p => { if (p.category) cats.add(p.category) })
  if (!cats.size) return ['All']
  return ['All', ...Array.from(cats).sort()]
})

const categoryCounts = computed(() => {
  const counts = { All: (posts.value || []).length }
  posts.value?.forEach(p => {
    if (p.category) counts[p.category] = (counts[p.category] || 0) + 1
  })
  return counts
})

const isFiltering = computed(() =>
  searchQuery.value.trim() !== '' || selectedCategory.value !== 'All'
)

const filteredPosts = computed(() => {
  let result = posts.value || []
  if (selectedCategory.value !== 'All') {
    result = result.filter(p => p.category === selectedCategory.value)
  }
  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    result = result.filter(p =>
      p.title?.toLowerCase().includes(q) ||
      p.content?.toLowerCase().includes(q)
    )
  }
  return result
})

const escapeHtml = (str) =>
  str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const highlight = (text) => {
  const safe = escapeHtml(text || '')
  const q = searchQuery.value.trim()
  if (!q) return safe
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return safe.replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>')
}

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
    .slice(0, 180)
}
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
  min-height: 100vh;
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
  max-width: 980px;
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

/* Page layout */
.page-body {
  display: grid;
  grid-template-columns: 190px 1fr;
  gap: 48px;
  max-width: 980px;
  margin: 0 auto;
  padding: 56px 24px 80px;
  align-items: start;
  min-width: 0;
}

/* Sidebar */
.sidebar {
  position: sticky;
  top: 72px;
}
.sidebar-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: #111;
  letter-spacing: -0.02em;
  margin: 0 0 8px 0;
}
.sidebar-desc {
  font-size: 0.8rem;
  color: #8a8a8e;
  line-height: 1.5;
  margin: 0;
}
.sidebar-divider {
  height: 1px;
  background: #e8e8e6;
  margin: 20px 0;
}
.cat-label {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #b0b0b4;
  margin: 0 0 10px 0;
  font-family: 'JetBrains Mono', monospace;
}
.cat-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.cat-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7px 10px;
  border-radius: 7px;
  cursor: pointer;
  transition: background 0.12s, color 0.12s;
  user-select: none;
}
.cat-item:hover {
  background: #f0f0ee;
}
.cat-item.active {
  background: #1d1d1f;
}
.cat-item.active .cat-name { color: #fff; font-weight: 600; }
.cat-item.active .cat-count { color: rgba(255,255,255,0.5); }
.cat-name {
  font-size: 0.875rem;
  color: #3a3a3e;
  font-weight: 500;
  transition: color 0.12s;
}
.cat-count {
  font-size: 0.72rem;
  color: #b0b0b4;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 500;
  min-width: 18px;
  text-align: right;
}
.cat-item:hover .cat-name { color: #111; }

/* Main content */
.main-content { min-width: 0; }

/* Search */
.search-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid #e8e8e6;
  border-radius: 10px;
  padding: 10px 14px;
  background: #fff;
  margin-bottom: 20px;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.search-wrap.focused {
  border-color: #1d1d1f;
  box-shadow: 0 0 0 3px rgba(0,0,0,0.05);
}
.search-icon { color: #aaa; flex-shrink: 0; }
.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 0.9rem;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  color: #1d1d1f;
  background: transparent;
  min-width: 0;
}
.search-input::placeholder { color: #c0c0c0; }
.search-input::-webkit-search-cancel-button { display: none; }
.search-clear {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  color: #aaa;
  line-height: 1;
  padding: 0 2px;
  flex-shrink: 0;
  transition: color 0.15s;
}
.search-clear:hover { color: #1d1d1f; }

.result-count {
  font-size: 0.82rem;
  color: #8a8a8e;
  margin-bottom: 16px;
  font-family: 'JetBrains Mono', monospace;
}
.loading { font-size: 0.9rem; color: #8a8a8e; padding: 24px 0; }
.empty { font-size: 0.9rem; color: #8a8a8e; }

/* Post list */
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
.post-item-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}
.post-date {
  font-size: 0.75rem;
  color: #8a8a8e;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.post-category {
  font-size: 0.72rem;
  font-weight: 700;
  color: #0066cc;
  background: rgba(0, 102, 204, 0.08);
  border-radius: 4px;
  padding: 2px 8px;
  letter-spacing: 0.04em;
}
.post-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #111;
  margin: 0 0 8px 0;
  letter-spacing: -0.02em;
  line-height: 1.35;
  transition: color 0.15s;
}
.post-item:hover .post-title { color: #0066cc; }
.post-excerpt {
  font-size: 0.875rem;
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
}
.post-item:hover .post-arrow { opacity: 1; transform: translateX(4px); }

:deep(mark) {
  background: #fff3b0;
  color: inherit;
  border-radius: 2px;
  padding: 0 1px;
}

/* Footer */
.footer {
  max-width: 980px;
  margin: 0 auto;
  padding: 24px 24px 48px;
  border-top: 1px solid #e8e8e6;
  font-size: 0.82rem;
  color: #aaa;
}

/* Tablet: sidebar to top */
@media (max-width: 768px) {
  .page-body {
    grid-template-columns: 1fr;
    gap: 0;
    padding: 32px 20px 60px;
  }
  .sidebar {
    position: static;
    border-bottom: 1px solid #e8e8e6;
    padding-bottom: 16px;
    margin-bottom: 24px;
  }
  .sidebar-title { display: none; }
  .sidebar-desc { display: none; }
  .sidebar-divider { display: none; }
  .cat-label { display: none; }
  .cat-list {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 6px;
  }
  .cat-item {
    border: 1px solid #e8e8e6;
    border-radius: 100px;
    padding: 5px 12px;
    background: #fff;
  }
  .cat-item.active {
    background: #1d1d1f;
    border-color: #1d1d1f;
  }
  .cat-count { display: none; }
  .nav-inner { max-width: 100%; }
  .footer { max-width: 100%; }
}
</style>
