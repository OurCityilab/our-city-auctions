// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-08-13',
  devtools: { enabled: true },
  ssr: true, // Server-side rendering for better SEO and initial load
  nitro: {
    preset: 'vercel'
  },
  
  app: {
    head: {
      title: 'Our City Auctions - Real Estate Auction Simulator',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: 'Educational Wayne County real estate auction simulation game teaching property valuation and strategic bidding' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ],
    }
  },

  modules: [
    '@nuxt/ui',
    '@nuxtjs/tailwindcss',
    '@nuxt/eslint', 
    '@nuxt/icon', 
    '@pinia/nuxt',
    '@vueuse/nuxt'
  ],

  // Auto-imports configuration
  imports: {
    dirs: ['stores', 'utils', 'types']
  },
  
  ui: {
    global: true,
    icons: ['heroicons', 'mdi']
  },

  runtimeConfig: {
    // Private keys (server-only)
    sessionSecret: process.env.SESSION_SECRET || 'dev-secret-key',
    
    // Public config
    public: {
      appName: 'Our City Auctions',
      version: '1.0.0',
      supportEmail: 'support@ourcityauctions.edu',
      maxStudentsPerSession: parseInt(process.env.MAX_STUDENTS) || 30,
      defaultSessionDuration: parseInt(process.env.SESSION_DURATION) || 3600, // 1 hour
      enableDebugMode: process.env.NODE_ENV === 'development'
    }
  },

  // Additional route rules
  routeRules: {
    '/student/**': { ssr: false }, // Client-side for real-time features
    '/moderator/**': { ssr: false },
    '/projection/**': { ssr: false },
    '/api/**': { cors: true }
  },

  // Build optimizations
  build: {
    transpile: ['seedrandom'],
    terserOptions: {
      mangle: {
        reserved: ['h', 'String', 'global', 'window', 'seedrandom']
      },
      compress: {
        drop_console: false,  // Keep console logs for debugging
        drop_debugger: true
      }
    }
  },

  // Development configuration
  vite: {
    define: {
      __DEV__: process.env.NODE_ENV === 'development'
    },
    optimizeDeps: {
      include: ['seedrandom']
    }
  },

  // TypeScript configuration - disabled for initial deployment
  typescript: {
    strict: false,
    typeCheck: false
  },

  // ESLint configuration
  eslint: {
    config: {
      stylistic: true
    }
  }
})