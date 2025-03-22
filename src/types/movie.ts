
export interface Movie {
  id: string;
  title: string;
  image_url: string;
  year: string;
  description: string | null;
  rating: number;
  created_at?: string;
}
