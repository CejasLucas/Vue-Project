<script setup lang="ts">
import { onMounted } from "vue";
import { productApi } from "./api/ProductApi";

onMounted(async () => {
    try {
        const response = await productApi.getAll();
        console.log(response.data);
    } catch (error) {
        console.error(error);
    }
});
</script>

<template>
    <RouterView />
</template>