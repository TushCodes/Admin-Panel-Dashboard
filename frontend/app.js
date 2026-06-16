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
      { id: 'overview', label: 'Operations', eyebrow: 'Network', icon: '⌁' },
      { id: 'dispatch', label: 'Dispatch', eyebrow: 'Fleet', icon: '↗' },
      { id: 'consignments', label: 'Consignments', eyebrow: 'Cargo', icon: '▣' },
      { id: 'leads', label: 'Customers', eyebrow: 'Accounts', icon: '◌' },
      { id: 'settings', label: 'Controls', eyebrow: 'Admin', icon: '⚙' },
    ];

    const lanes = ['LHR', 'ISB', 'KHI'];

    return { adminLoginPageRoute, lanes, tabs };
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
    <main class="min-h-screen overflow-hidden bg-[#eef3f0] text-[#10221f]">
      <div class="pointer-events-none fixed inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_18%_15%,rgba(139,217,56,0.22),transparent_28%),radial-gradient(circle_at_78%_8%,rgba(36,144,130,0.16),transparent_30%),linear-gradient(135deg,#06251f_0%,#0d3531_52%,#09212b_100%)]" aria-hidden="true"></div>
      <div class="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(16,34,31,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(16,34,31,0.035)_1px,transparent_1px)] bg-[size:44px_44px]" aria-hidden="true"></div>

      <div class="relative z-10 grid min-h-screen p-3 lg:grid-cols-[18rem_1fr] lg:p-4">
        <aside class="flex flex-col rounded-[1.8rem] border border-white/12 bg-[#071f1d] p-4 text-white shadow-[0_28px_80px_rgba(2,18,16,0.22)] lg:min-h-[calc(100vh-2rem)]" aria-label="Logistics dashboard sections">
          <div class="rounded-[1.35rem] border border-white/10 bg-white/[0.06] p-4">
            <div class="flex items-center gap-3">
              <div class="grid h-12 w-12 place-items-center rounded-2xl bg-[linear-gradient(135deg,#a9ec54,#49c78e)] text-xs font-black tracking-[-0.08em] text-[#071f1d] shadow-[0_16px_34px_rgba(169,236,84,0.22)]" aria-label="GRAM">GRAM</div>
              <div>
                <p class="text-[0.66rem] font-black uppercase tracking-[0.28em] text-[#a9ec54]">SCS Logistics</p>
                <h1 class="text-lg font-black tracking-[-0.04em]">Control Panel</h1>
              </div>
            </div>
            <div class="mt-4 grid grid-cols-3 gap-2 border-t border-white/10 pt-4" aria-label="Primary route lanes">
              <span v-for="lane in lanes" :key="lane" class="rounded-xl bg-white/[0.07] px-2 py-2 text-center text-[0.66rem] font-black tracking-[0.18em] text-white/64">{{ lane }}</span>
            </div>
          </div>

          <nav class="mt-5 grid gap-2" aria-label="Dashboard tabs">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              class="group flex w-full items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition duration-200"
              :class="activeTab === tab.id ? 'border-[#a9ec54]/60 bg-[#a9ec54]/14 shadow-[inset_4px_0_0_#a9ec54,0_16px_38px_rgba(0,0,0,0.16)]' : 'border-white/8 bg-transparent hover:border-white/16 hover:bg-white/[0.06]'"
              type="button"
              @click="activeTab = tab.id"
            >
              <span class="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-black transition" :class="activeTab === tab.id ? 'bg-[#a9ec54] text-[#071f1d]' : 'bg-white/[0.07] text-white/52 group-hover:text-white'">{{ tab.icon }}</span>
              <span class="min-w-0">
                <span class="block text-[0.62rem] font-black uppercase tracking-[0.22em]" :class="activeTab === tab.id ? 'text-[#caff80]' : 'text-white/38'">{{ tab.eyebrow }}</span>
                <span class="block text-sm font-extrabold" :class="activeTab === tab.id ? 'text-white' : 'text-white/74'">{{ tab.label }}</span>
              </span>
            </button>
          </nav>

          <div class="mt-auto hidden rounded-[1.35rem] border border-white/10 bg-white/[0.055] p-4 lg:block">
            <p class="text-[0.65rem] font-black uppercase tracking-[0.24em] text-white/36">Station status</p>
            <div class="mt-3 flex items-center justify-between gap-3">
              <span class="text-sm font-extrabold text-white/78">Ready for modules</span>
              <span class="h-2.5 w-2.5 rounded-full bg-[#a9ec54] shadow-[0_0_18px_rgba(169,236,84,0.8)]"></span>
            </div>
            <a class="mt-4 inline-flex w-full justify-center rounded-2xl border border-white/10 px-4 py-3 text-xs font-extrabold text-white/64 no-underline transition hover:border-[#a9ec54]/50 hover:text-white" :href="adminLoginPageRoute.path">Exit panel</a>
          </div>
        </aside>

        <section class="grid min-h-screen grid-rows-[auto_1fr] gap-4 p-2 sm:p-4 lg:min-h-0 lg:p-5" aria-labelledby="dashboard-title">
          <header class="overflow-hidden rounded-[1.8rem] border border-white/70 bg-white/85 shadow-[0_22px_70px_rgba(11,41,36,0.14)] backdrop-blur-2xl">
            <div class="grid gap-5 p-5 md:grid-cols-[1fr_auto] md:items-center lg:p-7">
              <div>
                <p class="text-xs font-black uppercase tracking-[0.28em] text-[#25846f]">{{ activeTabLabel }} desk</p>
                <h2 id="dashboard-title" class="mt-2 text-[clamp(2rem,4vw,3.7rem)] font-black leading-none tracking-[-0.055em] text-[#10221f]">Logistics command dashboard</h2>
                <p class="mt-3 max-w-2xl text-sm font-semibold leading-6 text-[#5d706b]">A structured internal workspace for shipments, dispatch, customer activity, and station controls.</p>
              </div>
              <div class="grid min-w-[16rem] gap-2 rounded-3xl border border-[#dce6df] bg-[#f7faf8] p-4">
                <div class="flex items-center justify-between text-[0.68rem] font-black uppercase tracking-[0.22em] text-[#78908a]">
                  <span>Today</span>
                  <span>Live shell</span>
                </div>
                <div class="flex items-end justify-between gap-4">
                  <span class="text-3xl font-black tracking-[-0.05em] text-[#10221f]">Empty</span>
                  <span class="rounded-full bg-[#dff8bd] px-3 py-1 text-xs font-black text-[#31510e]">Ready</span>
                </div>
              </div>
            </div>
          </header>

          <div class="grid gap-4 xl:grid-cols-[1fr_20rem]">
            <div class="rounded-[1.8rem] border border-white/70 bg-white/82 p-4 shadow-[0_22px_70px_rgba(11,41,36,0.10)] backdrop-blur-2xl lg:p-6">
              <div class="mb-5 grid gap-3 md:grid-cols-3" aria-label="Dashboard module placeholders">
                <div class="rounded-3xl border border-[#e0e9e3] bg-[#f8fbf8] p-4">
                  <p class="text-[0.65rem] font-black uppercase tracking-[0.22em] text-[#7d928d]">Shipments</p>
                  <div class="mt-4 h-3 w-24 rounded-full bg-[#dfe9e3]"></div>
                  <div class="mt-2 h-3 w-16 rounded-full bg-[#edf3ef]"></div>
                </div>
                <div class="rounded-3xl border border-[#e0e9e3] bg-[#f8fbf8] p-4">
                  <p class="text-[0.65rem] font-black uppercase tracking-[0.22em] text-[#7d928d]">Fleet</p>
                  <div class="mt-4 h-3 w-24 rounded-full bg-[#dfe9e3]"></div>
                  <div class="mt-2 h-3 w-16 rounded-full bg-[#edf3ef]"></div>
                </div>
                <div class="rounded-3xl border border-[#e0e9e3] bg-[#f8fbf8] p-4">
                  <p class="text-[0.65rem] font-black uppercase tracking-[0.22em] text-[#7d928d]">Customers</p>
                  <div class="mt-4 h-3 w-24 rounded-full bg-[#dfe9e3]"></div>
                  <div class="mt-2 h-3 w-16 rounded-full bg-[#edf3ef]"></div>
                </div>
              </div>

              <div class="grid min-h-[46vh] place-items-center rounded-[1.5rem] border border-dashed border-[#b9c9c2] bg-[linear-gradient(135deg,#f8fbf8_0%,#eef5f1_100%)]">
                <div class="max-w-lg p-6 text-center">
                  <div class="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-[#10221f] text-2xl text-[#a9ec54] shadow-[0_18px_34px_rgba(16,34,31,0.18)]">▦</div>
                  <p class="mt-5 text-sm font-black uppercase tracking-[0.3em] text-[#6f837d]">No operational widgets yet</p>
                  <p class="mt-3 text-base font-semibold leading-7 text-[#647872]">The dashboard is intentionally empty, but organized for logistics modules: lane performance, dispatch boards, consignment tables, and customer queues.</p>
                </div>
              </div>
            </div>

            <aside class="grid content-start gap-4" aria-label="Logistics context panels">
              <div class="rounded-[1.8rem] border border-white/70 bg-[#10221f] p-5 text-white shadow-[0_22px_70px_rgba(11,41,36,0.16)]">
                <p class="text-[0.68rem] font-black uppercase tracking-[0.24em] text-[#a9ec54]">Route monitor</p>
                <div class="mt-5 space-y-4">
                  <div class="flex items-center gap-3">
                    <span class="h-3 w-3 rounded-full bg-[#a9ec54]"></span>
                    <span class="h-px flex-1 bg-white/16"></span>
                    <span class="h-3 w-3 rounded-full bg-white/25"></span>
                    <span class="h-px flex-1 bg-white/16"></span>
                    <span class="h-3 w-3 rounded-full bg-white/25"></span>
                  </div>
                  <div class="flex justify-between text-[0.68rem] font-black tracking-[0.2em] text-white/48">
                    <span>PICKUP</span>
                    <span>HUB</span>
                    <span>DELIVERY</span>
                  </div>
                </div>
              </div>

              <div class="rounded-[1.8rem] border border-white/70 bg-white/82 p-5 shadow-[0_22px_70px_rgba(11,41,36,0.10)]">
                <p class="text-[0.68rem] font-black uppercase tracking-[0.24em] text-[#25846f]">Queue slots</p>
                <div class="mt-4 grid gap-3">
                  <div class="rounded-2xl border border-[#e0e9e3] bg-[#f8fbf8] p-3">
                    <div class="h-3 w-28 rounded-full bg-[#dfe9e3]"></div>
                    <div class="mt-2 h-3 w-20 rounded-full bg-[#edf3ef]"></div>
                  </div>
                  <div class="rounded-2xl border border-[#e0e9e3] bg-[#f8fbf8] p-3">
                    <div class="h-3 w-24 rounded-full bg-[#dfe9e3]"></div>
                    <div class="mt-2 h-3 w-16 rounded-full bg-[#edf3ef]"></div>
                  </div>
                </div>
              </div>
            </aside>
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
