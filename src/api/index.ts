import type { Meme, SearchResponse, Category, PaginatedResponse } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api/v1';

// Search memes by text query
export async function searchMemes(
  query: string,
  topK: number = 20,
  category?: string
): Promise<SearchResponse> {
  const response = await fetch(`${API_BASE}/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      top_k: topK,
      category,
    }),
  });

  if (!response.ok) {
    throw new Error(`Search failed: ${response.statusText}`);
  }

  return response.json();
}

// Get all categories
export async function getCategories(): Promise<Category[]> {
  const response = await fetch(`${API_BASE}/categories`);

  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.statusText}`);
  }

  return response.json();
}

// Get memes with pagination
export async function getMemes(
  page: number = 1,
  pageSize: number = 30,
  category?: string
): Promise<PaginatedResponse<Meme>> {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
  });

  if (category) {
    params.append('category', category);
  }

  const response = await fetch(`${API_BASE}/memes?${params}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch memes: ${response.statusText}`);
  }

  return response.json();
}

// Get single meme by ID
export async function getMeme(id: string): Promise<Meme> {
  const response = await fetch(`${API_BASE}/memes/${id}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch meme: ${response.statusText}`);
  }

  return response.json();
}
