<script setup lang="ts">
import { ref, onMounted } from "vue";
import { supplierApi } from "../api/SupplierApi";
import type { Supplier } from "../types/supplier";

const suppliers = ref<Supplier[]>([]);
const loading = ref(true);

onMounted(async () => {
  const response = await supplierApi.getAll();
  suppliers.value = response.data;
  loading.value = false;
});

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

const AVATAR_COLORS = [
  { bg: "rgba(55,138,221,.15)",  color: "#378ADD" },
  { bg: "rgba(124,58,237,.15)",  color: "#7C3AED" },
  { bg: "rgba(8,145,178,.15)",   color: "#0891B2" },
  { bg: "rgba(168,85,247,.15)",  color: "#A855F7" },
  { bg: "rgba(34,197,94,.12)",   color: "#16a34a" },
];

function avatarStyle(index: number) {
  const c = AVATAR_COLORS[index % AVATAR_COLORS.length];
  return { background: c.bg, color: c.color };
}
</script>

<template>
  <div class="page">

    <div class="page-header">
      <div>
        <h1 class="page-title">Suppliers</h1>
        <p class="page-sub">{{ suppliers.length }} registered suppliers</p>
      </div>
    </div>

    <div class="table-card">
      <div v-if="loading">
        <div v-for="n in 5" :key="n" class="skel row-skel" />
      </div>

      <div v-else-if="suppliers.length === 0" class="empty">
        <i class="ti ti-truck" aria-hidden="true" />
        <p>No suppliers found.</p>
      </div>

      <div v-else class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 30px">#</th>
              <th style="width: 200px">Name</th>
              <th style="width: 150px">Phone</th>
              <th style="width: 225px">Email</th>
              <th style="width: 300px">Address</th>
              <th style="width: 100px">Locality</th>
              <th style="width: 100px">Nationality</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(supplier, index) in suppliers" :key="supplier.id">
              <td class="muted mono">{{ index + 1 }}</td>
              <td>
                <div class="supplier-name">
                  <div class="avatar" :style="avatarStyle(index)">
                    {{ initials(supplier.name) }}
                  </div>
                  <span class="name-text">{{ supplier.name }}</span>
                </div>
              </td>

              <td class="mono muted">{{ supplier.phone ?? "—" }}</td>
              <td>
                <a :href="`mailto:${supplier.email}`" class="email-link"> {{ supplier.email ?? "—" }} </a>
              </td>
              <td class="mono muted">{{ supplier.address ?? "—" }}</td>
              <td class="mono muted">{{ supplier.locality ?? "—" }}</td>
              <td class="mono muted">{{ supplier.nationality ?? "—" }}</td>
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
  min-width: 560px;
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

.data-table tbody tr:last-child td { border-bottom: none; }
.data-table tbody tr:hover td { background: rgba(55,138,221,0.04); }

/* Supplier name with avatar */
.supplier-name {
  display: flex;
  align-items: center;
  gap: 9px;
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 600;
  flex-shrink: 0;
  letter-spacing: 0.02em;
}

.name-text {
  font-weight: 500;
  color: var(--text-h);
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Email link */
.email-link {
  color: #378ADD;
  text-decoration: none;
  font-size: 0.8rem;
}
.email-link:hover { text-decoration: underline; }

/* Utilities */
.mono       { font-family: var(--mono); font-size: 0.75rem; }
.muted      { color: var(--text); }

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
.row-skel { height: 42px; margin: 6px 1rem; border-radius: 6px; }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}
</style>