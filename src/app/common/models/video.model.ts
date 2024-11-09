export interface Vimeo {
  type: string;
  version: string;
  provider_name: string;
  provider_url: string;
  title: string;
  author_name: string;
  author_url: string;
  is_plus: string;
  account_type: string;
  html: string;
  width: number;
  height: number;
  duration: number;
  description: string;
  thumbnail_url: string;
  thumbnail_width: number;
  thumbnail_height: number;
  thumbnail_url_with_play_button: string;
  upload_date: string;
  video_id: number;
  uri: string;
}

export enum Platform {
  YOUTUBE = 'youtube',
  VIMEO = 'vimeo',
}

export const GET_SOURCE_VIDEO = /src="([^"]+)"/;
export const EMBED_YOUTUBE = 'https://www.youtube.com/embed/';