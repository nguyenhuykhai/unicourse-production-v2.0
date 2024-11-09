import { CourseMentor } from "./course_mentor.model";
import { Student } from "./user.model";


export interface EnrollCourse {
  id: number;
  status: string;
  student_id: number;
  course_mentor_id: number;
  created_at: string;
  updated_at: string;
  course_mentor: CourseMentor;
  student: Student;
  _count: {
    learning_progress: 0
  }
  totalTopic: number;
}
