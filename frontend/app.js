import { createApp, ref } from 'vue';

const LoginPage = {
  setup() {
    const username = ref('admin');
    const password = ref('password');
    const statusMessage = ref('');

    function handleSubmit() {
      statusMessage.value = 'Ready to sign in with admin credentials.';
    }

    return { username, password, statusMessage, handleSubmit };
  },
  template: `
    <main class="min-h-screen bg-[#071c20] bg-[radial-gradient(circle_at_12%_24%,rgba(40,130,70,0.2),transparent_28%),linear-gradient(115deg,#0f2f1f_0%,#071a22_48%,#0a2328_100%)] px-3.5 py-4 text-[#f6fbfb] sm:px-6 sm:pb-3.5" aria-labelledby="login-title">
      <div class="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-[660px] flex-col items-center">
        <a class="mb-6 inline-flex items-center gap-3 text-[clamp(1.05rem,2vw,1.38rem)] font-extrabold tracking-[0.01em] text-[#d6e2df] no-underline sm:mb-12" href="/" aria-label="Back to home">
          <span class="text-[1.55em] font-normal leading-none" aria-hidden="true">←</span>
          <span>Back to Home</span>
        </a>

        <section class="w-full overflow-hidden rounded-3xl border border-[rgba(202,222,216,0.18)] bg-[linear-gradient(143deg,rgba(36,62,56,0.92),rgba(28,43,46,0.94))] shadow-[0_28px_80px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.04)] sm:rounded-[31px]">
          <header class="grid justify-items-center border-b border-[rgba(202,222,216,0.14)] px-6 py-9 text-center sm:px-10 sm:pb-[34px] sm:pt-[53px]">
            <div class="relative mb-[23px] grid h-[78px] w-[183px] -skew-x-[0.5deg] place-items-center border-[7px] [border-style:ridge] border-[#a2f15f] bg-[linear-gradient(135deg,#8dde42_0%,#65b43d_52%,#9ced5e_100%)] text-[2.32rem] font-black leading-none tracking-[-0.14em] text-white shadow-[0_12px_26px_rgba(115,223,74,0.18),inset_0_5px_0_rgba(226,255,174,0.65)] [text-shadow:0_2px_0_rgba(42,122,36,0.65)]" aria-label="GRAM">
              <span class="absolute inset-x-[11px] top-[7px] h-[5px] bg-[rgba(219,255,156,0.72)]" aria-hidden="true"></span>
              <span class="absolute inset-x-[11px] bottom-[7px] h-[5px] bg-[rgba(52,143,43,0.45)]" aria-hidden="true"></span>
              <span>GRAM</span>
            </div>
            <h1 id="login-title" class="m-0 text-[clamp(2rem,4vw,2.25rem)] font-extrabold leading-[1.1] tracking-[-0.04em]">Admin Login</h1>
            <p class="m-0 mt-2.5 text-[clamp(1.05rem,2vw,1.32rem)] font-bold tracking-[0.025em] text-[rgba(226,235,231,0.78)]">Gram SCS IT Department</p>
          </header>

          <form class="grid gap-7 px-6 py-10 sm:px-12 sm:pb-[52px] sm:pt-11" @submit.prevent="handleSubmit">
            <label class="grid gap-[9px]" for="admin-username">
              <span class="text-[1.22rem] font-black uppercase text-[rgba(221,235,230,0.82)]">Username</span>
              <input class="min-h-16 w-full rounded-[17px] border-0 bg-[#e7eefb] px-[25px] py-[18px] text-[1.45rem] tracking-[0.03em] text-[#050608] outline outline-[3px] outline-transparent focus:outline-[rgba(165,238,96,0.55)] sm:min-h-[76px]" id="admin-username" v-model="username" name="username" autocomplete="username" />
            </label>

            <label class="grid gap-[9px]" for="admin-password">
              <span class="text-[1.22rem] font-black uppercase text-[rgba(221,235,230,0.82)]">Password</span>
              <input class="min-h-16 w-full rounded-[17px] border-0 bg-[#e7eefb] px-[25px] py-[18px] text-[1.45rem] tracking-[0.03em] text-[#050608] outline outline-[3px] outline-transparent focus:outline-[rgba(165,238,96,0.55)] sm:min-h-[76px]" id="admin-password" v-model="password" name="password" type="password" autocomplete="current-password" />
            </label>

            <button class="mt-2.5 min-h-16 cursor-pointer rounded-[17px] border-0 bg-[linear-gradient(100deg,#8bd938,#b8ed74)] text-[1.45rem] font-black tracking-[0.01em] text-[#0d1708] shadow-[0_18px_34px_rgba(116,212,59,0.18)] hover:brightness-105 focus-visible:brightness-105 sm:min-h-[78px]" type="submit">Sign In</button>
            <p v-if="statusMessage" class="-mt-2 text-center font-bold text-[#c8f5a0]" role="status">{{ statusMessage }}</p>
          </form>
        </section>
      </div>
    </main>
  `,
};

const HomePage = {
  template: `
    <main class="grid min-h-screen place-content-center gap-6 bg-[#071c20] p-6 text-center text-[#f6fbfb]">
      <h1 class="text-4xl font-extrabold">Admin Panel Dashboard</h1>
      <a class="inline-flex justify-center rounded-full bg-[#98e14a] px-5 py-3.5 font-extrabold text-[#08150d] no-underline" href="/auth/login">Open admin login</a>
    </main>
  `,
};

const App = {
  components: { LoginPage, HomePage },
  computed: {
    isLoginRoute() {
      return window.location.pathname.replace(/\/$/, '') === '/auth/login';
    },
  },
  template: '<LoginPage v-if="isLoginRoute" /><HomePage v-else />',
};

createApp(App).mount('#app');
