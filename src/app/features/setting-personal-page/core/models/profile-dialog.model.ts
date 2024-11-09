export interface ProfileDialog {
  header: string;
  description?: string;
  label?: string;
  placeholder?: string;
  value?: string;
  type: string;
  hint?: string;
  required: boolean;
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  field: string; // Field will send in body request
  optional?: any;
}