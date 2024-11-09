import { ElementTopic } from "./element-topic.model";

export interface Topic {
    id: string;
    title: string;
    description: string;
    position: number;
    created_at: Date;
    updated_at: Date;
    status: string;
    chapter_id: string;
    element_topic?: ElementTopic;
    isCompleted?: boolean;
}