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
    return { adminLoginPageRoute };
  },
  template: `
    <main class="grid min-h-screen place-content-center gap-6 bg-[radial-gradient(circle_at_12%_24%,rgba(40,130,70,0.2),transparent_28%),linear-gradient(115deg,#0f2f1f_0%,#071a22_48%,#0a2328_100%)] p-6 text-center text-[#f6fbfb]">
      <p class="text-sm font-extrabold uppercase tracking-[0.24em] text-[#a9ec54]">Admin Dashboard</p>
      <h1 class="text-[clamp(2.5rem,6vw,5rem)] font-black leading-none tracking-[-0.04em]">Welcome, admin</h1>
      <p class="mx-auto max-w-[660px] text-[clamp(1.05rem,2vw,1.32rem)] text-[rgba(221,235,230,0.82)]">This standalone frontend is available without backend authentication and is ready for the next dashboard experience.</p>
      <a class="mx-auto inline-flex justify-center rounded-full bg-[#98e14a] px-5 py-3.5 font-extrabold text-[#08150d] no-underline" :href="adminLoginPageRoute.path">Back to login</a>
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
