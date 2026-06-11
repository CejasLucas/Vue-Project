<script setup lang="ts">
import { ref, onMounted } from "vue";
import { productApi } from "../api/ProductApi";
import type { Product } from "../types/product";

const products = ref<Product[]>([]);
const loading = ref(true);

onMounted(async () => {
  const response = await productApi.getAll();
  products.value = response.data;
  loading.value = false;
});

function stockStatus(product: Product): "ok" | "low" | "critical" {
  if (product.current_stock === 0) return "critical";
  if (product.current_stock <= product.minimum_stock) return "low";
  return "ok";
}
</script>

<template>
  <div class="page">

    <div class="page-header">
      <div>
        <h1 class="page-title">Products</h1>
        <p class="page-sub">{{ products.length }} registered products</p>
      </div>
    </div>

    <div class="table-card">
      <div v-if="loading">
        <div v-for="n in 6" :key="n" class="skel row-skel" />
      </div>

      <div v-else-if="products.length === 0" class="empty">
        <i class="ti ti-box" aria-hidden="true" />
        <p>No products found.</p>
      </div>

      <div v-else class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 30px">#</th>
              <th style="width: 100px">SKU</th>
              <th style="width: 250px">Name</th>
              <th style="width: 55px">Unit</th>
              <th style="width: 120px">Current stock</th>
              <th style="width: 120px">Minimum stock</th>
              <th style="width: 100px">Price</th>
              <th style="width: 300px">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(product, index) in products" :key="product.id">
              <td class="muted mono">{{ index + 1 }}</td>
              <td class="mono sku">{{ product.sku }}</td>
              
              <td>
                <div class="product-name">
                  <span class="product-dot" :class="`dot-${stockStatus(product)}`" />
                  {{ product.name }}
                </div>
              </td>

              <td class="muted mono">{{ product.unit }}</td>
            
              <td class="text-center mono">
                <span
                  class="stock-badge"
                  :class="`stock-${stockStatus(product)}`"
                >
                  {{ product.current_stock }}
                </span>
              </td>
              <td class="text-center muted mono">{{ product.minimum_stock }}</td>
              <td class="muted mono">$ {{ product.last_purchase_price }}</td>
              <td class="muted mono">{{ product.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<style scoped>
.page {
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}
.page-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-h);
  margin: 0 0 2px;
}
.page-sub {
  font-size: 0.75rem;
  color: var(--text);
  margin: 0;
}

/* Table card */
.table-card {
  background: var(--code-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}

.table-wrap {
  overflow-x: auto;
  overflow-y: visible;
}

.data-table {
  width: 100%;
  min-width: 620px;
  border-collapse: collapse;
  font-size: 0.82rem;
  table-layout: fixed;
}

.data-table th {
  padding: 10px 1.1rem;
  color: var(--text);
  font-weight: 500;
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
  background: var(--code-bg);
  position: sticky;
  top: 0;
  z-index: 1;
}

.data-table td {
  padding: 11px 1.1rem;
  color: var(--text-h);
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.data-table tbody tr:last-child td { border-bottom: none; }
.data-table tbody tr:hover td { background: rgba(55,138,221,0.04); }

/* Product name with status dot */
.product-name {
  display: flex;
  align-items: center;
  gap: 20px;
  font-weight: 500;
}

.product-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 0 4px rgba(55, 138, 221, 0.12);
}
.dot-ok { background: #22c55e;; }
.dot-low   { background: #ad8b19; }
.dot-critical { background: #ef4444; }

/* Stock badge */
.stock-badge {
  display: inline-block;
  padding: 2px 9px;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 500;
}
.stock-ok { background: rgba(48, 124, 61, 0.15); color: #22c55e; }
.stock-low   { background: rgba(197, 173, 63, 0.15);  color: #ad8b19; }
.stock-critical { background: rgba(239,68,68,.12);  color: #dc2626; }

/* Utilities */
.mono      { font-family: var(--mono); font-size: 0.75rem; }
.muted     { color: var(--text); }
.text-left { text-align: left; }
.text-right { text-align: right; }
.text-center { text-align: center; }
.sku       { color: #378ADD; letter-spacing: 0.03em; }
.desc      { font-size: 0.78rem; }

/* Empty */
.empty {
  padding: 3rem 1rem;
  text-align: center;
  color: var(--text);
}
.empty i { font-size: 2rem; margin-bottom: 0.5rem; display: block; }
.empty p { font-size: 0.85rem; margin: 0; }

/* Skeleton */
.skel     { background: var(--border); border-radius: 4px; animation: pulse 1.4s ease-in-out infinite; }
.row-skel { height: 38px; margin: 6px 1rem; border-radius: 6px; }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}
</style>