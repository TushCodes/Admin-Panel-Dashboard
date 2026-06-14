import { errorPages } from './errors/error-pages.js';
import { routes } from './routes/index.js';

const { createApp, computed, ref } = Vue;

createApp({
  setup() {
    const apiUrl = ref('http://localhost:3000/health');
    const loading = ref(false);
    const result = ref({ message: 'Waiting for a request...' });
    const status = ref('idle');

    const formattedResult = computed(() => JSON.stringify(result.value, null, 2));
    const statusLabel = computed(() => ({ idle: 'Ready', loading: 'Checking', ok: 'Online', error: 'Offline' }[status.value]));
    const statusBadgeClass = computed(() => ({
      idle: 'bg-slate-100 text-slate-700',
      loading: 'bg-amber-100 text-amber-800',
      ok: 'bg-emerald-100 text-emerald-800',
      error: 'bg-rose-100 text-rose-800',
    }[status.value]));

    async function checkBackend() {
      const url = apiUrl.value.trim();
      loading.value = true;
      status.value = 'loading';
      result.value = { message: `Requesting ${url} ...` };

      try {
        const response = await fetch(url, { headers: { Accept: 'application/json' } });
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

    return { apiUrl, checkBackend, errorPages, formattedResult, loading, routes, statusBadgeClass, statusLabel };
  },
}).mount('#app');
