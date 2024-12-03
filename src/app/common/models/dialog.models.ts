export interface Dialog {
  header: string;
  message: string;
  type: string;
  display: boolean;
}

export interface ConfirmDialog {
  header: string;
  message: string;
  type: string;
  return: boolean;
  numberBtn: number;
  callback?: (...args: any[]) => void; // Update to accept any function signature
  args?: any[]; // Array of arguments to pass to the callback
}