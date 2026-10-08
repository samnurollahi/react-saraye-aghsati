import { ApiError } from '../../services/api-client'

export function getTransactionErrorMessage(error: unknown, fallback: string) {
  if (!(error instanceof ApiError)) return 'ارتباط با سرور برقرار نشد. اتصال اینترنت را بررسی و دوباره تلاش کنید.'
  const message = error.message.toLowerCase()

  if (error.status === 401) return 'نشست شما پایان یافته است. دوباره وارد شوید.'
  if (/shop.*inactive|inactive.*shop|فروشگاه.*غیرفعال|غیرفعال.*فروشگاه/.test(message)) return 'این فروشگاه غیرفعال است و امکان خرید از آن وجود ندارد.'
  if (/insufficient|not enough.*(balance|credit)|موجودی کافی|اعتبار کافی/.test(message)) return 'موجودی وام برای این خرید کافی نیست.'
  if (/no active loan|active loan.*not found|وام فعال|وامی فعال/.test(message)) return 'وام فعالی برای خرید پیدا نشد.'
  if (/invalid.*(qr|token)|(qr|token).*invalid|qr نامعتبر/.test(message)) return 'QR فروشگاه معتبر نیست. کد فروشگاه را دوباره اسکن کنید.'
  if (/invalid amount|amount must|مبلغ نامعتبر|مبلغ باید/.test(message)) return 'مبلغ واردشده معتبر نیست.'
  if (error.status === 404 && (message.includes('shop') || message.includes('فروشگاه'))) return 'فروشگاه پیدا نشد. QR معتبر نیست یا فروشگاه در دسترس نیست.'
  if (error.status === 403 && (message.includes('shop') || message.includes('فروشگاه'))) return 'این فروشگاه غیرفعال است و امکان خرید از آن وجود ندارد.'
  if (error.status === 404) return 'فروشگاه پیدا نشد. QR معتبر نیست.'
  if (error.status === 403) return 'این فروشگاه غیرفعال است و امکان خرید از آن وجود ندارد.'
  return error.message || fallback
}

export function getCameraErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : ''
  if (message.includes('notallowed') || message.includes('permission') || message.includes('denied')) {
    return 'اجازه دسترسی به دوربین داده نشد. دسترسی دوربین را در تنظیمات مرورگر فعال کنید.'
  }
  if (message.includes('notfound') || message.includes('device')) return 'دوربینی برای اسکن پیدا نشد.'
  return 'راه‌اندازی دوربین با خطا مواجه شد. دسترسی دوربین را بررسی و دوباره تلاش کنید.'
}