export enum StepCloseAccount {
  INITIATE_ACCOUNT_CLOSURE = 'initiate-account-closure',
  CONFIRM_ACCOUNT_CLOSURE = 'confirm-account-closure',
}

export interface ConfirmOTP {
    email: string;
    otp: string;
}