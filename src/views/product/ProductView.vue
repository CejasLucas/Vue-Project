<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

import { brandApi } from "../../api/BrandApi";
import { categoryApi } from "../../api/CategoryApi";
import { productApi } from "../../api/ProductApi";

import type { Brand } from "../../types/brand";
import type { Category } from "../../types/category";
import type { Product } from "../../types/product";

import DataTable, { type DataTableColumn } from "../../components/common/DataTable.vue";

const showModal = ref(false);
const isEditing = ref(false);
const isReadOnly = ref(false);
const saving = ref(false);
const deleting = ref(false);
const deleteTarget = ref<Product | null>(null);

const emptyForm = (): Omit<Product, "id"> => ({
  sku: "",
  name: "",
  description: "",
  current_stock: 0,
  minimum_stock: 0,
  last_purchase_price: 0,
  unit: "",
  brand_id: "",
  category_id: "",
});

const form = ref(emptyForm());
const editingId = ref<string | null>(null);

const products = ref<Product[]>([]);
const units = ref<{ value: string; label: string }[]>([]);
const brands = ref<Brand[]>([]);
const categories = ref<Category[]>([]);

const loading = ref(true);

const columns: DataTableColumn[] = [
  { key: "name", label: "NAME", width: "300px" },
  { key: "sku", label: "SKU", width: "130px" },
  { key: "unit", label: "UNIT", width: "110px" },
  { key: "price", label: "PRICE", width: "130px" },
  { key: "minimum_stock", label: "MINIMUM STOCK", align: "center", width: "170px" },
  { key: "current_stock", label: "CURRENT STOCK", align: "center", width: "170px" },
  { key: "description", label: "DESCRIPTION", width: "300px" },
];

const modalTitle = computed(() => {
  if (isReadOnly.value) return "Product details";
  return isEditing.value ? "Edit product" : "New product";
});

onMounted(async () => {
  await loadProducts();
  await loadUnits();
  await loadBrands();
  await loadCategories();
});

async function loadProducts() {
  loading.value = true;

  try {
    const response = await productApi.getAll();
    products.value = response.data;
  } finally {
    loading.value = false;
  }
}

async function loadUnits() {
  try {
    const response = await productApi.getUnits();
    units.value = response.data;
  } catch (error) {
    console.error("Failed to load units:", error);
  }
}

async function loadBrands() {
  try {
    const response = await brandApi.getAll();
    brands.value = response.data;
  } catch (error) {
    console.error("Failed to load brands:", error);
  }
}

async function loadCategories() {
  try {
    const response = await categoryApi.getAll();
    categories.value = response.data;
  } catch (error) {
    console.error("Failed to load categories:", error);
  }
}

function stockStatus(product: Product): "ok" | "low" | "critical" {
  if (product.current_stock === 0) return "critical";
  if (product.current_stock <= product.minimum_stock) return "low";
  return "ok";
}

function openCreate() {
  form.value = emptyForm();
  editingId.value = null;
  isEditing.value = false;
  isReadOnly.value = false;
  showModal.value = true;
}

function fillForm(product: Product) {
  form.value = {
    sku: product.sku,
    name: product.name,
    description: product.description,
    current_stock: product.current_stock,
    minimum_stock: product.minimum_stock,
    last_purchase_price: product.last_purchase_price,
    unit: product.unit,
    brand_id: product.brand_id,
    category_id: product.category_id,
  };
  editingId.value = String(product.id);
}

// Triggered by the "View product" button (read-only)
function openView(product: Product) {
  fillForm(product);
  isEditing.value = true;
  isReadOnly.value = true;
  showModal.value = true;
}

// Triggered by the "Update product" button
function openEdit(product: Product) {
  fillForm(product);
  isEditing.value = true;
  isReadOnly.value = false;
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
}

async function saveProduct() {
  saving.value = true;

  try {
    if (isEditing.value && editingId.value) {
      await productApi.update(editingId.value, form.value);
    } else {
      await productApi.create(form.value);
    }

    await loadProducts();
    closeModal();
  } finally {
    saving.value = false;
  }
}

// Triggered by the "Delete product" button
function confirmDelete(product: Product) {
  deleteTarget.value = product;
}

async function doDelete() {
  if (!deleteTarget.value) return;

  deleting.value = true;

  try {
    await productApi.remove(String(deleteTarget.value.id));
    await loadProducts();
    deleteTarget.value = null;
  } finally {
    deleting.value = false;
  }
}
</script>

<template>
  <DataTable
    :items="products"
    :columns="columns"
    :loading="loading"
    title="Products"
    entity-label="product"
    empty-icon="ti-box"
    empty-text="No products found."
    :search-keys="['name', 'sku', 'unit', 'description']"
    @add="openCreate"
    @view="openView"
    @edit="openEdit"
    @delete="confirmDelete"
  >
    <template #cell-name="{ item }">
      <div class="name">
        <span class="dot" :class="`dot-${stockStatus(item)}`" />
        {{ item.name }}
      </div>
    </template>

    <template #cell-sku="{ item }">
      <span class="mono">{{ item.sku }}</span>
    </template>

    <template #cell-unit="{ item }">
      <span class="muted">{{ item.unit }}</span>
    </template>

    <template #cell-price="{ item }">
      <span class="muted">$ {{ item.last_purchase_price }}</span>
    </template>

    <template #cell-current_stock="{ item }">
      <span class="stock-badge" :class="`stock-${stockStatus(item)}`">
        {{ item.current_stock }}
      </span>
    </template>

    <template #cell-description="{ item }">
      <span class="muted">{{ item.description ?? "—" }}</span>
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
              <label>SKU *</label>
              <input v-model="form.sku" placeholder="Product SKU" :disabled="isReadOnly" />
            </div>

            <div class="field">
              <label>Name *</label>
              <input v-model="form.name" placeholder="Product name" :disabled="isReadOnly" />
            </div>

            <div class="field full">
              <label>Description</label>
              <input
                v-model="form.description"
                placeholder="Product description"
                :disabled="isReadOnly"
              />
            </div>

            <div class="field">
              <label>Current Stock</label>
              <input
                type="number"
                v-model.number="form.current_stock"
                placeholder="Available units"
                min="0"
                :disabled="isReadOnly"
              />
            </div>

            <div class="field">
              <label>Minimum Stock</label>
              <input
                type="number"
                v-model.number="form.minimum_stock"
                placeholder="Reorder threshold"
                min="0"
                :disabled="isReadOnly"
              />
            </div>

            <div class="field">
              <label>Unit *</label>
              <select v-model="form.unit" :disabled="isReadOnly">
                <option v-for="unit in units" :key="unit.value" :value="unit.value">
                  {{ unit.label }}
                </option>
              </select>
            </div>

            <div class="field">
              <label>Price *</label>
              <input
                class="price-input"
                type="number"
                v-model.number="form.last_purchase_price"
                placeholder="0"
                min="0"
                step="0.01"
                :disabled="isReadOnly"
              />
            </div>

            <div class="field">
              <label>Brand</label>
              <select v-model="form.brand_id" :disabled="isReadOnly">
                <option v-for="brand in brands" :key="brand.id" :value="brand.id">
                  {{ brand.name }}
                </option>
              </select>
            </div>

            <div class="field">
              <label>Category</label>
              <select v-model="form.category_id" :disabled="isReadOnly">
                <option v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.name }}
                </option>
              </select>
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
            @click="saveProduct"
            :disabled="saving || !form.name.trim()"
          >
            <i v-if="saving" class="ti ti-loader-2 spin" />

            {{
              saving
                ? "Saving..."
                : isEditing
                ? "Save changes"
                : "Create product"
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
          <h2 class="modal-title">Delete product?</h2>
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

          <button class="btn-danger" @click="doDelete" :disabled="deleting">
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

/* ── Product ──────────────────────────────────────── */
@import "../../styles/stock.css";

.price-input::-webkit-outer-spin-button,
.price-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.price-input {
  -moz-appearance: textfield;
  appearance: textfield;
}

.field select:disabled,
.field input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.dot-ok { background: #22c55e; }
.dot-low { background: #ad8b19; }
.dot-critical { background: #ef4444; }
</style>