import type { Meme, SearchResponse, Category, CategoriesResponse, MemesListResponse } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api/v1';
const API_TOKEN = import.meta.env.VITE_API_TOKEN || '';

// #region agent log
const DEBUG_LOG_ENDPOINT = 'http://127.0.0.1:7242/ingest/7a83c483-fce1-4f8b-beaf-98cf80f7146c';
const logDebug = (location: string, message: string, data: any, hypothesisId: string) => {
  fetch(DEBUG_LOG_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ location, message, data, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId })
  }).catch(() => {});
};
// #endregion

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
  // #region agent log
  logDebug('api/index.ts:getMemes', 'getMemes called', { API_BASE, limit, offset, category }, 'D');
  // #endregion
  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  });

  if (category) {
    params.append('category', category);
  }

  const url = `${API_BASE}/memes?${params}`;
  // #region agent log
  logDebug('api/index.ts:getMemes', 'Before fetch', { url, headers: getHeaders() }, 'A');
  // #endregion
  
  const response = await fetch(url, {
    headers: getHeaders(),
    signal,
  });

  // #region agent log
  logDebug('api/index.ts:getMemes', 'After fetch', { ok: response.ok, status: response.status, statusText: response.statusText, headers: Object.fromEntries(response.headers.entries()) }, 'A');
  // #endregion

  if (!response.ok) {
    // #region agent log
    logDebug('api/index.ts:getMemes', 'Fetch failed', { status: response.status, statusText: response.statusText }, 'D');
    // #endregion
    throw new Error(`Failed to fetch memes: ${response.statusText}`);
  }

  const data: MemesListResponse = await response.json();
  // #region agent log
  logDebug('api/index.ts:getMemes', 'Response parsed', { total: data.total, resultsCount: data.results?.length }, 'D');
  // #endregion
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
  // #region agent log
  logDebug('api/index.ts:searchMemesStream', 'searchMemesStream called', { API_BASE, query, topK }, 'C');
  // #endregion
  const url = `${API_BASE}/search/stream`;
  const body = JSON.stringify({ query, top_k: topK });
  // #region agent log
  logDebug('api/index.ts:searchMemesStream', 'Before fetch', { url, body, headers: getHeaders('application/json') }, 'A');
  // #endregion
  
  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders('application/json'),
    body,
    signal,
  });

  // #region agent log
  logDebug('api/index.ts:searchMemesStream', 'After fetch', { ok: response.ok, status: response.status, statusText: response.statusText, contentType: response.headers.get('content-type') }, 'A');
  // #endregion

  if (!response.ok) {
    // #region agent log
    logDebug('api/index.ts:searchMemesStream', 'Fetch failed', { status: response.status, statusText: response.statusText }, 'C');
    // #endregion
    throw new Error(`Search failed: ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    // #region agent log
    logDebug('api/index.ts:searchMemesStream', 'Reader not available', {}, 'B');
    // #endregion
    throw new Error('Response body is not readable');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        // #region agent log
        logDebug('api/index.ts:searchMemesStream', 'Stream done', { bufferLength: buffer.length }, 'B');
        // #endregion
        break;
      }

      const decoded = decoder.decode(value, { stream: true });
      buffer += decoded;
      // #region agent log
      logDebug('api/index.ts:searchMemesStream', 'Chunk received', { chunkLength: decoded.length, bufferLength: buffer.length }, 'B');
      // #endregion

      // Process complete SSE events
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      let currentEventType = 'progress';

      for (const line of lines) {
        if (line.startsWith('event: ')) {
          currentEventType = line.slice(7).trim();
          // #region agent log
          logDebug('api/index.ts:searchMemesStream', 'Event type found', { eventType: currentEventType }, 'B');
          // #endregion
        } else if (line.startsWith('data: ')) {
          const data = line.slice(6);
          try {
            const event = JSON.parse(data) as SearchProgressEvent;
            // #region agent log
            logDebug('api/index.ts:searchMemesStream', 'SSE event parsed', { stage: event.stage, hasResults: !!event.results, dataLength: data.length }, 'B');
            // #endregion
            
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
            // #region agent log
            logDebug('api/index.ts:searchMemesStream', 'Parse error', { error: String(e), data }, 'B');
            // #endregion
            console.warn('Failed to parse SSE data:', data, e);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
