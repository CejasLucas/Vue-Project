<script setup lang="ts">
import { ref, onMounted } from "vue";
import { productApi } from "../api/ProductApi";
import type { Product } from "../types/product";

const products = ref<Product[]>([]);

onMounted(async () => {
    const response = await productApi.getAll();
    products.value = response.data;
});
</script>

<template>
    <div>
        <h1>Productos</h1>

        <p>Total productos: {{ products.length }}</p>

        <table border="1">
            <thead>
                <tr>
                    <th>SKU</th>
                    <th>Nombre</th>
                    <th>Descripcion</th>
                    <th>Stock Minimo</th>
                    <th>Stock Actual</th>
                </tr>
            </thead>

            <tbody>
                <tr
                    v-for="product in products"
                    :key="product.id"
                >
                    <td>{{ product.sku }}</td>
                    <td>{{ product.name }}</td>
                    <td>{{product.description}}</td>
                    <td>{{product.minimum_stock}}</td>
                    <td>{{ product.current_stock }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>