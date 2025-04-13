"use client"

import React, { forwardRef } from "react"
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group"
import { toggleVariants } from "@/components/ui/toggle"
import { cn } from "@/lib/utils"

const ToggleGroupContext = React.createContext({
  size: "default",
  variant: "default",
})

export const ToggleGroup = forwardRef(function ToggleGroup(props, ref) {
  const { className, variant, size, children, ...rest } = props
  return (
    <ToggleGroupPrimitive.Root ref={ref} className={cn("flex items-center justify-center gap-1", className)} {...rest}>
      <ToggleGroupContext.Provider value={{ variant, size }}>{children}</ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  )
})
ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName

export const ToggleGroupItem = forwardRef(function ToggleGroupItem(props, ref) {
  const { className, children, variant, size, ...rest } = props
  const context = React.useContext(ToggleGroupContext)

  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(toggleVariants({ variant: context.variant || variant, size: context.size || size }), className)}
      {...rest}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  )
})
ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName
