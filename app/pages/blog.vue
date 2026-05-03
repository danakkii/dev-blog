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

      <!-- Left sidebar: hierarchical categories -->
      <aside class="sidebar">
        <p class="sidebar-title">Blog</p>
        <p class="sidebar-desc">데이터와 개발에 관한 생각들을 기록합니다.</p>
        <div class="sidebar-divider"></div>

        <p class="cat-label">Categories</p>
        <ul class="cat-list">
          <li
            :class="['cat-item', { active: selectedCategory === 'All' && !selectedTagId }]"
            @click="selectAll"
          >
            <span class="cat-name">All</span>
            <span class="cat-count">{{ posts?.length || 0 }}</span>
          </li>

          <template v-for="[parent, data] in categoryTree" :key="parent">
            <li
              :class="['cat-item', 'parent-item', { active: selectedCategory === parent }]"
              @click="selectParent(parent)"
            >
              <span class="cat-name">{{ parent }}</span>
              <span class="cat-count">{{ data.totalCount }}</span>
            </li>
          </template>
        </ul>
      </aside>

      <!-- Main content -->
      <main class="main-content">

        <!-- Tag graph -->
        <div class="graph-section">
          <button class="graph-header" @click="graphVisible = !graphVisible">
            <span class="graph-label">Tag Space</span>
            <svg
              width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
              stroke-linecap="round" stroke-linejoin="round"
              :style="{ transition: 'transform 0.2s', transform: graphVisible ? 'rotate(0deg)' : 'rotate(180deg)' }"
            >
              <polyline points="18 15 12 9 6 15"/>
            </svg>
          </button>

          <div v-show="graphVisible" class="graph-body">
            <div v-if="!posts || posts.length === 0" class="graph-empty">
              포스트가 없습니다
            </div>
            <canvas
              v-else
              ref="graphCanvas"
              class="tag-graph"
              width="700"
              height="240"
              @mousemove="onGraphMouseMove"
              @click="onGraphClick"
              @mouseleave="onGraphMouseLeave"
            />
            <Transition name="badge-fade">
              <div v-if="selectedTagId" class="graph-tag-badge">
                <span class="badge-dot"></span>
                {{ selectedTagId }}
                <button class="badge-clear" @click.stop="clearTagFilter">×</button>
              </div>
            </Transition>
          </div>
        </div>

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
              <div class="post-item-body">
                <div class="post-item-top">
                  <time class="post-date">{{ formatDate(post.created_at) }}</time>
                  <span v-if="post.category" class="post-category">{{ displayCategory(post.category) }}</span>
                  <span v-if="isAdminViewer" class="post-views">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    {{ formatViews(post.views) }}
                  </span>
                </div>
                <h3 class="post-title" v-html="highlight(post.title)"></h3>
                <p class="post-excerpt" v-html="highlight(getPreviewText(post.content))"></p>
                <span class="post-arrow">Read more →</span>
              </div>
              <div v-if="getThumbnailImage(post.content)" class="post-thumbnail">
                <img :src="getThumbnailImage(post.content)" :alt="post.title" loading="lazy" />
              </div>
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
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const supabase = useSupabaseClient()
const selectedCategory = ref('All')
const selectedTagId = ref(null)
const searchQuery = ref('')
const searchFocused = ref(false)
const graphVisible = ref(true)
const isAdminViewer = ref(false)
const ADMIN_AUTH_KEY = 'devblog-admin-authenticated'
// ── Data ────────────────────────────────────────────────────────────
const { data: posts, pending } = await useAsyncData('blog-posts', async () => {
  const { data, error } = await supabase
    .from('post')
    .select('id, created_at, title, content, category, tags, views')
    .order('created_at', { ascending: false })
  if (error) {
    const { data: fallback } = await supabase
      .from('post')
      .select('id, created_at, title, content, category')
      .order('created_at', { ascending: false })
    return fallback || []
  }
  return data || []
})

const parseTagList = (tags) =>
  tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []

const formatViews = (n) => {
  if (!n) return '0'
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  return String(n)
}

// ── Category tree ────────────────────────────────────────────────────
const categoryTree = computed(() => {
  const tree = new Map()
  posts.value?.forEach(post => {
    if (!post.category) return
    const parts = post.category.split('/').map(s => s.trim())
    const parent = parts[0]
    const child = parts[1]
    if (!tree.has(parent)) tree.set(parent, { totalCount: 0, children: new Map(), tags: new Map() })
    const parentData = tree.get(parent)
    parentData.totalCount++
    if (child) {
      const c = parentData.children
      c.set(child, (c.get(child) || 0) + 1)
    }
    if (post.tags) {
      parseTagList(post.tags).forEach(tag => {
        parentData.tags.set(tag, (parentData.tags.get(tag) || 0) + 1)
      })
    }
  })
  return new Map([...tree.entries()].sort((a, b) => a[0].localeCompare(b[0])))
})

// ── Category / tag actions ───────────────────────────────────────────
const selectAll = () => { selectedCategory.value = 'All'; selectedTagId.value = null }
const selectParent = (p) => { selectedCategory.value = p; selectedTagId.value = null }
const selectCategory = (cat) => { selectedCategory.value = cat; selectedTagId.value = null }
const clearTagFilter = () => { selectedTagId.value = null }

const displayCategory = (cat) => {
  const parts = cat.split('/')
  return parts[parts.length - 1].trim()
}

// ── Filtering ────────────────────────────────────────────────────────
const getPostTagSet = (post) => {
  const tags = new Set()
  if (post.category) {
    post.category.split('/').forEach(p => tags.add(p.trim()))
    tags.add(post.category.trim())
  }
  if (post.tags) parseTagList(post.tags).forEach(t => tags.add(t))
  return tags
}

const isFiltering = computed(() =>
  searchQuery.value.trim() !== '' || selectedCategory.value !== 'All' || selectedTagId.value !== null
)

const filteredPosts = computed(() => {
  let result = posts.value || []

  if (selectedTagId.value) {
    result = result.filter(p => getPostTagSet(p).has(selectedTagId.value))
  } else if (selectedCategory.value !== 'All') {
    const sel = selectedCategory.value
    const isChild = sel.includes('/')
    result = result.filter(p => {
      if (!p.category) return false
      if (isChild) return p.category.trim() === sel
      return p.category.split('/')[0].trim() === sel
    })
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

const getThumbnailImage = (content) => {
  if (!content) return null
  const match = content.match(/!\[.*?\]\((.*?)\)/)
  return match ? match[1] : null
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

// ── Graph simulation ─────────────────────────────────────────────────
const GRAPH_W = 700
const GRAPH_H = 240
const graphCanvas = ref(null)

let simNodes = []
let simEdges = []
let hoveredNodeId = null
let animAlpha = 1.0
let animId = null

function buildSimulation(postsData) {
  const tagCountMap = new Map()
  const tagTypeMap = new Map()  // 'category' | 'tag'
  const postTagMap = new Map()

  for (const post of postsData) {
    const postTags = []
    if (post.category) {
      post.category.split('/').forEach(p => {
        const t = p.trim()
        if (t) { postTags.push(t); if (!tagTypeMap.has(t)) tagTypeMap.set(t, 'category') }
      })
    }
    if (post.tags) {
      parseTagList(post.tags).forEach(t => { postTags.push(t); tagTypeMap.set(t, 'tag') })
    }
    const uniqueTags = [...new Set(postTags)]
    postTagMap.set(post.id, uniqueTags)
    uniqueTags.forEach(t => tagCountMap.set(t, (tagCountMap.get(t) || 0) + 1))
  }

  simNodes = [
    ...Array.from(tagCountMap.entries()).map(([id, count]) => ({
      id,
      type: tagTypeMap.get(id) === 'tag' ? 'tag' : 'category',
      label: id, count,
      x: GRAPH_W / 2 + (Math.random() - 0.5) * 180,
      y: GRAPH_H / 2 + (Math.random() - 0.5) * 90,
      vx: 0, vy: 0
    })),
    ...postsData.map(post => ({
      id: `post_${post.id}`, type: 'post', label: '',
      x: GRAPH_W / 2 + (Math.random() - 0.5) * 220,
      y: GRAPH_H / 2 + (Math.random() - 0.5) * 110,
      vx: 0, vy: 0, count: 1
    }))
  ]

  simEdges = postsData.flatMap(post =>
    (postTagMap.get(post.id) || []).map(tagId => ({ s: `post_${post.id}`, t: tagId }))
  )

  animAlpha = 1.0
}

function tickSim() {
  const cx = GRAPH_W / 2, cy = GRAPH_H / 2, margin = 30

  for (let i = 0; i < simNodes.length; i++) {
    for (let j = i + 1; j < simNodes.length; j++) {
      const ni = simNodes[i], nj = simNodes[j]
      const dx = ni.x - nj.x, dy = ni.y - nj.y
      const dist2 = dx * dx + dy * dy || 0.01
      const dist = Math.sqrt(dist2)
      const isLabelI = ni.type !== 'post', isLabelJ = nj.type !== 'post'
      const rep = (isLabelI && isLabelJ ? 3200 : ni.type === 'post' && nj.type === 'post' ? 500 : 1400) / dist2
      const fx = (dx / dist) * rep, fy = (dy / dist) * rep
      ni.vx += fx; ni.vy += fy; nj.vx -= fx; nj.vy -= fy
    }
  }

  const nodeMap = new Map(simNodes.map(n => [n.id, n]))
  for (const { s, t } of simEdges) {
    const sn = nodeMap.get(s), tn = nodeMap.get(t)
    if (!sn || !tn) continue
    const dx = tn.x - sn.x, dy = tn.y - sn.y
    const dist = Math.sqrt(dx * dx + dy * dy) || 1
    const sf = (dist - 65) * 0.038
    const fx = (dx / dist) * sf, fy = (dy / dist) * sf
    sn.vx += fx; sn.vy += fy; tn.vx -= fx; tn.vy -= fy
  }

  for (const node of simNodes) {
    node.vx += (cx - node.x) * 0.013
    node.vy += (cy - node.y) * 0.013
    node.vx *= 0.87; node.vy *= 0.87
    node.x = Math.max(margin, Math.min(GRAPH_W - margin, node.x + node.vx * animAlpha))
    node.y = Math.max(margin, Math.min(GRAPH_H - margin, node.y + node.vy * animAlpha))
  }

  animAlpha = Math.max(0, animAlpha * 0.992)
}

function renderGraph() {
  const canvas = graphCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, GRAPH_W, GRAPH_H)
  ctx.fillStyle = '#fafaf8'
  ctx.fillRect(0, 0, GRAPH_W, GRAPH_H)

  if (simNodes.length === 0) return

  const nodeMap = new Map(simNodes.map(n => [n.id, n]))

  const connectedIds = new Set()
  const hotEdges = new Set()
  if (hoveredNodeId) {
    simEdges.forEach((e, i) => {
      if (e.s === hoveredNodeId || e.t === hoveredNodeId) {
        connectedIds.add(e.s); connectedIds.add(e.t); hotEdges.add(i)
      }
    })
  }

  // Draw edges
  simEdges.forEach((edge, i) => {
    const s = nodeMap.get(edge.s), t = nodeMap.get(edge.t)
    if (!s || !t) return
    const hot = hotEdges.has(i)
    const selEdge = selectedTagId.value && edge.t === selectedTagId.value
    ctx.strokeStyle = selEdge ? 'rgba(0,0,0,0.35)' : hot ? 'rgba(0,0,0,0.22)' : 'rgba(0,0,0,0.07)'
    ctx.lineWidth = hot || selEdge ? 1.4 : 0.7
    ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(t.x, t.y); ctx.stroke()
  })

  // Draw post dots
  for (const node of simNodes) {
    if (node.type !== 'post') continue
    const hot = hoveredNodeId ? connectedIds.has(node.id) : false
    const selPost = selectedTagId.value && simEdges.some(e => e.s === node.id && e.t === selectedTagId.value)
    const dimmed = hoveredNodeId && !hot
    ctx.beginPath()
    ctx.arc(node.x, node.y, dimmed ? 1.8 : 2.5, 0, Math.PI * 2)
    ctx.fillStyle = selPost ? '#1d1d1f' : dimmed ? '#e5e7eb' : hot ? '#6b7280' : '#b0b0b8'
    ctx.fill()
  }

  // Draw label nodes (category & tag — same gray palette)
  for (const node of simNodes) {
    if (node.type === 'post') continue
    const r = 7 + Math.log(node.count + 1) * 4.5
    const isHov = hoveredNodeId === node.id
    const isSel = selectedTagId.value === node.id
    const dimmed = hoveredNodeId && !connectedIds.has(node.id) && !isHov

    // Soft glow on hover/select
    if (isHov || isSel) {
      const grd = ctx.createRadialGradient(node.x, node.y, r * 0.4, node.x, node.y, r + 13)
      grd.addColorStop(0, 'rgba(0,0,0,0.08)')
      grd.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.beginPath(); ctx.arc(node.x, node.y, r + 13, 0, Math.PI * 2)
      ctx.fillStyle = grd; ctx.fill()
    }

    ctx.beginPath(); ctx.arc(node.x, node.y, r, 0, Math.PI * 2)
    ctx.fillStyle = isSel ? '#1d1d1f' : isHov ? '#4b5563' : dimmed ? '#e5e7eb' : '#9ca3af'
    ctx.fill()
    ctx.strokeStyle = isSel ? '#111' : isHov ? '#374151' : dimmed ? '#d1d5db' : '#6b7280'
    ctx.lineWidth = isSel ? 2 : 1.5; ctx.stroke()

    // Label
    ctx.fillStyle = dimmed ? '#d1d5db' : isSel ? '#111' : isHov ? '#1d1d1f' : '#4b5563'
    ctx.font = `${isHov || isSel ? '700' : '600'} ${isHov ? 10.5 : 9.5}px "JetBrains Mono", monospace`
    ctx.textAlign = 'center'
    ctx.fillText(node.label, node.x, node.y - r - 5)
  }
}

function animateGraph() {
  if (animAlpha > 0.004) tickSim()
  renderGraph()
  animId = requestAnimationFrame(animateGraph)
}

function stopAnimation() {
  if (animId) { cancelAnimationFrame(animId); animId = null }
}

function startGraph(postsData) {
  stopAnimation()
  buildSimulation(postsData)
  for (let i = 0; i < 120; i++) tickSim()
  animateGraph()
}

function onGraphMouseMove(e) {
  const canvas = graphCanvas.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  const mx = (e.clientX - rect.left) * (GRAPH_W / rect.width)
  const my = (e.clientY - rect.top) * (GRAPH_H / rect.height)

  hoveredNodeId = null
  for (const node of simNodes) {
    if (node.type === 'post') continue
    const r = 7 + Math.log(node.count + 1) * 4.5 + 5
    const dx = mx - node.x, dy = my - node.y
    if (dx * dx + dy * dy <= r * r) { hoveredNodeId = node.id; break }
  }
  canvas.style.cursor = hoveredNodeId ? 'pointer' : 'default'
}

function onGraphClick() {
  if (!hoveredNodeId) return
  if (selectedTagId.value === hoveredNodeId) {
    selectedTagId.value = null
  } else {
    selectedTagId.value = hoveredNodeId
    selectedCategory.value = 'All'
  }
}

function onGraphMouseLeave() { hoveredNodeId = null }

// ── Lifecycle ────────────────────────────────────────────────────────
onMounted(() => {
  isAdminViewer.value = localStorage.getItem(ADMIN_AUTH_KEY) === '1'

  watch(posts, p => {
    if (p && p.length > 0) startGraph(p)
  }, { immediate: true })
})

onUnmounted(() => stopAnimation())
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
  grid-template-columns: 200px 1fr;
  gap: 44px;
  max-width: 980px;
  margin: 0 auto;
  padding: 56px 24px 80px;
  align-items: start;
  min-width: 0;
}

/* ── Sidebar ─────────────────────────────────────────── */
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
  gap: 1px;
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
.cat-item:hover { background: #f0f0ee; }
.cat-item.active { background: #1d1d1f; }
.cat-item.active:hover { background: #1d1d1f; }
.cat-item.active .cat-name { color: #fff; font-weight: 600; }
.cat-item.active:hover .cat-name { color: #fff; }
.cat-item.active .cat-count { color: rgba(255,255,255,0.45); }
.cat-item.active:hover .cat-count { color: rgba(255,255,255,0.45); }
.cat-item.active .expand-btn { color: rgba(255,255,255,0.55); }
.cat-item.active .expand-btn:hover { color: #fff; }

.cat-name {
  font-size: 0.875rem;
  color: #3a3a3e;
  font-weight: 500;
  transition: color 0.12s;
}
.cat-item:hover .cat-name { color: #111; }
.cat-count {
  font-size: 0.72rem;
  color: #b0b0b4;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 500;
  min-width: 16px;
  text-align: right;
  flex-shrink: 0;
}

/* Hierarchical: parent/child */
.cat-right {
  display: flex;
  align-items: center;
  gap: 5px;
}
.expand-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 1px 2px;
  color: #b0b0b4;
  display: flex;
  align-items: center;
  line-height: 1;
  transition: color 0.12s;
  flex-shrink: 0;
}
.expand-btn:hover { color: #444; }

.child-item {
  padding-left: 22px;
}
.child-item .cat-name {
  font-size: 0.82rem;
  color: #5a5a60;
}
.child-item:hover .cat-name { color: #111; }
.child-item.active .cat-name { color: #fff; font-weight: 600; }

.tag-item {
  padding-left: 22px;
}
.tag-item .cat-name {
  font-size: 0.78rem;
  color: #8a8a8e;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 500;
  letter-spacing: 0.01em;
}
.tag-item:hover .cat-name { color: #444; }
.tag-item.active { background: #1d1d1f; }
.tag-item.active .cat-name { color: #fff; font-weight: 600; }
.tag-item.active .cat-count { color: rgba(255,255,255,0.45); }

/* ── Main content ────────────────────────────────────── */
.main-content { min-width: 0; }

/* ── Tag graph ───────────────────────────────────────── */
.graph-section {
  margin-bottom: 18px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e8e8e6;
  background: #fafaf8;
}
.graph-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: transparent;
  border-bottom: 1px solid #e8e8e6;
  cursor: pointer;
  user-select: none;
  border-top: none;
  border-left: none;
  border-right: none;
  width: 100%;
  color: #6e6e73;
}
.graph-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.68rem;
  font-weight: 700;
  color: #8a8a8e;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.graph-body {
  position: relative;
  background: #fafaf8;
}
.graph-empty {
  height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.82rem;
  color: #c0c0c8;
  font-family: 'JetBrains Mono', monospace;
}
.tag-graph {
  display: block;
  width: 100%;
  height: 240px;
  cursor: default;
}
.graph-tag-badge {
  position: absolute;
  bottom: 10px;
  left: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(37, 99, 235, 0.08);
  border: 1px solid rgba(37, 99, 235, 0.2);
  border-radius: 100px;
  padding: 4px 10px 4px 8px;
  font-size: 0.72rem;
  font-family: 'JetBrains Mono', monospace;
  color: #2563eb;
  font-weight: 600;
}
.badge-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #2563eb;
  flex-shrink: 0;
}
.badge-clear {
  background: none;
  border: none;
  cursor: pointer;
  color: rgba(37, 99, 235, 0.5);
  font-size: 0.95rem;
  padding: 0;
  line-height: 1;
  margin-left: 2px;
  transition: color 0.1s;
}
.badge-clear:hover { color: #2563eb; }

.badge-fade-enter-active,
.badge-fade-leave-active { transition: opacity 0.2s; }
.badge-fade-enter-from,
.badge-fade-leave-to { opacity: 0; }

/* ── Search ──────────────────────────────────────────── */
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

/* ── Post list ───────────────────────────────────────── */
.post-list { display: flex; flex-direction: column; gap: 12px; }
.post-item {
  display: flex;
  align-items: center;
  gap: 20px;
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
.post-item-body {
  flex: 1;
  min-width: 0;
}
.post-thumbnail {
  flex-shrink: 0;
  width: 96px;
  height: 72px;
  border-radius: 8px;
  overflow: hidden;
  background: #f0f0ee;
}
.post-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.2s ease;
}
.post-item:hover .post-thumbnail img { transform: scale(1.05); }
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
  gap: 8px;
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
.post-views {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 0.72rem;
  color: #aaa;
  font-weight: 500;
  margin-left: auto;
}
.post-tag {
  font-size: 0.7rem;
  font-weight: 500;
  color: #6e6e73;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 0.02em;
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

/* ── Footer ──────────────────────────────────────────── */
.footer {
  max-width: 980px;
  margin: 0 auto;
  padding: 24px 24px 48px;
  border-top: 1px solid #e8e8e6;
  font-size: 0.82rem;
  color: #aaa;
}

/* ── Tablet ──────────────────────────────────────────── */
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
  .expand-btn { display: none; }
  .child-item { padding-left: 12px; }
  .nav-inner { max-width: 100%; }
  .footer { max-width: 100%; }
  .post-thumbnail { width: 72px; height: 56px; }
}
</style>
