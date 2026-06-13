<script setup lang="ts">
import { ref, onMounted } from "vue";
import { purchaseApi } from "../api/PurchaseApi";
import type { Purchase } from "../types/purchase";
import type { PurchaseDetail } from "../types/purchaseDetails";


const loading = ref(true);
const showDetails = ref(false);
const loadingDetails = ref(false);

const purchases = ref<Purchase[]>([]);
const purchaseDetail = ref<PurchaseDetail | null>(null);


onMounted(async () => {
  const response = await purchaseApi.getAll();
  purchases.value = response.data;
  loading.value = false;
});


async function openDetails(id: string) {
  loadingDetails.value = true;

  try {
    const response = await purchaseApi.getDetails(id);
    purchaseDetail.value = response.data;
    showDetails.value = true;
  } finally {
    loadingDetails.value = false;
  }
}

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
    <!--Empty State-->
    <div class="page-header">
      <div>
        <h1 class="page-title">Purchases</h1>
        <p class="page-sub">{{ purchases.length }} registered purchases</p>
      </div>

      <button class="btn-primary">
        <i class="ti ti-plus" />
        Add purchase
      </button>
    </div>


    <div class="table-card">
      <!-- Loading -->
      <div v-if="loading">
        <div v-for="n in 5" :key="n" class="skel row-skel" />
      </div>

      <!-- Empty -->
      <div v-else-if="purchases.length === 0" class="empty">
        <i class="ti ti-shopping-cart" aria-hidden="true" />
        <p>No purchases found.</p>
      </div>

      <!-- Table -->
      <div v-else class="table-wrap">
        <table class="data-table">
          <!-- Table Titles -->
          <thead>
            <tr>
              <th class="text-left table-header" style="width: 50px">#</th>
              <th class="text-left table-header" style="width: 100px">PURCHASE ID</th>
              <th class="text-left table-header" style="width: 100px">DATE</th>
              <th class="text-left table-header" style="width: 100px">TOTAL</th>
              <th class="text-center table-header" style="width: 100px">STATUS</th>
              <th class="text-left table-header" style="width: 100px">PURCHASE DETAILS</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(purchase, index) in purchases" :key="purchase.id">
              <td class="muted table-content-index">
                {{ index + 1 }}
              </td>
              <td>
                <div class="name table-content-name">
                  <span class="dot"/>
                  {{ purchase.id.slice(-6).toUpperCase() }}
                </div>
              </td>
              <td class="muted table-content">
                {{ formatDate(purchase.purchase_date) }}
              </td>
              <td class="mono amount table-content">
                {{ formatAmount(purchase.total_amount) }}
              </td>
              <td class="text-center">
                <span
                  class="badge"
                  :class="purchase.status === 'confirmed' ? 'badge-confirmed' : 'badge-pending'"
                >
                  <span class="badge-dot" />
                  {{ statusLabel(purchase.status) }}
                </span>
              </td>
              <td>
                <button
                  class="details-link"
                  @click="openDetails(purchase.id)"
                >
                  Details
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="showDetails"
        class="budget-modal-overlay"
        @click.self="showDetails = false"
      >
        <div class="budget-modal">

          <div class="budget-modal-header">
            <h2 class="budget-modal-title">
              Purchase Details
            </h2>

            <button
              class="budget-modal-close-btn"
              @click="showDetails = false"
            >
              ✕
            </button>
          </div>

          <div
            v-if="purchaseDetail"
            class="budget-modal-body"
          >
            <div class="budget-modal-info">
              <div>
                <strong>Purchase ID</strong>
                {{ purchaseDetail.id.slice(-6).toUpperCase() }}
              </div>

              <div>
                <strong>Date</strong>
                {{ formatDate(purchaseDetail.purchase_date) }}
              </div>

              <div>
                <strong>Status</strong>
                {{ statusLabel(purchaseDetail.status) }}
              </div>
            </div>

            <table class="budget-modal-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Subtotal</th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="item in purchaseDetail.items"
                  :key="item.product_id"
                >
                  <td>{{ item.product_name }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>{{ formatAmount(item.unit_price) }}</td>
                  <td>{{ formatAmount(item.subtotal) }}</td>
                </tr>
              </tbody>
            </table>

            <div class="budget-modal-total">
              <span>Total:</span>

              <strong>
                {{ formatAmount(purchaseDetail.total_amount) }}
              </strong>
            </div>
          </div>

        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
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

.details-link {
  border: none;
  background: transparent;
  color: #378ADD;
  cursor: pointer;
  font-weight: 600;
}

.details-link:hover {
  text-decoration: underline;
}
</style>