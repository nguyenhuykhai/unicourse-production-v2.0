import { Student } from "./user.model";

export interface Feedback {
    id: string;
    rating: number;
    content: string;
    highlighted: boolean;
    status  : string;
    course_enroll_id: number;
    course_enroll: {
        student: Student;
    };
    created_at: Date;
    updated_at: Date;

}

export interface FeedbackIssueObject {
    fullName: string;
    email: string;
    phone: string;
    category: string;
    content: string;
}

export interface FeedBackCourseMentorResponse {
    id: string;
    rating: number;
    content: string;
    highlighted: boolean;
    create_at: Date;
    updated_at: Date;
    status: string;
    course_enroll_id: string;
}