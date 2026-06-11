import { http } from "./AppHTTP";

import type { Brand } from "../types/brand";

export const brandApi = {
    getAll() {
        return http.get<Brand[]>("/brands");
    },

    getById(id: string) {
        return http.get<Brand>(`/brands/${id}`);
    },
};