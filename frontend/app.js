import { createApp, ref } from 'vue';

const LoginPage = {
  setup() {
    const username = ref('');
    const password = ref('');
    const statusMessage = ref('');

    async function handleSubmit() {
      if (!username.value || !password.value) {
        statusMessage.value = 'Enter both a username and password to continue.';
        return;
      }

      statusMessage.value = 'Signing in…';
      try {
        const response = await fetch('/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: username.value, password: password.value }),
        });
        const payload = await response.json().catch(() => ({}));
        statusMessage.value = response.ok
          ? (payload.message ?? 'Login successful')
          : (payload.message ?? payload.error?.message ?? 'Invalid username or password');
      } catch (_error) {
        statusMessage.value = 'Unable to reach the login API. Please try again.';
      }
    }

    return { username, password, statusMessage, handleSubmit };
  },
  template: `
    <main class="login-shell" aria-labelledby="login-title">
      <div class="login-orb login-orb--large" aria-hidden="true"></div>
      <div class="login-orb login-orb--small" aria-hidden="true"></div>

      <a class="login-back" href="/" aria-label="Back to home">
        <span aria-hidden="true">←</span>
        <span>Back to Home</span>
      </a>

      <section class="login-card">
        <aside class="login-card__brand" aria-label="Gram SCS IT Department">
          <div class="login-logo" aria-label="GRAM">GRAM</div>
          <p class="login-eyebrow">Secure Admin Portal</p>
          <h1 id="login-title">Welcome back</h1>
          <p class="login-copy">Sign in with your administrator username and password to access the dashboard.</p>
        </aside>

        <form class="login-form" action="/api/v1/auth/login" method="post" @submit.prevent="handleSubmit">
          <div class="login-form__header">
            <p class="login-eyebrow">Account Login</p>
            <h2>Enter your credentials</h2>
          </div>

          <label class="login-field" for="admin-username">
            <span>Username</span>
            <input
              id="admin-username"
              v-model="username"
              name="username"
              type="text"
              placeholder="Enter username"
              autocomplete="username"
              required
            />
          </label>

          <label class="login-field" for="admin-password">
            <span>Password</span>
            <input
              id="admin-password"
              v-model="password"
              name="password"
              type="password"
              placeholder="Enter password"
              autocomplete="current-password"
              required
            />
          </label>

          <button class="login-button" type="submit">Sign in</button>
          <p v-if="statusMessage" class="login-status" role="status">{{ statusMessage }}</p>
        </form>
      </section>
    </main>
  `,
};

const HomePage = {
  template: `
    <main class="grid min-h-screen place-content-center gap-6 bg-[#071c20] p-6 text-center text-[#f6fbfb]">
      <h1 class="text-4xl font-extrabold">Admin Panel Dashboard</h1>
      <a class="inline-flex justify-center rounded-full bg-[#98e14a] px-5 py-3.5 font-extrabold text-[#08150d] no-underline" href="/auth/login">Open admin login</a>
    </main>
  `,
};

const App = {
  components: { LoginPage, HomePage },
  computed: {
    isLoginRoute() {
      return window.location.pathname.replace(/\/$/, '') === '/auth/login';
    },
  },
  template: '<LoginPage v-if="isLoginRoute" /><HomePage v-else />',
};

createApp(App).mount('#app');
