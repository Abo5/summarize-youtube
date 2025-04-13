"use client"

import React, { forwardRef } from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"
import { cn } from "@/lib/utils"

export const ScrollArea = forwardRef(function ScrollArea(props, ref) {
  const { className, children, ...rest } = props
  return (
    <ScrollAreaPrimitive.Root ref={ref} className={cn("relative overflow-hidden", className)} {...rest}>
      <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
})
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

export const ScrollBar = forwardRef(function ScrollBar(props, ref) {
  const { className, orientation = "vertical", ...rest } = props
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      ref={ref}
      orientation={orientation}
      className={cn(
        "flex touch-none select-none transition-colors",
        orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-[1px]",
        orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent p-[1px]",
        className
      )}
      {...rest}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  )
})
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName
