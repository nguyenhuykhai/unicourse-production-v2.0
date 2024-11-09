export interface PayLoadTransactionHistory {
  data: Array<TransactionHistory>;
  total: number;
  limit: number;
  page: number;
  totalPages: number;
}

export interface TransactionHistory {
  id: string;
  total_amount: number;
  final_amount: number;
  description: string;
  transaction_code: string;
  transaction_date: Date;
  created_at: Date;
  updated_at: Date;
  wallet_id: string;
  coupon_id: string;
  deposit_id: string;
  status: string;
  transactionLineItem: Array<TransactionLineItem>;
}

export interface TransactionLineItem {
  id: string;
  purchase_price: number;
  created_at: Date;
  updated_at: Date;
  transaction_id: number;
  course_mentor_id: number;
  isFeedback: boolean;
  course_mentor: {
    id: number;
    title: string;
    image: string;
    is_mentor: boolean;
    start_date: Date;
    end_date: Date;
    course_enroll: Array<any>;
  };
}
