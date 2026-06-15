import { createApp, ref } from 'vue';

const LoginPage = {
  setup() {
    const username = ref('admin');
    const password = ref('password');
    const statusMessage = ref('');

    function handleSubmit() {
      statusMessage.value = 'Ready to sign in with admin credentials.';
    }

    return { username, password, statusMessage, handleSubmit };
  },
  template: `
    <main class="login-shell" aria-labelledby="login-title">
      <a class="home-link" href="/" aria-label="Back to home">
        <span aria-hidden="true">←</span>
        <span>Back to Home</span>
      </a>

      <section class="login-card">
        <header class="login-card__hero">
          <div class="gram-logo" aria-label="GRAM">GRAM</div>
          <h1 id="login-title">Admin Login</h1>
          <p>Gram SCS IT Department</p>
        </header>

        <form class="login-form" @submit.prevent="handleSubmit">
          <label class="field-group" for="admin-username">
            <span>Username</span>
            <input id="admin-username" v-model="username" name="username" autocomplete="username" />
          </label>

          <label class="field-group" for="admin-password">
            <span>Password</span>
            <input id="admin-password" v-model="password" name="password" type="password" autocomplete="current-password" />
          </label>

          <button class="signin-button" type="submit">Sign In</button>
          <p v-if="statusMessage" class="form-status" role="status">{{ statusMessage }}</p>
        </form>
      </section>
    </main>
  `,
};

const HomePage = {
  template: `
    <main class="home-shell">
      <h1>Admin Panel Dashboard</h1>
      <a class="home-login-button" href="/auth/login">Open admin login</a>
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
