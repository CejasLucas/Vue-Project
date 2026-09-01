<script setup lang="ts">
import { ref, onMounted } from "vue";

import { purchaseApi } from "../../api/PurchaseApi.ts";
import type { Purchase } from "../../types/purchase.ts";
import type { PurchaseDetailDTO } from "../../types/purchaseDetails.ts";

import PurchaseModalForm from "./PurchaseModalForm.vue";
import PurchaseModalView from "./PurchaseModalView.vue";

import DataTable, { type DataTableColumn } from "../../components/common/DataTable.vue";

const loading = ref(true);
const purchases = ref<Purchase[]>([]);
const purchaseDetail = ref<PurchaseDetailDTO | null>(null);

const showDetails = ref(false);
const showFormModal = ref(false);
const selectedPurchaseForEdit = ref<PurchaseDetailDTO | null>(null);

// Estados para el borrado
const deleting = ref(false);
const deleteTarget = ref<Purchase | null>(null);

const columns: DataTableColumn[] = [
  { key: "id", label: "PURCHASE ID", width: "100px" },
  { key: "purchase_date", label: "DATE", width: "90px" },
  { key: "total_amount", label: "TOTAL", width: "90px" },
  { key: "status", label: "STATUS", align: "center", width: "90px" },
];

onMounted(async () => {
  await fetchPurchases();
});

async function fetchPurchases() {
  loading.value = true;
  try {
    const response = await purchaseApi.getAll();
    purchases.value = response.data;
  } finally {
    loading.value = false;
  }
}

// Visualizar detalles de la compra
async function openDetails(purchase: Purchase) {
  const response = await purchaseApi.getDetails(purchase.id);
  purchaseDetail.value = response.data;
  showDetails.value = true;
}

function closeDetails() {
  showDetails.value = false;
  purchaseDetail.value = null;
}

// Abrir modal de edición
async function openEdit(purchase: Purchase) {
  const response = await purchaseApi.getDetails(purchase.id);
  selectedPurchaseForEdit.value = response.data;
  showFormModal.value = true;
}

function closeForm() {
  showFormModal.value = false;
  selectedPurchaseForEdit.value = null;
}

// Funciones de borrado
function confirmDelete(purchase: Purchase) {
  deleteTarget.value = purchase;
}

async function doDelete() {
  if (!deleteTarget.value) return;

  deleting.value = true;
  try {
    await purchaseApi.delete(deleteTarget.value.id);
    await fetchPurchases();
    deleteTarget.value = null;
  } finally {
    deleting.value = false;
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

function statusLabel(status: string) {
  const st = (status || "").toLowerCase();
  if (st === "confirmed" || st === "approved") return "Confirmed";
  if (st === "pending") return "Pending";
  if (st === "rejected") return "Rejected";
  return status;
}
</script>

<template>
  <DataTable
    :items="purchases"
    :columns="columns"
    :loading="loading"
    title="Purchases"
    entity-label="purchase"
    empty-icon="ti-shopping-cart"
    empty-text="No purchases found."
    :search-keys="['id', 'status']"
    @add="showFormModal = true"
    @view="openDetails"
    @edit="openEdit"
    @delete="confirmDelete"
  >
    <template #cell-id="{ item }">
      <div class="name">
        <span class="dot" />
        {{ item.id.slice(-6).toUpperCase() }}
      </div>
    </template>

    <template #cell-purchase_date="{ item }">
      <span class="muted">{{ formatDate(item.purchase_date) }}</span>
    </template>

    <template #cell-total_amount="{ item }">
      <span class="mono amount">{{ formatAmount(item.total_amount) }}</span>
    </template>

    <template #cell-status="{ item }">
      <span
        class="badge"
        :class="
          item.status?.toLowerCase() === 'confirmed' || item.status?.toLowerCase() === 'approved'
            ? 'badge-confirmed'
            : 'badge-pending'
        "
      >
        <span class="badge-dot" />
        {{ statusLabel(item.status) }}
      </span>
    </template>
  </DataTable>

  <PurchaseModalView
    v-if="showDetails && purchaseDetail"
    :purchase="purchaseDetail"
    @close="closeDetails"
  />

  <PurchaseModalForm
    v-if="showFormModal"
    :purchase="selectedPurchaseForEdit"
    @close="closeForm"
    @saved="fetchPurchases"
  />

  <!-- Modal Delete -->
  <Teleport to="body">
    <div v-if="deleteTarget" class="overlay" @click.self="deleteTarget = null">
      <div class="modal modal--sm">
        <div class="modal-header">
          <h2 class="modal-title">Delete purchase?</h2>
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
            {{ deleting ? "Deleting..." : "Yes, delete" }}
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

/* ── Purchase ──────────────────────────────────────── */
@import "../../styles/badge.css";
</style>