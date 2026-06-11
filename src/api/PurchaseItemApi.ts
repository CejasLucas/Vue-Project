import { http } from "./AppHTTP";

import type { PurchaseItem } from "../types/purchaseItem";

export const purchaseItemApi = {
    getAll() {
        return http.get<PurchaseItem[]>("/purchase-items");
    },

    getById(id: string) {
        return http.get<PurchaseItem>(`/purchase-items/${id}`);
    },
};