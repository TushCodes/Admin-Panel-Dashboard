export const LoginCard = {
  emits: ['submit'],
  setup(_, { emit }) { return { handleSubmit: () => emit('submit') }; },
  template: `<section class="login-card"><aside><div class="crm-logo">SCS</div><p>Shipment CRM</p><h1 id="login-title">Operations sign in</h1><span>No authentication provider is configured; continue opens the local CRM workspace.</span></aside><form @submit.prevent="handleSubmit"><label>Workspace<input value="Enterprise shipment operations" readonly /></label><label>Role<input value="Dispatcher / CRM admin" readonly /></label><button type="submit">Continue to CRM</button></form></section>`,
};
