export interface ShopAuthTokens {
  accessToken: string
  refreshToken: string
}

const ACCESS_TOKEN_KEY = 'saraye.shop.accessToken'
const REFRESH_TOKEN_KEY = 'saraye.shop.refreshToken'

export function getShopAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getShopRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function saveShopTokens(tokens: ShopAuthTokens) {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken)
}

export function clearShopTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}