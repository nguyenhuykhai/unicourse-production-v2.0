import { Center, Course, CourseMentorDetail, Participant, Session } from "../../../../common/models";

export interface EnrollCourseMentorDetail {
    id: string;
    status: string;
    student_id: string;
    course_mentor_id: string;
    created_at: string;
    updated_at: string;
    course_mentor: CourseMentorDetail;
    participant: Array<Participant>;
    total_absent: number;
    total_pending: number;
    total_finished: number;
}