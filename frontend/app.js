import { createApp } from 'vue';

import { adminLoginPageRoute, adminRoute } from './routes/auth.js';

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

      <a class="relative z-10 mb-8 inline-flex w-fit items-center gap-3 rounded-full border border-[rgba(202,222,216,0.18)] bg-[rgba(13,34,39,0.72)] px-5 py-3 font-bold text-[#d6e2df] no-underline shadow-[0_18px_34px_rgba(0,0,0,0.20)]" href="/" aria-label="Back to home">
        <span aria-hidden="true">←</span>
        <span>Back to Home</span>
      </a>

      <section class="relative z-10 mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl border border-[rgba(202,222,216,0.18)] bg-[rgba(13,34,39,0.82)] shadow-[0_28px_80px_rgba(0,0,0,0.28)] lg:grid-cols-[1fr_1.05fr]">
        <aside class="flex flex-col justify-center gap-6 p-8 sm:p-12" aria-label="Gram SCS IT Department">
          <div class="grid h-24 w-24 place-items-center rounded-[28px] border-[7px] border-[#a2f15f] bg-[linear-gradient(135deg,#8dde42_0%,#65b43d_52%,#9ced5e_100%)] text-2xl font-black tracking-[-0.14em] text-white [border-style:ridge] [text-shadow:0_2px_0_rgba(42,122,36,0.65)]" aria-label="GRAM">GRAM</div>
          <p class="text-sm font-extrabold uppercase tracking-[0.24em] text-[#a9ec54]">Secure Admin Portal</p>
          <h1 id="login-title" class="text-[clamp(2.5rem,5vw,4.5rem)] font-black leading-none tracking-[-0.04em]">Welcome back</h1>
          <p class="max-w-md text-[1.08rem] leading-7 text-[rgba(221,235,230,0.76)]">Open the standalone admin frontend. No backend authentication is required.</p>
        </aside>

        <form class="grid gap-6 bg-[rgba(244,251,247,0.96)] p-8 text-[#0d1a16] sm:p-12" @submit.prevent="handleSubmit">
          <div class="grid gap-2">
            <p class="text-sm font-extrabold uppercase tracking-[0.22em] text-[#76bd37]">Standalone Login</p>
            <h2 class="text-3xl font-black tracking-[-0.04em]">Continue to dashboard</h2>
          </div>

          <button class="rounded-full bg-[linear-gradient(100deg,#8bd938,#b8ed74)] px-6 py-4 font-black text-[#08150d] shadow-[0_18px_34px_rgba(116,212,59,0.18)] hover:brightness-105 focus-visible:brightness-105 disabled:cursor-not-allowed disabled:opacity-70" type="submit">
            Continue
          </button>
        </form>
      </section>
    </main>
  `,
};

const AdminWelcomePage = {
  setup() {
    const menuItems = [
      { label: 'Dashboard', icon: '⌁', active: true },
      { label: 'Consignments', icon: '▣', active: false },
      { label: 'Leads', icon: '♚', active: false },
    ];

    const stats = [
      { value: '02', label: 'Active modules' },
      { value: '24/7', label: 'Admin access' },
      { value: '1-click', label: 'Backup ready' },
    ];

    const quickLinks = [
      {
        title: 'Consignment Sheet',
        description: 'Manage & export consignments',
        icon: '▣',
        accent: 'blue',
      },
      {
        title: 'Leads Panel',
        description: 'View customer enquiries',
        icon: '♚',
        accent: 'green',
      },
    ];

    return { adminLoginPageRoute, menuItems, quickLinks, stats };
  },
  template: `
    <main class="admin-dashboard-shell">
      <div class="admin-dashboard-layout">
        <aside class="admin-sidebar" aria-label="Admin navigation">
          <section class="admin-brand">
            <div class="admin-brand-logo" aria-label="GRAM">GRAM</div>
            <div class="admin-brand-copy">
              <p>Gram SCS</p>
              <p>Admin</p>
            </div>
          </section>

          <nav class="admin-nav" aria-label="Primary">
            <button
              v-for="item in menuItems"
              :key="item.label"
              class="admin-nav-item"
              :class="{ 'is-active': item.active }"
              type="button"
            >
              <span class="admin-nav-icon" aria-hidden="true">{{ item.icon }}</span>
              <span>{{ item.label }}</span>
            </button>
          </nav>

          <div class="admin-sidebar-footer">
            <a class="admin-logout-link" :href="adminLoginPageRoute.path">
              <span class="admin-nav-icon" aria-hidden="true">⇱</span>
              <span>Logout</span>
            </a>
          </div>
        </aside>

        <section class="admin-main" aria-labelledby="dashboard-title">
          <header class="admin-topbar">
            <h1 id="dashboard-title">Dashboard</h1>
            <div class="admin-actions">
              <span class="admin-badge">Admin</span>
              <a class="admin-outline-button" :href="adminLoginPageRoute.path">Logout</a>
            </div>
          </header>

          <div class="admin-content">
            <section class="admin-hero" aria-label="Welcome message">
              <div class="admin-hero-copy">
                <p class="admin-eyebrow">Control center</p>
                <h2>Welcome back!</h2>
                <p>Gram SCS Admin Panel — manage consignments, leads, and backups from a sharper command surface.</p>
              </div>
              <div class="admin-hero-stats" aria-label="Dashboard overview">
                <div v-for="stat in stats" :key="stat.label" class="admin-stat">
                  <strong>{{ stat.value }}</strong>
                  <span>{{ stat.label }}</span>
                </div>
              </div>
            </section>

            <section class="admin-shortcuts" aria-label="Dashboard shortcuts">
              <article v-for="link in quickLinks" :key="link.title" class="admin-card">
                <div class="admin-card-body">
                  <div class="admin-card-icon" :class="'is-' + link.accent" aria-hidden="true">{{ link.icon }}</div>
                  <div>
                    <h3>{{ link.title }}</h3>
                    <p>{{ link.description }}</p>
                  </div>
                </div>
                <button class="admin-card-button" :class="'is-' + link.accent" type="button">Open →</button>
              </article>
            </section>

            <section class="admin-backup-card" aria-label="Database backup">
              <div>
                <h3>Database Backup</h3>
                <p>Generate and download a one-shot JSON backup</p>
              </div>
              <button type="button">Download Backup</button>
            </section>

            <p class="admin-note">More sections will be added here as the dashboard grows. — Gram SCS IT Dept.</p>
          </div>
        </section>
      </div>
    </main>
  `,
};

const HomePage = {
  setup() {
    return { adminLoginPageRoute };
  },
  template: `
    <main class="grid min-h-screen place-content-center gap-6 bg-[#071c20] p-6 text-center text-[#f6fbfb]">
      <h1 class="text-4xl font-extrabold">Admin Panel Dashboard</h1>
      <a class="inline-flex justify-center rounded-full bg-[#98e14a] px-5 py-3.5 font-extrabold text-[#08150d] no-underline" :href="adminLoginPageRoute.path">Open admin login</a>
    </main>
  `,
};

const App = {
  components: { AdminWelcomePage, HomePage, LoginPage },
  setup() {
    return { adminLoginPageRoute, adminRoute };
  },
  computed: {
    currentRoute() {
      return window.location.pathname.replace(/\/$/, '') || '/';
    },
  },
  template: '<LoginPage v-if="currentRoute === adminLoginPageRoute.path" /><AdminWelcomePage v-else-if="currentRoute === adminRoute.path" /><HomePage v-else />',
};

createApp(App).mount('#app');
