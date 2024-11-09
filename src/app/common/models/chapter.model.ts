import { Topic } from "./topic.model";

export interface Chapter {
    id: string;
    title: string;
    position: number;
    created_at: Date;
    updated_at: Date;
    status: string;
    course_id: number;
    topic: Array<Topic>;
    expanded?: boolean;
    isCompleted?: boolean;
}