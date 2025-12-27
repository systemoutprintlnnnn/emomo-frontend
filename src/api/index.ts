import type { Meme, SearchResponse, Category, CategoriesResponse, MemesListResponse } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api/v1';
const API_TOKEN = import.meta.env.VITE_API_TOKEN || '';

// Generate request headers with optional authentication
function getHeaders(contentType?: string): HeadersInit {
  const headers: HeadersInit = {};

  if (contentType) {
    headers['Content-Type'] = contentType;
  }

  if (API_TOKEN) {
    headers['Authorization'] = `Bearer ${API_TOKEN}`;
  }

  return headers;
}

// Helper function to convert SearchResult to Meme format for UI consistency
function normalizeSearchResults(response: SearchResponse): { results: Meme[]; total: number } {
  return {
    results: response.results.map((result) => ({
      id: result.id,
      url: result.url,
      score: result.score,
      vlm_description: result.description, // map 'description' to 'vlm_description'
      category: result.category,
      tags: result.tags,
      is_animated: result.is_animated,
      width: result.width,
      height: result.height,
    })),
    total: response.total,
  };
}

// Search memes by text query
export async function searchMemes(
  query: string,
  topK: number = 20,
  category?: string
): Promise<{ results: Meme[]; total: number }> {
  const response = await fetch(`${API_BASE}/search`, {
    method: 'POST',
    headers: getHeaders('application/json'),
    body: JSON.stringify({
      query,
      top_k: topK,
      category,
    }),
  });

  if (!response.ok) {
    throw new Error(`Search failed: ${response.statusText}`);
  }

  const data: SearchResponse = await response.json();
  return normalizeSearchResults(data);
}

// Get all categories
export async function getCategories(): Promise<Category[]> {
  const response = await fetch(`${API_BASE}/categories`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.statusText}`);
  }

  // Backend returns { categories: string[], total: number }
  const data: CategoriesResponse = await response.json();
  
  // Convert string array to Category objects
  return data.categories.map((name) => ({
    name,
    count: undefined, // Backend doesn't provide count per category in this endpoint
  }));
}

// Get memes with pagination (using limit/offset)
export async function getMemes(
  limit: number = 30,
  offset: number = 0,
  category?: string
): Promise<MemesListResponse> {
  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  });

  if (category) {
    params.append('category', category);
  }

  const response = await fetch(`${API_BASE}/memes?${params}`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch memes: ${response.statusText}`);
  }

  return response.json();
}

// Get single meme by ID
export async function getMeme(id: string): Promise<Meme> {
  const response = await fetch(`${API_BASE}/memes/${id}`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch meme: ${response.statusText}`);
  }

  return response.json();
}
