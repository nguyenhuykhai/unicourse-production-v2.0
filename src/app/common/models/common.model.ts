import { Course } from "./course.model";

export interface Common {
  id: number;
  created_at: Date;
  updated_at: Date;
}

export interface Response<T> {
  status: number;
  message: string;
  data: T;
}

export interface Filter {
  page: number;
  pageSize: number;
  where?: any;
  orderBy: any;
  code?: string;
  filter?: string;
}

export interface PayloadData<T> {
  data: Array<T>;
  total: number;
  limit: number;
  page: number;
  totalPages: number;
}

