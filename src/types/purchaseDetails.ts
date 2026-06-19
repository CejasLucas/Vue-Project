export interface PurchaseItemProductDTO {
  product_id: string
  name: string
  brand: string
  category: string
}
  
export interface PurchaseItemDetailDTO {
  quantity: number
  unit_price: number
  subtotal: number
  product: PurchaseItemProductDTO
}
  
export interface PurchaseSupplierDetailDTO {
  supplier_id: string
  name: string
  email: string
  phone: string
  address: string
  locality: string
  nationality: string
  tax_id: string
}

export interface PurchaseDetailDTO {
  id: string
  purchase_date: string
  status: string
  total_amount: number
  supplier: PurchaseSupplierDetailDTO
  items: PurchaseItemDetailDTO[]
}