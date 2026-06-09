import { http } from "./AppHTTP";

import type { Purchase } from "../types/purchase";

export const purchaseApi = {
    getAll() {
        return http.get<Purchase[]>("/purchases");
    },

    getById(id: string) {
        return http.get<Purchase>(`/purchases/${id}`);
    },
};