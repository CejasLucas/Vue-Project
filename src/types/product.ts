export interface Product {
    id: string;

    sku: string; 

    name: string;

    description: string;

    current_stock: number; 

    minimum_stock: number; 

    last_purchase_price: number; 

    unit: string;

    brand_id: string;

    category_id: string;
}

export interface ProductItems {
    id: string;

    name: string;
    
    unit: string;
    
    unit_price: number;
    
    category_id: string;
    
    category: string;
    
    brand_id: string;
    
    brand: string;
}