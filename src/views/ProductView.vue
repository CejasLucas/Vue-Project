<script setup lang="ts">
import { ref, onMounted } from "vue";


import { brandApi } from "../api/BrandApi";
import { categoryApi } from "../api/CategoryApi";
import { productApi } from "../api/ProductApi";

import type { Brand } from "../types/brand";
import type { Category } from "../types/category";
import type { Product } from "../types/product";

const showModal = ref(false);
const isEditing = ref(false);
const saving = ref(false);
const deleting = ref(false);
const deleteId = ref<string | null>(null);

const emptyForm = (): Omit<Product, "id"> => ({
  sku: "",
  name: "",
  description: "",
  current_stock: 0,
  minimum_stock: 0,
  last_purchase_price: 0,
  unit: "",
  brand_id: "",
  category_id: ""
});

const form = ref(emptyForm());
const editingId = ref<string | null>(null);

const products = ref<Product[]>([]);
const units = ref<{ value: string; label: string }[]>([]);
const brands = ref<Brand[]>([]);
const categories = ref<Category[]>([]);

const loading = ref(true);


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
  try{
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
  showModal.value = true;
}

function openEdit(product: Product) {
  form.value = {
    sku: product.sku,
    name: product.name,
    description: product.description,
    current_stock: product.current_stock,
    minimum_stock: product.minimum_stock,
    last_purchase_price: product.last_purchase_price,
    unit: product.unit,
    brand_id: product.brand_id,
    category_id: product.category_id
  };

  editingId.value = String(product.id);
  isEditing.value = true;
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

function confirmDelete(id: string) {
  deleteId.value = id;
}

async function doDelete() {
  if (!deleteId.value) return;

  deleting.value = true;

  try {
    await productApi.remove(deleteId.value);
    await loadProducts();
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
        <h1 class="page-title">Products</h1>
        <p class="page-sub">{{ products.length }} registered products</p>
      </div>

      <button class="btn-primary" @click="openCreate">
        <i class="ti ti-plus" />
        Add product
      </button>
    </div>

    <div class="table-card">
      <!-- Loading -->
      <div v-if="loading">
        <div v-for="n in 5" :key="n" class="skel row-skel" />
      </div>

      <!-- Empty -->
      <div v-else-if="products.length === 0" class="empty">
        <i class="ti ti-box" aria-hidden="true" />
        <p>No products found.</p>
      </div>

      <!-- Table -->
      <div v-else class="table-wrap">
        <table class="data-table">
          <!-- Table Titles -->
          <thead>
            <tr>
              <th class="text-left table-header" style="width: 80px">#</th>
              <th class="text-left table-header" style="width: 300px">NAME</th>
              <th class="text-left table-header" style="width: 130px">SKU</th>
              <th class="text-left table-header" style="width: 110px">UNIT</th>
              <th class="text-left table-header" style="width: 130px">PRICE</th>
              <th class="text-center table-header" style="width: 170px">MINIMUM STOCK</th>
              <th class="text-center table-header" style="width: 170px">CURRENT STOCK</th>
              <th class="text-left table-header" style="width: 300px">DESCRIPTION</th>
              <th class="text-center table-header" style="width: 150px">OPERATIONS</th>
            </tr>
          </thead>

          <!-- Table Content -->
          <tbody>
            <tr v-for="(product, index) in products" :key="product.id">
              <td class="muted mono table-content-index">{{ index + 1 }}</td>
              
              <td>
                <div class="name table-content-name">
                  <span class="dot" :class="`dot-${stockStatus(product)}`" />
                  {{ product.name }}
                </div>
              </td>
              <td class="mono table-content">{{ product.sku }}</td>
              <td class="muted table-content">{{ product.unit }}</td>
              <td class="muted table-content">$ {{ product.last_purchase_price }}</td>
              
              <td class="text-center table-content">
                <span
                  class="stock-badge"
                  :class="`stock-${stockStatus(product)}`"
                >
                  {{ product.current_stock }}
                </span>
              </td>
              <td class="text-center table-content">{{ product.minimum_stock }}</td>
              <td class="muted table-content">{{ product.description }}</td>
              
              <!--Button Actions-->
              <td>
                <div class="row-actions">
                  <button
                    class="icon-btn"
                    title="Edit"
                    @click="openEdit(product)"
                  >
                    <i class="ti ti-edit" />
                  </button>

                  <button
                    class="icon-btn danger"
                    title="Delete"
                    @click="confirmDelete(String(product.id))"
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
              {{ isEditing ? "Edit product" : "New product" }}
            </h2>

            <button class="icon-btn" @click="closeModal">
              <i class="ti ti-x" />
            </button>
          </div>

          <div class="modal-body">
            <div class="field-grid">    

              <div class="field">
                <label>SKU *</label>
                <input
                  v-model="form.sku"
                  placeholder="Product SKU"
                />
              </div>

              <div class="field">
                <label>Name *</label>
                <input
                  v-model="form.name"
                  placeholder="Product name"
                />
              </div>
              
              <div class="field full">
                <label>Description</label>

                <input
                  v-model="form.description"
                  placeholder="Product description"
                />
              </div>

              <div class="field">
                <label>
                  Current Stock
                </label>
                <input
                  type="number"
                  v-model.number="form.current_stock"
                  placeholder="Available units"
                  min="0"
                />
              </div>

              <div class="field">
                <label>
                  Minimum Stock
                </label>
                <input 
                  type="number"
                  v-model.number="form.minimum_stock"
                  placeholder="Reorder threshold"
                  min="0"
                />
              </div>
              
              <div class="field">
                <label>Unit *</label>
                <select v-model="form.unit">
                  <option
                    v-for="unit in units"
                    :key="unit.value"
                    :value="unit.value"
                  >
                    {{ unit.label }}
                  </option>
                </select>
              </div>

              <div class="field">
                <label> Price *</label>
                <input
                  class="price-input"
                  type="number"
                  v-model.number="form.last_purchase_price"
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>

              <div class="field">
                <label>Brand</label>
                <select v-model="form.brand_id">
                  <option
                    v-for="brand in brands"
                    :key="brand.id"
                    :value="brand.id"
                  >
                    {{ brand.name }}
                  </option>
                </select>
              </div>

              <div class="field">
                <label>Category</label>
                <select v-model="form.category_id">
                  <option
                    v-for="category in categories"
                    :key="category.id"
                    :value="category.id"
                  >
                    {{ category.name }}
                  </option>
                </select>
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
                @click="saveProduct"
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
                    : "Create product"
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
@import "../assets/styles/layout.css";
@import "../assets/styles/position.css";
@import "../assets/styles/utilities.css";
@import "../assets/styles/table.css";
@import "../assets/styles/buttons.css";
@import "../assets/styles/modal.css";
@import "../assets/styles/forms.css";

/* ── Product ──────────────────────────────────────── */
@import "../assets/styles/stock.css";

.price-input::-webkit-outer-spin-button,
.price-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.price-input {
  -moz-appearance: textfield;
  appearance: textfield;
}

.dot-ok { background: #22c55e;; }
.dot-low   { background: #ad8b19; }
.dot-critical { background: #ef4444; }
</style>