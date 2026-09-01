<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";

import { purchaseApi } from "../../api/PurchaseApi";
import { productApi } from "../../api/ProductApi";
import { supplierApi } from "../../api/SupplierApi";

import type { PurchaseDetailDTO } from "../../types/purchaseDetails";
import type { ProductItem } from "../../types/product";

/* ── Types ─────────────────────────────────────────── */

interface SupplierOption {
  id: string;
  name: string;
  tax_id?: string;
  email?: string;
  phone?: string;
  address?: string;
  locality?: string;
  nationality?: string;
}

interface FormItem {
  product_id: string;
  name: string;
  category: string;
  brand: string;
  unit: string;
  quantity: number;
  unit_price: number;
}

/* ── Props / Emits ─────────────────────────────────── */

const props = defineProps<{
  purchase: PurchaseDetailDTO | null;
}>();

const emit = defineEmits(["close", "saved"]);

const isEdit = computed(() => !!props.purchase?.id);

/* ── State ─────────────────────────────────────────── */

const saving = ref(false);
const loadingOptions = ref(true);

const products = ref<ProductItem[]>([]);
const suppliers = ref<SupplierOption[]>([]);

const form = reactive({
  supplier_id: "",
  purchase_date: "",
  status: "pending",
  items: [] as FormItem[],
});

/* ── Helpers ───────────────────────────────────────── */

function toId(value: unknown): string {
  return value == null ? "" : String(value);
}

function extractSupplierId(purchase: PurchaseDetailDTO): string {
  const supplier: any = purchase.supplier ?? {};

  return toId(
    supplier.id ??
      supplier.supplier_id ??
      (purchase as any).supplier_id ??
      ""
  );
}

function extractProductId(item: any): string {
  const product = item.product ?? {};

  return toId(
    product.id ??
      product.product_id ??
      item.product_id ??
      ""
  );
}

/* ── Load options + prefill on edit ───────────────── */

onMounted(async () => {
  try {
    const [productsRes, suppliersRes] = await Promise.all([
      productApi.getAllItems(),
      supplierApi.getAll(),
    ]);

    products.value = (productsRes.data ?? []).map((product) => ({
      ...product,
      id: toId(product.id),
      category_id: toId(product.category_id),
      brand_id: toId(product.brand_id),
    }));

    suppliers.value = (suppliersRes.data ?? []).map((supplier: any) => ({
      ...supplier,
      id: toId(supplier.id ?? supplier.supplier_id),
    }));
  } finally {
    loadingOptions.value = false;
  }

  if (props.purchase) {
    form.supplier_id = extractSupplierId(props.purchase);

    form.purchase_date =
      props.purchase.purchase_date?.slice(0, 10) ?? "";

    form.status =
      (props.purchase.status || "pending").toLowerCase();

    form.items = props.purchase.items.map((item: any) => {
      const productId = extractProductId(item);

      const product = products.value.find(
        (p) => p.id === productId
      );

      return {
        product_id: productId,
        name: item.product?.name ?? product?.name ?? "",
        category:
          item.product?.category ??
          product?.category ??
          "",
        brand:
          item.product?.brand ??
          product?.brand ??
          "",
        unit:
          item.product?.unit ??
          product?.unit ??
          "",
        quantity: item.quantity ?? 1,
        unit_price:
          item.unit_price ??
          product?.unit_price ??
          0,
      };
    });
  } else {
    form.purchase_date = new Date()
      .toISOString()
      .slice(0, 10);

    addItem();
  }
});

/* ── Supplier seleccionado ────────────────────────── */

const selectedSupplier = computed(() =>
  suppliers.value.find(
    (supplier) => supplier.id === form.supplier_id
  ) ?? null
);

/* ── Items ────────────────────────────────────────── */

function addItem() {
  form.items.push({
    product_id: "",
    name: "",
    category: "",
    brand: "",
    unit: "",
    quantity: 1,
    unit_price: 0,
  });
}

function removeItem(index: number) {
  form.items.splice(index, 1);
}

function onProductChange(item: FormItem) {
  const selected = products.value.find(
    (product) => product.id === item.product_id
  );

  if (!selected) return;

  item.name = selected.name;
  item.category = selected.category;
  item.brand = selected.brand;
  item.unit = selected.unit;
  item.unit_price = selected.unit_price;
}

function subtotal(item: FormItem) {
  return (
    (item.quantity || 0) *
    (item.unit_price || 0)
  );
}

const totalAmount = computed(() =>
  form.items.reduce(
    (sum, item) => sum + subtotal(item),
    0
  )
);

function formatAmount(n: number) {
  return `$${n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/* ── Save ─────────────────────────────────────────── */

const canSave = computed(() => {
  if (!form.supplier_id || !form.purchase_date) {
    return false;
  }

  if (form.items.length === 0) {
    return false;
  }

  return form.items.every(
    (item) =>
      item.product_id &&
      item.quantity > 0 &&
      item.unit_price >= 0
  );
});

async function handleSubmit() {
  if (!canSave.value || saving.value) return;

  saving.value = true;

  try {
    const payload = {
      supplier_id: form.supplier_id,
      purchase_date: form.purchase_date,
      status: form.status,
      items: form.items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
      })),
    };

    if (isEdit.value && props.purchase) {
      await purchaseApi.update(
        props.purchase.id,
        payload
      );
    } else {
      await purchaseApi.create(payload);
    }

    emit("saved");
    emit("close");
  } finally {
    saving.value = false;
  }
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
          type="button"
          @click="$emit('close')"
        >
          ✕
        </button>

        <form
          class="form"
          @submit.prevent="handleSubmit"
        >

          <!-- Header -->
          <div class="purchase-info-card">

            <div class="purchase-info-item">
              <span>Purchase</span>
              <strong>
                {{
                  isEdit
                    ? `#${props.purchase!.id
                        .slice(-10)
                        .toUpperCase()}`
                    : "New"
                }}
              </strong>
            </div>

            <div class="purchase-info-item">
              <span>Date</span>

              <input
                v-model="form.purchase_date"
                type="date"
                class="form-field-input"
                required
              />
            </div>

            <div class="purchase-info-item">
              <span>Items</span>
              <strong>
                {{ form.items.length }}
              </strong>
            </div>

            <div class="purchase-info-item">
              <span>Total</span>
              <strong class="purchase-total-highlight">
                {{ formatAmount(totalAmount) }}
              </strong>
            </div>

            <div class="purchase-info-item">
              <span>Status</span>

              <select
                v-model="form.status"
                class="form-field-select status-select"
              >
                <option value="pending">
                  Pending
                </option>

                <option value="confirmed">
                  Confirmed
                </option>
              </select>
            </div>

          </div>

          <!-- Supplier -->
          <div class="purchase-supplier-card">

            <div class="purchase-supplier-icon">
              <i class="ti ti-building-store"></i>
            </div>

            <div class="purchase-supplier-block">
              <span class="purchase-field-label">
                Supplier
              </span>

              <select
                v-model="form.supplier_id"
                class="form-field-select"
                required
                :disabled="loadingOptions"
              >
                <option
                  value=""
                  disabled
                >
                  Select a supplier
                </option>

                <option
                  v-for="supplier in suppliers"
                  :key="supplier.id"
                  :value="supplier.id"
                >
                  {{ supplier.name }}
                </option>
              </select>
            </div>

            <div class="purchase-supplier-block">
              <span class="purchase-field-label">
                Contact
              </span>

              <strong>
                {{ selectedSupplier?.email || "—" }}
              </strong>

              <small>
                {{ selectedSupplier?.phone || "—" }}
              </small>
            </div>

            <div class="purchase-supplier-block">
              <span class="purchase-field-label">
                Address
              </span>

              <strong>
                {{ selectedSupplier?.address || "—" }}
              </strong>

              <small>
                {{ selectedSupplier?.locality || "" }}

                <template
                  v-if="selectedSupplier?.nationality"
                >
                  , {{ selectedSupplier.nationality }}
                </template>
              </small>
            </div>

          </div>

          <!-- Products -->
          <div class="purchase-products-card">

            <div class="purchase-form-products-header">
              <h3>Products</h3>

              <button
                type="button"
                class="btn-primary"
                @click="addItem"
              >
                + Add product
              </button>
            </div>

            <table class="purchase-products-table">

              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Brand</th>
                  <th>Unit</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Subtotal</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>

                <tr
                  v-if="form.items.length === 0"
                >
                  <td
                    colspan="8"
                    class="purchase-empty-items"
                  >
                    No products added yet.
                  </td>
                </tr>

                <tr
                  v-for="(item, index) in form.items"
                  :key="index"
                >

                  <!-- Product -->
                  <td>
                    <select
                      v-model="item.product_id"
                      class="form-field-select"
                      required
                      :disabled="loadingOptions"
                      @change="onProductChange(item)"
                    >
                      <option
                        value=""
                        disabled
                      >
                        Select product
                      </option>

                      <option
                        v-for="product in products"
                        :key="product.id"
                        :value="product.id"
                      >
                        {{ product.name }}
                      </option>
                    </select>
                  </td>

                  <!-- Category -->
                  <td>
                    <span class="readonly-cell">
                      {{ item.category || "—" }}
                    </span>
                  </td>

                  <!-- Brand -->
                  <td>
                    <span class="readonly-cell">
                      {{ item.brand || "—" }}
                    </span>
                  </td>

                  <!-- Unit -->
                  <td>
                    <span class="readonly-cell">
                      {{ item.unit || "—" }}
                    </span>
                  </td>

                  <!-- Quantity -->
                  <td>
                    <input
                      v-model.number="item.quantity"
                      type="number"
                      min="1"
                      class="form-field-input qty-input"
                      required
                    />
                  </td>

                  <!-- Unit Price -->
                  <td>
                    <input
                      v-model.number="item.unit_price"
                      type="number"
                      min="0"
                      step="0.01"
                      class="form-field-input price-input"
                      required
                    />
                  </td>

                  <!-- Subtotal -->
                  <td>
                    {{ formatAmount(subtotal(item)) }}
                  </td>

                  <!-- Delete -->
                  <td>
                    <button
                      type="button"
                      class="purchase-remove-item"
                      @click="removeItem(index)"
                    >
                      <i class="ti ti-trash"></i>
                    </button>
                  </td>

                </tr>

              </tbody>

            </table>

          </div>

          <!-- Total -->
          <div class="purchase-total">
            <span>Total</span>

            <strong>
              {{ formatAmount(totalAmount) }}
            </strong>
          </div>

          <!-- Footer -->
          <div class="modal-footer">

            <button
              type="button"
              class="btn-secondary"
              @click="$emit('close')"
            >
              Cancel
            </button>

            <button
              type="submit"
              class="btn btn-primary"
              :disabled="!canSave || saving"
            >
              {{
                saving
                  ? "Saving..."
                  : isEdit
                    ? "Save changes"
                    : "Create purchase"
              }}
            </button>

          </div>

        </form>

      </div>
    </div>
  </Teleport>
</template>

<style scoped>
@import "../../styles/modal.css";
@import "../../styles/buttons.css";
@import "../../styles/badge.css";
@import "./purchaseModalForm.css";
</style>