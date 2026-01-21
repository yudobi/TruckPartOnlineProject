import { jwtDecode } from "jwt-decode"

import { REFRESH_TOKEN_KEY, TOKEN_KEY, USER_KEY } from "@/lib/constants"
import type { LoginData, User } from "@/types/auth"
import { decryptData, encryptData } from "./encryptation"



const PASSWORD = "encriptUserPassword!@#$"

export function getAuthInfo(): {
  token: string
  refresh: string
  userInfo: User
} | null {
  try {
    const token = localStorage.getItem(TOKEN_KEY)
    const refresh = localStorage.getItem(REFRESH_TOKEN_KEY) || ""
    const encryptedUserInfo = localStorage.getItem(USER_KEY)

    if (!token || !encryptedUserInfo) {
      return null
    }

    const userInfo = decryptData(encryptedUserInfo, PASSWORD)

    return { token, refresh, userInfo }
  } catch (error) {
    console.error("Error decrypting user info:", error)
    return null
  }
}

export function storeAuthInfo(loginData: LoginData) {
  localStorage.setItem(TOKEN_KEY, loginData.token)
  localStorage.setItem(REFRESH_TOKEN_KEY, loginData.refresh)

  // 🔐 Encrypt user info before store in local storage
  const encryptedUserInfo = encryptData(loginData.user_info, PASSWORD)
  localStorage.setItem(USER_KEY, encryptedUserInfo)
}

export function removeAuthInfo() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export function isAuthenticated() {
  return getAuthInfo() !== null
}

export function hasPermissions() {
  const auth = getAuthInfo()
  if (!auth) return false
  return hasAccessPermissions(auth.userInfo)
}

export function hasAccessPermissions(user: User) {
  return user.is_staff || user.is_superuser
}

export function hasTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode<{ exp?: number }>(token)
    if (typeof decoded.exp !== "number") {
      // If exp is missing or not a number, treat as expired
      return true
    }
    const exp = decoded.exp * 1000 // ms
    const now = Date.now()
    if (exp > now) {
      return false
    }
    return true
  } catch (err) {
    console.error("Error decoding jwt:", err)
    return true
  }
}
