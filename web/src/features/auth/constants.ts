export const API_URL = process.env.NEXT_PUBLIC_API_URL

if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL environment variable is not set')
}

export const ACCESS_TOKEN_COOKIE = 'accessToken'
export const REFRESH_TOKEN_COOKIE = 'refreshToken'

export const ACCESS_MAX_AGE = 15 * 60
export const REFRESH_MAX_AGE = 7 * 24 * 60 * 60
