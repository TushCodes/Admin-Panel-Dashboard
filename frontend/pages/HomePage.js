import { adminLoginPageRoute } from '../routes.js';

export const HomePage = {
  setup() { return { adminLoginPageRoute }; },
  template: `<main class="public-home"><section><p>Enterprise Shipment Tracking CRM</p><h1>Operations-first freight control.</h1><a :href="adminLoginPageRoute.path">Open CRM login</a></section></main>`,
};
