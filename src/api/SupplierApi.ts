import { http } from "./AppHTTP";

import type { Supplier } from "../types/supplier";

export const supplierApi = {
    getAll() {
        return http.get<Supplier[]>("/suppliers");
    },

    getById(id: string) {
        return http.get<Supplier>(`/suppliers/${id}`);
    },
  
    create(data: Omit<Supplier, "id">) {
        return http.post<Supplier>("/suppliers", data);
    },
  
    update(id: string, data: Partial<Supplier>) {
        return http.put<Supplier>(`/suppliers/${id}`, data);
    },
  
    remove(id: string) {
        return http.delete(`/suppliers/${id}`);
    },
};