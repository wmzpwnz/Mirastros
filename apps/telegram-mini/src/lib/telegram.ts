/**
 * Telegram-specific features integration
 */
import WebApp from '@twa-dev/sdk'
import { authenticatedFetch } from './auth'

/**
 * Telegram Stars payment integration
 */
export interface PaymentParams {
  title: string
  description: string
  amount: number // Amount in Telegram Stars
  payload: string // Custom payload for backend verification
}

export async function initiateTelegramStarsPayment(
  params: PaymentParams
): Promise<boolean> {
  try {
    // Check if payments are supported
    if (!WebApp.isVersionAtLeast('6.1')) {
      console.error('Telegram Stars payments require Telegram version 6.1+')
      return false
    }

    // Create invoice link via backend
    const response = await authenticatedFetch('/payments/telegram/create-invoice', {
      method: 'POST',
      body: JSON.stringify({
        title: params.title,
        description: params.description,
        amount: params.amount,
        payload: params.payload,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to create invoice')
    }

    const { invoice_link } = await response.json()

    // Open invoice in Telegram
    WebApp.openInvoice(invoice_link, (status: string) => {
      if (status === 'paid') {
        console.log('Payment successful')
        // Backend will handle webhook and update subscription
      } else if (status === 'cancelled') {
        console.log('Payment cancelled')
      } else if (status === 'failed') {
        console.error('Payment failed')
      }
    })

    return true
  } catch (error) {
    console.error('Payment error:', error)
    return false
  }
}

/**
 * Subscribe to Premium using Telegram Stars
 */
export async function subscribeToPremium(): Promise<boolean> {
  return initiateTelegramStarsPayment({
    title: 'Mirastros Premium',
    description: 'Unlimited access to all esoteric services',
    amount: 999, // 999 Telegram Stars (~$9.99)
    payload: JSON.stringify({
      subscription_tier: 'premium',
      billing_period: 'monthly',
    }),
  })
}

/**
 * Subscribe to Platinum using Telegram Stars
 */
export async function subscribeToPlatinum(): Promise<boolean> {
  return initiateTelegramStarsPayment({
    title: 'Mirastros Platinum',
    description: 'VIP access with personalized AI astrologer',
    amount: 2999, // 2999 Telegram Stars (~$29.99)
    payload: JSON.stringify({
      subscription_tier: 'platinum',
      billing_period: 'monthly',
    }),
  })
}

/**
 * Bot notifications integration
 */
export interface NotificationPreferences {
  daily_horoscope: boolean
  transit_alerts: boolean
  lunar_phases: boolean
  personalized_insights: boolean
}

export async function updateNotificationPreferences(
  preferences: NotificationPreferences
): Promise<boolean> {
  try {
    const response = await authenticatedFetch('/telegram/notifications/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    })

    return response.ok
  } catch (error) {
    console.error('Failed to update notification preferences:', error)
    return false
  }
}

export async function subscribeToNotifications(
  notificationType: keyof NotificationPreferences
): Promise<boolean> {
  try {
    const response = await authenticatedFetch('/telegram/notifications/subscribe', {
      method: 'POST',
      body: JSON.stringify({
        notification_type: notificationType,
      }),
    })

    return response.ok
  } catch (error) {
    console.error('Failed to subscribe to notifications:', error)
    return false
  }
}

/**
 * Share reading with Telegram contacts
 */
export function shareReading(
  readingType: string,
  readingText: string
): void {
  const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(
    window.location.href
  )}&text=${encodeURIComponent(
    `✨ My ${readingType} from Mirastros:\n\n${readingText.substring(0, 200)}...`
  )}`

  WebApp.openTelegramLink(shareUrl)
}

/**
 * Send reading to saved messages
 */
export async function saveReadingToTelegram(
  readingType: string,
  readingData: any
): Promise<boolean> {
  try {
    const response = await authenticatedFetch('/telegram/save-reading', {
      method: 'POST',
      body: JSON.stringify({
        reading_type: readingType,
        reading_data: readingData,
      }),
    })

    if (response.ok) {
      WebApp.showAlert('Reading saved to your Telegram Saved Messages!')
      return true
    }

    return false
  } catch (error) {
    console.error('Failed to save reading:', error)
    return false
  }
}

/**
 * Haptic feedback for better UX
 */
export function triggerHapticFeedback(
  type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light'
): void {
  if (WebApp.HapticFeedback) {
    switch (type) {
      case 'light':
      case 'medium':
      case 'heavy':
        WebApp.HapticFeedback.impactOccurred(type)
        break
      case 'success':
      case 'warning':
      case 'error':
        WebApp.HapticFeedback.notificationOccurred(type)
        break
    }
  }
}

/**
 * Show Telegram popup
 */
export function showPopup(
  title: string,
  message: string,
  buttons: Array<{ text: string; type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive' }> = [
    { text: 'OK', type: 'ok' },
  ]
): Promise<string> {
  return new Promise((resolve) => {
    WebApp.showPopup(
      {
        title,
        message,
        buttons,
      },
      (buttonId: string) => {
        resolve(buttonId || '')
      }
    )
  })
}

/**
 * Request contact sharing
 */
export function requestContact(): Promise<any> {
  return new Promise((resolve, reject) => {
    if (!WebApp.isVersionAtLeast('6.9')) {
      reject(new Error('Contact sharing requires Telegram version 6.9+'))
      return
    }

    // Note: This is a placeholder - actual implementation depends on Telegram API updates
    WebApp.showAlert('Contact sharing will be available in a future update')
    reject(new Error('Not implemented yet'))
  })
}

/**
 * Set main button (bottom action button)
 */
export function setMainButton(
  text: string,
  onClick: () => void,
  options: {
    color?: string
    textColor?: string
    isActive?: boolean
    isVisible?: boolean
  } = {}
): void {
  const mainButton = WebApp.MainButton

  mainButton.setText(text)
  mainButton.onClick(onClick)

  if (options.color) mainButton.setParams({ color: options.color })
  if (options.textColor) mainButton.setParams({ text_color: options.textColor })
  if (options.isActive !== undefined) {
    options.isActive ? mainButton.enable() : mainButton.disable()
  }
  if (options.isVisible !== undefined) {
    options.isVisible ? mainButton.show() : mainButton.hide()
  }
}

/**
 * Hide main button
 */
export function hideMainButton(): void {
  WebApp.MainButton.hide()
}

/**
 * Get Telegram theme colors
 */
export function getTelegramTheme() {
  return {
    bgColor: WebApp.themeParams.bg_color || '#1E0A3C',
    textColor: WebApp.themeParams.text_color || '#FFFFFF',
    hintColor: WebApp.themeParams.hint_color || '#999999',
    linkColor: WebApp.themeParams.link_color || '#D4AF37',
    buttonColor: WebApp.themeParams.button_color || '#D4AF37',
    buttonTextColor: WebApp.themeParams.button_text_color || '#000000',
  }
}

/**
 * Close Mini App
 */
export function closeMiniApp(): void {
  WebApp.close()
}

/**
 * Check if running in Telegram
 */
export function isRunningInTelegram(): boolean {
  return WebApp.initData !== ''
}
