import { computed, onMounted, ref, watch } from 'vue';

const apiPaths = {
  consignments: '/consignments/aggregated-consignments',
  leads: '/leads',
  documents: '/documents',
  archived: '/archived/consignments',
};

export const ResourcePanel = {
  props: { section: { type: String, required: true } },
  setup(props) {
    const items = ref([]);
    const loading = ref(false);
    const error = ref('');
    const config = computed(() => ({
      consignments: { eyebrow: 'Operations', title: 'Consignment Sheet', description: 'View and manage active consignment records.', columns: ['Consignment #', 'Status', 'Pickup', 'Drop'], fields: ['consignmentNum', 'status', 'pickupAddress', 'dropAddress'] },
      leads: { eyebrow: 'Sales', title: 'Leads Panel', description: 'Review customer enquiries and contact details.', columns: ['ID', 'Name', 'Phone', 'Subject'], fields: ['id', 'name', 'phone', 'subject'] },
      documents: { eyebrow: 'Files', title: 'Documents', description: 'Track uploaded document references.', columns: ['ID', 'Document upload'], fields: ['id', 'documentUpload'] },
      archived: { eyebrow: 'Archive', title: 'Archived Consignments', description: 'View archived consignment records.', columns: ['Consignment #', 'Status', 'Pickup', 'Drop'], fields: ['consignmentNum', 'status', 'pickupAddress', 'dropAddress'] },
    }[props.section]));

    async function loadItems() {
      const section = props.section;
      const path = apiPaths[section];
      if (!path) {
        error.value = 'Unknown resource section.';
        items.value = [];
        return;
      }

      loading.value = true;
      error.value = '';
      try {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`Request failed with ${response.status}`);
        const payload = await response.json();
        if (props.section === section) items.value = payload.data ?? [];
      } catch (err) {
        if (props.section === section) error.value = err.message;
      } finally {
        if (props.section === section) loading.value = false;
      }
    }

    onMounted(loadItems);

    watch(() => props.section, () => {
      items.value = [];
      loadItems();
    });

    return { config, items, loading, error, loadItems };
  },
  template: `
    <section class="admin-panel-card" :aria-labelledby="section + '-title'">
      <div v-if="config" class="admin-panel-header">
        <div><p class="admin-eyebrow">{{ config.eyebrow }}</p><h2 :id="section + '-title'">{{ config.title }}</h2><p>{{ config.description }}</p></div>
        <button class="admin-refresh-button" type="button" @click="loadItems">Refresh</button>
      </div>
      <p v-if="!config" class="admin-state-text is-error">Unknown resource section.</p>
      <p v-else-if="loading" class="admin-state-text">Loading {{ config.title.toLowerCase() }}…</p>
      <p v-else-if="error" class="admin-state-text is-error">{{ error }}</p>
      <div v-else class="admin-table-wrap"><table class="admin-table"><thead><tr><th v-for="column in config.columns" :key="column">{{ column }}</th></tr></thead><tbody><tr v-if="!items.length"><td :colspan="config.columns.length">No records found.</td></tr><tr v-for="item in items" :key="item.id ?? item.consignmentNum"><td v-for="field in config.fields" :key="field">{{ item[field] || '—' }}</td></tr></tbody></table></div>
    </section>
  `,
};
