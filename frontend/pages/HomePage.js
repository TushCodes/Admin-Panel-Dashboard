import { adminLoginPageRoute } from '../routes.js';

export const HomePage = {
  setup() { return { adminLoginPageRoute }; },
  template: `<main class="grid min-h-screen place-content-center gap-6 bg-[#071c20] p-6 text-center text-[#f6fbfb]"><h1 class="text-4xl font-extrabold">Admin Panel Dashboard</h1><a class="inline-flex justify-center rounded-full bg-[#98e14a] px-5 py-3.5 font-extrabold text-[#08150d] no-underline" :href="adminLoginPageRoute.path">Open admin login</a></main>`,
};
