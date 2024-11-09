import { Chapter } from "./chapter.model";
import { Course } from "./course.model";
import { Lecturer, Mentor } from "./user.model";

export interface CourseMentor {
  id: string;
  title: string;
  description: string;
  image: string;
  amount: number;
  is_mentor: boolean;
  status: string;
  course_id: number;
  mentor_id: number | null;
  center_id: number | null;
  start_date: Date;
  end_date: Date;
  discount: number;
  course?: CourseItem;
  created_at: Date;
  updated_at: Date;
  _count?: {
    mentor_session: number;
  }
  avg_rating: number;
  total_number_ratings: number;
}

export interface CourseItem {
  id: number;
  title: string;
  price: number;
  amount: number;
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
  _count: {
    chapter: number;
  }
}

// START ZONE: INTERFACE USING FOR LEARNING COURSE PAGE
export interface CourseMentorDetail {
  id: string;
  title: string;
  description: string;
  image: string;
  amount: number;
  is_mentor: boolean;
  status: string;
  course_id: string;
  mentor_id: string | null;
  center_id: string | null;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
  discount: number;
  chapter?: Array<Chapter>;
  lecturer?: Lecturer;

  // Variables for course mentor offline
  mentor_session?: Array<Session>;
  center?: Center;
  mentor?: Mentor;
  course?: Course;
}
// END ZONE: INTERFACE USING FOR LEARNING COURSE PAGE


// START ZONE: INTERFACE USING FOR COURSE MENTOR PAGE
export interface Session {
  id: string;
  title: string;
  description: string;
  position: number;
  status: string;
  start_time: Date;
  end_time: Date;
  created_at: Date;
  updated_at: Date;
  course_mentor_id: number;
  room_id: number;
  room?: Room;

  // Variables for UI
  attendance?: string;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  status: string;
  center_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface Center {
  id: string;
  address: string;
  description: string;
  lat: number | null;
  long: number | null;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export interface Participant {
  id: string;
  attendance: boolean;
  status: string;
  mentor_session_id: string;
  course_enroll_id: string;
  created_at: string;
  updated_at: string;
}

// END ZONE: INTERFACE USING FOR COURSE MENTOR PAGE