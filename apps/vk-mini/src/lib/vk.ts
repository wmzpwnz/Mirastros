/**
 * VK Bridge integration for VK Mini App
 */
import bridge, { UserInfo } from '@vkontakte/vk-bridge'
import { authenticatedFetch } from './auth'

/**
 * Initialize VK Bridge
 */
export async function initVKBridge(): Promise<void> {
  try {
    await bridge.send('VKWebAppInit')
    console.log('VK Bridge initialized')
  } catch (error) {
    console.error('Failed to initialize VK Bridge:', error)
    throw error
  }
}

/**
 * Get VK user info
 */
export async function getVKUserInfo(): Promise<UserInfo> {
  try {
    const userInfo = await bridge.send('VKWebAppGetUserInfo')
    return userInfo
  } catch (error) {
    console.error('Failed to get VK user info:', error)
    throw error
  }
}

/**
 * Get VK access token
 */
export async function getVKAccessToken(scope: string = ''): Promise<string> {
  try {
    const data = await bridge.send('VKWebAppGetAuthToken', {
      app_id: parseInt(process.env.NEXT_PUBLIC_VK_APP_ID || '0'),
      scope: scope,
    })
    return data.access_token
  } catch (error) {
    console.error('Failed to get VK access token:', error)
    throw error
  }
}

/**
 * VK Pay payment integration
 */
export interface VKPaymentParams {
  amount: number // Amount in rubles
  description: string
  payload: string // Custom payload for backend verification
}

export async function initiateVKPayment(
  params: VKPaymentParams
): Promise<boolean> {
  try {
    // Create payment via backend
    const response = await authenticatedFetch('/payments/vk/create-payment', {
      method: 'POST',
      body: JSON.stringify({
        amount: params.amount,
        description: params.description,
        payload: params.payload,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to create payment')
    }

    const { merchant_id, sign } = await response.json()

    // Open VK Pay form
    const result = await bridge.send('VKWebAppOpenPayForm', {
      app_id: parseInt(process.env.NEXT_PUBLIC_VK_APP_ID || '0'),
      action: 'pay-to-service',
      params: {
        amount: params.amount,
        description: params.description,
        merchant_id: merchant_id,
        sign: sign,
      },
    })

    if (result.status) {
      console.log('Payment successful')
      return true
    }

    return false
  } catch (error) {
    console.error('Payment error:', error)
    return false
  }
}

/**
 * Subscribe to Premium using VK Pay
 */
export async function subscribeToPremium(): Promise<boolean> {
  return initiateVKPayment({
    amount: 999, // 999 rubles (~$9.99)
    description: 'Mirastros Premium - Unlimited access to all esoteric services',
    payload: JSON.stringify({
      subscription_tier: 'premium',
      billing_period: 'monthly',
    }),
  })
}

/**
 * Subscribe to Platinum using VK Pay
 */
export async function subscribeToPlatinum(): Promise<boolean> {
  return initiateVKPayment({
    amount: 2999, // 2999 rubles (~$29.99)
    description: 'Mirastros Platinum - VIP access with personalized AI astrologer',
    payload: JSON.stringify({
      subscription_tier: 'platinum',
      billing_period: 'monthly',
    }),
  })
}

/**
 * Share reading to VK wall
 */
export async function shareToWall(
  message: string,
  attachments?: string
): Promise<boolean> {
  try {
    const result = await bridge.send('VKWebAppShowWallPostBox', {
      message: message,
      attachments: attachments,
    })

    if (result.post_id) {
      console.log('Shared to wall successfully')
      return true
    }

    return false
  } catch (error) {
    console.error('Failed to share to wall:', error)
    return false
  }
}

/**
 * Share reading as VK story
 */
export async function shareAsStory(
  imageUrl: string,
  stickerUrl?: string
): Promise<boolean> {
  try {
    const stickers = stickerUrl
      ? [
          {
            sticker_type: 'renderable' as const,
            sticker: {
              content_type: 'image' as const,
              url: stickerUrl,
            },
          },
        ]
      : []

    const result = await bridge.send('VKWebAppShowStoryBox', {
      background_type: 'image',
      url: imageUrl,
      stickers: stickers,
    })

    return true
  } catch (error) {
    console.error('Failed to share story:', error)
    return false
  }
}

/**
 * Share reading with VK friends
 */
export function shareReading(
  readingType: string,
  readingText: string,
  readingUrl: string
): void {
  const message = `✨ My ${readingType} from Mirastros:\n\n${readingText.substring(0, 200)}...`
  shareToWall(message, readingUrl)
}

/**
 * Show VK native alert
 */
export async function showAlert(
  title: string,
  message: string
): Promise<void> {
  try {
    await bridge.send('VKWebAppCallAPIMethod', {
      method: 'messages.send',
      params: {
        message: `${title}\n\n${message}`,
        v: '5.131',
      },
    })
  } catch (error) {
    console.error('Failed to show alert:', error)
  }
}

/**
 * Request VK permissions
 */
export async function requestPermissions(
  scope: string[]
): Promise<boolean> {
  try {
    const result = await bridge.send('VKWebAppGetAuthToken', {
      app_id: parseInt(process.env.NEXT_PUBLIC_VK_APP_ID || '0'),
      scope: scope.join(','),
    })

    return !!result.access_token
  } catch (error) {
    console.error('Failed to request permissions:', error)
    return false
  }
}

/**
 * Get VK theme colors
 */
export function getVKTheme() {
  // VK uses CSS variables for theming
  const style = getComputedStyle(document.documentElement)
  
  return {
    bgColor: style.getPropertyValue('--vkui--color_background') || '#1E0A3C',
    textColor: style.getPropertyValue('--vkui--color_text_primary') || '#FFFFFF',
    accentColor: style.getPropertyValue('--vkui--color_accent') || '#D4AF37',
    buttonColor: style.getPropertyValue('--vkui--color_button_primary_background') || '#D4AF37',
  }
}

/**
 * Check if running in VK
 */
export function isRunningInVK(): boolean {
  return window.location.search.includes('vk_') || 
         window.location.hash.includes('vk_')
}

/**
 * Close VK Mini App
 */
export async function closeMiniApp(): Promise<void> {
  try {
    await bridge.send('VKWebAppClose', {
      status: 'success',
      payload: {},
    })
  } catch (error) {
    console.error('Failed to close mini app:', error)
  }
}

/**
 * Add to favorites
 */
export async function addToFavorites(): Promise<boolean> {
  try {
    const result = await bridge.send('VKWebAppAddToFavorites')
    return true
  } catch (error) {
    console.error('Failed to add to favorites:', error)
    return false
  }
}

/**
 * Add to home screen
 */
export async function addToHomeScreen(): Promise<boolean> {
  try {
    const result = await bridge.send('VKWebAppAddToHomeScreen')
    return true
  } catch (error) {
    console.error('Failed to add to home screen:', error)
    return false
  }
}

/**
 * Allow notifications
 */
export async function allowNotifications(): Promise<boolean> {
  try {
    const result = await bridge.send('VKWebAppAllowNotifications')
    return true
  } catch (error) {
    console.error('Failed to allow notifications:', error)
    return false
  }
}

/**
 * Deny notifications
 */
export async function denyNotifications(): Promise<boolean> {
  try {
    const result = await bridge.send('VKWebAppDenyNotifications')
    return true
  } catch (error) {
    console.error('Failed to deny notifications:', error)
    return false
  }
}
