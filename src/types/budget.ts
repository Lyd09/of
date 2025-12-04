
export interface BudgetItem {
  description: string;
  unit?: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  discountType: 'percentage' | 'fixed';
  finalPrice?: number;
  itemTotal: number;
  itemDiscountValue: number;
}

export interface BudgetPreviewData {
  companyName: string;
  logoUrl?: string;
  slogan?: string;
  isDroneFeatureEnabled: boolean;
  budgetDate: string;
  clientName: string;
  clientAddress?: string;
  items: BudgetItem[];
  subtotal: number;
  generalDiscountType: 'percentage' | 'fixed';
  generalDiscountValue: number;
  generalDiscountPercentage: number;
  totalAmount: number;
  commercialConditions?: string;
  paymentConditions?: string;
  observations?: string;
}
