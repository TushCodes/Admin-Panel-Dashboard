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
    const tabs = [
      { id: 'overview', label: 'Overview', eyebrow: 'Command' },
      { id: 'analytics', label: 'Analytics', eyebrow: 'Signals' },
      { id: 'consignments', label: 'Consignments', eyebrow: 'Flow' },
      { id: 'leads', label: 'Leads', eyebrow: 'Pipeline' },
      { id: 'settings', label: 'Settings', eyebrow: 'Control' },
    ];

    return { adminLoginPageRoute, tabs };
  },
  data() {
    return {
      activeTab: 'overview',
    };
  },
  computed: {
    activeTabLabel() {
      return this.tabs.find((tab) => tab.id === this.activeTab)?.label ?? 'Dashboard';
    },
  },
  template: `
    <main class="min-h-screen overflow-hidden bg-[#061316] text-[#f6fbfb]">
      <div class="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_16%_10%,rgba(169,236,84,0.18),transparent_28%),radial-gradient(circle_at_92%_18%,rgba(59,188,173,0.16),transparent_26%),linear-gradient(135deg,#09251f_0%,#061316_46%,#081f28_100%)]" aria-hidden="true"></div>
      <div class="pointer-events-none fixed left-1/2 top-0 h-px w-[72rem] -translate-x-1/2 bg-[linear-gradient(90deg,transparent,rgba(206,255,153,0.56),transparent)]" aria-hidden="true"></div>

      <div class="relative z-10 grid min-h-screen lg:grid-cols-[19rem_1fr]">
        <aside class="border-b border-white/10 bg-white/[0.055] p-5 shadow-[24px_0_80px_rgba(0,0,0,0.22)] backdrop-blur-2xl lg:border-b-0 lg:border-r lg:p-6" aria-label="Dashboard sections">
          <div class="flex items-center justify-between gap-4 lg:block">
            <div class="flex items-center gap-3">
              <div class="grid h-12 w-12 place-items-center rounded-2xl border border-[#caff80]/40 bg-[linear-gradient(135deg,#a9ec54,#4fc68d)] text-xs font-black tracking-[-0.08em] text-[#061316] shadow-[0_16px_44px_rgba(169,236,84,0.24)]" aria-label="GRAM">GRAM</div>
              <div>
                <p class="text-[0.68rem] font-black uppercase tracking-[0.24em] text-[#a9ec54]">Admin</p>
                <h1 class="text-lg font-black tracking-[-0.04em]">Control Panel</h1>
              </div>
            </div>
            <a class="hidden rounded-full border border-white/10 px-4 py-2 text-xs font-extrabold text-white/70 no-underline transition hover:border-[#a9ec54]/50 hover:text-white lg:inline-flex lg:mt-8" :href="adminLoginPageRoute.path">Exit</a>
          </div>

          <nav class="mt-6 grid gap-2" aria-label="Dashboard tabs">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              class="group flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition duration-200"
              :class="activeTab === tab.id ? 'border-[#a9ec54]/50 bg-[#a9ec54]/14 shadow-[0_18px_50px_rgba(169,236,84,0.12)]' : 'border-white/8 bg-white/[0.035] hover:border-white/18 hover:bg-white/[0.07]'"
              type="button"
              @click="activeTab = tab.id"
            >
              <span class="h-2.5 w-2.5 rounded-full transition" :class="activeTab === tab.id ? 'bg-[#a9ec54] shadow-[0_0_20px_rgba(169,236,84,0.9)]' : 'bg-white/25 group-hover:bg-white/45'"></span>
              <span class="min-w-0">
                <span class="block text-[0.63rem] font-black uppercase tracking-[0.22em]" :class="activeTab === tab.id ? 'text-[#caff80]' : 'text-white/38'">{{ tab.eyebrow }}</span>
                <span class="block text-sm font-extrabold" :class="activeTab === tab.id ? 'text-white' : 'text-white/72'">{{ tab.label }}</span>
              </span>
            </button>
          </nav>
        </aside>

        <section class="grid min-h-screen grid-rows-[auto_1fr] p-5 sm:p-8 lg:p-10" aria-labelledby="dashboard-title">
          <header class="flex flex-col justify-between gap-5 rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.22)] backdrop-blur-2xl md:flex-row md:items-center">
            <div>
              <p class="text-xs font-black uppercase tracking-[0.28em] text-[#a9ec54]">{{ activeTabLabel }}</p>
              <h2 id="dashboard-title" class="mt-2 text-[clamp(2rem,5vw,4.6rem)] font-black leading-none tracking-[-0.06em]">Dashboard panel</h2>
            </div>
            <div class="flex items-center gap-3 rounded-full border border-white/10 bg-black/20 px-4 py-3 text-sm font-bold text-white/68">
              <span class="h-2.5 w-2.5 rounded-full bg-[#a9ec54] shadow-[0_0_22px_rgba(169,236,84,0.9)]"></span>
              Empty workspace
            </div>
          </header>

          <div class="mt-6 grid rounded-[2.25rem] border border-dashed border-white/14 bg-[linear-gradient(145deg,rgba(255,255,255,0.075),rgba(255,255,255,0.025))] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_30px_100px_rgba(0,0,0,0.22)] backdrop-blur-2xl">
            <div class="grid min-h-[48vh] place-items-center rounded-[1.75rem] border border-white/8 bg-[#071c20]/55">
              <div class="max-w-md text-center">
                <p class="text-sm font-black uppercase tracking-[0.3em] text-white/34">No widgets yet</p>
                <p class="mt-4 text-lg font-semibold leading-8 text-white/62">Use the sidebar tabs to move through the future dashboard sections. This canvas is intentionally empty for now.</p>
              </div>
            </div>
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
