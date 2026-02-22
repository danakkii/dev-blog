// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  
  // 1. Supabase 모듈 사용한다고 알려주기
  modules: ['@nuxtjs/supabase'],

  // 2. Supabase 설정 (포트폴리오니까 강제 로그인 기능 끄기)
  supabase: {
    redirect: false
  }
})