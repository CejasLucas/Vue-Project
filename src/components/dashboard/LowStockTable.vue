<script setup lang="ts">

import type { LowStockProductDTO } from "../../types/dashboard";


defineProps<{

  loading:boolean;

  products:LowStockProductDTO[];

}>();

</script>



<template>


<div class="table-card">


  <div class="table-header">

    <span class="chart-title">
      Low Stock
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

          <th>
            Product
          </th>

          <th class="text-right">
            Current
          </th>

          <th class="text-right">
            Minimum
          </th>

          <th class="text-right">
            Missing
          </th>

        </tr>


      </thead>



      <tbody>


        <tr
          v-for="product in products"
          :key="product.id"
        >


          <td>
            {{ product.name }}
          </td>



          <td class="text-right">

            {{ product.current_stock }}

          </td>



          <td class="text-right">

            {{ product.minimum_stock }}

          </td>



          <td class="text-right stock-low">

            {{ product.missing_stock }}

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



.data-table {

  width:100%;

  border-collapse:collapse;

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



.stock-low {

  color:#EF4444;

  font-weight:600;

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