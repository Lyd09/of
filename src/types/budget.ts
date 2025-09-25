export interface BudgetItem {
  description: string;
  unit?: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  discountType: 'percentage' | 'fixed';
  itemTotal: number;
  itemDiscountValue: number;
}

export interface BudgetPreviewData {
  companyName: string;
  logoUrl?: string;
  slogan?: string;
  isDroneFeatureEnabled: boolean;
  budgetNumber: string;
  budgetDate: string;
  clientName: string;
  clientAddress?: string;
  items: BudgetItem[];
  subtotal: number;
  generalDiscountValue: number;
  generalDiscountPercentage: number;
  totalAmount: number;
  paymentConditions?: string;
  observations?: string;
}
