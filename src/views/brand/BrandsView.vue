<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { brandApi } from "../../api/BrandApi";
import type { Brand } from "../../types/brand";

import DataTable, { type DataTableColumn } from "../../components/common/DataTable.vue";

const showModal = ref(false);
const isEditing = ref(false);
const isReadOnly = ref(false);
const saving = ref(false);
const deleting = ref(false);
const deleteTarget = ref<Brand | null>(null);

const emptyForm = (): Omit<Brand, "id"> => ({
  name: "",
  nationality: "",
  active: true,
});

const form = ref(emptyForm());
const editingId = ref<string | null>(null);

const brands = ref<Brand[]>([]);
const loading = ref(true);

const columns: DataTableColumn[] = [
  { key: "name", label: "NAME", width: "160px" },
  { key: "nationality", label: "NATIONALITY", width: "200px" },
  { key: "active", label: "STATUS", width: "150px" },
];

const modalTitle = computed(() => {
  if (isReadOnly.value) return "Brand details";
  return isEditing.value ? "Edit brand" : "New brand";
});

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
}

function openCreate() {
  form.value = emptyForm();
  editingId.value = null;
  isEditing.value = false;
  isReadOnly.value = false;
  showModal.value = true;
}

function fillForm(brand: Brand) {
  form.value = {
    name: brand.name,
    nationality: brand.nationality ?? "",
    active: brand.active,
  };
  editingId.value = String(brand.id);
}

// Triggered by the "View brand" button (read-only)
function openView(brand: Brand) {
  fillForm(brand);
  isEditing.value = true;
  isReadOnly.value = true;
  showModal.value = true;
}

// Triggered by the "Update brand" button
function openEdit(brand: Brand) {
  fillForm(brand);
  isEditing.value = true;
  isReadOnly.value = false;
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

// Triggered by the "Delete brand" button
function confirmDelete(brand: Brand) {
  deleteTarget.value = brand;
}

async function doDelete() {
  if (!deleteTarget.value) return;
  deleting.value = true;
  try {
    await brandApi.remove(String(deleteTarget.value.id));
    await loadBrands();
    deleteTarget.value = null;
  } finally {
    deleting.value = false;
  }
}
</script>

<template>
  <DataTable
    :items="brands"
    :columns="columns"
    :loading="loading"
    title="Brands"
    entity-label="brand"
    empty-icon="ti-building-factory"
    empty-text="No brands found."
    :search-keys="['name', 'nationality']"
    @add="openCreate"
    @view="openView"
    @edit="openEdit"
    @delete="confirmDelete"
  >
    <template #cell-name="{ item }">
      <div class="name">
        <span class="dot" />
        {{ item.name }}
      </div>
    </template>

    <template #cell-active="{ item }">
      <span class="status-badge" :class="item.active ? 'active' : 'inactive'">
        <span class="status-dot" />
        {{ item.active ? "Active" : "Inactive" }}
      </span>
    </template>
  </DataTable>

  <!--Modal Create / Edit / View-->
  <Teleport to="body">
    <div v-if="showModal" class="overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">{{ modalTitle }}</h2>
          <button class="icon-btn" @click="closeModal">
            <i class="ti ti-x" />
          </button>
        </div>

        <div class="modal-body">
          <div class="field-grid">
            <div class="field">
              <label>Name *</label>
              <input v-model="form.name" placeholder="Brand name" :disabled="isReadOnly" />
            </div>

            <div class="field">
              <label>Nationality</label>
              <input v-model="form.nationality" placeholder="Argentina" :disabled="isReadOnly" />
            </div>

            <div class="field full">
              <label>Status</label>
              <button
                type="button"
                class="toggle"
                :class="{ active: form.active }"
                :disabled="isReadOnly"
                @click="!isReadOnly && (form.active = !form.active)"
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
          <button class="btn-ghost" @click="closeModal">
            {{ isReadOnly ? "Close" : "Cancel" }}
          </button>

          <button
            v-if="!isReadOnly"
            class="btn-primary"
            @click="saveBrand"
            :disabled="saving || !form.name.trim()"
          >
            <i v-if="saving" class="ti ti-loader-2 spin" />

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
    <div v-if="deleteTarget" class="overlay" @click.self="deleteTarget = null">
      <div class="modal modal--sm">
        <div class="modal-header">
          <h2 class="modal-title">Delete brand?</h2>
        </div>

        <div class="modal-body">
          <p class="confirm-text">This action is permanent and cannot be undone.</p>
        </div>

        <div class="modal-footer">
          <button class="btn-ghost" @click="deleteTarget = null">
            Cancel
          </button>

          <button
            class="btn-danger"
            @click="doDelete"
            :disabled="deleting"
          >
            <i v-if="deleting" class="ti ti-loader-2 spin" />

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
</template>

<style scoped>
@import "../../styles/modal.css";
@import "../../styles/forms.css";
@import "../../styles/toggle.css";
@import "../../styles/buttons.css";

.field input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.toggle:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

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

.status-badge.active {
  background: rgba(34, 197, 94, 0.12);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.status-badge.active .status-dot {
  background: #22c55e;
  box-shadow: 0 0 6px rgba(34, 197, 94, 0.6);
}

.status-badge.inactive {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.status-badge.inactive .status-dot {
  background: #ef4444;
  box-shadow: 0 0 6px rgba(239, 68, 68, 0.5);
}
</style>