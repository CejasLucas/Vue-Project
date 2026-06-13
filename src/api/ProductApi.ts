import { http } from "./AppHTTP";

import type { Product } from "../types/product";

export const productApi = {
    getAll() {
        return http.get<Product[]>("/products");
    },

    getById(id: string) {
        return http.get<Product>(`/products/${id}`);
    },

    getUnits() {
        return http.get<{ value: string; label: string }[]>("/products/units");
    },

    create(data: Omit<Product, "id">) {
        return http.post<Product>("/products", data);
    },

    update(id: string, data: Partial<Product>) {
        return http.put<Product>(`/products/${id}`, data);
    },
    
    remove(id: string) {
        return http.delete(`/products/${id}`);
    },
};