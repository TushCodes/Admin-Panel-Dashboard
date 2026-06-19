import { adminRoute } from '../routes.js';
import { LoginCard } from '../components/LoginCard.js';

export const LoginPage = {
  components: { LoginCard },
  setup() { return { handleSubmit: () => window.location.assign(adminRoute.path) }; },
  template: `<main class="login-page" aria-labelledby="login-title"><a href="/">← Back to home</a><LoginCard @submit="handleSubmit" /></main>`,
};
