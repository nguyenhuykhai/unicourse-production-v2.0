export interface QuestionBank {
    id: string;
    title: string;
    description: string;
    picture_url: string;
    path_picture_url: string;
    created_at: string;
    updated_at: string;
    type: string;
    question_bank_id: string;
    answer: Answer[];
    alreadyAnswered?: boolean;
    userAnswerCorrect?: boolean;
}

export interface Answer {
    id: string;
    content: string;
    explaination: string;
    is_correct: boolean;
    created_at: string;
    updated_at: string;
    question_id: string;
    isChoiced?: boolean;
}