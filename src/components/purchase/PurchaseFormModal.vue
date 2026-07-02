<script setup lang="ts">
import { computed, ref, onMounted } from "vue";

import type { Supplier } from "../../types/supplier";
import { supplierApi } from "../../api/SupplierApi";

import type { Product } from "../../types/product";
import { productApi } from "../../api/ProductApi";

import type { Brand } from "../../types/brand";
import { brandApi } from "../../api/BrandApi";

import type { Category } from "../../types/category";
import { categoryApi } from "../../api/CategoryApi";

const suppliers = ref<Supplier[]>([]);
const products = ref<Product[]>([]);
const brands = ref<Brand[]>([]);
const categories = ref<Category[]>([]);


onMounted(async () => {
  const [suppliersRes, productsRes, brandsRes, categoriesRes] = await Promise.all([
    supplierApi.getAll(),
    productApi.getAll(),
    brandApi.getAll(),
    categoryApi.getAll()
  ]);

  suppliers.value = suppliersRes.data;
  products.value = productsRes.data;
  brands.value = brandsRes.data;
  categories.value = categoriesRes.data;
});

defineEmits(["close"]);

function getTodayLocal() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const form = ref({
  supplier_id: "",
  date: getTodayLocal(),
  status: "",
  items: [
    {
      product_id: "",
      quantity: 1,
      unit_price: 0,
      category: "",
      brand: ""
    }
  ]
});

const total = computed(() =>
  form.value.items.reduce((sum, item) => {
    return sum + item.quantity * (item.unit_price || 0);
  }, 0)
);

function addItem() {
  form.value.items.push({
    product_id: "",
    quantity: 1,
    unit_price: 0,
    category: "",
    brand: ""
  });
}

function removeItem(index: number) {
  form.value.items.splice(index, 1);
}

function onProductChange(item: any) {
  const product = products.value.find(p => p.id === item.product_id);

  if (product) {
    item.unit_price = product.last_purchase_price ?? 0;
    item.category = categories.value.find(c => c.id === product.category_id)?.name ?? "—";
    item.brand = brands.value.find(b => b.id === product.brand_id)?.name ?? "—";
  } else {
    item.unit_price = 0;
    item.category = "";
    item.brand = "";
  }
}

function formatAmount(value: number) {
  return `$${value.toLocaleString("en-US")}`;
}
</script>

<template>
  <Teleport to="body">
    <div class="purchase-modal-overlay" @click.self="$emit('close')">
      <div class="purchase-modal purchase-form-modal">
        <button class="purchase-modal-close" @click="$emit('close')">
          ✕
        </button>

        <h2>CREATE PURCHASE</h2>

        <div class="form-section">
          <div class="purchase-form-header">
            <div>
              <label>Supplier</label>
              <select v-model="form.supplier_id">
                <option
                  v-for="supplier in suppliers"
                  :key="supplier.id"
                  :value="supplier.id"
                >
                  {{ supplier.name }}
                </option>
              </select>
            </div>

            <div>
              <label>Purchase Date</label>
              <input v-model="form.date" type="date" />
            </div>

            <div>
              <label>Status</label>
              <select v-model="form.status">
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
              </select>
            </div>
          </div>
        </div>

        <div class="form-section">
          <div class="section-header">
            <h3>Purchase Items</h3>

            <button class="btn-primary" @click="addItem">
              + Add Product
            </button>
          </div>

          <div class="purchase-products-card">
            <table class="purchase-products-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Brand</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Subtotal</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="(item, index) in form.items" :key="index">
                  <td>
                    <select
                      v-model="item.product_id"
                      @change="onProductChange(item)"
                    >
                      <option
                        v-for="product in products"
                        :key="product.id"
                        :value="product.id"
                      >
                        {{ product.name }}
                      </option>
                    </select>
                  </td>

                  <td>
                    <input :value="item.category" disabled placeholder="—" />
                  </td>

                  <td>
                    <input :value="item.brand" disabled placeholder="—" />
                  </td>

                  <td>
                    <input v-model.number="item.quantity" type="number" min="1" />
                  </td>

                  <td>
                    <input v-model.number="item.unit_price" type="number" min="0" />
                  </td>

                  <td>
                    {{ formatAmount(item.quantity * (item.unit_price || 0)) }}
                  </td>

                  <td>
                    <button @click="removeItem(index)">
                      🗑
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="purchase-total">
          <span>Total</span>
          <strong>{{ formatAmount(total) }}</strong>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
@import url("./purchaseModal.css");
@import url("./purchaseFormModal.css");
@import url("../../assets/styles/badge.css");
</style>