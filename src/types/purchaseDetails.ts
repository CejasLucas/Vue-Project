export interface PurchaseDetailItem {
  product_id: string;

  product_name: string;

  quantity: number;

  unit_price: number;

  subtotal: number;
}

export interface PurchaseDetail {
  id: string;
  
  supplier_id: string | null;

  purchase_date: string;

  status: string;

  total_amount: number;
  
  items: PurchaseDetailItem[];
}