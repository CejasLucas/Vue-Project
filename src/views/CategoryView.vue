<script setup lang="ts">
import { ref, onMounted } from "vue";
import { categoryApi } from "../api/CategoryApi";
import type { Category } from "../types/category";

const categories = ref<Category[]>([]);

onMounted(async () => {
    const response = await categoryApi.getAll();
    categories.value = response.data;
});
</script>

<template>
    <div>
        <h1>Categorías</h1>

        <p>Total categorías: {{ categories.length }}</p>

        <table border="1">
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Descripción</th>
                </tr>
            </thead>

            <tbody>
                <tr
                    v-for="category in categories"
                    :key="category.id"
                >
                    <td>{{ category.name }}</td>
                    <td>{{ category.description }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>