import { createApp, ref } from 'vue';

import { AdminWelcomePage, HomePage, LoginPage, adminSections } from './pages/index.js';
import { adminLoginPageRoute } from './routes.js';

const App = {
  components: { AdminWelcomePage, HomePage, LoginPage },
  setup() {
    const normalizePath = (value) => value.replace(/\/$/, '') || '/';
    const path = ref(normalizePath(window.location.pathname));

    function navigate(nextPath) {
      const normalizedPath = normalizePath(nextPath);
      if (normalizedPath !== path.value) {
        window.history.pushState({}, '', normalizedPath);
        path.value = normalizedPath;
      }
    }

    return { adminLoginPageRoute, path, navigate };
  },
  computed: { isAdminRoute() { return Object.values(adminSections).some((route) => route.path === this.path); } },
  template: '<LoginPage v-if="path === adminLoginPageRoute.path" /><AdminWelcomePage v-else-if="isAdminRoute" :route-path="path" @navigate="navigate" /><HomePage v-else />',
};

createApp(App).mount('#app');
