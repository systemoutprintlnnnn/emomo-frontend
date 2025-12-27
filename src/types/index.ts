// Meme entity
export interface Meme {
  id: string;
  source_type: string;
  source_id: string;
  storage_key: string;
  original_url: string;
  url: string; // computed from storage_key
  width: number;
  height: number;
  format: string;
  is_animated: boolean;
  file_size: number;
  vlm_description: string;
  tags: string[];
  category: string;
  score?: number; // similarity score from search
  created_at: string;
}

// Search request
export interface SearchRequest {
  query: string;
  top_k?: number;
  category?: string;
}

// Search response
export interface SearchResponse {
  results: Meme[];
  query: string;
  took_ms: number;
}

// Category
export interface Category {
  id: string;
  name: string;
  count: number;
}

// Pagination
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}
