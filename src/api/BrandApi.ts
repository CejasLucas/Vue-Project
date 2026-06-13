import { http } from "./AppHTTP";

import type { Brand } from "../types/brand";

export const brandApi = {
    getAll() {
        return http.get<Brand[]>("/brands");
    },

    getById(id: string) {
        return http.get<Brand>(`/brands/${id}`);
    },

    create(data: Omit<Brand, "id">) {
        return http.post<Brand>("/brands", data);
    },
    
    update(id: string, data: Partial<Brand>) {
        return http.put<Brand>(`/brands/${id}`, data);
    },
    
    remove(id: string) {
        return http.delete(`/brands/${id}`);
    },
};