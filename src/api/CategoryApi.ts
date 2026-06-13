import { http } from "./AppHTTP";

import type { Category } from "../types/category";

export const categoryApi = {
    getAll() {
        return http.get<Category[]>("/categories");
    },

    getById(id: string) {
        return http.get<Category>(`/categories/${id}`);
    },

    create(data: Omit<Category, "id">) {
        return http.post<Category>("/categories", data);
    },

    update(id: string, data: Partial<Category>) {
        return http.put<Category>(`/categories/${id}`, data);
    },
    
    remove(id: string) {
        return http.delete(`/categories/${id}`);
    },
};