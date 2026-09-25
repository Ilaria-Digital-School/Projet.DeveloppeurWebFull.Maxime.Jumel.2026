"use client"

import * as React from "react"
import {
  ToggleGroup as ToggleGroupPrimitive,
} from "@base-ui/react/toggle-group"
import { Toggle as ToggleItemPrimitive } from "@base-ui/react/toggle"
import { cn } from "@/lib/utils"

function ToggleGroup<Value extends string>({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive<Value>> & {
  variant?: "default" | "outline"
  size?: "default" | "sm"
}) {
  return (
    <ToggleGroupPrimitive
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      className={cn(
        "flex w-fit items-center gap-1 rounded-lg bg-muted p-1",
        className
      )}
      {...props}
    />
  )
}

function ToggleGroupItem<Value extends string>({
  className,
  children,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof ToggleItemPrimitive<Value>> & {
  variant?: "default" | "outline"
  size?: "default" | "sm"
}) {
  return (
    <ToggleItemPrimitive
      data-slot="toggle-group-item"
      data-variant={variant}
      data-size={size}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-medium transition-[color,box-shadow] outline-none",
        "focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
        "data-pressed:bg-background data-pressed:text-foreground data-pressed:shadow-sm",
        "data-pressed:border data-pressed:border-border",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        variant === "outline" &&
          "border border-transparent data-pressed:border-border",
        className
      )}
      {...props}
    >
      {children}
    </ToggleItemPrimitive>
  )
}

export { ToggleGroup, ToggleGroupItem }
