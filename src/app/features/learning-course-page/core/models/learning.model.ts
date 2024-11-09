export interface LearningProgress {
    id: number;
    status: string;
    student_id: number;
    course_mentor_id: number;
    created_at: string;
    updated_at: string;
    learning_progress: Array<LearningItem> | Array<any>;
    totalTopic: number;
    totalCompletedTopic?: number;
}

export interface LearningItem {
    id: string;
    created_at: Date;
    updated_at: Date;
    status: string;
    topic_id: string;
    topic_position: number;
    chapter_id: string;
    chapter_position: number;
    enroll_course_id: string;
}

export interface RequestAmendAndCompleteTopicLearningProgress {
    topicId: string;
    enrollCourseId: string;
}