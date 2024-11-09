export interface LearningChapter {
  id: string;
  title: string;
  position: number;
  created_at: Date;
  updated_at: Date;
  status: string;
  course_id: number;
  topic: Array<LearningTopic>;
  expanded: boolean;
}

export interface LearningTopic {
    id: string;
    title: string;
    description: string;
    position: number;
    created_at: Date;
    updated_at: Date;
    status: string;
    chapter_id: string;
    element_topic?: LearningElementTopic;
}

export interface LearningElementTopic {
    id: number;
    created_at: Date;
    updated_at: Date;
    topic_id: number;
    document_id?: number;
    question_id?: number;
    video_id?: number;
    video?: Video;
    document?: Document;
    question?: Question;
  }
  
  export interface Video {
      id: number;
      url: string;
      duration: number;
      platform: string;
      created_at: Date;
      updated_at: Date;
  }
  
  export interface Question {}
  
  export interface Document {}
  
