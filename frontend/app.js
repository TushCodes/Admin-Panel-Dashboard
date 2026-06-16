import { createApp, ref } from 'vue';

import { adminLoginPageRoute, adminRoute } from './routes/auth.js';
import { AdminWelcomePage, ConsignmentTestPage, HomePage, LoginPage, adminSections } from './pages/index.js';

const App = {
  components: { AdminWelcomePage, ConsignmentTestPage, HomePage, LoginPage },
  setup() {
    const path = ref(window.location.pathname.replace(/\/$/, '') || '/');
    window.addEventListener('popstate', () => { path.value = window.location.pathname.replace(/\/$/, '') || '/'; });
    return { adminLoginPageRoute, adminRoute, path };
  },
  computed: { isAdminRoute() { return Object.values(adminSections).some((route) => route.path === this.path); } },
  template: '<LoginPage v-if="path === adminLoginPageRoute.path" /><ConsignmentTestPage v-else-if="path === \'/consignment-test\'" /><AdminWelcomePage v-else-if="isAdminRoute" :route-path="path" /><HomePage v-else />',
};

createApp(App).mount('#app');
