import { ApiResponse } from "../../shared/types"
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s mission timeout
  try {
    const res = await fetch(path, {
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      ...init
    });
    clearTimeout(timeoutId);
    let json: ApiResponse<T>;
    const text = await res.text();
    try {
      if (!text) {
        json = { success: false, error: 'Empty response from gateway' };
      } else {
        json = JSON.parse(text) as ApiResponse<T>;
      }
    } catch (e) {
      console.error('[API ERROR] Failed to parse response:', e);
      throw new Error('Malformed intelligence received from mainframe');
    }
    if (!res.ok || !json.success) {
      // Descriptive security mapping
      if (res.status === 403) {
        throw new Error(json.error || 'FORBIDDEN: Administrative clearance required for this sector');
      }
      if (res.status === 401) {
        throw new Error(json.error || 'UNAUTHORIZED: Identity signature expired or invalid');
      }
      if (res.status === 404) {
        throw new Error(json.error || 'Mission not found in registry');
      }
      throw new Error(json.error || `Request failed with status ${res.status}`);
    }
    if (json.data === undefined) {
      throw new Error('Invalid data payload received from mainframe');
    }
    return json.data;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Communication timed out. Secure gateway is unresponsive');
    }
    throw error;
  }
}