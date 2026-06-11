<script setup lang="ts">
import { ref, onMounted } from "vue";
import { categoryApi } from "../api/CategoryApi";
import type { Category } from "../types/category";

const categories = ref<Category[]>([]);
const loading = ref(true);

onMounted(async () => {
  const response = await categoryApi.getAll();
  categories.value = response.data;
  loading.value = false;
});
</script>

<template>
  <div class="page">

    <div class="page-header">
      <div>
        <h1 class="page-title">Categories</h1>
        <p class="page-sub">{{ categories.length }} registered categories</p>
      </div>
    </div>

    <div class="table-card">
      <div v-if="loading">
        <div v-for="n in 5" :key="n" class="skel row-skel" />
      </div>

      <div v-else-if="categories.length === 0" class="empty">
        <i class="ti ti-tag" aria-hidden="true" />
        <p>No categories found.</p>
      </div>

      <div v-else class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 20px">#</th>
              <th style="width: 150px">Name</th>
              <th style="width: 150px">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(category, index) in categories" :key="category.id">
              <td class="muted mono">{{ index + 1 }}</td>
              <td>
                <div class="cat-name">
                  <span class="cat-dot" />
                  {{ category.name }}
                </div>
              </td>
              <td class="muted">{{ category.description ?? "—" }}</td>
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

/* Header */
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

/* Scroll wrapper — horizontal scroll only on the table itself */
.table-wrap {
  overflow-x: auto;
  overflow-y: visible;
}

.data-table {
  width: 100%;
  min-width: 400px;
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
  padding: 10px 1.1rem;
  color: var(--text-h);
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.data-table tbody tr:hover td {
  background: rgba(55, 138, 221, 0.04);
}

/* Category name with dot */
.cat-name {
  display: flex;
  align-items: center;
  gap: 20px;
  font-weight: 500;
  color: var(--text-h);
}

.cat-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #378add;
  flex-shrink: 0;
  box-shadow: 0 0 0 4px rgba(55, 138, 221, 0.12);
}

/* Utilities */
.mono  { font-family: var(--mono); font-size: 0.72rem; }
.muted { color: var(--text); }
.text-center { text-align: center; }
.text-right  { text-align: right; }
.text-left   { text-align: left; }

/* Empty state */
.empty {
  padding: 3rem 1rem;
  text-align: center;
  color: var(--text);
}
.empty i  { font-size: 2rem; margin-bottom: 0.5rem; display: block; }
.empty p  { font-size: 0.85rem; margin: 0; }

/* Skeleton */
.skel      { background: var(--border); border-radius: 4px; animation: pulse 1.4s ease-in-out infinite; }
.row-skel  { height: 38px; margin: 6px 1rem; border-radius: 6px; }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}
</style>