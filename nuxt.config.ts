// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxt/ui", "@vueuse/nuxt"],
  css: ["~/assets/css/main.css"],
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: "2025-07-15",
  runtimeConfig: {
    twelveDataApiKey: "", // overridden by NUXT_TWELVE_DATA_API_KEY
  },
  devtools: { enabled: true },
});
