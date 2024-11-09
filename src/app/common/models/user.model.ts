import { EnrollCourse } from "./enroll-course.model";
import { Wallet } from "./wallet.model";

export interface User {
  id: string;
  email: string;
  full_name: string;
  date_of_birth?: string;
  role: string;
  profile_image: string;
  title: string;
  phone_num?: string;
  address?: string;
  is_blocked: boolean;
  created_at: string;
  updated_at: string;
  hashed_password?: boolean;
  bio?: string;
  self_intro_url?: string;
  facebook_url?: string;
  linkedin_url?: string;
  github_url?: string;
  password?: string;
  lecturer?: string;
  mentor?: string;
  student?: Student;
  admin?: string;
  wallet?: Wallet;
  certificate?: Array<Certificate>;
}

export interface BodyUpdateUser {
  full_name?: string;
  date_of_birth?: string;
  address?: string;
  phone_num?: string;
  title?: string;
  bio?: string;
  self_intro_url?: string;
  facebook_url?: string;
  linkedin_url?: string;
  github_url?: string;
  profile_image?: string;
  hashed_password?: string;
}

export interface RequestUpdatePassword {
  old_password?: string;
  new_password?: string;
  confirm_password?: string;
}

export interface Student {
  id: number;
  created_at: string;
  updated_at: string;
  user_id: number;
  user?: User;
  device_token?: string;
  wishlist?: any;
  course_enroll?: Array<EnrollCourse>
}

export interface Lecturer {
  id: number;
  info_description: string;
  skill_json: any;
  created_at: Date;
  updated_at: Date;
  user_id: number;
  user?: User;
  total_courses?: number;
  total_enrollments?: number;
}

export interface Mentor {
  id: number;
  info_description: string;
  skill_json: any;
  user_id: number;
  created_at: Date;
  updated_at: Date;
  user?: User;
}

export interface Certificate {
  id: string;
  title: string;
  description: string;
  certification_url: string;
  created_at: string;
  updated_at: string;
  status: string;
  issued_date: string;
  expiration_date: string;
  certification_type_id: string;
  user_id: string;
}