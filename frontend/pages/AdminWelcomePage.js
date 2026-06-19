import { computed, onMounted, ref } from 'vue';

import { adminLoginPageRoute } from '../routes.js';
import { ResourcePanel } from './ResourcePanel.js';

export const adminSections = {
  dashboard: { path: '/admin', title: 'Operations Dashboard', label: 'Dashboard', icon: '▦' },
  consignments: { path: '/admin/consignments', title: 'Shipment Tracker', label: 'Shipments', icon: '⛟' },
  leads: { path: '/admin/lead', title: 'Lead Desk', label: 'Leads', icon: '☎' },
  documents: { path: '/admin/documents', title: 'Document Register', label: 'Documents', icon: '☷' },
};

async function fetchCount(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Request failed with ${response.status}`);
  const payload = await response.json();
  return payload.data ?? [];
}

export const AdminWelcomePage = {
  components: { ResourcePanel },
  props: { routePath: { type: String, required: true } },
  emits: ['navigate'],
  setup(props, { emit }) {
    const overview = ref({ shipments: 0, exceptions: 0, leads: 0, documents: 0, loaded: false, error: '' });
    const currentSection = computed(() => Object.entries(adminSections).find(([, section]) => section.path === props.routePath)?.[0] ?? 'dashboard');
    const menuItems = computed(() => Object.values(adminSections).map((item) => ({ ...item, active: item.path === props.routePath })));
    const quickLinks = [
      { title: 'Open shipment queue', description: 'Search, filter, update status, and export loads.', path: adminSections.consignments.path },
      { title: 'Work customer leads', description: 'Create prospects and keep follow-ups visible.', path: adminSections.leads.path },
      { title: 'Review documents', description: 'Find uploaded compliance references.', path: adminSections.documents.path },
    ];
    function navigate(path) { emit('navigate', path); }
    async function loadOverview() {
      overview.value.error = '';
      try {
        const [shipments, leads, documents] = await Promise.all([
          fetchCount('/consignments/aggregated-consignments'),
          fetchCount('/leads'),
          fetchCount('/documents'),
        ]);
        overview.value = {
          shipments: shipments.length,
          exceptions: shipments.filter((item) => ['delayed', 'cancelled'].includes(item.status)).length,
          leads: leads.length,
          documents: documents.length,
          loaded: true,
          error: '',
        };
      } catch (err) {
        overview.value = { ...overview.value, loaded: true, error: err.message };
      }
    }
    function downloadBackup() {
      const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), overview: overview.value }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'shipment-crm-overview.json';
      link.click();
      URL.revokeObjectURL(url);
    }
    onMounted(loadOverview);
    return { adminLoginPageRoute, currentSection, downloadBackup, loadOverview, menuItems, navigate, overview, quickLinks };
  },
  template: `
    <main class="crm-shell"><div class="crm-layout"><aside class="crm-sidebar" aria-label="CRM navigation"><section class="crm-brand"><div class="crm-logo">SCS</div><div><strong>Shipment CRM</strong><span>Enterprise Ops</span></div></section><nav class="crm-nav" aria-label="Primary"><button v-for="item in menuItems" :key="item.label" :class="{ 'is-active': item.active }" type="button" @click="navigate(item.path)"><span>{{ item.icon }}</span>{{ item.label }}</button></nav><a class="crm-logout" :href="adminLoginPageRoute.path">Logout</a></aside>
      <section class="crm-main"><header class="crm-topbar"><div><p>Control room</p><h1>{{ menuItems.find((item) => item.active)?.title || 'Dashboard' }}</h1></div><div class="crm-button-row"><button type="button" @click="loadOverview">Sync overview</button><a :href="adminLoginPageRoute.path">Logout</a></div></header><div class="crm-content">
        <template v-if="currentSection === 'dashboard'"><section class="crm-hero"><p class="crm-eyebrow">Functional shipment tracking CRM</p><h2>Move freight, not pixels.</h2><p>This dashboard is organized for daily operations: monitor workload, open queues, update shipment status, and export working data.</p></section><p v-if="overview.error" class="crm-state is-error">{{ overview.error }}</p><section class="crm-metrics"><article><strong>{{ overview.shipments }}</strong><span>Total shipments</span></article><article><strong>{{ overview.exceptions }}</strong><span>Shipment exceptions</span></article><article><strong>{{ overview.leads }}</strong><span>Customer leads</span></article><article><strong>{{ overview.documents }}</strong><span>Documents</span></article></section><section class="crm-shortcuts"><article v-for="link in quickLinks" :key="link.title"><h3>{{ link.title }}</h3><p>{{ link.description }}</p><button type="button" @click="navigate(link.path)">Open module</button></article></section><section class="crm-backup"><div><h3>Operations snapshot</h3><p>Download the current CRM overview as JSON for handoff or audit notes.</p></div><button type="button" @click="downloadBackup">Download JSON</button></section></template>
        <ResourcePanel v-else :section="currentSection" />
      </div></section></div></main>`
};
