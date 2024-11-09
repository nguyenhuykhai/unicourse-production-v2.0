export interface CreatePaymentLink {
  // Tạo link nạp xu vào ví
  amount: number;
  description: string;
  cancelUrl: string;
  returnUrl: string;
  payment_method_id: number;
}

export interface PaymentLink {
  bin: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  description: string;
  orderCode: number;
  currency: string;
  paymentLinkId: string;
  status: string;
  checkoutUrl: string;
  qrCode: string;
}

export interface PaymentStatus {
  loading: boolean;
  code: string;
  id: string;
  cancel: string;
  status: string;
  orderCode: string;
}

export interface InfoPaymentLink {
  payload: Payload;
  signature: string;
}
export interface Payload {
  id: string;
  orderCode: string;
  amount: number;
  amountPaid: number;
  amountRemaining: number;
  status: string;
  createdAt: Date;
  transactions: Array<Transaction>;
  canceledAt?: Date;
  cancellationReason?: string;
}

export interface Transaction {
  reference: string;
  amount: number;
  accountNumber: string;
  description: string;
  transactionDateTime: Date;
  virtualAccountNumber?: string;
  virtualAccountName?: string;
  counterAccountBankId?: string;
  counterAccountBankName?: string;
  counterAccountName?: string;
  counterAccountNumber?: string;
}
