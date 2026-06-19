import { computed, onMounted, ref, watch } from 'vue';

const apiPaths = {
  consignments: '/consignments/aggregated-consignments',
  leads: '/leads',
  documents: '/documents',
};

const sectionConfig = {
  consignments: {
    eyebrow: 'Shipment operations',
    title: 'Shipment Tracker',
    description: 'Search shipments, update delivery status, add operations notes, and create new consignments.',
    idField: 'consignmentNum',
    searchable: ['consignmentNum', 'status', 'pickupAddress', 'pickupPincode', 'dropAddress', 'dropPincode', 'pickupTag', 'dropTag'],
    columns: [
      { label: 'Shipment', field: 'consignmentNum' },
      { label: 'Status', field: 'status', type: 'status' },
      { label: 'Pickup', field: 'pickupAddress' },
      { label: 'Drop', field: 'dropAddress' },
      { label: 'Pickup date', field: 'pickupDate', type: 'date' },
      { label: 'Due date', field: 'dropDate', type: 'date' },
    ],
    statuses: ['created', 'pickup_scheduled', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'delayed', 'cancelled'],
  },
  leads: {
    eyebrow: 'Customer pipeline',
    title: 'Lead Desk',
    description: 'Track customer enquiries and keep follow-up status current.',
    idField: 'id',
    searchable: ['id', 'name', 'phone', 'email', 'subject', 'message', 'status'],
    columns: [
      { label: 'Lead ID', field: 'id' },
      { label: 'Customer', field: 'name' },
      { label: 'Phone', field: 'phone' },
      { label: 'Subject', field: 'subject' },
      { label: 'Status', field: 'status', type: 'leadStatus' },
    ],
    statuses: ['new', 'contacted', 'quoted', 'won', 'lost'],
  },
  documents: {
    eyebrow: 'Compliance',
    title: 'Document Register',
    description: 'Find uploaded shipment paperwork and supporting document references.',
    idField: 'id',
    searchable: ['id', 'documentUpload', 'documentName', 'type'],
    columns: [
      { label: 'Document ID', field: 'id' },
      { label: 'Upload reference', field: 'documentUpload' },
      { label: 'Name', field: 'documentName' },
      { label: 'Type', field: 'type' },
    ],
  },
};

function normalize(value) { return String(value ?? '').toLowerCase(); }
function asDate(value) { return value ? new Date(value).toLocaleDateString() : '—'; }
function download(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export const ResourcePanel = {
  props: { section: { type: String, required: true } },
  setup(props) {
    const items = ref([]);
    const loading = ref(false);
    const error = ref('');
    const search = ref('');
    const statusFilter = ref('all');
    const selectedId = ref('');
    const noteDraft = ref('');
    const actionMessage = ref('');
    const form = ref({});
    const config = computed(() => sectionConfig[props.section]);
    const selectedItem = computed(() => items.value.find((item) => String(item[config.value?.idField]) === selectedId.value));
    const filteredItems = computed(() => {
      if (!config.value) return [];
      const query = normalize(search.value);
      return items.value.filter((item) => {
        const matchesSearch = !query || config.value.searchable.some((field) => normalize(item[field]).includes(query));
        const matchesStatus = statusFilter.value === 'all' || item.status === statusFilter.value;
        return matchesSearch && matchesStatus;
      });
    });
    const counts = computed(() => {
      const total = items.value.length;
      const active = items.value.filter((item) => !['delivered', 'cancelled', 'lost'].includes(item.status)).length;
      const exceptions = items.value.filter((item) => ['delayed', 'cancelled', 'lost'].includes(item.status)).length;
      return { total, active, exceptions, filtered: filteredItems.value.length };
    });

    function resetForm() {
      form.value = props.section === 'consignments'
        ? { status: 'created', pickupAddress: '', dropAddress: '', pickupPincode: '', dropPincode: '' }
        : { status: 'new', name: '', phone: '', subject: '' };
    }

    function noteKey(id) { return `shipment-crm-note:${props.section}:${id}`; }
    function readNote(item) { return localStorage.getItem(noteKey(item[config.value.idField])) || ''; }
    function writeNote() {
      if (!selectedId.value) return;
      localStorage.setItem(noteKey(selectedId.value), noteDraft.value);
      actionMessage.value = 'Note saved locally for this workstation.';
    }

    function selectItem(item) {
      selectedId.value = String(item[config.value.idField]);
      noteDraft.value = readNote(item);
    }

    function valueFor(item, column) {
      const value = item[column.field];
      if (column.type === 'date') return asDate(value);
      return value || '—';
    }

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
      actionMessage.value = '';
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

    async function updateStatus(item, status) {
      const id = item[config.value.idField];
      const path = props.section === 'consignments' ? `/consignments/${id}` : `/leads/${id}`;
      try {
        const response = await fetch(path, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
        if (!response.ok) throw new Error(`Update failed with ${response.status}`);
        item.status = status;
        actionMessage.value = `${id} updated to ${status.replaceAll('_', ' ')}.`;
      } catch (err) { error.value = err.message; }
    }

    async function createRecord() {
      const path = props.section === 'consignments' ? '/consignments' : '/leads';
      const payload = props.section === 'consignments'
        ? { ...form.value, consignmentNum: form.value.consignmentNum || `CN${Date.now()}` }
        : form.value;
      try {
        const response = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!response.ok) throw new Error(`Create failed with ${response.status}`);
        actionMessage.value = 'Record created.';
        resetForm();
        await loadItems();
      } catch (err) { error.value = err.message; }
    }

    function exportCsv() {
      if (!config.value) return;
      const rows = [config.value.columns.map((column) => column.label), ...filteredItems.value.map((item) => config.value.columns.map((column) => valueFor(item, column)))];
      const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n');
      download(`${props.section}-export.csv`, csv, 'text/csv');
    }

    onMounted(() => { resetForm(); loadItems(); });
    watch(() => props.section, () => { items.value = []; search.value = ''; statusFilter.value = 'all'; selectedId.value = ''; noteDraft.value = ''; resetForm(); loadItems(); });

    return { actionMessage, config, counts, createRecord, error, exportCsv, filteredItems, form, items, loadItems, loading, noteDraft, search, sectionConfig, selectItem, selectedId, selectedItem, statusFilter, updateStatus, valueFor, writeNote };
  },
  template: `
    <section class="crm-panel" :aria-labelledby="section + '-title'">
      <div v-if="config" class="crm-panel-header"><div><p class="crm-eyebrow">{{ config.eyebrow }}</p><h2 :id="section + '-title'">{{ config.title }}</h2><p>{{ config.description }}</p></div><div class="crm-button-row"><button type="button" @click="exportCsv">Export CSV</button><button type="button" @click="loadItems">Refresh</button></div></div>
      <p v-if="!config" class="crm-state is-error">Unknown resource section.</p>
      <template v-else>
        <div class="crm-metrics"><article><strong>{{ counts.total }}</strong><span>Total records</span></article><article><strong>{{ counts.active }}</strong><span>Active workload</span></article><article><strong>{{ counts.exceptions }}</strong><span>Exceptions</span></article><article><strong>{{ counts.filtered }}</strong><span>Visible after filters</span></article></div>
        <div class="crm-toolbar"><label>Search<input v-model="search" type="search" placeholder="ID, city, customer, phone..." /></label><label v-if="config.statuses">Status<select v-model="statusFilter"><option value="all">All statuses</option><option v-for="status in config.statuses" :key="status" :value="status">{{ status.replaceAll('_', ' ') }}</option></select></label></div>
        <p v-if="loading" class="crm-state">Loading {{ config.title.toLowerCase() }}…</p><p v-else-if="error" class="crm-state is-error">{{ error }}</p><p v-if="actionMessage" class="crm-state is-success">{{ actionMessage }}</p>
        <div class="crm-workspace" v-if="!loading && !error"><div class="crm-table-wrap"><table class="crm-table"><thead><tr><th v-for="column in config.columns" :key="column.label">{{ column.label }}</th><th>Action</th></tr></thead><tbody><tr v-if="!filteredItems.length"><td :colspan="config.columns.length + 1">No records match the current filters.</td></tr><tr v-for="item in filteredItems" :key="item[config.idField]" :class="{ 'is-selected': String(item[config.idField]) === selectedId }"><td v-for="column in config.columns" :key="column.field"><select v-if="(column.type === 'status' || column.type === 'leadStatus') && config.statuses" :value="item.status || config.statuses[0]" @change="updateStatus(item, $event.target.value)"><option v-for="status in config.statuses" :key="status" :value="status">{{ status.replaceAll('_', ' ') }}</option></select><span v-else>{{ valueFor(item, column) }}</span></td><td><button type="button" @click="selectItem(item)">Open</button></td></tr></tbody></table></div>
        <aside class="crm-detail"><h3>Work item</h3><p v-if="!selectedItem">Select a record to view details and save local operations notes.</p><template v-else><dl><template v-for="column in config.columns" :key="column.field"><dt>{{ column.label }}</dt><dd>{{ valueFor(selectedItem, column) }}</dd></template></dl><label>Operations note<textarea v-model="noteDraft" rows="5" placeholder="Call updates, delivery blockers, document issues..."></textarea></label><button type="button" @click="writeNote">Save note</button></template></aside></div>
        <form v-if="section === 'consignments'" class="crm-create" @submit.prevent="createRecord"><h3>Create shipment</h3><input v-model="form.consignmentNum" placeholder="Shipment number (optional)" /><input v-model="form.pickupAddress" required placeholder="Pickup address" /><input v-model="form.dropAddress" required placeholder="Drop address" /><input v-model="form.pickupPincode" placeholder="Pickup ZIP" /><input v-model="form.dropPincode" placeholder="Drop ZIP" /><button type="submit">Create</button></form>
        <form v-else-if="section === 'leads'" class="crm-create" @submit.prevent="createRecord"><h3>Create lead</h3><input v-model="form.name" required placeholder="Customer name" /><input v-model="form.phone" required placeholder="Phone" /><input v-model="form.subject" required placeholder="Shipment need" /><button type="submit">Create</button></form>
      </template>
    </section>`
};
