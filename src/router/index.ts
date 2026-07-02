import { createRouter, createWebHistory } from "vue-router";

import MainLayout from "../components/layout/MainLayout.vue";

import DashboardView from "../views/AppDashboardView.vue";

import BrandsView from "../views/BrandsView.vue";

import CategoryView from "../views/CategoryView.vue"; 

import ProductView from "../views/ProductView.vue";

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
                    path: "brands",
                    component: BrandsView,
                },
                {
                    path: "categories",
                    component: CategoryView,
                },
                {
                    path: "products",
                    component: ProductView,
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