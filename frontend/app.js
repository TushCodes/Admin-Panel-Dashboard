import { createApp, ref } from 'vue';

import { adminLoginPageRoute, adminRoute } from './routes/auth.js';
import { AdminWelcomePage, ConsignmentTestPage, HomePage, LoginPage, adminSections } from './pages/index.js';

const App = {
  components: { AdminWelcomePage, ConsignmentTestPage, HomePage, LoginPage },
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

    return { adminLoginPageRoute, adminRoute, path, navigate };
  },
  computed: { isAdminRoute() { return Object.values(adminSections).some((route) => route.path === this.path); } },
  template: '<LoginPage v-if="path === adminLoginPageRoute.path" /><ConsignmentTestPage v-else-if="path === \'/consignment-test\'" /><AdminWelcomePage v-else-if="isAdminRoute" :route-path="path" @navigate="navigate" /><HomePage v-else />',
};

createApp(App).mount('#app');
