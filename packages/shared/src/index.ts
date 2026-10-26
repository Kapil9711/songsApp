export interface Song {
  id: string;
  title: string;
  artist: string;
  duration: number;
  coverUrl?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}
