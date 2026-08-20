<script setup lang="ts">

import type { RecentPurchaseDTO } from "../../types/dashboard";

defineProps<{
  loading: boolean;
  purchases: RecentPurchaseDTO[];
}>();

function formatDate(date:string){

  return new Date(date).toLocaleDateString("en-US",{
    day:"2-digit",
    month:"2-digit",
    year:"numeric"
  });

}

</script>


<template>

<div class="table-card">

  <div class="table-header">
    <span class="chart-title">
      Recent Purchases
    </span>
  </div>


  <div v-if="loading">

    <div
      v-for="n in 5"
      :key="n"
      class="skel row-skel"
    />

  </div>


  <div
    v-else
    class="table-scroll"
  >

    <table class="data-table">

      <thead>

        <tr>
          <th>Purchase</th>
          <th>Supplier</th>
          <th>Date</th>
          <th>Status</th>
          <th class="text-right">
            Total
          </th>
        </tr>

      </thead>


      <tbody>

        <tr
          v-for="purchase in purchases"
          :key="purchase.id"
        >

          <td>
            #{{ purchase.id.slice(-6).toUpperCase() }}
          </td>


          <td>
            {{ purchase.supplier }}
          </td>


          <td>
            {{ formatDate(purchase.purchase_date) }}
          </td>


          <td>

            <span
              class="badge"
              :class="
                purchase.status === 'confirmed'
                ? 'badge-confirmed'
                : 'badge-pending'
              "
            >
              {{ purchase.status }}
            </span>

          </td>


          <td class="text-right">

            ${{ purchase.total_amount.toLocaleString("en-US") }}

          </td>


        </tr>

      </tbody>


    </table>


  </div>


</div>


</template>



<style scoped>

.table-card {

  display:flex;
  flex-direction:column;

  background:var(--code-bg);
  border:1px solid var(--border);
  border-radius:12px;

  overflow:hidden;

}


.table-header {

  padding:.9rem 1rem;
  border-bottom:1px solid var(--border);

}


.chart-title {

  font-size:.9rem;
  font-weight:600;
  color:var(--text-h);

}



.table-scroll {

  overflow:auto;
  max-height:340px;

}


.table-scroll::-webkit-scrollbar {
  width:5px;
}


.table-scroll::-webkit-scrollbar-thumb {

  background:var(--border);
  border-radius:5px;

}



.data-table {

  width:100%;
  border-collapse:collapse;
  table-layout:fixed;

}


.data-table thead {

  position:sticky;
  top:0;
  background:var(--code-bg);

}


.data-table th {

  padding:.7rem 1rem;

  text-align:left;

  font-size:.68rem;
  font-weight:600;

  color:var(--text);

  text-transform:uppercase;

  border-bottom:1px solid var(--border);

}



.data-table td {

  padding:.8rem 1rem;

  font-size:.8rem;

  color:var(--text-h);

  border-bottom:1px solid var(--border);

}


.data-table tbody tr:hover td {

  background:rgba(255,255,255,.02);

}



.text-right {

  text-align:right;

}



.badge {

  display:inline-block;

  padding:2px 10px;

  border-radius:20px;

  font-size:.68rem;

}



.badge-confirmed {

  color:#378ADD;

  background:rgba(55,138,221,.15);

}



.badge-pending {

  color:#A855F7;

  background:rgba(168,85,247,.15);

}



.skel {

  background:var(--border);

  border-radius:6px;

  animation:pulse 1.5s infinite;

}



.row-skel {

  height:40px;
  margin:.5rem 1rem;

}



@keyframes pulse {

  50% {
    opacity:.45;
  }

}

</style>