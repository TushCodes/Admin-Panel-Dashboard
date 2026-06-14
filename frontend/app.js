const { createApp, computed, ref } = Vue;

createApp({
  setup() {
    const apiUrl = ref('http://localhost:3000/health');
    const loading = ref(false);
    const result = ref({ message: 'Waiting for a request...' });
    const status = ref('idle');

    const routes = [
      { name: 'Login', method: 'POST', path: '/login', description: 'Validate credentials with zod and return a session token payload.' },
      { name: 'Logout', method: 'POST', path: '/logout', description: 'Provide an explicit logout endpoint for clients to clear their session.' },
      { name: 'Consignments', method: 'GET/POST/PATCH', path: '/consignments', description: 'List, create, read, and update consignment records.' },
      { name: 'Leads', method: 'GET/POST/PATCH', path: '/leads', description: 'Capture and manage lead details submitted by customers.' },
      { name: 'Archived', method: 'GET/POST', path: '/archived/consignments', description: 'List archived consignments and archive or restore records.' },
    ];

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

    return { apiUrl, checkBackend, formattedResult, loading, routes, statusBadgeClass, statusLabel };
  },
}).mount('#app');
