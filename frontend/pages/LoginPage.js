import { LoginCard } from '../components/LoginCard.js';
import { adminRoute } from '../routes/auth.js';

export const LoginPage = {
  components: { LoginCard },
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
      <LoginCard @submit="handleSubmit" />
    </main>
  `,
};
