<script setup lang="ts">
import { computed, ref, nextTick, onMounted, onUnmounted } from "vue";
import { Doughnut } from "vue-chartjs";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js";

import type { CategorySpendingDTO } from "../../types/dashboard";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

const props = defineProps<{
  loading: boolean;
  categories: CategorySpendingDTO[];
}>();

const chartRef = ref();

const COLORS = [
  "#378ADD",
  "#0891B2",
  "#7C3AED",
  "#A855F7",
  "#EC4899",
];

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

const total = computed(() =>
  props.categories.reduce((sum, c) => sum + c.total, 0)
);

const chartData = computed(() => ({
  labels: props.categories.map(c => c.category),
  datasets: [{
    data: props.categories.map(c => c.total),
    backgroundColor: COLORS,
    borderWidth: 0,
    hoverOffset: 8
  }]
}));

const chartOptions: ChartOptions<"doughnut"> = {
  responsive:true,
  maintainAspectRatio:false,
  cutout:"68%",

  plugins:{
    legend:{
      display:false
    },

    tooltip:{
      callbacks:{
        label:(ctx)=>
          "$" + Number(ctx.raw).toLocaleString("en-US")
      }
    }
  }
};
</script>

<template>

<div class="chart-card">

    <div class="header">
        <h3>Spending by Category</h3>
        <span>Top Categories</span>
    </div>

    <div
        v-if="loading"
        class="chart-skeleton"
    />

    <div
        v-else
        class="content"
    >

        <div class="donut">

            <Doughnut
                ref="chartRef"
                :data="chartData"
                :options="chartOptions"
            />

            <div class="center">
                <small>Total</small>

                <strong>
                    ${{ total.toLocaleString("en-US") }}
                </strong>
            </div>

        </div>


        <div class="legend">

            <div
                v-for="(category,index) in categories"
                :key="category.category"
                class="legend-item"
            >

                <span
                    class="dot"
                    :style="{ background: COLORS[index] }"
                />

                <span class="name">
                    {{ category.category }}
                </span>

                <span class="value">
                    {{ ((category.total / total) * 100).toFixed(0) }}%
                </span>

            </div>

        </div>

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

    font-size:.72rem;

    color:var(--text);

}

.content{
    flex:1;

    display:flex;
    flex-direction:column;

    align-items:center;
    justify-content:center;

    gap:1.25rem;
}


.donut{

    position:relative;

    width:220px;
    height:220px;

}


.center{

    position:absolute;

    inset:0;

    display:flex;

    flex-direction:column;

    justify-content:center;

    align-items:center;

    pointer-events:none;

}


.center small{

    color:var(--text);

    font-size:.75rem;

}


.center strong{

    color:var(--text-h);

    font-size:1.05rem;

    font-weight:600;

}


.legend{

    width:100%;

    display:flex;

    flex-direction:column;

    gap:.45rem;

}


.legend-item{

    display:flex;

    align-items:center;

    gap:.6rem;

}


.dot{

    width:10px;

    height:10px;

    border-radius:50%;

    flex-shrink:0;

}


.name{

    flex:1;

    color:var(--text);

    font-size:.78rem;

}


.value{

    color:var(--text-h);

    font-weight:600;

    font-size:.75rem;

}

.chart-skeleton{

    width:100%;

    height:100%;

    background:var(--border);

    border-radius:8px;

    animation:pulse 1.5s infinite;

}

@keyframes pulse{

    50%{

        opacity:.45;

    }

}

@media(max-width:900px){

    .content{

        grid-template-columns:1fr;

        justify-items:center;

    }

}

</style>