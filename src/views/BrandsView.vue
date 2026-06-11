<script setup lang="ts">
import { ref, onMounted } from "vue";
import { brandApi } from "../api/BrandApi";
import type { Brand } from "../types/brand";

const brands = ref<Brand[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const response = await brandApi.getAll();
    brands.value = response.data;
  } catch (error) {
    console.error("Error loading brands:", error);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Brands</h1>
        <p class="page-sub">{{ brands.length }} registered brands</p>
      </div>
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
          <thead>
            <tr>
              <th style="width: 50px">#</th>
              <th style="width: 200px">Name</th>
              <th style="width: 200px">Nationality</th>
              <th style="width: 150px">Status</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(brand, index) in brands" :key="brand.id">
              <td class="mono muted">
                {{ index + 1 }}
              </td>

              <td>
                <div class="brand-name">
                  <span class="brand-dot" />
                  {{ brand.name }}
                </div>
              </td>

              <td class="muted">
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

/* Card */
.table-card {
  background: var(--code-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}

/* Scroll */
.table-wrap {
  overflow-x: auto;
  overflow-y: visible;
}

/* Table */
.data-table {
  width: 100%;
  min-width: 650px;
  border-collapse: collapse;
  font-size: 0.82rem;
  table-layout: fixed;
}

.data-table th {
  padding: 10px 1.1rem;
  color: var(--text);
  font-weight: 600;
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
  background: var(--code-bg);
  position: sticky;
  top: 0;
  z-index: 1;
}

.data-table td {
  padding: 5px 1.1rem;
  color: var(--text-h);
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.data-table tbody tr {
  transition: all 0.15s ease;
}

.data-table tbody tr:hover td {
  background: rgba(55, 138, 221, 0.05);
}

/* Brand Name */
.brand-name {
  display: flex;
  align-items: center;
  gap: 20px;
  font-weight: 500;
}

.brand-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #378add;
  flex-shrink: 0;
  box-shadow: 0 0 0 4px rgba(55, 138, 221, 0.12);
}

/* Status Badge */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 4px 15px;
  border-radius: 999px;
  font-size: 0.72rem;
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

/* Utilities */
.mono {
  font-family: var(--mono);
  font-size: 0.72rem;
}

.muted {
  color: var(--text);
}

/* Empty State */
.empty {
  padding: 3rem 1rem;
  text-align: center;
  color: var(--text);
}

.empty i {
  font-size: 2.2rem;
  margin-bottom: 0.75rem;
  display: block;
  opacity: 0.7;
}

.empty p {
  font-size: 0.85rem;
  margin: 0;
}

/* Skeleton */
.skel {
  background: var(--border);
  border-radius: 4px;
  animation: pulse 1.4s ease-in-out infinite;
}

.row-skel {
  height: 42px;
  margin: 6px 1rem;
  border-radius: 6px;
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