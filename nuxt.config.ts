// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  modules: ['@nuxtjs/supabase'],

  supabase: {
    redirect: false
  },

  css: ['highlight.js/styles/atom-one-dark.css']
})