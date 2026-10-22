"use client"

import { createContext, useContext, useEffect, useState } from "react"

export interface CurrentUser {
  id: string
  pseudo: string
  email: string
  role: string
  solde: number
  credits: number
  prj: number
  cmd: number
  ticket: number
}

const UserContext = createContext<CurrentUser | null>(null)

export function useUser() {
  const user = useContext(UserContext)
  if (!user) throw new Error("useUser must be used inside <AuthGuard>")
  return user
}

export function logout() {
  localStorage.removeItem("token")
  window.location.replace("/login")
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      window.location.replace("/login")
      return
    }
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized")
        return res.json()
      })
      .then(setUser)
      .catch(logout)
  }, [])

  return user ? <UserContext.Provider value={user}>{children}</UserContext.Provider> : null
}
