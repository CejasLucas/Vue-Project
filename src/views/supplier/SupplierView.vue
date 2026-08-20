<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { supplierApi } from "../../api/SupplierApi";
import type { Supplier } from "../../types/supplier";

import DataTable, { type DataTableColumn } from "../../components/common/DataTable.vue";

const loading = ref(true);
const suppliers = ref<Supplier[]>([]);

/* ── Modal state ─────────────────────────────────────────── */
const showModal = ref(false);
const isEditing = ref(false);
const isReadOnly = ref(false);
const saving = ref(false);
const deleteTarget = ref<Supplier | null>(null);
const deleting = ref(false);

const emptyForm = (): Omit<Supplier, "id"> => ({
  name: "",
  phone: "",
  email: "",
  address: "",
  locality: "",
  nationality: "",
  tax_id: "",
});

const form = ref(emptyForm());
const editingId = ref<string | null>(null);

const columns: DataTableColumn[] = [
  { key: "name", label: "NAME", width: "300px" },
  { key: "tax_id", label: "TAX ID", width: "200px" },
  { key: "phone", label: "PHONE", width: "230px" },
  { key: "email", label: "EMAIL", width: "270px" },
  { key: "address", label: "ADDRESS", width: "300px" },
  { key: "locality", label: "LOCALITY", width: "200px" },
  { key: "nationality", label: "NATIONALITY", width: "175px" },
];

const modalTitle = computed(() => {
  if (isReadOnly.value) return "Supplier details";
  return isEditing.value ? "Edit supplier" : "New supplier";
});

/* ── Load ────────────────────────────────────────────────── */
onMounted(async () => {
  await loadSuppliers();
});

async function loadSuppliers() {
  loading.value = true;
  const response = await supplierApi.getAll();
  suppliers.value = response.data;
  loading.value = false;
}

/* ── Open modal ──────────────────────────────────────────── */
function openCreate() {
  form.value = emptyForm();
  editingId.value = null;
  isEditing.value = false;
  isReadOnly.value = false;
  showModal.value = true;
}

function fillForm(supplier: Supplier) {
  form.value = {
    name: supplier.name,
    phone: supplier.phone ?? "",
    email: supplier.email ?? "",
    address: supplier.address ?? "",
    locality: supplier.locality ?? "",
    nationality: supplier.nationality ?? "",
    tax_id: supplier.tax_id ?? "",
  };
  editingId.value = String(supplier.id);
}

// Triggered by the "View supplier" button (read-only)
function openView(supplier: Supplier) {
  fillForm(supplier);
  isEditing.value = true;
  isReadOnly.value = true;
  showModal.value = true;
}

// Triggered by the "Update supplier" button
function openEdit(supplier: Supplier) {
  fillForm(supplier);
  isEditing.value = true;
  isReadOnly.value = false;
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
}

/* ── Save (create or update) ─────────────────────────────── */
async function saveSupplier() {
  saving.value = true;
  try {
    if (isEditing.value && editingId.value) {
      await supplierApi.update(editingId.value, form.value);
    } else {
      await supplierApi.create(form.value);
    }
    await loadSuppliers();
    closeModal();
  } finally {
    saving.value = false;
  }
}

/* ── Delete ──────────────────────────────────────────────── */
// Triggered by the "Delete supplier" button
function confirmDelete(supplier: Supplier) {
  deleteTarget.value = supplier;
}

async function doDelete() {
  if (!deleteTarget.value) return;
  deleting.value = true;
  try {
    await supplierApi.remove(String(deleteTarget.value.id));
    await loadSuppliers();
    deleteTarget.value = null;
  } finally {
    deleting.value = false;
  }
}

/* ── Helpers ─────────────────────────────────────────────── */
function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

const AVATAR_COLORS = [
  { bg: "rgba(55,138,221,.15)", color: "#378ADD" },
  { bg: "rgba(124,58,237,.15)", color: "#7C3AED" },
  { bg: "rgba(8,145,178,.15)", color: "#0891B2" },
  { bg: "rgba(168,85,247,.15)", color: "#A855F7" },
  { bg: "rgba(34,197,94,.12)", color: "#16a34a" },
];

function avatarStyle(index: number) {
  const c = AVATAR_COLORS[index % AVATAR_COLORS.length];
  return { background: c.bg, color: c.color };
}
</script>

<template>
  <DataTable
    :items="suppliers"
    :columns="columns"
    :loading="loading"
    title="Suppliers"
    entity-label="supplier"
    empty-icon="ti-truck"
    empty-text="No suppliers found."
    :search-keys="['name', 'tax_id', 'phone', 'email', 'locality', 'nationality']"
    @add="openCreate"
    @view="openView"
    @edit="openEdit"
    @delete="confirmDelete"
  >
    <template #cell-name="{ item, index }">
      <div class="supplier-name">
        <div class="avatar" :style="avatarStyle(index)">
          {{ initials(item.name) }}
        </div>
        <span class="table-content-name">{{ item.name }}</span>
      </div>
    </template>

    <template #cell-email="{ item }">
      <a
        v-if="item.email"
        :href="`mailto:${item.email}`"
        class="email-link"
        @click.stop
      >
        {{ item.email }}
      </a>
      <span v-else class="muted">—</span>
    </template>
  </DataTable>

  <!-- ── Create / Edit / View Modal ────────────────────────────── -->
  <Teleport to="body">
    <div v-if="showModal" class="overlay" @click.self="closeModal">
      <div class="modal" role="dialog" :aria-label="modalTitle">
        <div class="modal-header">
          <h2 class="modal-title">{{ modalTitle }}</h2>
          <button class="icon-btn" @click="closeModal" aria-label="Close">
            <i class="ti ti-x" aria-hidden="true" />
          </button>
        </div>

        <div class="modal-body">
          <div class="field-grid">
            <div class="field">
              <label>Name *</label>
              <input v-model="form.name" placeholder="Company name" :disabled="isReadOnly" />
            </div>
            <div class="field">
              <label>Tax ID</label>
              <input v-model="form.tax_id" placeholder="12-3456789-0" :disabled="isReadOnly" />
            </div>

            <div class="field">
              <label>Phone</label>
              <input v-model="form.phone" placeholder="+54 11 0000-0000" :disabled="isReadOnly" />
            </div>
            <div class="field">
              <label>Email</label>
              <input
                v-model="form.email"
                type="email"
                placeholder="sales@company.com"
                :disabled="isReadOnly"
              />
            </div>
            <div class="field full">
              <label>Address</label>
              <input v-model="form.address" placeholder="Av. Example 1234" :disabled="isReadOnly" />
            </div>
            <div class="field">
              <label>Locality</label>
              <input v-model="form.locality" placeholder="Buenos Aires" :disabled="isReadOnly" />
            </div>
            <div class="field">
              <label>Nationality</label>
              <input v-model="form.nationality" placeholder="Argentina" :disabled="isReadOnly" />
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-ghost" @click="closeModal" :disabled="saving">
            {{ isReadOnly ? "Close" : "Cancel" }}
          </button>
          <button
            v-if="!isReadOnly"
            class="btn-primary"
            @click="saveSupplier"
            :disabled="saving || !form.name.trim()"
          >
            <i v-if="saving" class="ti ti-loader-2 spin" aria-hidden="true" />
            {{ saving ? "Saving…" : isEditing ? "Save changes" : "Create supplier" }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- ── Delete confirm Modal ───────────────────────────── -->
  <Teleport to="body">
    <div v-if="deleteTarget" class="overlay" @click.self="deleteTarget = null">
      <div class="modal modal--sm" role="dialog" aria-label="Confirm delete">
        <div class="modal-header">
          <h2 class="modal-title">Delete supplier?</h2>
        </div>
        <div class="modal-body">
          <p class="confirm-text">
            This action is permanent and cannot be undone.
          </p>
        </div>
        <div class="modal-footer">
          <button class="btn-ghost" @click="deleteTarget = null" :disabled="deleting">
            Cancel
          </button>
          <button class="btn-danger" @click="doDelete" :disabled="deleting">
            <i v-if="deleting" class="ti ti-loader-2 spin" aria-hidden="true" />
            {{ deleting ? "Deleting…" : "Yes, delete" }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
@import "../../styles/modal.css";
@import "../../styles/forms.css";
@import "../../styles/buttons.css";

/* ── Supplier ──────────────────────────────────────── */
.supplier-name {
  display: flex;
  align-items: center;
  gap: 9px;
}
.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 600;
  flex-shrink: 0;
  letter-spacing: 0.02em;
}
.email-link {
  color: #378add;
  text-decoration: none;
  font-size: 0.8rem;
}
.email-link:hover {
  text-decoration: underline;
}

.field input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>