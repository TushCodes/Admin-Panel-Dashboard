import { createApp, computed, ref } from 'vue';

import { adminLoginPageRoute, adminRoute } from './routes/auth.js';

const adminSections = {
  dashboard: { path: '/admin', title: 'Dashboard', label: 'Dashboard', icon: '⌁' },
  consignments: { path: '/admin/consignments', title: 'Consignments', label: 'Consignments', icon: '▣' },
  leads: { path: '/admin/lead', title: 'Leads', label: 'Leads', icon: '♚' },
  documents: { path: '/admin/documents', title: 'Documents', label: 'Documents', icon: '☷' },
  archived: { path: '/admin/archived', title: 'Archive', label: 'Archive', icon: '◴' },
};

const apiPaths = {
  consignments: '/consignments',
  leads: '/leads',
  documents: '/documents',
  archived: '/archived/consignments',
};

const LoginPage = {
  setup() {
    function handleSubmit() {
      window.location.assign(adminRoute.path);
    }

    return { handleSubmit };
  },
  template: `
    <main class="relative grid min-h-screen overflow-hidden bg-[radial-gradient(circle_at_18%_18%,rgba(169,236,84,0.18),transparent_26%),linear-gradient(135deg,#0c3023_0%,#061b20_48%,#082830_100%)] px-6 py-10 text-[#f6fbfb]" aria-labelledby="login-title">
      <div class="pointer-events-none absolute -left-24 top-12 h-72 w-72 rounded-full bg-[rgba(169,236,84,0.20)] blur-3xl" aria-hidden="true"></div>
      <div class="pointer-events-none absolute -right-20 bottom-10 h-56 w-56 rounded-full bg-[rgba(74,195,160,0.16)] blur-3xl" aria-hidden="true"></div>
      <a class="relative z-10 mb-8 inline-flex w-fit items-center gap-3 rounded-full border border-[rgba(202,222,216,0.18)] bg-[rgba(13,34,39,0.72)] px-5 py-3 font-bold text-[#d6e2df] no-underline shadow-[0_18px_34px_rgba(0,0,0,0.20)]" href="/" aria-label="Back to home"><span aria-hidden="true">←</span><span>Back to Home</span></a>
      <section class="relative z-10 mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl border border-[rgba(202,222,216,0.18)] bg-[rgba(13,34,39,0.82)] shadow-[0_28px_80px_rgba(0,0,0,0.28)] lg:grid-cols-[1fr_1.05fr]">
        <aside class="flex flex-col justify-center gap-6 p-8 sm:p-12" aria-label="Gram SCS IT Department"><div class="grid h-24 w-24 place-items-center rounded-[28px] border-[7px] border-[#a2f15f] bg-[linear-gradient(135deg,#8dde42_0%,#65b43d_52%,#9ced5e_100%)] text-2xl font-black tracking-[-0.14em] text-white [border-style:ridge] [text-shadow:0_2px_0_rgba(42,122,36,0.65)]" aria-label="GRAM">GRAM</div><p class="text-sm font-extrabold uppercase tracking-[0.24em] text-[#a9ec54]">Secure Admin Portal</p><h1 id="login-title" class="text-[clamp(2.5rem,5vw,4.5rem)] font-black leading-none tracking-[-0.04em]">Welcome back</h1><p class="max-w-md text-[1.08rem] leading-7 text-[rgba(221,235,230,0.76)]">Open the standalone admin frontend. No backend authentication is required.</p></aside>
        <form class="grid gap-6 bg-[rgba(244,251,247,0.96)] p-8 text-[#0d1a16] sm:p-12" @submit.prevent="handleSubmit"><div class="grid gap-2"><p class="text-sm font-extrabold uppercase tracking-[0.22em] text-[#76bd37]">Standalone Login</p><h2 class="text-3xl font-black tracking-[-0.04em]">Continue to dashboard</h2></div><button class="rounded-full bg-[linear-gradient(100deg,#8bd938,#b8ed74)] px-6 py-4 font-black text-[#08150d] shadow-[0_18px_34px_rgba(116,212,59,0.18)] hover:brightness-105 focus-visible:brightness-105 disabled:cursor-not-allowed disabled:opacity-70" type="submit">Continue</button></form>
      </section>
    </main>
  `,
};

const ResourcePanel = {
  props: { section: { type: String, required: true } },
  setup(props) {
    const items = ref([]);
    const loading = ref(false);
    const error = ref('');
    const config = computed(() => ({
      consignments: { eyebrow: 'Operations', title: 'Consignment Sheet', description: 'View and manage active consignment records.', columns: ['Consignment #', 'Status', 'Pickup', 'Drop'], fields: ['consignmentNum', 'status', 'pickupAddress', 'dropAddress'] },
      leads: { eyebrow: 'Sales', title: 'Leads Panel', description: 'Review customer enquiries and contact details.', columns: ['ID', 'Name', 'Phone', 'Subject'], fields: ['id', 'name', 'phone', 'subject'] },
      documents: { eyebrow: 'Files', title: 'Documents', description: 'Track uploaded document references.', columns: ['ID', 'Document upload'], fields: ['id', 'documentUpload'] },
      archived: { eyebrow: 'Archive', title: 'Archived Consignments', description: 'View archived consignment records.', columns: ['Consignment #', 'Status', 'Pickup', 'Drop'], fields: ['consignmentNum', 'status', 'pickupAddress', 'dropAddress'] },
    }[props.section]));

    async function loadItems() {
      loading.value = true;
      error.value = '';
      try {
        const response = await fetch(apiPaths[props.section]);
        if (!response.ok) throw new Error(`Request failed with ${response.status}`);
        const payload = await response.json();
        items.value = payload.data ?? [];
      } catch (err) {
        error.value = err.message;
      } finally {
        loading.value = false;
      }
    }

    loadItems();
    return { config, items, loading, error, loadItems };
  },
  template: `
    <section class="admin-panel-card" :aria-labelledby="section + '-title'">
      <div class="admin-panel-header">
        <div><p class="admin-eyebrow">{{ config.eyebrow }}</p><h2 :id="section + '-title'">{{ config.title }}</h2><p>{{ config.description }}</p></div>
        <button class="admin-refresh-button" type="button" @click="loadItems">Refresh</button>
      </div>
      <p v-if="loading" class="admin-state-text">Loading {{ config.title.toLowerCase() }}…</p>
      <p v-else-if="error" class="admin-state-text is-error">{{ error }}</p>
      <div v-else class="admin-table-wrap"><table class="admin-table"><thead><tr><th v-for="column in config.columns" :key="column">{{ column }}</th></tr></thead><tbody><tr v-if="!items.length"><td :colspan="config.columns.length">No records found.</td></tr><tr v-for="item in items" :key="item.id ?? item.consignmentNum"><td v-for="field in config.fields" :key="field">{{ item[field] || '—' }}</td></tr></tbody></table></div>
    </section>
  `,
};

const AdminWelcomePage = {
  components: { ResourcePanel },
  props: { routePath: { type: String, required: true } },
  setup(props) {
    const currentSection = computed(() => Object.entries(adminSections).find(([, section]) => section.path === props.routePath)?.[0] ?? 'dashboard');
    const menuItems = computed(() => Object.values(adminSections).map((item) => ({ ...item, active: item.path === props.routePath })));
    const quickLinks = [
      { title: 'Consignment Sheet', description: 'Manage & export consignments', icon: '▣', accent: 'blue', path: adminSections.consignments.path },
      { title: 'Leads Panel', description: 'View customer enquiries', icon: '♚', accent: 'green', path: adminSections.leads.path },
      { title: 'Documents', description: 'Review document uploads', icon: '☷', accent: 'purple', path: adminSections.documents.path },
      { title: 'Archive', description: 'View archived consignments', icon: '◴', accent: 'orange', path: adminSections.archived.path },
    ];
    const stats = [{ value: '04', label: 'Active modules' }, { value: '24/7', label: 'Admin access' }, { value: '1-click', label: 'Backup ready' }];
    function navigate(path) { window.history.pushState({}, '', path); window.dispatchEvent(new Event('popstate')); }
    return { adminLoginPageRoute, currentSection, menuItems, quickLinks, stats, navigate };
  },
  template: `
    <main class="admin-dashboard-shell"><div class="admin-dashboard-layout"><aside class="admin-sidebar" aria-label="Admin navigation"><section class="admin-brand"><div class="admin-brand-logo" aria-label="GRAM">GRAM</div><div class="admin-brand-copy"><p>Gram SCS</p><p>Admin</p></div></section><nav class="admin-nav" aria-label="Primary"><button v-for="item in menuItems" :key="item.label" class="admin-nav-item" :class="{ 'is-active': item.active }" type="button" @click="navigate(item.path)"><span class="admin-nav-icon" aria-hidden="true">{{ item.icon }}</span><span>{{ item.label }}</span></button></nav><div class="admin-sidebar-footer"><a class="admin-logout-link" :href="adminLoginPageRoute.path"><span class="admin-nav-icon" aria-hidden="true">⇱</span><span>Logout</span></a></div></aside>
      <section class="admin-main" aria-labelledby="dashboard-title"><header class="admin-topbar"><h1 id="dashboard-title">{{ menuItems.find((item) => item.active)?.title || 'Dashboard' }}</h1><div class="admin-actions"><span class="admin-badge">Admin</span><a class="admin-outline-button" :href="adminLoginPageRoute.path">Logout</a></div></header><div class="admin-content">
        <template v-if="currentSection === 'dashboard'"><section class="admin-hero" aria-label="Welcome message"><div class="admin-hero-copy"><p class="admin-eyebrow">Control center</p><h2>Welcome back!</h2><p>Gram SCS Admin Panel — manage consignments, leads, documents, and backups from a sharper command surface.</p></div><div class="admin-hero-stats" aria-label="Dashboard overview"><div v-for="stat in stats" :key="stat.label" class="admin-stat"><strong>{{ stat.value }}</strong><span>{{ stat.label }}</span></div></div></section><section class="admin-shortcuts" aria-label="Dashboard shortcuts"><article v-for="link in quickLinks" :key="link.title" class="admin-card"><div class="admin-card-body"><div class="admin-card-icon" :class="'is-' + link.accent" aria-hidden="true">{{ link.icon }}</div><div><h3>{{ link.title }}</h3><p>{{ link.description }}</p></div></div><button class="admin-card-button" :class="'is-' + link.accent" type="button" @click="navigate(link.path)">Open →</button></article></section><section class="admin-backup-card" aria-label="Database backup"><div><h3>Database Backup</h3><p>Generate and download a one-shot JSON backup</p></div><button type="button">Download Backup</button></section><p class="admin-note">Use the sidebar or cards to open each panel without a full page reload. — Gram SCS IT Dept.</p></template>
        <ResourcePanel v-else :section="currentSection" />
      </div></section></div></main>
  `,
};


const ConsignmentTestPage = {
  setup() {
    const testItems = [
      { id: 'CT-001', label: 'Pickup documents verified' },
      { id: 'CT-002', label: 'Warehouse intake scheduled' },
      { id: 'CT-003', label: 'Driver assignment pending' },
      { id: 'CT-004', label: 'Delivery confirmation ready' },
    ];

    return { testItems };
  },
  template: `
    <main class="min-h-screen bg-[#071c20] px-6 py-10 text-[#f6fbfb]" aria-labelledby="consignment-test-title">
      <section class="mx-auto grid w-full max-w-3xl gap-6 rounded-3xl border border-[rgba(202,222,216,0.18)] bg-[rgba(13,34,39,0.88)] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.28)] sm:p-8">
        <div class="grid gap-2">
          <p class="text-sm font-extrabold uppercase tracking-[0.22em] text-[#a9ec54]">Consignment Test</p>
          <h1 id="consignment-test-title" class="text-3xl font-black tracking-[-0.04em]">Consignment Test Items</h1>
          <p class="text-[rgba(221,235,230,0.76)]">A simple frontend panel for checking consignment list rendering.</p>
        </div>
        <ul class="grid gap-3" aria-label="Consignment test list">
          <li v-for="item in testItems" :key="item.id" class="rounded-2xl border border-[rgba(202,222,216,0.16)] bg-[rgba(244,251,247,0.08)] p-4">
            <strong class="block text-[#a9ec54]">{{ item.id }}</strong>
            <span>{{ item.label }}</span>
          </li>
        </ul>
      </section>
    </main>
  `,
};

const HomePage = { setup() { return { adminLoginPageRoute }; }, template: `<main class="grid min-h-screen place-content-center gap-6 bg-[#071c20] p-6 text-center text-[#f6fbfb]"><h1 class="text-4xl font-extrabold">Admin Panel Dashboard</h1><a class="inline-flex justify-center rounded-full bg-[#98e14a] px-5 py-3.5 font-extrabold text-[#08150d] no-underline" :href="adminLoginPageRoute.path">Open admin login</a></main>` };

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
