export interface Category {
  id: number;
  name: string;
}

export interface ContentItem {
  id: number;
  title: string;
  category_id: number;
  category_name?: string;
  content: string;
  author_name: string;
  author_email?: string;
  cover_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  is_highlight: number;
  created_at: string;
}

export interface Settings {
  header_title: string;
  ticker_text: string;
}
