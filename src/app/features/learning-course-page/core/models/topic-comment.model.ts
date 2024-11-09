export interface TopicComment {
    id: string;
    content: string;
    topic_id: string;
    user_id: string;
    parent_comment_id?: string | null;
    sub_comment_id?: string | null;
    numberOfReplies?: number;
    createdAt: string;
    updatedAt: string;
    user: {
        id: string;
        full_name: string;
        profile_image: string;
    };
    parent_comment?: { user: UserCommentInfo } | null;
    sub_comment?: { user: UserCommentInfo } | null;
    children?: Array<TopicComment>;
}

export interface UserCommentInfo {
    id: string;
    full_name: string;
    profile_image: string;
}

export interface TopicCommentRequest {
    content: string;
    topic_id?: string;
    parent_comment_id?: string | null;
    sub_comment_id?: string | null;
    original_topic_comment?: TopicComment;
    url_link?: string;
}