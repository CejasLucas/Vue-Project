<script setup lang="ts">
import { ref, onMounted } from "vue";
import { supplierApi } from "../api/SupplierApi";
import type { Supplier } from "../types/supplier";

const suppliers = ref<Supplier[]>([]);

onMounted(async () => {
    const response = await supplierApi.getAll();
    suppliers.value = response.data;
});
</script>

<template>
    <div>
        <h1>Proveedores</h1>

        <p>Total proveedores: {{ suppliers.length }}</p>

        <table border="1">
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Telefono</th>
                    <th>Tax ID</th>
                </tr>
            </thead>

            <tbody>
                <tr
                    v-for="supplier in suppliers"
                    :key="supplier.id"
                >
                    <td>{{ supplier.name }}</td>
                    <td>{{ supplier.email }}</td>
                    <td>{{supplier.phone}}</td>
                    <td>{{supplier.tax_id}}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>