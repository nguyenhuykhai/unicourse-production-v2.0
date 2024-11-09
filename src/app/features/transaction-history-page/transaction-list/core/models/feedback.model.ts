export interface FeedbackObject {
    content: string;
    rating: number;
    course_enroll_id: string;
    transaction_id: string;
    
    // Display UI
    isFeedback: boolean;
    is_mentor: boolean;
    start_date: Date;
    end_date: Date;
}