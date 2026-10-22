"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { AuthGuard, useUser } from "@/components/auth-guard"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

function Stats() {
  const user = useUser()
  const stats = [
    { label: "Solde", value: `${user.solde.toFixed(2)} €` },
    { label: "Crédits", value: user.credits },
    { label: "Projets", value: user.prj },
    { label: "Commandes", value: user.cmd },
    { label: "Tickets", value: user.ticket },
  ]

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold">Bonjour, {user.pseudo}</h1>
        <p className="text-sm text-muted-foreground">
          Voici un aperçu de votre compte.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-2xl tabular-nums">{stat.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
      <Card className="text-2x1">
        <CardHeader>
          <CardTitle>Activité récente</CardTitle>
          <CardDescription>Aucune activité pour le moment.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Vos projets, commandes et tickets apparaîtront ici.
        </CardContent>
      </Card>
    </div>
  )
}

export default function Page() {
  return (
    <AuthGuard>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <span className="font-medium">Dashboard</span>
          </header>
          <Stats />
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  )
}
