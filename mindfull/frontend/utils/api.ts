// Read base API URL from environment (set by .env or CI). If not set,
// fall back to localhost for developers running both frontend+backend on same machine.
// Accept either API_BASE_URL (project default) or EXPO_PUBLIC_API_BASE_URL
// (you already have EXPO_PUBLIC_API_BASE_URL in your .env). Prefer the
// EXPO_PUBLIC_* name but fall back to the older API_BASE_URL for compatibility.
import { EXPO_PUBLIC_API_BASE_URL } from '@env'

const raw = (typeof EXPO_PUBLIC_API_BASE_URL === 'string' && EXPO_PUBLIC_API_BASE_URL.length > 0)
	? EXPO_PUBLIC_API_BASE_URL
	: (typeof EXPO_PUBLIC_API_BASE_URL === 'string' && EXPO_PUBLIC_API_BASE_URL.length > 0)
		? EXPO_PUBLIC_API_BASE_URL
		: ''

const base = raw.length > 0 ? raw.replace(/\/$/, '') : 'http://localhost:3000'

export const RECIPES_API_URL = `${base}/api/recipes`
export const MEDICINE_API_URL = `${base}/api/medicine`