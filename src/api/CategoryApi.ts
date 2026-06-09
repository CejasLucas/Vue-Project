import { http } from "./AppHTTP";

import type { Category } from "../types/category";

export const categoryApi = {
    getAll() {
        return http.get<Category[]>("/categories");
    },

    getById(id: string) {
        return http.get<Category>(`/categories/${id}`);
    },
};