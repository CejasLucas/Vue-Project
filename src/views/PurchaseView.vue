<script setup lang="ts">
import { ref, onMounted } from "vue";
import { purchaseApi } from "../api/PurchaseApi";
import type { Purchase } from "../types/purchase";

const purchases = ref<Purchase[]>([]);
const loading = ref(true);

onMounted(async () => {
  const response = await purchaseApi.getAll();
  purchases.value = response.data;
  loading.value = false;
});

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatAmount(n: number) {
  return `$${n.toLocaleString("en-US")}`;
}

type Status = "confirmed" | "pending" | string;

function statusLabel(s: Status) {
  if (s === "confirmed") return "Confirmed";
  if (s === "pending")   return "Pending";
  return s;
}
</script>

<template>
  <div class="page">

    <div class="page-header">
      <div>
        <h1 class="page-title">Purchases</h1>
        <p class="page-sub">{{ purchases.length }} registered purchases</p>
      </div>
    </div>

    <div class="table-card">
      <div v-if="loading">
        <div v-for="n in 6" :key="n" class="skel row-skel" />
      </div>

      <div v-else-if="purchases.length === 0" class="empty">
        <i class="ti ti-shopping-cart" aria-hidden="true" />
        <p>No purchases found.</p>
      </div>

      <div v-else class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 50px">#</th>
              <th style="width: 100px">Purchase ID</th>
              <th style="width: 100px">Date</th>
              <th style="width: 100px">Total</th>
              <th class="text-center" style="width: 130px">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(purchase, index) in purchases" :key="purchase.id">
              <td class="muted mono">{{ index + 1 }}</td>
              <td class="mono purchase-id">#{{ purchase.id.slice(-6).toUpperCase() }}</td>
              <td class="muted">{{ formatDate(purchase.purchase_date) }}</td>
              <td class="mono amount">{{ formatAmount(purchase.total_amount) }}</td>
              <td class="text-center">
                <span
                  class="badge"
                  :class="purchase.status === 'confirmed' ? 'badge-confirmed' : 'badge-pending'"
                >
                  <span class="badge-dot" />
                  {{ statusLabel(purchase.status) }}
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
  min-width: 520px;
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

/* Purchase ID */
.purchase-id {
  color: #378ADD;
  letter-spacing: 0.03em;
}

/* Amount */
.amount {
  font-weight: 600;
  color: var(--text-h);
}

/* Badge */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.68rem;
  font-weight: 500;
}

.badge-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
}

.badge-confirmed { background: rgba(55,138,221,.15); color: #378ADD; }
.badge-pending   { background: rgba(168,85,247,.15);  color: #A855F7; }

.badge-confirmed .badge-dot { background: #378ADD; }
.badge-pending .badge-dot { background: #A855F7; }

/* Utilities */
.mono       { font-family: var(--mono); font-size: 0.75rem; }
.muted      { color: var(--text); }
.text-right  { text-align: right; }
.text-center { text-align: center; }

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