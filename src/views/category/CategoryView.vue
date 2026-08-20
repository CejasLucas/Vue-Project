<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { categoryApi } from "../../api/CategoryApi";
import type { Category } from "../../types/category";

import DataTable, { type DataTableColumn } from "../../components/common/DataTable.vue";

const categories = ref<Category[]>([]);
const loading = ref(true);

const showModal = ref(false);
const isEditing = ref(false);
const isReadOnly = ref(false);
const saving = ref(false);
const deleting = ref(false);

const deleteTarget = ref<Category | null>(null);
const editingId = ref<string | null>(null);

const emptyForm = () => ({
  name: "",
  description: "",
});

const form = ref(emptyForm());

const columns: DataTableColumn[] = [
  { key: "name", label: "NAME", width: "200px" },
  { key: "description", label: "DESCRIPTION", width: "250px" },
];

const modalTitle = computed(() => {
  if (isReadOnly.value) return "Category details";
  return isEditing.value ? "Edit category" : "New category";
});

onMounted(async () => {
  await loadCategories();
});

async function loadCategories() {
  loading.value = true;

  try {
    const response = await categoryApi.getAll();
    categories.value = response.data;
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

function fillForm(category: Category) {
  form.value = {
    name: category.name,
    description: category.description ?? "",
  };
  editingId.value = String(category.id);
}

// Triggered by the "View category" button (read-only)
function openView(category: Category) {
  fillForm(category);
  isEditing.value = true;
  isReadOnly.value = true;
  showModal.value = true;
}

// Triggered by the "Update category" button
function openEdit(category: Category) {
  fillForm(category);
  isEditing.value = true;
  isReadOnly.value = false;
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
}

async function saveCategory() {
  saving.value = true;

  try {
    if (isEditing.value && editingId.value) {
      await categoryApi.update(editingId.value, form.value);
    } else {
      await categoryApi.create(form.value);
    }

    await loadCategories();
    closeModal();
  } finally {
    saving.value = false;
  }
}

// Triggered by the "Delete category" button
function confirmDelete(category: Category) {
  deleteTarget.value = category;
}

async function doDelete() {
  if (!deleteTarget.value) return;

  deleting.value = true;

  try {
    await categoryApi.remove(String(deleteTarget.value.id));
    await loadCategories();
    deleteTarget.value = null;
  } finally {
    deleting.value = false;
  }
}
</script>

<template>
  <DataTable
    :items="categories"
    :columns="columns"
    :loading="loading"
    title="Categories"
    entity-label="category"
    empty-icon="ti-building-factory"
    empty-text="No categories found."
    :search-keys="['name', 'description']"
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
              <input
                v-model="form.name"
                placeholder="Category name"
                :disabled="isReadOnly"
              />
            </div>

            <div class="field full">
              <label>Description</label>
              <input
                v-model="form.description"
                placeholder="Category description"
                :disabled="isReadOnly"
              />
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
            @click="saveCategory"
            :disabled="saving || !form.name.trim()"
          >
            <i v-if="saving" class="ti ti-loader-2 spin" />

            {{
              saving
                ? "Saving..."
                : isEditing
                ? "Save changes"
                : "Create category"
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
          <h2 class="modal-title">Delete category?</h2>
        </div>

        <div class="modal-body">
          <p class="confirm-text">
            This action is permanent and cannot be undone.
          </p>
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
@import "../../styles/buttons.css";

.field input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>