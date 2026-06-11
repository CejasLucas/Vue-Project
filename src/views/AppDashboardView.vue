<script setup lang="ts">
import { 
  ref, 
  computed, 
  onMounted 
} from "vue";

import { 
  Line, 
  Doughnut 
} from "vue-chartjs";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
} from "chart.js";


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

import { productApi } from "../api/ProductApi";
import { categoryApi } from "../api/CategoryApi";
import { supplierApi } from "../api/SupplierApi";
import { purchaseApi } from "../api/PurchaseApi";
import { purchaseItemApi } from "../api/PurchaseItemApi";

import type { Product } from "../types/product";
import type { Category } from "../types/category";
import type { Supplier } from "../types/supplier";
import type { Purchase } from "../types/purchase";
import type { PurchaseItem } from "../types/purchaseItem";


const products      = ref<Product[]>([]);
const categories    = ref<Category[]>([]);
const suppliers     = ref<Supplier[]>([]);
const purchases     = ref<Purchase[]>([]);
const purchaseItems = ref<PurchaseItem[]>([]);
const loading       = ref(true);

onMounted(async () => {
  const [p, c, s, pu, pi] = await Promise.all([
    productApi.getAll(),
    categoryApi.getAll(),
    supplierApi.getAll(),
    purchaseApi.getAll(),
    purchaseItemApi.getAll(),
  ]);
  products.value      = p.data;
  categories.value    = c.data;
  suppliers.value     = s.data;
  purchases.value     = pu.data;
  purchaseItems.value = pi.data;
  loading.value       = false;
});

// ── Cards ───────────────────────────────────────────────────────────
const totalSpent = computed(() =>
  purchases.value.reduce((acc, p) => acc + p.total_amount, 0)
);

const lowStockProducts = computed(() =>
  products.value.filter((p) => p.current_stock <= p.minimum_stock)
);

const cards = computed(() => [
  {
    label: "Purchases",
    value: purchases.value.length,
    sub: "Historical total",
    icon: "shopping-cart",
    accent: "#378ADD",
    iconBg: "rgba(55,138,221,.15)",
  },
  {
    label: "Total spent",
    value: `$${totalSpent.value.toLocaleString("en-US")}`,
    sub: "Accumulated",
    icon: "currency-dollar",
    accent: "#0891B2",
    iconBg: "rgba(8,145,178,.15)",
  },
  {
    label: "Products",
    value: products.value.length,
    sub: "In catalog",
    icon: "box",
    accent: "#7C3AED",
    iconBg: "rgba(124,58,237,.15)",
  },
  {
    label: "Suppliers",
    value: suppliers.value.length,
    sub: "Registered",
    icon: "truck",
    accent: "#6D28D9",
    iconBg: "rgba(109,40,217,.15)",
  },
  {
    label: "Low stock",
    value: lowStockProducts.value.length,
    sub: "Below minimum",
    icon: "alert-triangle",
    accent: "#A855F7",
    iconBg: "rgba(168,85,247,.15)",
  },
]);

// ── Line graph ─────────────────────────────────────────────────
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const spendingByMonth = computed(() => {
  const currentYear = new Date().getFullYear();
  const totals = Array(12).fill(0);
  purchases.value.forEach((p) => {
    const date = new Date(p.purchase_date);
    if (date.getFullYear() === currentYear)
      totals[date.getMonth()] += p.total_amount;
  });
  return totals;
});

const lineChartData = computed(() => ({
  labels: MONTHS,
  datasets: [
    {
      label: "Monthly spending",
      data: spendingByMonth.value,
      borderColor: "#378ADD",
      backgroundColor: "rgba(55,138,221,0.1)",
      borderWidth: 2,
      pointBackgroundColor: "#378ADD",
      pointBorderColor: "#378ADD",
      pointRadius: 3,
      pointHoverRadius: 5,
      tension: 0.4,
      fill: true,
    },
  ],
}));

const lineChartOptions: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: {
      grid: { color: "rgba(255,255,255,0.04)" },
      border: { dash: [4, 4] },
      ticks: { color: "#6b7280", font: { size: 11 } },
    },
    y: {
      grid: { color: "rgba(255,255,255,0.04)" },
      border: { dash: [4, 4] },
      ticks: {
        color: "#6b7280",
        font: { size: 11 },
        callback: (v) =>
          Number(v) >= 1_000_000
            ? `$${Number(v) / 1_000_000}M`
            : Number(v) >= 1000
            ? `$${Number(v) / 1000}K`
            : `$${v}`,
      },
    },
  },
};

// ── Donut chart ──────────────────────────────────────────────────
const DONA_COLORS = [
  "#378ADD",
  "#0891B2",
  "#7C3AED",
  "#6D28D9",
  "#A855F7",
];

const donutData = computed(() => {
  const prodCat = new Map(products.value.map((p) => [p.id, p.category_id]));
  const catName = new Map(categories.value.map((c) => [c.id, c.name]));

  const totals: Record<string, number> = {};
  purchaseItems.value.forEach((item) => {
    const catId = prodCat.get(item.product_id);
    if (!catId) return;
    const name = catName.get(catId) ?? "Other";
    totals[name] = (totals[name] ?? 0) + item.quantity * item.unit_price;
  });

  const sorted = Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return {
    labels: sorted.map(([k]) => k),
    datasets: [
      {
        data: sorted.map(([, v]) => v),
        backgroundColor: DONA_COLORS,
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  };
});

const donutTotal = computed(() =>
  (donutData.value.datasets[0]?.data as number[]).reduce((a, b) => a + b, 0)
);

const donutOptions: ChartOptions<"doughnut"> = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: "72%",
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx) => ` $${(ctx.raw as number).toLocaleString("en-US")}`,
      },
    },
  },
};

// ── Últimas compras ──────────────────────────────────────────────────
const supplierMap = computed(() =>
  new Map(suppliers.value.map((s) => [s.id, s.name]))
);

const lastPurchases = computed(() =>
  [...purchases.value]
    .sort((a, b) => new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime())
    .slice(0, 12)
);

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ── Stock bajo ───────────────────────────────────────────────────────
const lowStock = computed(() =>
  lowStockProducts.value
    .sort((a, b) => a.current_stock - b.current_stock)
    .slice(0, 10)
);
</script>

<template>
  <div class="dashboard">

    <!-- Cards -->
    <div class="cards">
      <template v-if="loading">
        <div v-for="n in 5" :key="n" class="card skeleton-card">
          <div class="skel icon-skel" />
          <div class="skel label-skel" />
          <div class="skel value-skel" />
          <div class="skel sub-skel" />
        </div>
      </template>
      <template v-else>
        <div v-for="card in cards" :key="card.label" class="card">
          <div class="card-header">
            <div class="card-accent" :style="{ background: card.accent }" />
            <div class="card-icon" :style="{ background: card.iconBg, color: card.accent }">
              <i :class="`ti ti-${card.icon}`" aria-hidden="true" />
            </div>
            <p class="card-label">{{ card.label }}</p>
          </div>
          <p class="card-value">{{ card.value }}</p>
          <p class="card-sub">{{ card.sub }}</p>
        </div>
      </template>
    </div>

    <!-- Gráficos -->
    <div class="charts-row">

      <div class="chart-card">
        <div class="chart-header">
          <span class="chart-title">Spending by Month</span>
          <span class="chart-badge">{{ new Date().getFullYear() }}</span>
        </div>
        <div class="chart-body">
          <div v-if="loading" class="skel chart-skel" />
          <Line v-else :data="lineChartData" :options="lineChartOptions" />
        </div>
      </div>

      <div class="chart-card">
        <div class="chart-header">
          <span class="chart-title">Spending by Category</span>
          <span class="chart-badge">Top 5</span>
        </div>
        <div v-if="loading" class="chart-body">
          <div class="skel chart-skel" />
        </div>
        <div v-else class="donut-body">
          <div class="donut-wrap">
            <Doughnut :data="donutData" :options="donutOptions" />
            <div class="donut-center">
              <span class="donut-total-label">Total</span>
              <span class="donut-total-value">
                ${{ Math.round(donutTotal / 1000).toLocaleString("en-US") }}K
              </span>
            </div>
          </div>
          <ul class="donut-legend">
            <li
              v-for="(label, i) in donutData.labels"
              :key="String(label)"
              class="legend-item"
            >
              <span class="legend-dot" :style="{ background: DONA_COLORS[i] }" />
              <span class="legend-name">{{ label }}</span>
              <span class="legend-pct">
                {{ Math.round((donutData.datasets[0].data[i] as number) / donutTotal * 100) }}%
              </span>
              <span class="legend-value">
                ${{ (donutData.datasets[0].data[i] as number).toLocaleString("en-US") }}
              </span>
            </li>
          </ul>
        </div>
      </div>

    </div>

    <!-- Tablas -->
    <div class="tables-row">

      <div class="table-card">
        <div class="table-header">
          <span class="chart-title">Recent Purchases</span>
        </div>
        <div v-if="loading">
          <div v-for="n in 5" :key="n" class="skel row-skel" />
        </div>
        <div v-else class="table-scroll">
          <table class="data-table">
            <colgroup>
              <col style="width: 80px">
              <col style="width: 125px">
              <col style="width: 100px">
              <col style="width: 85px">
              <col style="width: 100px">
            </colgroup>
            <thead>
              <tr>
                <th>Purchase</th>
                <th>Supplier</th>
                <th>Date</th>
                <th class="text-center">Status</th>
                <th class="text-center">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in lastPurchases" :key="p.id">
                <td class="mono">#{{ p.id.slice(-6).toUpperCase() }}</td>
                <td class="truncate">{{ supplierMap.get(p.supplier_id) ?? "—" }}</td>
                <td>{{ formatDate(p.purchase_date) }}</td>
                <td class="text-center">
                  <span
                    class="badge"
                    :class="p.status === 'confirmed' ? 'badge-confirmed' : 'badge-pending'"
                  >
                    {{ p.status === "confirmed" ? "Confirmed" : "Pending" }}
                  </span>
                </td>
                <td class="text-right mono"> ${{ p.total_amount.toLocaleString("en-US") }} </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="table-card">
        <div class="table-header">
          <span class="chart-title">Low Stock</span>
        </div>
        <div v-if="loading">
          <div v-for="n in 5" :key="n" class="skel row-skel" />
        </div>
        <div v-else class="table-scroll">
          <table class="data-table">
            <colgroup>
              <col style="width: 110px">
              <col style="width: 50px">
              <col style="width: 60px">
            </colgroup>
            <thead>
              <tr>
                <th>Product</th>
                <th class="text-right">Current</th>
                <th class="text-right">Minimum</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in lowStock" :key="p.id">
                <td class="truncate">{{ p.name }}</td>
                <td class="text-right stock-low">{{ p.current_stock }}</td>
                <td class="text-right muted">{{ p.minimum_stock }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.dashboard { padding: 1.25rem 1.5rem; display: flex; flex-direction: column; gap: 1rem; }

/* ── Cards ── */
.cards {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
}
.card {
  background: var(--code-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 0.875rem 1rem 0.75rem;
  position: relative;
  overflow: hidden;
  transition: border-color 0.2s, transform 0.15s;
}
.card:hover { border-color: var(--accent-border); transform: translateY(-2px); }

.card-header {
  display: flex; align-items: center; gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.card-accent {
  position: absolute; top: 0; left: 0; right: 0; height: 3px;
  border-radius: 12px 12px 0 0;
}
.card-icon {
  width: 30px; height: 30px; border-radius: 7px;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; margin-bottom: 8px;
}
.card-label {
  font-size: 0.75rem; color: var(--text);
  letter-spacing: 0.07em; text-transform: uppercase;
}
.card-value {
  font-size: 1.35rem; font-weight: 600; color: var(--text-h);
  margin: 0 0 3px; line-height: 1.1;
}
.card-sub { font-size: 0.65rem; color: var(--text); margin: 0; }

/* ── Charts ── */
.charts-row {
  display: grid;
  grid-template-columns: 2.5fr 1fr;
  gap: 0.5rem;
}
.chart-card {
  background: var(--code-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.chart-header { display: flex; align-items: center; justify-content: space-between; }
.chart-title  { font-size: 0.88rem; font-weight: 600; color: var(--text-h); }
.chart-badge  {
  font-size: 0.7rem; color: var(--text);
  background: var(--border); padding: 2px 10px; border-radius: 20px;
}
.chart-body { height: 10rem; position: relative; }

/* Donut */
.donut-body {
  display: grid;
  grid-template-columns: 130px 1fr;
  align-items: center;
  gap: 1rem;
}
.donut-wrap { position: relative; width: 130px; height: 130px; flex-shrink: 0; }
.donut-center {
  position: absolute; inset: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  pointer-events: none;
}
.donut-total-label {
  font-size: 0.58rem; color: var(--text);
  text-transform: uppercase; letter-spacing: 0.06em;
}
.donut-total-value { font-size: 0.9rem; font-weight: 600; color: var(--text-h); }

.donut-legend { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
.legend-item  { display: flex; align-items: center; gap: 7px; }
.legend-dot   { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.legend-name  { flex: 1; font-size: 0.75rem; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.legend-pct   { font-size: 0.7rem; color: var(--text); min-width: 30px; text-align: right; }
.legend-value { font-size: 0.75rem; color: var(--text-h); font-weight: 500; min-width: 82px; text-align: right; }

/* ── Tables ── */
.tables-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 0.5rem;
}
.table-card {
  background: var(--code-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.table-header {
  padding: 0.8rem 1.25rem;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

/* Scroll container — altura fija, thead sticky */
.table-scroll {
  overflow-y: auto;
  max-height: 19.5rem;
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
}
.table-scroll::-webkit-scrollbar {
  width: 4px;
}
.table-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.table-scroll::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 4px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
  table-layout: fixed;
}
.data-table thead {
  position: sticky;
  top: 0;
  z-index: 1;
  background: var(--code-bg);
}
.data-table th {
  padding: 6px 1rem;
  color: var(--text);
  font-weight: 500;
  font-size: 0.67rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}
.data-table td {
  padding: 10px 1rem;
  color: var(--text-h);
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.data-table tbody tr:last-child td { border-bottom: none; }
.data-table tbody tr:hover td { background: rgba(255,255,255,0.02); }

.text-right { text-align: right; }
.text-center { text-align: center; }
.mono       { font-family: var(--mono); font-size: 0.75rem; }
.muted      { color: var(--text); }
.stock-low  { color: #E53E3E; font-weight: 600; }
.truncate   { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 0.67rem;
  font-weight: 500;
}
.badge-confirmed { background: rgba(55,138,221,.15); color: #378ADD; }
.badge-pending   { background: rgba(168,85,247,.15);  color: #A855F7; }

/* ── Skeleton ── */
.skeleton-card { pointer-events: none; }
.skel { background: var(--border); border-radius: 4px; animation: pulse 1.4s ease-in-out infinite; }
.icon-skel  { width: 28px; height: 28px; border-radius: 7px; margin-bottom: 8px; }
.label-skel { width: 55%; height: 7px; margin-bottom: 5px; }
.value-skel { width: 38%; height: 20px; margin-bottom: 5px; }
.sub-skel   { width: 60%; height: 7px; }
.chart-skel { width: 100%; height: 100%; border-radius: 8px; }
.row-skel   { height: 34px; margin: 6px 1rem; border-radius: 6px; }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}

@media (max-width: 1100px) {
  .cards { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 900px) {
  .cards { grid-template-columns: repeat(2, 1fr); }
  .charts-row, .tables-row { grid-template-columns: 1fr; }
}
</style>