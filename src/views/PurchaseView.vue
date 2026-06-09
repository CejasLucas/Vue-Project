<script setup lang="ts">
import { ref, onMounted } from "vue";
import { purchaseApi } from "../api/PurchaseApi";
import type { Purchase } from "../types/purchase";

const purchases = ref<Purchase[]>([]);

onMounted(async () => {
    const response = await purchaseApi.getAll();
    purchases.value = response.data;
});
</script>

<template>
    <div>
        <h1>Compras</h1>

        <p>Total compras: {{ purchases.length }}</p>

        <table border="1">
            <thead>
                <tr>
                    <th>Dia de la Compra</th>
                    <th>Total</th>
                    <th>Status</th>
                </tr>
            </thead>

            <tbody>
                <tr
                    v-for="purchase in purchases"
                    :key="purchase.id"
                >
                    <td>{{ new Date(purchase.purchase_date).toLocaleDateString("es-AR") }}</td>
                    <td>{{ purchase.total_amount }}</td>
                    <td>{{purchase.status}}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>