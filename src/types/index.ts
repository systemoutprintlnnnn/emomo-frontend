// Meme entity - unified format for both search and list results
export interface Meme {
  id: string;
  url: string;
  score?: number; // similarity score from search (0 for list results)
  description?: string; // description from VLM
  category?: string;
  tags?: string[];
  is_animated: boolean;
  width?: number;
  height?: number;
  // Legacy fields for demo data compatibility
  vlm_description?: string;
  original_url?: string;
  source_type?: string;
  source_id?: string;
  storage_key?: string;
  format?: string;
  file_size?: number;
  created_at?: string;
}

// Search result from backend (same structure as Meme)
export interface SearchResult {
  id: string;
  url: string;
  score: number;
  description: string;
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

// List memes response from backend (now unified with SearchResponse format)
export interface MemesListResponse {
  results: SearchResult[];
  total: number;
  limit: number;
  offset: number;
}
