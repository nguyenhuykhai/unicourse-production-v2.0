import { Filter, PayloadData, User } from "../../../../../../common/models";

export enum NotificationCategory {
    SYSTEM = 'SYSTEM',
    USER = 'USER',
}

export interface CatcheNotiDataWithFilter {
    filter: Filter;
    data: PayloadData<NotificationPayLoad>;
}

export interface NotificationPayLoad {
    id: number;
    is_read: boolean;
    created_at: string;
    updated_at: string;
    notification_id: number;
    recipient_id: number;
    notification?: Notification;
}

export interface Notification {
    id: number;
    description: string;
    category: string;
    url_link?: string;
    sender_id?: number | null;
    sender?: User | null;
    created_at: string;
    updated_at: string;
}