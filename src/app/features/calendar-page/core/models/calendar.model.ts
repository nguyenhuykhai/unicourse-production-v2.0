import { Center, CourseMentorDetail, Mentor, Participant, Session } from "../../../../common/models"

export interface Calendar {
    id: string;
    status: string;
    student_id: string;
    course_mentor_id: string;
    created_at: string;
    updated_at: string;
    _count: {
        participant: number;
    };
    course_mentor: CourseMentorDetail;
    participant: Array<Participant>;
}

export interface FilterCalendar {
    startDate: string;
    endDate: string;
}

// INTERFACES FOR DISPLAY UI
export interface DayOfWeek {
    full: string;
    short: string;
}

export interface Day {
    dayNumber: number;
    events: Array<Event>;
    fromCurrentMonth?: boolean;

    // Inherited from CourseMentorDetail
    id?: string;
    title?: string;
    status?: string;
    course_id?: string;
    mentor_id?: string | null;
    center_id?: string | null;
    start_date?: Date;
    end_date?: Date;
}

export interface Event {
    name: string;
    time: string;
    mentor_session?: Session;
    participant?: Participant;
    center?: Center;
    mentor?: Mentor;

    // Variables for display
    attendance?: string;
}

export interface Week {
    days: Array<Day>;
}