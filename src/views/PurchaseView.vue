<script setup lang="ts">
import { ref, onMounted } from "vue";

import { purchaseApi } from "../api/PurchaseApi";
import type { Purchase } from "../types/purchase";
import type { PurchaseDetailDTO } from "../types/purchaseDetails";

import PurchaseFormModal from "../components/purchase/PurchaseFormModal.vue";
import PurchaseDetailsModal from "../components/purchase/PurchaseDetailsModal.vue";


const loading = ref(true);
const purchases = ref<Purchase[]>([]);
const purchaseDetail = ref<PurchaseDetailDTO | null>(null);

const showDetails = ref(false);
const showCreateModal = ref(false);

onMounted(async () => {
  const response = await purchaseApi.getAll();

  purchases.value = response.data;

  loading.value = false;
});

async function openDetails(id: string) {
  const response = await purchaseApi.getDetails(id);

  purchaseDetail.value = response.data;

  showDetails.value = true;
}

function closeDetails() {
  showDetails.value = false;
  purchaseDetail.value = null;
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

function statusLabel(status: string) {
  if (status === "confirmed") return "Confirmed";
  if (status === "pending") return "Pending";
  return status;
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

      <button
        class="btn-primary"
        @click="showCreateModal = true"
      >
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
              <th class="text-left table-header" style="width: 90px">DATE</th>
              <th class="text-left table-header" style="width: 90px">TOTAL</th>
              <th class="text-center table-header" style="width: 90px">STATUS</th>
              <th class="text-center table-header" style="width: 110px">PURCHASE DETAILS</th>
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
              <td class="text-center">
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

    <PurchaseDetailsModal
      v-if="showDetails && purchaseDetail"
      :purchase="purchaseDetail"
      @close="closeDetails"
    />

    <PurchaseFormModal
      v-if="showCreateModal"
      @close="showCreateModal = false"
    />

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

/* ── Purchase ──────────────────────────────────────── */
@import "../assets/styles/badge.css";

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