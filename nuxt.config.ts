// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  modules: ['@nuxtjs/supabase', '@nuxtjs/sitemap'],

  supabase: {
    redirect: false
  },

  css: ['highlight.js/styles/atom-one-dark.css'],

  site: {
    url: 'https://dana-kim.vercel.app',
    name: 'Dana Kim'
  },

  sitemap: {
    sources: ['/api/__sitemap__/urls']
  },

  app: {
    head: {
      meta: [
        { name: 'google-site-verification', content: 'L6iQ7iU4IqpHPMMUPKvvEhAxJrfY0rYUctmrOEqU1Oc' }
      ]
    }
  }
})