import { computed } from 'vue';

import { adminLoginPageRoute } from '../routes/auth.js';
import { ResourcePanel } from './ResourcePanel.js';

export const adminSections = {
  dashboard: { path: '/admin', title: 'Dashboard', label: 'Dashboard', icon: '⌁' },
  consignments: { path: '/admin/consignments', title: 'Consignments', label: 'Consignments', icon: '▣' },
  leads: { path: '/admin/lead', title: 'Leads', label: 'Leads', icon: '♚' },
  documents: { path: '/admin/documents', title: 'Documents', label: 'Documents', icon: '☷' },
  archived: { path: '/admin/archived', title: 'Archive', label: 'Archive', icon: '◴' },
};

export const AdminWelcomePage = {
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
