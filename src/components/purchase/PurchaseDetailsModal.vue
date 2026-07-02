<script setup lang="ts">
import type { PurchaseDetailDTO } from "../../types/purchaseDetails";

const props = defineProps<{
  purchase: PurchaseDetailDTO;
}>();

defineEmits(["close"]);

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
  <Teleport to="body">
    <div
      class="purchase-modal-overlay"
      @click.self="$emit('close')"
    >
      <div class="purchase-modal">

        <button
          class="purchase-modal-close"
          @click="$emit('close')"
        >
          ✕
        </button>

        <div class="purchase-info-card">

          <div class="purchase-info-item">
            <span>Purchase</span>
            <strong>
              #{{ props.purchase.id.slice(-10).toUpperCase() }}
            </strong>
          </div>

          <div class="purchase-info-item">
            <span>Date</span>
            <strong>
              {{ formatDate(props.purchase.purchase_date) }}
            </strong>
          </div>

          <div class="purchase-info-item">
            <span>Items</span>
            <strong>
              {{ props.purchase.items.length }}
            </strong>
          </div>

          <div class="purchase-info-item">
            <span>Total</span>
            <strong class="purchase-total-highlight">
              {{ formatAmount(props.purchase.total_amount) }}
            </strong>
          </div>

          <div class="purchase-info-item">
            <span>Status</span>

            <span
              class="badge"
              :class="
                props.purchase.status === 'confirmed'
                  ? 'badge-confirmed'
                  : 'badge-pending'
              "
            >
              <span class="badge-dot" />
              {{ statusLabel(props.purchase.status) }}
            </span>
          </div>

        </div>

        <div class="purchase-supplier-card">

          <div class="purchase-supplier-icon">
            <i class="ti ti-building-store"></i>
          </div>

          <div class="purchase-supplier-block">
            <span class="purchase-field-label">Supplier</span>
            <strong>{{ props.purchase.supplier.name }}</strong>
            <small>NIF: {{ props.purchase.supplier.tax_id }}</small>
          </div>

          <div class="purchase-supplier-block">
            <span class="purchase-field-label">Contact</span>
            <strong>{{ props.purchase.supplier.email }}</strong>
            <small>{{ props.purchase.supplier.phone }}</small>
          </div>

          <div class="purchase-supplier-block">
            <span class="purchase-field-label">Address</span>
            <strong>{{ props.purchase.supplier.address }}</strong>
            <small>
              {{ props.purchase.supplier.locality }},
              {{ props.purchase.supplier.nationality }}
            </small>
          </div>

        </div>

        <div class="purchase-products-card">

          <table class="purchase-products-table">

            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Brand</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Subtotal</th>
              </tr>
            </thead>

            <tbody>

              <tr
                v-for="item in props.purchase.items"
                :key="item.product.product_id"
              >
                <td>{{ item.product.name }}</td>
                <td>{{ item.product.category }}</td>
                <td>{{ item.product.brand }}</td>
                <td>{{ item.quantity }}</td>
                <td>{{ formatAmount(item.unit_price) }}</td>
                <td>{{ formatAmount(item.subtotal) }}</td>
              </tr>

            </tbody>

          </table>

        </div>

        <div class="purchase-total">
          <span>Total</span>

          <strong>
            {{ formatAmount(props.purchase.total_amount) }}
          </strong>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<style scoped>
@import url("./purchaseModal.css");
@import url("./purchaseDetailsModal.css");
@import url("../../assets/styles/badge.css");
</style>