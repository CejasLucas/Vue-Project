import { http } from "./AppHTTP";

import type { Product } from "../types/product";
import type { ProductItem } from "../types/product";

export const productApi = {
    getAll() {
        return http.get<Product[]>("/products");
    },

    getAllItems() {
        return http.get<ProductItem[]>("/products/items");  
    },
    
    getAllUnits() {
        return http.get<{ value: string; label: string }[]>("/products/units");
    },


    getById(id: string) {
        return http.get<Product>(`/products/${id}`);
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