import React, { createContext, useContext, useEffect, useState } from "react"

import {
  getAuthInfo,
  removeAuthInfo,
  storeAuthInfo,
  hasTokenExpired,
} from "@/servises/auth"

import type { AuthContextType, LoginData, User } from "@/types/auth"
import { refreshAccessToken } from "@/servises/auth/token/refres-access-token"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const login = (loginData: LoginData) => {
    try {
      storeAuthInfo(loginData)
      setToken(loginData.token)
      setUser(loginData.user_info)
    } catch (error) {
      console.error("Login failed:", error)
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    removeAuthInfo()
    window.location.href = "/login"
  }

  useEffect(() => {
    const initializeAuth = async () => {
      const auth = getAuthInfo()
      if (!auth) {
        setIsLoading(false)
        return
      }

      const accessExpired = hasTokenExpired(auth.token)
      const refreshExpired = !auth.refresh || hasTokenExpired(auth.refresh)

      if (!accessExpired) {
        setToken(auth.token)
        setUser(auth.userInfo)
        setIsLoading(false)
        return
      }

      if (refreshExpired) {
        logout()
        return
      }

      // Try refreshing the access token
      try {
        const { access, refresh } = await refreshAccessToken(auth.refresh)
        storeAuthInfo({
          token: access,
          refresh: refresh || auth.refresh,
          user_info: auth.userInfo,
        })
        setToken(access)
        setUser(auth.userInfo)
      } catch {
        logout()
        return
      }

      setIsLoading(false)
    }

    initializeAuth()
  }, [])

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!user && !!token,
    isLoading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useLoginContext must be used within a LoginProvider")
  }
  return context
}

export default { AuthProvider, useAuth }
