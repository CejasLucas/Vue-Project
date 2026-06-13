<script setup lang="ts">
import { ref, onMounted } from "vue";
import { categoryApi } from "../api/CategoryApi";
import type { Category } from "../types/category";

const categories = ref<Category[]>([]);
const loading = ref(true);

const showModal = ref(false);
const isEditing = ref(false);
const saving = ref(false);
const deleting = ref(false);

const deleteId = ref<string | null>(null);
const editingId = ref<string | null>(null);

const emptyForm = () => ({
  name: "",
  description: "",
});

const form = ref(emptyForm());

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
  showModal.value = true;
}

function openEdit(category: Category) {
  form.value = {
    name: category.name,
    description: category.description ?? "",
  };

  editingId.value = String(category.id);
  isEditing.value = true;
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

function confirmDelete(id: string) {
  deleteId.value = id;
}

async function doDelete() {
  if (!deleteId.value) return;

  deleting.value = true;

  try {
    await categoryApi.remove(deleteId.value);
    await loadCategories();
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
          <h1 class="page-title">Categories</h1>
          <p class="page-sub">{{ categories.length }} registered categories</p>
        </div>

        <button class="btn-primary" @click="openCreate">
          <i class="ti ti-plus" />
          Add category
        </button>
      </div>

    <div class="table-card">
      <!-- Loading -->
      <div v-if="loading">
        <div v-for="n in 5" :key="n" class="skel row-skel" />
      </div>

      <!-- Empty -->
      <div v-else-if="categories.length === 0" class="empty">
        <i class="ti ti-building-factory" aria-hidden="true" />
        <p>No categories found.</p>
      </div>

      <!-- Table -->
      <div v-else class="table-wrap">
        <table class="data-table">
          <!--Table Titles-->
          <thead>
            <tr>
              <th class="text-left table-header" style="width: 50px">#</th>
              <th class="text-left table-header" style="width: 200px">NAME</th>
              <th class="text-left table-header" style="width: 250px">DESCRIPTION</th>
              <th class="text-center table-header" style="width: 100px">OPERATIONS</th>
            </tr>
          </thead>

          <!--Table Content-->
          <tbody>
            <tr v-for="(category, index) in categories" :key="category.id">
              <td class="mono muted table-content-index">
                {{ index + 1 }}
              </td>
              
              <td>
                <div class="name table-content-name">
                  <span class="dot" />
                  {{ category.name }}
                </div>
              </td>
              
              <td class="muted table-content">
                {{ category.description ?? "—" }}
              </td>
              
              <!--Button Actions-->
              <td>
                <div class="row-actions">
                  <button
                    class="icon-btn"
                    title="Edit"
                    @click="openEdit(category)"
                  >
                    <i class="ti ti-edit" />
                  </button>

                  <button
                    class="icon-btn danger"
                    title="Delete"
                    @click="confirmDelete(String(category.id))"
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
              {{ isEditing ? "Edit category" : "New category" }}
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
                  placeholder="Category name"
                />
              </div>

              <div class="field full">
                <label>Description</label>

                <input
                  v-model="form.description"
                  placeholder="Category description"
                />
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
              @click="saveCategory"
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
                  : "Create category"
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
              Delete category?
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

</style>