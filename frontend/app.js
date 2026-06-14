import { Auth } from 'https://esm.sh/@supa-kit/auth-ui-vue@0.4.0?external=vue';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { ThemeSupa } from 'https://esm.sh/@supabase/auth-ui-shared@0.1.8';
import { computed, createApp, ref, shallowRef } from 'vue';

import { errorPages } from './errors/error-pages.js';
import { routes } from './routes/index.js';

const savedConfig = JSON.parse(localStorage.getItem('supabaseConfig') ?? '{}');
const defaultConfig = window.SUPABASE_CONFIG ?? {};

createApp({
  components: { Auth },
  setup() {
    const apiUrl = ref('http://localhost:3000/health');
    const loading = ref(false);
    const result = ref({ message: 'Waiting for a request...' });
    const status = ref('idle');
    const supabaseUrl = ref(savedConfig.url ?? defaultConfig.url ?? '');
    const supabaseAnonKey = ref(savedConfig.anonKey ?? defaultConfig.anonKey ?? '');
    const authMessage = ref('Add your Supabase project URL and anon key to initialize the hosted auth widget.');
    const authLoading = ref(false);
    const session = ref(null);
    const supabaseClient = shallowRef(null);
    const authProviders = ['google', 'github'];
    const authAppearance = {
      theme: ThemeSupa,
      variables: {
        default: {
          colors: {
            brand: '#2563eb',
            brandAccent: '#1d4ed8',
          },
        },
      },
    };

    const formattedResult = computed(() => JSON.stringify(result.value, null, 2));
    const statusLabel = computed(() => ({ idle: 'Ready', loading: 'Checking', ok: 'Online', error: 'Offline' }[status.value]));
    const statusBadgeClass = computed(() => ({
      idle: 'bg-slate-100 text-slate-700',
      loading: 'bg-amber-100 text-amber-800',
      ok: 'bg-emerald-100 text-emerald-800',
      error: 'bg-rose-100 text-rose-800',
    }[status.value]));
    const supabaseConfigured = computed(() => Boolean(supabaseClient.value));
    const signedInEmail = computed(() => session.value?.user?.email ?? 'Authenticated user');

    async function configureSupabase() {
      const url = supabaseUrl.value.trim();
      const anonKey = supabaseAnonKey.value.trim();
      if (!url || !anonKey) {
        authMessage.value = 'Supabase URL and anon key are required before the auth UI can be shown.';
        return;
      }

      authLoading.value = true;
      try {
        const client = createClient(url, anonKey);
        supabaseClient.value = client;
        localStorage.setItem('supabaseConfig', JSON.stringify({ url, anonKey }));
        const { data, error } = await client.auth.getSession();
        if (error) throw error;
        session.value = data.session;
        client.auth.onAuthStateChange((_event, currentSession) => {
          session.value = currentSession;
          authMessage.value = currentSession ? 'You are signed in with Supabase Auth.' : 'You are signed out.';
        });
        authMessage.value = session.value ? 'You are signed in with Supabase Auth.' : 'Supabase Auth UI is ready.';
      } catch (error) {
        supabaseClient.value = null;
        session.value = null;
        authMessage.value = error instanceof Error ? error.message : String(error);
      } finally {
        authLoading.value = false;
      }
    }

    async function signOut() {
      if (!supabaseClient.value) return;
      authLoading.value = true;
      const { error } = await supabaseClient.value.auth.signOut();
      authLoading.value = false;
      if (error) {
        authMessage.value = error.message;
        return;
      }
      session.value = null;
      authMessage.value = 'You are signed out.';
    }

    async function checkBackend() {
      const url = apiUrl.value.trim();
      loading.value = true;
      status.value = 'loading';
      result.value = { message: `Requesting ${url} ...` };

      try {
        const headers = { Accept: 'application/json' };
        if (session.value?.access_token) headers.Authorization = `Bearer ${session.value.access_token}`;
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

    if (supabaseUrl.value && supabaseAnonKey.value) configureSupabase();

    return { apiUrl, authAppearance, authLoading, authMessage, authProviders, checkBackend, configureSupabase, errorPages, formattedResult, loading, routes, session, signOut, signedInEmail, statusBadgeClass, statusLabel, supabaseAnonKey, supabaseClient, supabaseConfigured, supabaseUrl };
  },
}).mount('#app');
