<script setup lang="ts">
import { computed } from "vue";

import type {
  DashboardCountsDTO,
  DashboardKPIDTO,
} from "../../types/dashboard";

const props = defineProps<{
  loading: boolean;
  counts: DashboardCountsDTO;
  kpis: DashboardKPIDTO;
}>();

const cards = computed(() => [
  {
    label: "Suppliers",
    value: props.counts.amount_suppliers,
    sub: "Registered",
    icon: "truck",
    accent: "#6D28D9",
    iconBg: "rgba(109,40,217,.15)",
  },
  {
    label: "Products",
    value: props.counts.amount_products,
    sub: "Catalog",
    icon: "box",
    accent: "#7C3AED",
    iconBg: "rgba(124,58,237,.15)",
  },
  {
    label: "Purchases",
    value: props.counts.amount_purchases,
    sub: "Confirmed",
    icon: "shopping-cart",
    accent: "#378ADD",
    iconBg: "rgba(55,138,221,.15)",
  },
  {
    label: "Low Stock",
    value: props.counts.low_stock_count,
    sub: "Need restock",
    icon: "alert-triangle",
    accent: "#DC2626",
    iconBg: "rgba(220,38,38,.15)",
  },
  {
    label: "Total Spent",
    value: `$${props.counts.total_spent.toLocaleString("en-US")}`,
    sub: "Accumulated",
    icon: "currency-dollar",
    accent: "#0891B2",
    iconBg: "rgba(8,145,178,.15)",
  },
  {
    label: "Growth",
    value: `${props.kpis.monthly_growth_percentage.toFixed(1)}%`,
    sub: "Vs last month",
    icon: "trending-up",
    accent: "#10B981",
    iconBg: "rgba(16,185,129,.15)",
  },
]);
</script>

<template>
  <div class="cards">

    <template v-if="loading">
      <div
        v-for="n in 6"
        :key="n"
        class="card skeleton-card"
      >
        <div class="skel icon-skel"></div>
        <div class="skel label-skel"></div>
        <div class="skel value-skel"></div>
        <div class="skel sub-skel"></div>
      </div>
    </template>

    <template v-else>
      <div
        v-for="card in cards"
        :key="card.label"
        class="card"
      >
        <div
          class="card-accent"
          :style="{ background: card.accent }"
        ></div>

        <div class="card-header">

          <div
            class="card-icon"
            :style="{
              background: card.iconBg,
              color: card.accent
            }"
          >
            <i :class="`ti ti-${card.icon}`"></i>
          </div>

          <span class="card-label">
            {{ card.label }}
          </span>

        </div>

        <div class="card-value">
          {{ card.value }}
        </div>

        <div class="card-sub">
          {{ card.sub }}
        </div>

      </div>
    </template>

  </div>
</template>

<style scoped>

.cards{
  display:grid;
  grid-template-columns:repeat(6,1fr);
  gap:.75rem;
}

.card{
  position:relative;
  overflow:hidden;

  padding:.9rem 1rem;

  border:1px solid var(--border);
  border-radius:12px;

  background:var(--code-bg);

  transition:.2s;
}

.card:hover{
  transform:translateY(-2px);
  border-color:var(--accent-border);
}

.card-accent{
  position:absolute;
  top:0;
  left:0;
  right:0;
  height:3px;
}

.card-header{
  display:flex;
  align-items:center;
  gap:.75rem;
  margin-bottom:.6rem;
}

.card-icon{
  width:32px;
  height:32px;

  display:flex;
  align-items:center;
  justify-content:center;

  border-radius:8px;

  font-size:18px;
}

.card-label{
  font-size:.72rem;
  text-transform:uppercase;
  letter-spacing:.05em;
  color:var(--text);
}

.card-value{
  font-size:1.35rem;
  font-weight:600;
  color:var(--text-h);
}

.card-sub{
  margin-top:4px;
  font-size:.68rem;
  color:var(--text);
}

/* Skeleton */

.skel{
  background:var(--border);
  border-radius:6px;
  animation:pulse 1.5s infinite;
}

.icon-skel{
  width:32px;
  height:32px;
  margin-bottom:.7rem;
}

.label-skel{
  width:55%;
  height:8px;
  margin-bottom:.5rem;
}

.value-skel{
  width:40%;
  height:22px;
  margin-bottom:.45rem;
}

.sub-skel{
  width:65%;
  height:8px;
}

@keyframes pulse{
  50%{
    opacity:.45;
  }
}

@media(max-width:1200px){

  .cards{
    grid-template-columns:repeat(3,1fr);
  }

}

@media(max-width:700px){

  .cards{
    grid-template-columns:repeat(2,1fr);
  }

}

</style>