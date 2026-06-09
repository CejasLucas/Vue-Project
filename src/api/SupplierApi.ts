import { http } from "./AppHTTP";

import type { Supplier } from "../types/supplier";

export const supplierApi = {
    getAll() {
        return http.get<Supplier[]>("/suppliers");
    },

    getById(id: string) {
        return http.get<Supplier>(`/suppliers/${id}`);
    },
};