export const ConsignmentTestPage = {
  setup() {
    const testItems = [
      { id: 'CT-001', label: 'Pickup documents verified' },
      { id: 'CT-002', label: 'Warehouse intake scheduled' },
      { id: 'CT-003', label: 'Driver assignment pending' },
      { id: 'CT-004', label: 'Delivery confirmation ready' },
    ];

    return { testItems };
  },
  template: `
    <main class="min-h-screen bg-[#071c20] px-6 py-10 text-[#f6fbfb]" aria-labelledby="consignment-test-title">
      <section class="mx-auto grid w-full max-w-3xl gap-6 rounded-3xl border border-[rgba(202,222,216,0.18)] bg-[rgba(13,34,39,0.88)] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.28)] sm:p-8">
        <div class="grid gap-2">
          <p class="text-sm font-extrabold uppercase tracking-[0.22em] text-[#a9ec54]">Consignment Test</p>
          <h1 id="consignment-test-title" class="text-3xl font-black tracking-[-0.04em]">Consignment Test Items</h1>
          <p class="text-[rgba(221,235,230,0.76)]">A simple frontend panel for checking consignment list rendering.</p>
        </div>
        <ul class="grid gap-3" aria-label="Consignment test list">
          <li v-for="item in testItems" :key="item.id" class="rounded-2xl border border-[rgba(202,222,216,0.16)] bg-[rgba(244,251,247,0.08)] p-4">
            <strong class="block text-[#a9ec54]">{{ item.id }}</strong>
            <span>{{ item.label }}</span>
          </li>
        </ul>
      </section>
    </main>
  `,
};
