<script setup lang="ts">
import { computed, ref, nextTick, onMounted, onUnmounted } from "vue";
import { Bar } from "vue-chartjs";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend, type ChartOptions } from "chart.js";
import type { SupplierSpendingDTO } from "../../types/dashboard";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const props = defineProps<{
  loading: boolean;
  suppliers: SupplierSpendingDTO[];
}>();

const chartRef = ref();

function resizeChart() {
  nextTick(() => requestAnimationFrame(() => chartRef.value?.chart?.resize()));
}

onMounted(() => window.addEventListener("dashboard-resized", resizeChart));
onUnmounted(() => window.removeEventListener("dashboard-resized", resizeChart));

const chartData = computed(() => ({
  labels: props.suppliers.map(s => s.supplier),
  datasets: [{
    data: props.suppliers.map(s => s.total),
    backgroundColor: "#0891B2",
    borderRadius: 6,
    barThickness: 16
  }]
}));

const chartOptions: ChartOptions<"bar"> = {
  indexAxis: "y",
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: ctx => "$" + Number(ctx.raw).toLocaleString("en-US")
      }
    }
  },
  scales: {
    x: {
      beginAtZero: true,
      grid: { color: "rgba(255,255,255,.05)" },
      ticks: { color: "#94A3B8" }
    },
    y: {
      grid: { display: false },
      ticks: {
        color: "#94A3B8",
        callback(value) {
          const label = this.getLabelForValue(Number(value));
          return label.length > 18 ? label.substring(0,18) + "..." : label;
        }
      }
    }
  }
};
</script>

<template>
<div class="chart-card">
  <div class="header">
    <h3>Top Suppliers</h3>
    <span>{{ suppliers.length }} Suppliers</span>
  </div>

  <div v-if="loading" class="chart-skeleton"/>

  <div v-else class="body">
    <Bar ref="chartRef" :data="chartData" :options="chartOptions"/>
  </div>
</div>
</template>

<style scoped>
.chart-card{display:flex;flex-direction:column;background:var(--code-bg);border:1px solid var(--border);border-radius:12px;padding:1rem;min-height:340px}
.header{display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem}
.header h3{margin:0;font-size:.95rem;color:var(--text-h)}
.header span{font-size:.72rem;color:var(--text)}
.body{flex:1;position:relative}
.body canvas{width:100%!important;height:100%!important}
.chart-skeleton{width:100%;height:100%;background:var(--border);border-radius:8px;animation:pulse 1.5s infinite}
@keyframes pulse{50%{opacity:.45}}
</style>