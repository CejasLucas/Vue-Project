import { http } from "./AppHTTP";

import type { Purchase } from "../types/purchase";

import type { PurchaseDetailDTO } from "../types/purchaseDetails";

export const purchaseApi = {
    getAll() {
        return http.get<Purchase[]>("/purchases");
    },

    getById(id: string) {
        return http.get<Purchase>(`/purchases/${id}`);
    },

    getDetails(id: string) {
        return http.get<PurchaseDetailDTO>(`/purchases/details/${id}`);
    },
};