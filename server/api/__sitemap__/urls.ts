import { createClient } from '@supabase/supabase-js'

export default defineSitemapEventHandler(async () => {
  const config = useRuntimeConfig()
  const supabase = createClient(
    config.public.supabase.url,
    config.public.supabase.key
  )

  const { data: posts } = await supabase
    .from('post')
    .select('id, created_at')
    .order('created_at', { ascending: false })

  const postUrls = (posts || []).map((post) => ({
    loc: `/posts/${post.id}`,
    lastmod: post.created_at,
  }))

  return [
    { loc: '/' },
    { loc: '/blog' },
    ...postUrls,
  ]
})
