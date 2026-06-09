import { http } from "./AppHTTP";

import type { Product } from "../types/product";

export const productApi = {
    getAll() {
        return http.get<Product[]>("/products");
    },

    getById(id: string) {
        return http.get<Product>(`/products/${id}`);
    },
};