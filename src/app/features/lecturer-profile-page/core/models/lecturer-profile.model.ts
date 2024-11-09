import { Course, User } from '../../../../common/models';

export interface LecturerProfile {
  id: string;
  info_description: string;
  skill_json: {
    skills: Skill[];
    certifications: Certification[];
  };
  user_id: number;
  user: User;
  course: Course[];
  total_courses: number;
  total_enrollments: number;
  certificates: Certification[];
  created_at: Date;
  updated_at: Date;
}

export interface Skill {
  name: string;
  level: string;
}

export interface Certification {
  name: string;
  year: number;
}
