import { errorPages } from './error-pages.js';

const { createApp, computed } = Vue;

const codeFromPath = window.location.pathname.match(/(\d{3})(?:\.html)?$/)?.[1] ?? '404';

createApp({
  setup() {
    const page = computed(() => errorPages.find((errorPage) => errorPage.code === codeFromPath) ?? errorPages[0]);
    const relatedPages = computed(() => errorPages.filter((errorPage) => errorPage.code !== page.value.code));

    return { page, relatedPages };
  },
}).mount('#app');
