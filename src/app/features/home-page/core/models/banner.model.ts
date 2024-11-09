export interface Banner {
  id: number;
  title: string;
  img: string;
  path: string;
  href: string;
  status: string;
  type?: string;
  created_at?: Date;
  updated_at?: Date;
}
