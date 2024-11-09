import { CourseMentor } from "./course_mentor.model";
export interface Wishlist {
    id: string;
    created_at: Date;
    updated_at: Date;
    student_id: number;
    course_mentor_id: string;
    course_mentor?: CourseMentor;
    avg_rating: number;
    total_number_ratings: number;
}