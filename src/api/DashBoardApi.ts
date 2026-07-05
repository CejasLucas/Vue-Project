import { http } from "./AppHTTP";

import type { DashboardSummaryDTO } from "../types/dashboard";

export const dashboardApi = {
    getDashboard() {
        return http.get<DashboardSummaryDTO>("/dashboard");
    },
};