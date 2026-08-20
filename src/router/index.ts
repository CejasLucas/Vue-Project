import { createRouter, createWebHistory } from "vue-router";

import MainLayout from "../components/layout/MainLayout.vue";

import DashboardView from "../views/dashboard/AppDashboardView.vue";

import BrandsView from "../views/brand/BrandsView.vue";

import CategoryView from "../views/category/CategoryView.vue"; 

import ProductView from "../views/product/ProductView.vue";

import SupplierView from "../views/supplier/SupplierView.vue";

import PurchaseView from "../views/purchase/PurchaseView.vue";


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