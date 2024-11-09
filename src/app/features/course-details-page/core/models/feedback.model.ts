import { EnrollCourse, Student } from "../../../../common/models";
export interface Feedbacks {
    id: number;
    rating?: number;
    content?: string;
    created_at: Date;
    updated_at: Date;
    status: string;
    course_enroll_id: number;
    course_enroll: EnrollCourse;
}