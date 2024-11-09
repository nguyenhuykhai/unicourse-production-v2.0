export class FileUpload {
  key!: string;
  name!: string;
  url!: string;
  file: File;
  path!: string;

  constructor(file: File) {
    this.file = file;
  }
}
