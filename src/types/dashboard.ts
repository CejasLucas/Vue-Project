export interface ExpensesPerMonthDTO {
  jan: number;
  feb: number;
  mar: number;
  apr: number;
  may: number;
  jun: number;
  jul: number;
  aug: number;
  sep: number;
  oct: number;
  nov: number;
  dec: number;
}

export interface CategorySpendingDTO {
  category: string;
  total: number;
}

export interface SupplierSpendingDTO {
  supplier: string;
  total: number;
}

export interface RecentPurchaseDTO {
  id: string; // UUID
  supplier: string;
  purchase_date: string; 
  status: string;
  total_amount: number;
}

export interface LowStockProductDTO {
  id: string; // UUID
  name: string;
  current_stock: number;
  minimum_stock: number;
}

export interface DashboardCountsDTO {
  amount_purchases: number;
  amount_products: number;
  amount_suppliers: number;
  low_stock_count: number;
  total_pending: number;
}

export interface DashboardSummaryDTO {
  year: number;
  counts: DashboardCountsDTO;
  expenses_per_month: ExpensesPerMonthDTO;
  spending_by_category: CategorySpendingDTO[];
  top_suppliers: SupplierSpendingDTO[];
  recent_purchases: RecentPurchaseDTO[];
  low_stock_products: LowStockProductDTO[];
}