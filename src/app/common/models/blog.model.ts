import { Category } from "./category.model";
import { User } from "./user.model";

export interface Blog {
    id: string;
    title: string;
    content: string;
    author_id: number;
    is_question_marked: boolean;
    is_highlighted: boolean;
    status: string;
    min_read: number;
    thumbnail_url: string;
    path_thumbnail_url: string | null;
    description: string;
    created_at: Date;
    updated_at: Date;
    author: User;
    blog_tag: Array<BlogTag>;
}

export interface BlogPayload {
    title?: string;
    error_title?: string;
    invalid_title?: boolean;
    content?: string;
    error_content?: boolean;
    invalid_content?: boolean;
    categories_id?: Array<number>;
    error_categories_id?: string;
    invalid_categories_id?: boolean;
    description?: string;
    error_description?: string;
    invalid_description?: boolean;
    min_read?: number;
    error_min_read?: string;
    invalid_min_read?: boolean;
    thumbnail_url?: string;
    path_thumbnail_url?: string;
}

export interface BlogTag {
    category: Category;
}

export interface Comment {
    id: string;
    content: string;
    created_at: Date;
    updated_at: Date;
    blog_id: string;
    user_id: string;
    user: User;
}