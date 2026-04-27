<template>
  <!-- 비밀번호 게이트 -->
  <div v-if="!authenticated" class="gate-wrapper">
    <div class="gate-box">
      <p class="gate-logo">>>_</p>
      <p class="gate-sub">Dana Kim · Admin</p>
      <input v-model="password" type="password" class="gate-input" placeholder="Password" @keyup.enter="login" autofocus />
      <button class="gate-btn" @click="login">Enter →</button>
      <p v-if="loginError" class="gate-error">비밀번호가 틀렸습니다.</p>
    </div>
  </div>

  <!-- 에디터 -->
  <div v-else class="admin-wrapper">
    <nav class="admin-nav">
      <div class="nav-inner">
        <NuxtLink to="/" class="nav-back">← Blog</NuxtLink>
        <div class="nav-center">
          <button class="btn-posts" :class="{ active: showPosts }" @click="togglePosts">
            Posts {{ allPosts.length ? `(${allPosts.length})` : '' }}
          </button>
          <span v-if="editingPostId" class="nav-mode">· Editing</span>
        </div>
        <div class="nav-actions">
          <button v-if="editingPostId" class="btn-new" @click="resetEditor">+ New</button>
          <button class="btn-publish" :disabled="publishing" @click="save">
            {{ publishing ? 'Saving...' : editingPostId ? 'Update →' : 'Publish →' }}
          </button>
        </div>
      </div>
    </nav>

    <!-- 글 목록 패널 -->
    <div v-if="showPosts" class="posts-panel">
      <div v-if="allPosts.length === 0" class="posts-empty">아직 작성된 글이 없습니다.</div>
      <div v-for="post in allPosts" :key="post.id" class="post-row" :class="{ 'post-row--active': editingPostId === post.id }">
        <div class="post-row-info">
          <p class="post-row-title">{{ post.title }}</p>
          <time class="post-row-date">{{ formatDate(post.created_at) }}</time>
        </div>
        <div class="post-row-actions">
          <button class="row-btn row-btn--edit" @click="startEdit(post)">Edit</button>
          <button class="row-btn row-btn--delete" @click="deletePost(post.id)">Delete</button>
        </div>
      </div>
    </div>

    <main class="editor-main">
      <input v-model="title" class="title-input" type="text" placeholder="Post title..." />
      <div class="category-row">
        <span class="category-prefix"># category</span>
        <input v-model="category" class="category-input" type="text" placeholder="예: Data, Backend, AI ..." />
      </div>

      <!-- 툴바 -->
      <div class="toolbar">
        <div class="toolbar-group">
          <button class="tb-btn" @click="wrap('**', '**')" title="Bold"><b>B</b></button>
          <button class="tb-btn" @click="wrap('*', '*')" title="Italic"><i>I</i></button>
          <button class="tb-btn tb-mono" @click="wrap('`', '`')" title="Inline Code">` `</button>
          <button class="tb-btn tb-mono" @click="insertCodeBlock" title="Code Block">{ }</button>
        </div>
        <div class="toolbar-sep"></div>
        <div class="toolbar-group">
          <button class="tb-btn" @click="openLinkDialog" title="Insert Link">Link</button>
          <button class="tb-btn tb-image" :disabled="uploading" @click="imageInputEl?.click()">
            {{ uploading ? 'Uploading...' : '+ Image' }}
          </button>
        </div>
        <input ref="imageInputEl" type="file" accept="image/*" style="display:none" @change="uploadImage" />
      </div>

      <div class="editor-split">
        <div class="pane write-pane">
          <div class="pane-label">Markdown</div>
          <textarea ref="textareaEl" v-model="content" class="markdown-textarea" placeholder="Write in markdown..." spellcheck="false" @paste="handlePaste"></textarea>
          <div v-if="fetchingLink" class="fetch-indicator">
            <span class="fetch-dot"></span> 링크 제목 가져오는 중...
          </div>
        </div>
        <div class="pane preview-pane">
          <div class="pane-label">Preview</div>
          <div ref="previewBodyEl" class="preview-body markdown-preview" v-html="parsedPreview"></div>
        </div>
      </div>
    </main>

    <!-- 링크 다이얼로그 -->
    <div v-if="linkDialog.show" class="dialog-overlay" @click.self="linkDialog.show = false">
      <div class="dialog-box">
        <p class="dialog-title">Insert Link</p>
        <input v-model="linkDialog.text" class="dialog-input" placeholder="Link text" />
        <input v-model="linkDialog.url" class="dialog-input" placeholder="https://..." @keyup.enter="confirmLink" />
        <div class="dialog-actions">
          <button class="dialog-cancel" @click="linkDialog.show = false">Cancel</button>
          <button class="dialog-confirm" @click="confirmLink">Insert →</button>
        </div>
      </div>
    </div>

    <div v-if="toast" class="toast">{{ toast }}</div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch, onMounted } from 'vue'
import { marked } from 'marked'

marked.use({ gfm: true, breaks: true })

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

// ✏️ 여기서 비밀번호 변경
const ADMIN_PASSWORD = 'dana2024'

const supabase = useSupabaseClient()

const authenticated = ref(false)
const password = ref('')
const loginError = ref(false)

const title = ref('')
const content = ref('')
const category = ref('')
const publishing = ref(false)
const uploading = ref(false)
const fetchingLink = ref(false)
const toast = ref('')

const editingPostId = ref(null)
const allPosts = ref([])
const showPosts = ref(false)

const textareaEl = ref(null)
const imageInputEl = ref(null)
const previewBodyEl = ref(null)
const linkDialog = ref({ show: false, text: '', url: '', cursorPos: 0 })

// ── 인증 ──────────────────────────────────────────────
const login = async () => {
  if (password.value === ADMIN_PASSWORD) {
    authenticated.value = true
    loginError.value = false
    await loadPosts()
  } else {
    loginError.value = true
    password.value = ''
  }
}

// ── 글 목록 ───────────────────────────────────────────
const loadPosts = async () => {
  const { data } = await supabase
    .from('post')
    .select('id, created_at, title, content, category')
    .order('created_at', { ascending: false })
  allPosts.value = data || []
}

const togglePosts = () => { showPosts.value = !showPosts.value }

const formatDate = (dateString) => {
  if (!dateString) return ''
  const d = new Date(dateString)
  return `${d.getFullYear()}. ${String(d.getMonth() + 1).padStart(2, '0')}. ${String(d.getDate()).padStart(2, '0')}.`
}

// ── 수정 ──────────────────────────────────────────────
const startEdit = (post) => {
  editingPostId.value = post.id
  title.value = post.title
  content.value = post.content
  category.value = post.category || ''
  showPosts.value = false
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const resetEditor = () => {
  editingPostId.value = null
  title.value = ''
  content.value = ''
  category.value = ''
}

// ── 삭제 ──────────────────────────────────────────────
const deletePost = async (id) => {
  if (!confirm('이 글을 삭제하시겠습니까?')) return
  const { error } = await supabase.from('post').delete().eq('id', id)
  if (error) { showToast('삭제 실패: ' + error.message); return }
  allPosts.value = allPosts.value.filter(p => p.id !== id)
  if (editingPostId.value === id) resetEditor()
  showToast('삭제되었습니다.')
}

// ── 미리보기 ──────────────────────────────────────────
const parsedPreview = computed(() => {
  if (!content.value) return '<p style="color:#aaa;font-size:0.9rem">미리보기가 여기에 표시됩니다.</p>'
  return processMermaid(marked.parse(content.value))
})

const renderMermaid = async () => {
  if (!previewBodyEl.value) return
  const nodes = [...previewBodyEl.value.querySelectorAll('.mermaid-block:not([data-done])')]
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
      node.innerHTML = `<pre style="color:#c0392b;font-size:0.8rem;padding:10px;background:#fff0f0;border-radius:6px">Mermaid error: ${e.message}</pre>`
    }
  }
}

watch(parsedPreview, async () => { await nextTick(); await renderMermaid() })

// ── 토스트 ─────────────────────────────────────────────
const showToast = (msg) => {
  toast.value = msg
  setTimeout(() => { toast.value = '' }, 3000)
}

// ── 커서 삽입 헬퍼 ────────────────────────────────────
const insertAtCursor = (before, after = '', placeholder = '') => {
  const ta = textareaEl.value
  if (!ta) return
  const start = ta.selectionStart
  const end = ta.selectionEnd
  const selected = content.value.substring(start, end) || placeholder
  content.value = content.value.substring(0, start) + before + selected + after + content.value.substring(end)
  nextTick(() => {
    ta.focus()
    const c = start + before.length + selected.length
    ta.setSelectionRange(c, c)
  })
}

const wrap = (before, after) => insertAtCursor(before, after)

const insertCodeBlock = () => {
  const ta = textareaEl.value
  if (!ta) return
  const start = ta.selectionStart
  const selected = content.value.substring(start, ta.selectionEnd)
  const block = '```\n' + (selected || 'code here') + '\n```'
  content.value = content.value.substring(0, start) + block + content.value.substring(ta.selectionEnd)
  nextTick(() => {
    ta.focus()
    const inner = selected || 'code here'
    ta.setSelectionRange(start + 4, start + 4 + inner.length)
  })
}

// ── 링크 다이얼로그 ────────────────────────────────────
const openLinkDialog = () => {
  const ta = textareaEl.value
  const start = ta?.selectionStart ?? content.value.length
  const end = ta?.selectionEnd ?? content.value.length
  const selected = ta ? content.value.substring(start, end) : ''
  linkDialog.value = { show: true, text: selected, url: '', cursorStart: start, cursorEnd: end }
}

const confirmLink = () => {
  const { text, url, cursorStart, cursorEnd } = linkDialog.value
  if (!url.trim()) return
  const markdown = `[${text.trim() || url}](${url})`
  // cursorStart~cursorEnd 범위(원본 선택 구간)를 markdown으로 정확히 대체
  content.value = content.value.substring(0, cursorStart) + markdown + content.value.substring(cursorEnd)
  linkDialog.value.show = false
  nextTick(() => textareaEl.value?.focus())
}

// ── 이미지 업로드 ─────────────────────────────────────
const BUCKET = 'blog-images'

const uploadImage = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  uploading.value = true

  const fileName = `${Date.now()}.${file.name.split('.').pop()}`
  let { data, error } = await supabase.storage.from(BUCKET).upload(fileName, file, { cacheControl: '3600', upsert: false })

  // bucket이 없으면 자동 생성 후 재시도
  if (error && (error.statusCode === 404 || error.message?.toLowerCase().includes('not found') || error.message?.toLowerCase().includes('bucket'))) {
    const { error: createErr } = await supabase.storage.createBucket(BUCKET, {
      public: true,
      allowedMimeTypes: ['image/*'],
      fileSizeLimit: 10485760
    })
    if (!createErr) {
      const retry = await supabase.storage.from(BUCKET).upload(fileName, file, { cacheControl: '3600', upsert: false })
      data = retry.data
      error = retry.error
    } else {
      showToast('Supabase Storage에서 "blog-images" 버킷을 Public으로 먼저 생성해주세요.')
      uploading.value = false
      event.target.value = ''
      return
    }
  }

  if (error) { showToast('업로드 실패: ' + error.message); uploading.value = false; event.target.value = ''; return }
  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path)
  insertAtCursor(`![image](${urlData.publicUrl})`)
  uploading.value = false
  event.target.value = ''
  showToast('✓ 이미지 업로드 완료')
}

// ── URL 붙여넣기 → 링크 제목 자동 변환 ──────────────────
const handlePaste = async (e) => {
  const text = e.clipboardData?.getData('text/plain')?.trim()
  if (!text) return

  // URL인지 확인
  let parsed
  try {
    parsed = new URL(text)
    if (!parsed.protocol.startsWith('http')) return
  } catch {
    return // 일반 텍스트는 기본 붙여넣기
  }

  e.preventDefault()
  fetchingLink.value = true

  try {
    const { title: pageTitle } = await $fetch(`/api/link-preview?url=${encodeURIComponent(text)}`)
    insertAtCursor(pageTitle ? `[${pageTitle}](${text})` : text)
  } catch {
    insertAtCursor(text)
  } finally {
    fetchingLink.value = false
  }
}

// ── 저장 (발행 / 수정) ────────────────────────────────
const save = async () => {
  if (!title.value.trim()) { showToast('제목을 입력해주세요.'); return }
  if (!content.value.trim()) { showToast('내용을 입력해주세요.'); return }

  publishing.value = true

  const payload = {
    title: title.value.trim(),
    content: content.value.trim(),
    category: category.value.trim() || null
  }

  if (editingPostId.value) {
    const { error } = await supabase
      .from('post')
      .update(payload)
      .eq('id', editingPostId.value)
    publishing.value = false
    if (error) { showToast('오류: ' + error.message); return }
    showToast('✓ 수정되었습니다!')
  } else {
    const { error } = await supabase
      .from('post')
      .insert(payload)
    publishing.value = false
    if (error) { showToast('오류: ' + error.message); return }
    showToast('✓ 발행되었습니다!')
  }

  await loadPosts()
  resetEditor()
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

* { box-sizing: border-box; }

/* ---- Gate ---- */
.gate-wrapper { font-family: 'Inter', sans-serif; min-height: 100vh; background: #0d0d0f; display: flex; align-items: center; justify-content: center; }
.gate-box { display: flex; flex-direction: column; align-items: center; gap: 16px; width: 320px; }
.gate-logo { font-family: 'JetBrains Mono', monospace; font-size: 2rem; color: #f5f5f7; margin: 0; letter-spacing: 0.05em; }
.gate-sub { color: #6e6e73; font-size: 0.85rem; margin: 0; letter-spacing: 0.06em; text-transform: uppercase; }
.gate-input { width: 100%; background: #1c1c1e; border: 1px solid #2a2a2e; color: #f5f5f7; border-radius: 10px; padding: 14px 16px; font-size: 1rem; font-family: inherit; outline: none; transition: border-color 0.2s; }
.gate-input:focus { border-color: #0066cc; }
.gate-btn { width: 100%; background: #0066cc; color: #fff; border: none; border-radius: 10px; padding: 14px; font-size: 0.95rem; font-weight: 700; font-family: inherit; cursor: pointer; transition: background 0.2s; }
.gate-btn:hover { background: #0055aa; }
.gate-error { color: #ff453a; font-size: 0.85rem; margin: 0; }

/* ---- Admin layout ---- */
.admin-wrapper { font-family: 'Inter', sans-serif; min-height: 100vh; background: #fafaf8; display: flex; flex-direction: column; }

/* Nav */
.admin-nav { position: sticky; top: 0; background: rgba(250, 250, 248, 0.92); backdrop-filter: blur(16px); border-bottom: 1px solid #e0e0e0; z-index: 100; }
.nav-inner { max-width: 1400px; margin: 0 auto; padding: 13px 24px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.nav-back { color: #6e6e73; text-decoration: none; font-size: 0.88rem; font-weight: 600; transition: color 0.15s; white-space: nowrap; }
.nav-back:hover { color: #0066cc; }
.nav-center { display: flex; align-items: center; gap: 8px; }
.btn-posts {
  background: #f0f0ee;
  border: 1px solid #e0e0e0;
  border-radius: 7px;
  padding: 7px 14px;
  font-size: 0.82rem;
  font-weight: 600;
  font-family: inherit;
  color: #4a4a4e;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-posts:hover, .btn-posts.active { background: #1d1d1f; color: #fff; border-color: #1d1d1f; }
.nav-mode { font-size: 0.82rem; color: #0066cc; font-weight: 600; }
.nav-actions { display: flex; align-items: center; gap: 8px; }
.btn-new { background: transparent; border: 1px solid #e0e0e0; border-radius: 7px; padding: 7px 14px; font-size: 0.82rem; font-weight: 600; font-family: inherit; color: #4a4a4e; cursor: pointer; transition: all 0.15s; }
.btn-new:hover { border-color: #aaa; color: #1d1d1f; }
.btn-publish { background: #1d1d1f; color: #fff; border: none; border-radius: 8px; padding: 9px 20px; font-size: 0.88rem; font-weight: 700; font-family: inherit; cursor: pointer; transition: background 0.2s, opacity 0.2s; white-space: nowrap; }
.btn-publish:hover { background: #0066cc; }
.btn-publish:disabled { opacity: 0.5; cursor: not-allowed; }

/* Posts panel */
.posts-panel {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  padding: 0 24px;
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
}
.posts-empty { padding: 20px 0; color: #8a8a8e; font-size: 0.9rem; }
.post-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid #f0f0ee;
  gap: 16px;
  transition: background 0.1s;
}
.post-row:last-child { border-bottom: none; }
.post-row--active { background: #f0f7ff; margin: 0 -24px; padding: 14px 24px; }
.post-row-info { flex: 1; min-width: 0; }
.post-row-title { font-size: 0.92rem; font-weight: 600; color: #1d1d1f; margin: 0 0 3px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.post-row-date { font-size: 0.75rem; color: #8a8a8e; font-family: 'JetBrains Mono', monospace; }
.post-row-actions { display: flex; gap: 6px; flex-shrink: 0; }
.row-btn { border: 1px solid #e0e0e0; border-radius: 6px; padding: 5px 12px; font-size: 0.8rem; font-weight: 600; font-family: inherit; cursor: pointer; transition: all 0.15s; }
.row-btn--edit { background: #f0f7ff; border-color: #b8d4f0; color: #0055aa; }
.row-btn--edit:hover { background: #0066cc; color: #fff; border-color: #0066cc; }
.row-btn--delete { background: #fff0f0; border-color: #f0c0c0; color: #c0392b; }
.row-btn--delete:hover { background: #c0392b; color: #fff; border-color: #c0392b; }

/* Editor main */
.editor-main { flex: 1; display: flex; flex-direction: column; max-width: 1400px; width: 100%; margin: 0 auto; padding: 28px 24px 24px; gap: 12px; }
.title-input { width: 100%; font-size: 1.8rem; font-weight: 800; font-family: inherit; color: #111; background: transparent; border: none; border-bottom: 2px solid #e0e0e0; padding: 8px 0 14px; outline: none; letter-spacing: -0.03em; transition: border-color 0.2s; }
.title-input:focus { border-color: #0066cc; }
.title-input::placeholder { color: #c0c0c0; }
.category-row { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid #e0e0e0; }
.category-prefix { font-size: 0.76rem; font-weight: 700; color: #8a8a8e; font-family: 'JetBrains Mono', monospace; letter-spacing: 0.06em; white-space: nowrap; }
.category-input { flex: 1; font-size: 0.9rem; font-family: inherit; color: #2c2c2e; background: transparent; border: none; outline: none; }
.category-input::placeholder { color: #c8c8c8; }

/* Link fetch indicator */
.write-pane { position: relative; }
.fetch-indicator {
  position: absolute;
  bottom: 12px;
  left: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: #8a8a8e;
  background: rgba(250,250,248,0.92);
  padding: 5px 10px;
  border-radius: 20px;
  border: 1px solid #e0e0e0;
  pointer-events: none;
}
.fetch-dot {
  width: 7px;
  height: 7px;
  background: #0066cc;
  border-radius: 50%;
  animation: pulse 1s infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

/* Toolbar */
.toolbar { display: flex; align-items: center; gap: 6px; padding: 8px 12px; background: #f4f4f2; border: 1px solid #e0e0e0; border-radius: 10px; flex-wrap: wrap; }
.toolbar-group { display: flex; gap: 4px; }
.toolbar-sep { width: 1px; height: 20px; background: #d8d8d8; margin: 0 4px; }
.tb-btn { background: #fff; border: 1px solid #e0e0e0; border-radius: 6px; padding: 5px 10px; font-size: 0.82rem; font-family: 'Inter', sans-serif; color: #3a3a3e; cursor: pointer; transition: background 0.15s, border-color 0.15s; line-height: 1; }
.tb-btn:hover { background: #e8e8ff; border-color: #0066cc; color: #0066cc; }
.tb-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.tb-mono { font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; }
.tb-image { background: #f0f7ff; border-color: #b8d4f0; color: #0055aa; font-weight: 600; }
.tb-image:hover { background: #dceeff; }

/* Editor split */
.editor-split { flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; min-height: calc(100vh - 270px); }
.pane { display: flex; flex-direction: column; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; background: #fff; }
.pane-label { padding: 10px 16px; font-size: 0.76rem; font-weight: 700; color: #8a8a8e; letter-spacing: 0.08em; text-transform: uppercase; background: #f7f7f5; border-bottom: 1px solid #e0e0e0; font-family: 'JetBrains Mono', monospace; }
.markdown-textarea { flex: 1; width: 100%; padding: 20px; font-family: 'JetBrains Mono', monospace; font-size: 0.9rem; line-height: 1.7; color: #2c2c2e; background: #fff; border: none; resize: none; outline: none; tab-size: 2; }
.markdown-textarea::placeholder { color: #c0c0c0; }
.preview-pane { overflow-y: auto; }
.preview-body { padding: 20px 24px; font-size: 0.95rem; line-height: 1.8; color: #2c2c2e; }

/* Markdown preview */
:deep(.markdown-preview h1) { font-size: 1.6rem; font-weight: 800; letter-spacing: -0.03em; margin: 1.5em 0 0.5em; border-bottom: 1px solid #e0e0e0; padding-bottom: 0.3em; }
:deep(.markdown-preview h2) { font-size: 1.25rem; font-weight: 700; margin: 1.4em 0 0.4em; }
:deep(.markdown-preview h3) { font-size: 1.05rem; font-weight: 700; margin: 1.2em 0 0.4em; }
:deep(.markdown-preview p) { margin-bottom: 1.2em; }
:deep(.markdown-preview a) { color: #0066cc; text-decoration: underline; text-underline-offset: 3px; }
:deep(.markdown-preview strong) { font-weight: 700; }
:deep(.markdown-preview em) { font-style: italic; }
:deep(.markdown-preview ul), :deep(.markdown-preview ol) { padding-left: 1.5em; margin-bottom: 1.2em; }
:deep(.markdown-preview li) { margin-bottom: 0.4em; }
:deep(.markdown-preview blockquote) { border-left: 3px solid #0066cc; margin: 1.2em 0; padding: 0.4em 0 0.4em 1em; color: #6e6e73; font-style: italic; }
:deep(.markdown-preview code) { font-family: 'JetBrains Mono', monospace; background: #f0f0f2; color: #c0392b; padding: 2px 7px; border-radius: 4px; font-size: 0.85em; }
:deep(.markdown-preview pre) { background: #1a1a1e; color: #e8e8ed; padding: 18px 20px; border-radius: 10px; overflow-x: auto; margin: 1.4em 0; font-size: 0.85rem; line-height: 1.7; border: 1px solid #2a2a2e; }
:deep(.markdown-preview pre code) { background: none !important; color: #e8e8ed !important; padding: 0; border-radius: 0; font-size: inherit; }
:deep(.markdown-preview img) { max-width: 100%; border-radius: 8px; margin: 16px 0; display: block; }
:deep(.markdown-preview hr) { border: none; border-top: 1px solid #e0e0e0; margin: 1.5em 0; }
:deep(.markdown-preview .mermaid-block) { margin: 1.5em 0; text-align: center; overflow-x: auto; }
:deep(.markdown-preview .mermaid-block svg) { max-width: 100%; height: auto; border-radius: 8px; }
:deep(.markdown-preview table) { width: 100%; border-collapse: collapse; margin: 1.2em 0; font-size: 0.9em; }
:deep(.markdown-preview th) { background: #f4f4f2; font-weight: 700; padding: 8px 12px; border: 1px solid #e0e0e0; text-align: left; }
:deep(.markdown-preview td) { padding: 8px 12px; border: 1px solid #e0e0e0; }

/* Link Dialog */
.dialog-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 200; }
.dialog-box { background: #fff; border-radius: 14px; padding: 28px 28px 24px; width: 380px; box-shadow: 0 8px 40px rgba(0,0,0,0.18); display: flex; flex-direction: column; gap: 12px; }
.dialog-title { font-size: 1rem; font-weight: 700; color: #111; margin: 0; }
.dialog-input { border: 1px solid #e0e0e0; border-radius: 8px; padding: 10px 14px; font-size: 0.9rem; font-family: inherit; outline: none; transition: border-color 0.15s; }
.dialog-input:focus { border-color: #0066cc; }
.dialog-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 4px; }
.dialog-cancel { background: #f0f0f0; border: none; border-radius: 7px; padding: 9px 16px; font-size: 0.85rem; font-weight: 600; font-family: inherit; cursor: pointer; color: #3a3a3e; }
.dialog-cancel:hover { background: #e4e4e4; }
.dialog-confirm { background: #0066cc; color: #fff; border: none; border-radius: 7px; padding: 9px 18px; font-size: 0.85rem; font-weight: 700; font-family: inherit; cursor: pointer; }
.dialog-confirm:hover { background: #0055aa; }

/* Toast */
.toast { position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%); background: #1d1d1f; color: #fff; padding: 12px 24px; border-radius: 24px; font-size: 0.9rem; font-weight: 600; box-shadow: 0 4px 20px rgba(0,0,0,0.2); animation: fadeUp 0.2s ease; z-index: 999; }
@keyframes fadeUp {
  from { opacity: 0; transform: translateX(-50%) translateY(8px); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0); }
}

/* Mobile */
@media (max-width: 768px) {
  .editor-split { grid-template-columns: 1fr; min-height: auto; }
  .write-pane { min-height: 50vh; }
  .preview-pane { min-height: 40vh; }
  .title-input { font-size: 1.4rem; }
  .dialog-box { width: calc(100vw - 48px); }
}
</style>
