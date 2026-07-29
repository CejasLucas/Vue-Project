<script setup lang="ts">
import { computed, ref, nextTick, onMounted, onUnmounted } from "vue";
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js";

import type { MonthlyExpenseDTO } from "../../types/dashboard";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

const props = defineProps<{
  loading: boolean;
  year: number;
  expenses: MonthlyExpenseDTO[];
}>();

const chartRef = ref();

function resizeChart() {
  nextTick(() => {
    requestAnimationFrame(() => {
      chartRef.value?.chart?.resize();
    });
  });
}

onMounted(() => {
  window.addEventListener("dashboard-resized", resizeChart);
});

onUnmounted(() => {
  window.removeEventListener("dashboard-resized", resizeChart);
});

const chartData = computed(() => ({
  labels: props.expenses.map(e => e.month),
  datasets: [
    {
      label: "Monthly Spending",
      data: props.expenses.map(e => e.total),
      backgroundColor: "#378ADD",
      borderRadius: 8,
      borderSkipped: false,
      maxBarThickness: 40,
    },
  ],
}));

const chartOptions: ChartOptions<"bar"> = {
  responsive: true,
  maintainAspectRatio: false,
  resizeDelay: 150,

  plugins: {
    legend: {
      display: false,
    },

    tooltip: {
      callbacks: {
        label: (ctx) =>
          "$" + Number(ctx.raw).toLocaleString("en-US"),
      },
    },
  },

  scales: {

    x: {
      grid: {
        display: false,
      },

      ticks: {
        color: "#94A3B8",
      },
    },

    y: {

      beginAtZero: true,

      grid: {
        color: "rgba(255,255,255,.05)",
      },

      ticks: {

        color: "#94A3B8",

        callback(value) {

          const n = Number(value);

          if (n >= 1000000)
            return `$${n / 1000000}M`;

          if (n >= 1000)
            return `$${n / 1000}K`;

          return `$${n}`;

        }

      }

    }

  }

};
</script>

<template>

<div class="chart-card">

    <div class="header">

        <div>
            <h3>Monthly Spending</h3>
            <span>{{ year }}</span>
        </div>

    </div>

    <div class="body">

        <div
            v-if="loading"
            class="chart-skeleton"
        />

        <Bar
            v-else
            ref="chartRef"
            :data="chartData"
            :options="chartOptions"
        />

    </div>

</div>

</template>

<style scoped>

.chart-card{

    display:flex;
    flex-direction:column;

    background:var(--code-bg);

    border:1px solid var(--border);

    border-radius:12px;

    padding:1rem;

    min-height:420px;

}

.header{

    display:flex;

    justify-content:space-between;

    align-items:center;

    margin-bottom:1rem;

}

.header h3{

    margin:0;

    font-size:.95rem;

    color:var(--text-h);

}

.header span{

    color:var(--text);

    font-size:.72rem;

}

.body{

    flex:1;

    position:relative;

}

.body canvas{

    width:100%!important;

    height:100%!important;

}

.chart-skeleton{

    width:100%;

    height:100%;

    border-radius:8px;

    background:var(--border);

    animation:pulse 1.5s infinite;

}

@keyframes pulse{

    50%{

        opacity:.45;

    }

}

</style>