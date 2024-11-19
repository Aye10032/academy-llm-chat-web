import { useAuth, isTokenExpired } from './auth'

const API_BASE_URL = '/api'

interface FetchOptions extends RequestInit {
  timeout?: number
}

async function fetchWithTimeout(url: string, options: FetchOptions = {}) {
  const { timeout = 10000, ...fetchOptions } = options
  
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal
    })
    clearTimeout(id)
    
    if (!response.ok) {
      if (response.status === 401) {
        useAuth.getState().logout()
        window.location.href = '/'
      }
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
    }
    
    return response
  } catch (error) {
    clearTimeout(id)
    throw error
  }
}

export async function apiClient<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const token = useAuth.getState().token
  
  if (token && isTokenExpired(token)) {
    useAuth.getState().logout()
    window.location.href = '/'
    throw new Error('Token has expired')
  }
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }
  
  const response = await fetchWithTimeout(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })
  
  return response.json()
} 