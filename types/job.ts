export interface Job {
  id: string | number;
  title: string;
  company: string;
  location?: string;
  description?: string;
  requirements?: string[] | string;
  salary?: string;
  posted_date?: string;
}