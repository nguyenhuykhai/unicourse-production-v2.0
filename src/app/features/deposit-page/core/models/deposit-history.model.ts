export interface Deposit {
  id: string;
  sender_id?: string;
  amount: number;
  status: string;
  description: string;
  deposit_date: Date;
  created_at: Date;
  updated_at: Date;
  extra_payment?: string;
  payment_method_id: string;
  payment_method: PaymentMethod;
}

export interface PaymentMethod {
  id: string;
  description: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}
