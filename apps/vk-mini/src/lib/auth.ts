/**
 * Authentication utilities for VK Mini App
 */
import { getVKUserInfo, getVKAccessToken } from './vk'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const AUTH_STORAGE_KEY = 'mirastros_vk_auth'

export interface User {
  id: string
  email: string
  full_name: string
  birth_date: string | null
  birth_time: string | null
  birth_location: string | null
  subscription_tier: 'freemium' | 'premium' | 'platinum'
  subscription_expires: string | null
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  token_type: string
  user: User
}

/**
 * Authenticate with VK and backend
 */
export async function authenticateWithVK(): Promise<AuthResponse | null> {
  try {
    // Get VK user info
    const vkUser = await getVKUserInfo()
    
    // Get VK access token (optional, for additional permissions)
    let vkAccessToken: string | null = null
    try {
      vkAccessToken = await getVKAccessToken('')
    } catch (error) {
      console.log('VK access token not required for basic auth')
    }

    // Authenticate with backend
    const response = await fetch(`${API_BASE_URL}/auth/vk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vk_user_id: vkUser.id,
        first_name: vkUser.first_name,
        last_name: vkUser.last_name,
        photo_url: vkUser.photo_200,
        access_token: vkAccessToken,
      }),
    })

    if (!response.ok) {
      throw new Error('Authentication failed')
    }

    const authData: AuthResponse = await response.json()

    // Store authentication data
    storeAuth(authData)

    return authData
  } catch (error) {
    console.error('VK authentication error:', error)
    return null
  }
}

/**
 * Store authentication data in localStorage
 */
export function storeAuth(auth: AuthResponse): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth))
  }
}

/**
 * Get stored authentication data
 */
export function getStoredAuth(): AuthResponse | null {
  if (typeof window === 'undefined') {
    return null
  }

  const stored = localStorage.getItem(AUTH_STORAGE_KEY)
  if (!stored) {
    return null
  }

  try {
    return JSON.parse(stored)
  } catch (error) {
    console.error('Failed to parse stored auth:', error)
    return null
  }
}

/**
 * Clear authentication data
 */
export function clearAuth(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getStoredAuth() !== null
}

/**
 * Get access token
 */
export function getAccessToken(): string | null {
  const auth = getStoredAuth()
  return auth?.access_token || null
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(): Promise<AuthResponse | null> {
  const auth = getStoredAuth()
  if (!auth) {
    return null
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh_token: auth.refresh_token,
      }),
    })

    if (!response.ok) {
      throw new Error('Token refresh failed')
    }

    const newAuth: AuthResponse = await response.json()
    storeAuth(newAuth)

    return newAuth
  } catch (error) {
    console.error('Token refresh error:', error)
    clearAuth()
    return null
  }
}

/**
 * Make authenticated API request
 */
export async function authenticatedFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  let accessToken = getAccessToken()

  if (!accessToken) {
    throw new Error('Not authenticated')
  }

  // Add authorization header
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  }

  // Make request
  let response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  // If unauthorized, try to refresh token
  if (response.status === 401) {
    const newAuth = await refreshAccessToken()
    if (newAuth) {
      accessToken = newAuth.access_token
      headers.Authorization = `Bearer ${accessToken}`

      // Retry request with new token
      response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      })
    }
  }

  return response
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await authenticatedFetch('/auth/me')

    if (!response.ok) {
      throw new Error('Failed to get current user')
    }

    return await response.json()
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  updates: Partial<User>
): Promise<User | null> {
  try {
    const response = await authenticatedFetch('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(updates),
    })

    if (!response.ok) {
      throw new Error('Failed to update user profile')
    }

    const updatedUser = await response.json()

    // Update stored auth with new user data
    const auth = getStoredAuth()
    if (auth) {
      auth.user = updatedUser
      storeAuth(auth)
    }

    return updatedUser
  } catch (error) {
    console.error('Update user profile error:', error)
    return null
  }
}

/**
 * Logout
 */
export async function logout(): Promise<void> {
  try {
    await authenticatedFetch('/auth/logout', {
      method: 'POST',
    })
  } catch (error) {
    console.error('Logout error:', error)
  } finally {
    clearAuth()
  }
}
