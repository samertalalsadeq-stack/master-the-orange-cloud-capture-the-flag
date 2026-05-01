import { ApiResponse } from "../../shared/types"
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { 
    headers: { 'Content-Type': 'application/json' }, 
    ...init 
  });
  let json: ApiResponse<T>;
  try {
    const text = await res.text();
    if (!text) {
      json = { success: false, error: 'Empty response from gateway' };
    } else {
      json = JSON.parse(text) as ApiResponse<T>;
    }
  } catch (e) {
    console.error('[API ERROR] Failed to parse response:', e);
    throw new Error('Communication error with secure gateway');
  }
  if (!res.ok || !json.success) {
    throw new Error(json.error || `Request failed with status ${res.status}`);
  }
  if (json.data === undefined) {
    throw new Error('Invalid data payload received from mainframe');
  }
  return json.data;
}