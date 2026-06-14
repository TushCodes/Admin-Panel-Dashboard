import { computed, createApp, ref } from 'vue';

import { errorPages } from './errors/error-pages.js';
import { routes } from './routes/index.js';

const savedApiUrl = localStorage.getItem('apiUrl');
const savedSession = JSON.parse(localStorage.getItem('adminSession') ?? 'null');
const defaultApiUrl = window.API_URL ?? 'http://localhost:3000';

createApp({
  setup() {
    const apiBaseUrl = ref(savedApiUrl ?? defaultApiUrl);
    const apiUrl = computed(() => `${apiBaseUrl.value.replace(/\/$/, '')}/health`);
    const loading = ref(false);
    const result = ref({ message: 'Waiting for a request...' });
    const status = ref('idle');
    const adminId = ref('');
    const adminPassword = ref('');
    const authMessage = ref('Enter the admin ID and password configured on the server.');
    const authLoading = ref(false);
    const session = ref(savedSession);

    const formattedResult = computed(() => JSON.stringify(result.value, null, 2));
    const statusLabel = computed(() => ({ idle: 'Ready', loading: 'Checking', ok: 'Online', error: 'Offline' }[status.value]));
    const statusBadgeClass = computed(() => ({
      idle: 'bg-slate-100 text-slate-700',
      loading: 'bg-amber-100 text-amber-800',
      ok: 'bg-emerald-100 text-emerald-800',
      error: 'bg-rose-100 text-rose-800',
    }[status.value]));
    const signedInId = computed(() => session.value?.user?.id ?? 'Admin');

    function endpoint(path) {
      return `${apiBaseUrl.value.trim().replace(/\/$/, '')}${path}`;
    }

    async function login() {
      authLoading.value = true;
      authMessage.value = 'Checking credentials…';
      try {
        const response = await fetch(endpoint('/auth/login'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ id: adminId.value, password: adminPassword.value }),
        });
        const body = await response.json();
        if (!response.ok) throw new Error(body?.error?.message ?? 'Login failed.');
        session.value = { user: body.user, token: body.session.token, expiresAt: body.session.expiresAt };
        localStorage.setItem('adminSession', JSON.stringify(session.value));
        localStorage.setItem('apiUrl', apiBaseUrl.value.trim());
        adminPassword.value = '';
        authMessage.value = `Signed in until ${new Date(body.session.expiresAt).toLocaleString()}.`;
      } catch (error) {
        session.value = null;
        localStorage.removeItem('adminSession');
        authMessage.value = error instanceof Error ? error.message : String(error);
      } finally {
        authLoading.value = false;
      }
    }

    function signOut() {
      session.value = null;
      localStorage.removeItem('adminSession');
      authMessage.value = 'You are signed out.';
    }

    async function checkBackend() {
      const url = apiUrl.value;
      loading.value = true;
      status.value = 'loading';
      result.value = { message: `Requesting ${url} ...` };

      try {
        const headers = { Accept: 'application/json' };
        if (session.value?.token) headers.Authorization = `Bearer ${session.value.token}`;
        const response = await fetch(url, { headers });
        const body = await response.json();
        status.value = response.ok ? 'ok' : 'error';
        result.value = { ok: response.ok, status: response.status, body };
      } catch (error) {
        status.value = 'error';
        result.value = {
          ok: false,
          message: 'Request failed. If the API is running, confirm CORS allows this frontend origin.',
          error: error instanceof Error ? error.message : String(error),
        };
      } finally {
        loading.value = false;
      }
    }

    return { adminId, adminPassword, apiBaseUrl, apiUrl, authLoading, authMessage, checkBackend, errorPages, formattedResult, loading, login, routes, session, signOut, signedInId, statusBadgeClass, statusLabel };
  },
}).mount('#app');
