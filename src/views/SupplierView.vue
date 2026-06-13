<script setup lang="ts">
import { ref, onMounted } from "vue";
import { supplierApi } from "../api/SupplierApi";
import type { Supplier } from "../types/supplier";

const suppliers = ref<Supplier[]>([]);
const loading = ref(true);

/* ── Modal state ─────────────────────────────────────────── */
const showModal   = ref(false);
const isEditing   = ref(false);
const saving      = ref(false);
const deleteId    = ref<string | null>(null);
const deleting    = ref(false);

const emptyForm = (): Omit<Supplier, "id"> => ({
  name: "", phone: "", email: "", address: "", locality: "", nationality: "",tax_id: "",
});

const form     = ref(emptyForm());
const editingId = ref<string | null>(null);

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
  form.value    = emptyForm();
  editingId.value = null;
  isEditing.value = false;
  showModal.value = true;
}

function openEdit(supplier: Supplier) {
  form.value = {
    name:        supplier.name,
    phone:       supplier.phone ?? "",
    email:       supplier.email ?? "",
    address:     supplier.address ?? "",
    locality:    supplier.locality ?? "",
    nationality: supplier.nationality ?? "",
    tax_id:      supplier.tax_id ?? "",
  };
  editingId.value = String(supplier.id);
  isEditing.value = true;
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
function confirmDelete(id: string) {
  deleteId.value = id;
}

async function doDelete() {
  if (!deleteId.value) return;
  deleting.value = true;
  try {
    await supplierApi.remove(deleteId.value);
    await loadSuppliers();
    deleteId.value = null;
  } finally {
    deleting.value = false;
  }
}

/* ── Helpers ─────────────────────────────────────────────── */
function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

const AVATAR_COLORS = [
  { bg: "rgba(55,138,221,.15)",  color: "#378ADD" },
  { bg: "rgba(124,58,237,.15)",  color: "#7C3AED" },
  { bg: "rgba(8,145,178,.15)",   color: "#0891B2" },
  { bg: "rgba(168,85,247,.15)",  color: "#A855F7" },
  { bg: "rgba(34,197,94,.12)",   color: "#16a34a" },
];

function avatarStyle(index: number) {
  const c = AVATAR_COLORS[index % AVATAR_COLORS.length];
  return { background: c.bg, color: c.color };
}
</script>

<template>
  <div class="page">
    <!--Empty State-->
    <div class="page-header">
      <div>
        <h1 class="page-title">Suppliers</h1>
        <p class="page-sub">{{ suppliers.length }} registered suppliers</p>
      </div>
      <button class="btn-primary" @click="openCreate">
        <i class="ti ti-plus" aria-hidden="true" />
        Add supplier
      </button>
    </div>

    <div class="table-card">
      <!-- Loading state -->
      <div v-if="loading">
        <div v-for="n in 5" :key="n" class="skel row-skel" />
      </div>

      <!-- Empty state -->
      <div v-else-if="suppliers.length === 0" class="empty">
        <i class="ti ti-truck" aria-hidden="true" />
        <p>No suppliers found.</p>
      </div>

      <!-- Table -->
      <div v-else class="table-wrap">
        <table class="data-table">
          <!--Table Titles-->
          <thead>
            <tr>
              <th class="text-left table-header" style="width: 70px">#</th>
              <th class="text-left table-header" style="width: 300px">NAME</th>
              <th class="text-left table-header" style="width: 200px">TAX ID</th>
              <th class="text-left table-header" style="width: 230px">PHONE</th>
              <th class="text-left table-header" style="width: 270px">EMAIL</th>
              <th class="text-left table-header" style="width: 300px">ADDRESS</th>
              <th class="text-left table-header" style="width: 200px">LOCALITY</th>
              <th class="text-left table-header" style="width: 175px">NATIONALITY</th>
              <th class="text-left table-header" style="width: 125px">OPERATIONS</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(supplier, index) in suppliers" :key="supplier.id">
              <td class="muted mono table-content-index">{{ index + 1 }}</td>
              <td>
                <div class="supplier-name">
                  <div class="avatar" :style="avatarStyle(index)">
                    {{ initials(supplier.name) }}
                  </div>
                  <span class="table-content-name">{{ supplier.name }}</span>
                </div>
              </td>
              <td class="table-content">{{ supplier.tax_id ?? "—" }}</td>
              <td class="table-content">{{ supplier.phone ?? "—" }}</td>
              <td>
                <a :href="`mailto:${supplier.email}`" class="email-link">
                  {{ supplier.email ?? "—" }}
                </a>
              </td>
              <td class="table-content">{{ supplier.address ?? "—" }}</td>
              <td class="table-content">{{ supplier.locality ?? "—" }}</td>
              <td class="table-content">{{ supplier.nationality ?? "—" }}</td>
              <td>
                <div class="row-actions">
                  <button class="icon-btn" title="Edit" @click="openEdit(supplier)">
                    <i class="ti ti-edit" aria-hidden="true" />
                  </button>
                  <button class="icon-btn danger" title="Delete" @click="confirmDelete(String(supplier.id))">
                    <i class="ti ti-trash" aria-hidden="true" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── Create / Edit Modal ────────────────────────────── -->
    <Teleport to="body">
      <div v-if="showModal" class="overlay" @click.self="closeModal">
        <div class="modal" role="dialog" :aria-label="isEditing ? 'Edit supplier' : 'New supplier'">

          <div class="modal-header">
            <h2 class="modal-title">{{ isEditing ? "Edit supplier" : "New supplier" }}</h2>
            <button class="icon-btn" @click="closeModal" aria-label="Close">
              <i class="ti ti-x" aria-hidden="true" />
            </button>
          </div>

          <div class="modal-body">
            <div class="field-grid">
              <div class="field">
                <label>Name *</label>
                <input v-model="form.name" placeholder="Company name" />
              </div>
              <div class="field">
                <label>Tax ID</label>
                <input v-model="form.tax_id" placeholder="12-3456789-0" />
              </div>
            
              <div class="field">
                <label>Phone</label>
                <input v-model="form.phone" placeholder="+54 11 0000-0000" />
              </div>
              <div class="field">
                <label>Email</label>
                <input v-model="form.email" type="email" placeholder="sales@company.com" />
              </div>
              <div class="field full">
                <label>Address</label>
                <input v-model="form.address" placeholder="Av. Example 1234" />
              </div>
              <div class="field">
                <label>Locality</label>
                <input v-model="form.locality" placeholder="Buenos Aires" />
              </div>
              <div class="field">
                <label>Nationality</label>
                <input v-model="form.nationality" placeholder="Argentina" />
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-ghost" @click="closeModal" :disabled="saving">Cancel</button>
            <button
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
      <div v-if="deleteId" class="overlay" @click.self="deleteId = null">
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
            <button class="btn-ghost" @click="deleteId = null" :disabled="deleting">Cancel</button>
            <button class="btn-danger" @click="doDelete" :disabled="deleting">
              <i v-if="deleting" class="ti ti-loader-2 spin" aria-hidden="true" />
              {{ deleting ? "Deleting…" : "Yes, delete" }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<style scoped>
/* ── Supplier name ──────────────────────────────────────── */
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
  color: #378ADD;
  text-decoration: none;
  font-size: 0.8rem;
}
.email-link:hover { text-decoration: underline; }

</style>