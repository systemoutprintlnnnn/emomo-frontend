// Meme entity (full entity from database)
export interface Meme {
  id: string;
  source_type?: string;
  source_id?: string;
  storage_key?: string;
  original_url?: string;
  url: string;
  width?: number;
  height?: number;
  format?: string;
  is_animated: boolean;
  file_size?: number;
  vlm_description?: string;
  tags?: string[];
  category?: string;
  score?: number; // similarity score from search
  created_at?: string;
}

// Search result from backend (subset of Meme fields)
export interface SearchResult {
  id: string;
  url: string;
  score: number;
  description: string; // backend uses 'description' instead of 'vlm_description'
  category: string;
  tags: string[];
  is_animated: boolean;
  width?: number;
  height?: number;
}

// Search request
export interface SearchRequest {
  query: string;
  top_k?: number;
  category?: string;
}

// Search response from backend
export interface SearchResponse {
  results: SearchResult[];
  total: number;
}

// Category (backend returns string array, not objects)
export interface Category {
  name: string;
  count?: number;
}

// Categories response from backend
export interface CategoriesResponse {
  categories: string[];
  total: number;
}

// List memes response from backend
export interface MemesListResponse {
  memes: Meme[];
  count: number;
  limit: number;
  offset: number;
}
