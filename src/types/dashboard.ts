export interface DashboardCountsDTO {
  amount_purchases: number;

  amount_products: number;

  amount_suppliers: number;

  low_stock_count: number;

  total_spent: number;
}


export interface DashboardKPIDTO {
  average_purchase: number;

  largest_purchase: number;

  purchases_this_month: number;

  spending_this_month: number;

  monthly_growth_percentage: number;
}


export interface MonthlyExpenseDTO {
  month: string;

  total: number;
}


export interface CategorySpendingDTO {
  category: string;

  total: number;
}


export interface SupplierSpendingDTO {
  supplier: string;

  total: number;
}


export interface TopProductDTO {
  product: string;

  quantity: number;
}


export interface RecentPurchaseDTO {
  id: string;

  supplier: string;

  purchase_date: string;

  status: string;

  total_amount: number;
}


export interface LowStockProductDTO {
  id: string;

  name: string;

  current_stock: number;

  minimum_stock: number;

  missing_stock: number;
}


export interface DashboardSummaryDTO {

  year: number;

  counts: DashboardCountsDTO;

  kpis: DashboardKPIDTO;

  monthly_expenses: MonthlyExpenseDTO[];

  spending_by_category: CategorySpendingDTO[];

  top_suppliers: SupplierSpendingDTO[];

  top_products: TopProductDTO[];

  recent_purchases: RecentPurchaseDTO[];

  low_stock_products: LowStockProductDTO[];
}