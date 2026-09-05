export interface OrderCurrency {
  id: string;
  code: string;
  name: string;
  symbol: string;
}

export interface OrderProduct {
  id: string;
  code: string;
  name: string;
}

export interface OrderItem {
  id: string;
  amount: string;
  rate: string;
  inrSubtotal: string;
  product: OrderProduct;
  currency: OrderCurrency;
}

export interface OrderBranch {
  id: string;
  name: string;
  code: string;
  city: string;
}

export interface OrderQuote {
  id: string;
  amountForeign: string;
  lockedInrRate: string;
  currency: OrderCurrency;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmountInr: string;
  deliveryMethod: string;
  createdAt: string;
  updatedAt: string;
  branch?: OrderBranch;
  quote?: OrderQuote;
  items: OrderItem[];
  complianceStatus?: string;
  currentStage?: string;
  requiresKyc?: boolean;
  requiresInventory?: boolean;
  requiresPickupHandover?: boolean;
  requiresDelivery?: boolean;
  history?: any[];
  cancelRequested?: boolean;
  cancelReason?: string | null;
  assignedStaffId?: string | null;
  fulfillmentStatus?: string | null;
  productType?: string;
  [key: string]: any;
}
