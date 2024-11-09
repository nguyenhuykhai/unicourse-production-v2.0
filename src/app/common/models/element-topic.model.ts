export interface ElementTopic {
  id: number;
  created_at: Date;
  updated_at: Date;
  topic_id: number;
  document_id?: number;
  question_bank_id?: number;
  video_id?: number;
  video?: Video;
  document?: Document;
  question_bank?: Question;
}

export interface Video {
    id: number;
    url: string;
    duration: number;
    platform: string;
    created_at: Date;
    updated_at: Date;
    videoUrl?: any;
}

export interface Question {
    id: string;
    title: string;
    description: string;
    total_question: number;
    duration: number;
    created_at: Date;
    updated_at: Date;
}
export interface Document {
    id: number;
    text: string;
    content: string;
    reference_url: string;
    min_read: number;
    created_at: Date;
    updated_at: Date;
}
