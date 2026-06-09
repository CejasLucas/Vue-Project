<script setup lang="ts">
import { ref, onMounted } from "vue";

import { productApi } from "../api/ProductApi";
import { categoryApi } from "../api/CategoryApi";
import { supplierApi } from "../api/SupplierApi";
import { purchaseApi } from "../api/PurchaseApi";

import type { Product } from "../types/product";
import type { Category } from "../types/category";
import type { Supplier } from "../types/supplier";
import type { Purchase } from "../types/purchase";

const products = ref<Product[]>([]);
const categories = ref<Category[]>([]);
const suppliers = ref<Supplier[]>([]);
const purchases = ref<Purchase[]>([]);

onMounted(async () => {
    const [
        productsResponse,
        categoriesResponse,
        suppliersResponse,
        purchasesResponse,
    ] = await Promise.all([
        productApi.getAll(),
        categoryApi.getAll(),
        supplierApi.getAll(),
        purchaseApi.getAll(),
    ]);

    products.value = productsResponse.data;
    categories.value = categoriesResponse.data;
    suppliers.value = suppliersResponse.data;
    purchases.value = purchasesResponse.data;
});

</script>



<template>
    <div>
        <h1>Dashboard</h1>

        <div class="cards">
            <div class="card">
                <h3>Productos</h3>
                <p>{{ products.length }}</p>
            </div>

            <div class="card">
                <h3>Categorías</h3>
                <p>{{ categories.length }}</p>
            </div>

            <div class="card">
                <h3>Proveedores</h3>
                <p>{{ suppliers.length }}</p>
            </div>

            <div class="card">
                <h3>Compras</h3>
                <p>{{ purchases.length }}</p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.cards {
    display: flex;
    gap: 20px;
    margin-top: 30px;
}

.card {
    background: #1e293b;
    padding: 20px;
    border-radius: 10px;
    min-width: 200px;
}
</style>