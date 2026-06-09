import { createRouter, createWebHistory } from "vue-router";

import MainLayout from "../layout/MainLayout.vue";

import DashboardView from "../views/AppDashboardView.vue";

import ProductView from "../views/ProductView.vue";

import CategoryView from "../views/CategoryView.vue"; 

import SupplierView from "../views/SupplierView.vue";

import PurchaseView from "../views/PurchaseView.vue";

const router = createRouter({
    history: createWebHistory(),

    routes: [
        {
            path: "/",

            component: MainLayout,

            children: [
                {
                    path: "",
                    component: DashboardView,
                },

                {
                    path: "products",
                    component: ProductView,
                },

                {
                    path: "categories",
                    component: CategoryView,
                },
                {
                    path: "suppliers",
                    component: SupplierView,
                },
                {
                    path: "purchases",
                    component: PurchaseView,
                }
            ],
        },
    ],
});

export default router;