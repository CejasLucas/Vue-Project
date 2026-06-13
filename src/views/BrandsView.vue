<script setup lang="ts">
import { ref, onMounted } from "vue";
import { brandApi } from "../api/BrandApi";
import type { Brand } from "../types/brand";

const showModal = ref(false);
const isEditing = ref(false);
const saving = ref(false);
const deleting = ref(false);
const deleteId = ref<string | null>(null);

const emptyForm = (): Omit<Brand, "id"> => ({
  name: "",
  nationality: "",
  active: true,
});

const form = ref(emptyForm());
const editingId = ref<string | null>(null);

const brands = ref<Brand[]>([]);
const loading = ref(true);

onMounted(async () => {
  await loadBrands();
});

async function loadBrands() {
  loading.value = true;
  try {
    const response = await brandApi.getAll();
    brands.value = response.data;
  } finally {
    loading.value = false;
  }
};

function openCreate() {
  form.value = emptyForm();
  editingId.value = null;
  isEditing.value = false;
  showModal.value = true;
}

function openEdit(brand: Brand) {
  form.value = {
    name: brand.name,
    nationality: brand.nationality ?? "",
    active: brand.active,
  };

  editingId.value = String(brand.id);
  isEditing.value = true;
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
}

async function saveBrand() {
  saving.value = true;

  try {
    if (isEditing.value && editingId.value) {
      await brandApi.update(editingId.value, form.value);
    } else {
      await brandApi.create(form.value);
    }

    await loadBrands();
    closeModal();
  } finally {
    saving.value = false;
  }
}

function confirmDelete(id: string) {
  deleteId.value = id;
}

async function doDelete() {
  if (!deleteId.value) return;

  deleting.value = true;

  try {
    await brandApi.remove(deleteId.value);
    await loadBrands();
    deleteId.value = null;
  } finally {
    deleting.value = false;
  }
}

</script>

<template>
  <div class="page">
    <!--Empty State-->
    <div class="page-header">
      <div>
        <h1 class="page-title">Brands</h1>
        <p class="page-sub">{{ brands.length }} registered brands</p>
      </div>

      <button class="btn-primary" @click="openCreate">
        <i class="ti ti-plus" />
        Add brand
      </button>
    </div>

    <div class="table-card">
      <!-- Loading -->
      <div v-if="loading">
        <div v-for="n in 5" :key="n" class="skel row-skel" />
      </div>

      <!-- Empty -->
      <div v-else-if="brands.length === 0" class="empty">
        <i class="ti ti-building-factory" aria-hidden="true" />
        <p>No brands found.</p>
      </div>

      <!-- Table -->
      <div v-else class="table-wrap">
        <table class="data-table">
          <!-- Table Titles -->
          <thead>
            <tr>
              <th class="text-left table-header" style="width: 60px">#</th>
              <th class="text-left table-header" style="width: 160px">NAME</th>
              <th class="text-left table-header" style="width: 200px">NATIONALITY</th>
              <th class="text-left table-header" style="width: 150px">STATUS</th>
              <th class="text-center table-header" style="width: 100px">OPERATIONS</th>
            </tr>
          </thead>
          
          <!-- Table Content -->
          <tbody>
            <tr v-for="(brand, index) in brands" :key="brand.id">
              <td class="mono muted table-content-index">
                {{ index + 1 }}
              </td>

              <td>
                <div class="name table-content-name">
                  <span class="dot" />
                  {{ brand.name }}
                </div>
              </td>

              <td class="muted table-content">
                {{ brand.nationality }}
              </td>

              <td>
                <span
                  class="status-badge"
                  :class="brand.active ? 'active' : 'inactive'"
                >
                  <span class="status-dot" />
                  {{ brand.active ? "Active" : "Inactive" }}
                </span>
              </td>
              
              <!--Button Actions-->
              <td>
                <div class="row-actions">
                  <button
                    class="icon-btn"
                    title="Edit"
                    @click="openEdit(brand)"
                  >
                    <i class="ti ti-edit" />
                  </button>

                  <button
                    class="icon-btn danger"
                    title="Delete"
                    @click="confirmDelete(String(brand.id))"
                  >
                    <i class="ti ti-trash" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!--Modal Edit-->
    <Teleport to="body">
      <div
        v-if="showModal"
        class="overlay"
        @click.self="closeModal"
      >
        <div class="modal">

          <div class="modal-header">
            <h2 class="modal-title">
              {{ isEditing ? "Edit brand" : "New brand" }}
            </h2>

            <button class="icon-btn" @click="closeModal">
              <i class="ti ti-x" />
            </button>
          </div>

          <div class="modal-body">
            <div class="field-grid">

              <div class="field">
                <label>Name *</label>
                <input
                  v-model="form.name"
                  placeholder="Brand name"
                />
              </div>

              <div class="field">
                <label>Nationality</label>
                <input
                  v-model="form.nationality"
                  placeholder="Argentina"
                />
              </div>

              <div class="field full">
                <label>Status</label>

                <button
                  type="button"
                  class="toggle"
                  :class="{ active: form.active }"
                  @click="form.active = !form.active"
                >
                  <span class="toggle-track">
                    <span class="toggle-thumb" />
                  </span>

                  <span class="toggle-label">
                    {{ form.active ? "Active" : "Inactive" }}
                  </span>
                </button>
              </div>

            </div>
          </div>

          <div class="modal-footer">
            <button
              class="btn-ghost"
              @click="closeModal"
            >
              Cancel
            </button>

            <button
              class="btn-primary"
              @click="saveBrand"
              :disabled="saving || !form.name.trim()"
            >
              <i
                v-if="saving"
                class="ti ti-loader-2 spin"
              />

              {{
                saving
                  ? "Saving..."
                  : isEditing
                  ? "Save changes"
                  : "Create brand"
              }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
    
    <!--Modal Delete-->
    <Teleport to="body">
      <div
        v-if="deleteId"
        class="overlay"
        @click.self="deleteId = null"
      >
        <div class="modal modal--sm">

          <div class="modal-header">
            <h2 class="modal-title">
              Delete brand?
            </h2>
          </div>

          <div class="modal-body">
            <p class="confirm-text">
              This action is permanent and cannot be undone.
            </p>
          </div>

          <div class="modal-footer">
            <button
              class="btn-ghost"
              @click="deleteId = null"
            >
              Cancel
            </button>

            <button
              class="btn-danger"
              @click="doDelete"
              :disabled="deleting"
            >
              <i
                v-if="deleting"
                class="ti ti-loader-2 spin"
              />

              {{
                deleting
                  ? "Deleting..."
                  : "Yes, delete"
              }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* Status Badge */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 5.5px 15px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.01em;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

/* Active */
.status-badge.active {
  background: rgba(34, 197, 94, 0.12);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.status-badge.active .status-dot {
  background: #22c55e;
  box-shadow: 0 0 6px rgba(34, 197, 94, 0.6);
}

/* Inactive */
.status-badge.inactive {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.status-badge.inactive .status-dot {
  background: #ef4444;
  box-shadow: 0 0 6px rgba(239, 68, 68, 0.5);
}

.confirm-text {
  font-size: 0.85rem;
  color: var(--text);
  margin: 0;
  line-height: 1.5;
}

.toggle {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
}

.toggle-track {
  width: 52px;
  height: 28px;
  border-radius: 999px;
  background: rgba(239, 68, 68, 0.25);
  border: 1px solid rgba(239, 68, 68, 0.3);
  position: relative;
  transition: all 0.2s ease;
}

.toggle-thumb {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: white;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.toggle.active .toggle-track {
  background: rgba(34, 197, 94, 0.25);
  border-color: rgba(34, 197, 94, 0.35);
}

.toggle.active .toggle-thumb {
  transform: translateX(24px);
}

.toggle-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-h);
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }
}
</style>