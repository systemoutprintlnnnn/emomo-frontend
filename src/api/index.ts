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

// Helper function to convert API response to Meme format for UI consistency
// Both /api/v1/search and /api/v1/memes now return the same format
function normalizeResults(results: SearchResponse['results']): Meme[] {
  return results.map((result) => ({
    id: result.id,
    url: result.url,
    score: result.score,
    description: result.description,
    vlm_description: result.description, // keep for backward compatibility
    category: result.category,
    tags: result.tags,
    is_animated: result.is_animated,
    width: result.width,
    height: result.height,
  }));
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
  return {
    results: normalizeResults(data.results),
    total: data.total,
  };
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
// Returns results in the same format as searchMemes for consistency
export async function getMemes(
  limit: number = 30,
  offset: number = 0,
  category?: string,
  signal?: AbortSignal
): Promise<{ results: Meme[]; total: number }> {
  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  });

  if (category) {
    params.append('category', category);
  }

  const response = await fetch(`${API_BASE}/memes?${params}`, {
    headers: getHeaders(),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch memes: ${response.statusText}`);
  }

  const data: MemesListResponse = await response.json();
  return {
    results: normalizeResults(data.results),
    total: data.total,
  };
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

// Search stage types
export type SearchStage =
  | 'query_expansion_start'
  | 'thinking'
  | 'query_expansion_done'
  | 'embedding'
  | 'searching'
  | 'enriching'
  | 'complete'
  | 'error';

// Search progress event from SSE
export interface SearchProgressEvent {
  stage: SearchStage;
  message?: string;
  thinking_text?: string;
  is_delta?: boolean;
  expanded_query?: string;
  results?: Meme[];
  total?: number;
  query?: string;
  collection?: string;
  error?: string;
}

// Stream search memes with progress updates
export async function searchMemesStream(
  query: string,
  topK: number = 20,
  onProgress: (event: SearchProgressEvent) => void,
  signal?: AbortSignal
): Promise<void> {
  const response = await fetch(`${API_BASE}/search/stream`, {
    method: 'POST',
    headers: getHeaders('application/json'),
    body: JSON.stringify({
      query,
      top_k: topK,
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Search failed: ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Response body is not readable');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Process complete SSE events
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      let currentEventType = 'progress';

      for (const line of lines) {
        if (line.startsWith('event: ')) {
          currentEventType = line.slice(7).trim();
        } else if (line.startsWith('data: ')) {
          const data = line.slice(6);
          try {
            const event = JSON.parse(data) as SearchProgressEvent;
            
            // Normalize results if present
            if (event.results) {
              event.results = normalizeResults(event.results as unknown as SearchResponse['results']);
            }
            
            // Set stage from event type if not present
            if (!event.stage && currentEventType) {
              event.stage = currentEventType as SearchStage;
            }
            
            onProgress(event);
          } catch (e) {
            console.warn('Failed to parse SSE data:', data, e);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
