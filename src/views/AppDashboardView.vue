<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from "vue";

import { dashboardApi } from "../api/DashBoardApi";

import type { DashboardSummaryDTO } from "../types/dashboard";

import DashboardCards from "../components/dashboard/DashboardCards.vue";
import MonthlySpendingChart from "../components/dashboard/MonthlySpendingChart.vue";
import SpendingCategoryChart from "../components/dashboard/SpendingCategoryChart.vue";
import TopSuppliersChart from "../components/dashboard/TopSuppliersChart.vue";
import TopProductsChart from "../components/dashboard/TopProductsChart.vue";
import RecentPurchasesTable from "../components/dashboard/RecentPurchasesTable.vue";
import LowStockTable from "../components/dashboard/LowStockTable.vue";

const loading = ref(true);
const dashboard = ref<DashboardSummaryDTO | null>(null);

function notifyChartsResize() {
  nextTick(() => {
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event("dashboard-resized"));
    });
  });
}

onMounted(async () => {
  window.addEventListener("sidebar-resized", notifyChartsResize);

  const { data } = await dashboardApi.getDashboard();

  dashboard.value = data;

  loading.value = false;

  notifyChartsResize();
});

onUnmounted(() => {
  window.removeEventListener("sidebar-resized", notifyChartsResize);
});
</script>

<template>
  <div class="dashboard" v-if="dashboard">

    <DashboardCards
      :loading="loading"
      :counts="dashboard.counts"
      :kpis="dashboard.kpis"
    />

    <div class="charts-row">

      <MonthlySpendingChart
        :loading="loading"
        :year="dashboard.year"
        :expenses="dashboard.monthly_expenses"
      />

      <SpendingCategoryChart
        :loading="loading"
        :categories="dashboard.spending_by_category"
      />

    </div>

    <div class="charts-row charts-half">

      <TopSuppliersChart
        :loading="loading"
        :suppliers="dashboard.top_suppliers"
      />

      <TopProductsChart
        :loading="loading"
        :products="dashboard.top_products"
      />

    </div>

    <div class="tables-row">

      <RecentPurchasesTable
        :loading="loading"
        :purchases="dashboard.recent_purchases"
      />

      <LowStockTable
        :loading="loading"
        :products="dashboard.low_stock_products"
      />

    </div>

  </div>
</template>

<style scoped>

.dashboard{
    display:flex;
    flex-direction:column;
    gap:1rem;
    padding:1.25rem 1.5rem;
}

.charts-row{
    display:grid;
    grid-template-columns:2fr 1fr;
    gap:.75rem;
}

.charts-half{
    grid-template-columns:1fr 1fr;
}

.tables-row{
    display:grid;
    grid-template-columns:2fr 1fr;
    gap:.75rem;
}

@media(max-width:900px){

    .charts-row,
    .charts-half,
    .tables-row{
        grid-template-columns:1fr;
    }

}

</style>