export interface Wallet {
    id?: string;
    balance: number;
    created_at: string;
    updated_at: string;
    status?: string;
    user_id?: string;
}