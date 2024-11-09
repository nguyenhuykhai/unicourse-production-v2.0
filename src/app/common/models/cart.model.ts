import { CourseMentor } from '.';

export interface Cart {
  id: string;
  cartItem: CartItem[];
  created_at: Date;
  updated_at: Date;
}
export interface CartItem {
  id: string;
  course_mentor_id: string;
  cart_id: string;
  course_mentor: CourseMentor;
  created_at: Date;
  updated_at: Date;
}
export interface CartRequest {
  id: string;
  final_amount: number;
  total_amount: number;
  cart_items: Array<CartItemRequest>;
}

export interface CartItemRequest {
  course_mentor_id: string;
  amount: number;
}