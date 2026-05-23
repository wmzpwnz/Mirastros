/**
 * Telegram authentication utilities
 */
import WebApp from '@twa-dev/sdk'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  language_code?: string
}

export interface AuthResponse {
  user: {
    id: string
    email?: string
    full_name: string
    subscription_tier: 'freemium' | 'premium' | 'platinum'
    telegram_id?: string
  }
  access_token: string
  refresh_token: string
}

/**
 * Authenticate with backend using Telegram user data
 */
export async function authenticateWithTelegram(): Promise<AuthResponse | null> {
  try {
    const initData = WebApp.initDataUnsafe
    
    if (!initData.user) {
      console.error('No Telegram user data available')
      return null
    }

    const telegramUser = initData.user
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
    const language = telegramUser.language_code?.split('-')[0] || 'ru'

    // Send authentication request to backend
    const response = await fetch(`${API_URL}/auth/social/telegram`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        telegram_id: telegramUser.id.toString(),
        username: telegramUser.username,
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name,
        photo_url: telegramUser.photo_url,
        preferred_language: language,
        timezone: timezone,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Authentication failed:', error)
      return null
    }

    const authData: AuthResponse = await response.json()
    
    // Store tokens in localStorage
    localStorage.setItem('access_token', authData.access_token)
    localStorage.setItem('refresh_token', authData.refresh_token)
    localStorage.setItem('user', JSON.stringify(authData.user))

    return authData
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}

/**
 * Get stored authentication data
 */
export function getStoredAuth(): AuthResponse | null {
  try {
    const accessToken = localStorage.getItem('access_token')
    const refreshToken = localStorage.getItem('refresh_token')
    const userStr = localStorage.getItem('user')

    if (!accessToken || !refreshToken || !userStr) {
      return null
    }

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: JSON.parse(userStr),
    }
  } catch (error) {
    console.error('Error reading stored auth:', error)
    return null
  }
}

/**
 * Clear authentication data
 */
export function clearAuth(): void {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user')
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getStoredAuth() !== null
}

/**
 * Get access token for API requests
 */
export function getAccessToken(): string | null {
  return localStorage.getItem('access_token')
}

/**
 * Make authenticated API request
 */
export async function authenticatedFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getAccessToken()

  if (!token) {
    throw new Error('Not authenticated')
  }

  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  // If unauthorized, try to refresh token
  if (response.status === 401) {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      // Retry request with new token
      headers['Authorization'] = `Bearer ${getAccessToken()}`
      return fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      })
    } else {
      // Refresh failed, clear auth
      clearAuth()
      throw new Error('Authentication expired')
    }
  }

  return response
}

/**
 * Refresh access token using refresh token
 */
async function refreshAccessToken(): Promise<boolean> {
  try {
    const refreshToken = localStorage.getItem('refresh_token')
    
    if (!refreshToken) {
      return false
    }

    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })

    if (!response.ok) {
      return false
    }

    const data = await response.json()
    localStorage.setItem('access_token', data.access_token)
    
    return true
  } catch (error) {
    console.error('Token refresh error:', error)
    return false
  }
}
