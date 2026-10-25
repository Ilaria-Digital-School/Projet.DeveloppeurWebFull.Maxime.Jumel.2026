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
  fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/logout`, {
    method: "POST",
    credentials: "include",
  }).finally(() => window.location.replace("/login"))
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null)

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/me`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized")
        return res.json()
      })
      .then(({ user: u }) => {
        setUser({
          id: u.id,
          pseudo: u.username,
          email: u.email,
          role: u.roles?.[0] ?? "user",
          solde: u.solde ?? 0,
          credits: 0,
          prj: 0,
          cmd: 0,
          ticket: u.tickets ?? 0,
        })
      })
      .catch(() => window.location.replace("/login"))
  }, [])

  return user ? <UserContext.Provider value={user}>{children}</UserContext.Provider> : null
}
