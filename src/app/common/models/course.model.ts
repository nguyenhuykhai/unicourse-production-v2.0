import { Category } from './category.model';
import { Chapter } from './chapter.model';
import { CourseMentor } from './course_mentor.model';
import { Lecturer } from './user.model';

export interface Course {
  id: number;
  title: string;
  price: number;
  title_description: string;
  thumbnail: string;
  learning_outcome: Array<string>;
  requirements: Array<string>;
  status: string;
  created_at: Date;
  updated_at: Date;
  category_id: number;
  lecture_id: number;
  description: string;
  category: Category;
  course_skill: Array<any>;
  chapter: Array<Chapter>;
  course_mentor: Array<CourseMentor>;
  discount: number;
  sub_title_description: Array<string>;
  students_enrolled?: number;
  rating: number;
}

export interface CourseFilterResponse {
  data: CourseFilterItem[];
  total: number;
  limit: number;
  page: number;
  totalPages: number;
}

export interface CourseFilterItem {
  id: number;
  title: string;
  price: number;
  title_description: string;
  description: string;
  thumbnail: string;
  learning_outcome: Array<string>;
  requirements: Array<string>;
  status: string;
  created_at: Date;
  updated_at: Date;
  category_id: number;
  lecture_id: number;
  lecturer: Lecturer;
  category: Category;
  course_skill: Array<any>;
  chapter: Array<Chapter>;
  course_mentor: Array<CourseMentor>;
  average_rating: number;
  total_number_ratings: number;
}
