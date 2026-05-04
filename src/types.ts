export type Category = 'Insumo Agrícola' | 'Medicamento Veterinario' | 'Alimento para Animales';

export interface Product {
  id: string;
  name: string;
  category: Category;
  unitOfMeasure: string;
  purchasePrice: number;
  salePrice: number;
  currentStock: number;
  minStock: number;
  updatedAt: any;
}

export interface InvoiceItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface PurchaseInvoice {
  id: string;
  invoiceNumber: string;
  supplierName: string;
  invoiceDate: string;
  totalAmount: number;
  items: InvoiceItem[];
  createdAt: any;
  createdBy: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
}
