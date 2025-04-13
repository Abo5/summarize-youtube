"use client"

import React, { forwardRef } from "react"
import { Drawer as DrawerPrimitive } from "vaul"
import { cn } from "@/lib/utils"

export function Drawer({ shouldScaleBackground = true, ...props }) {
  return <DrawerPrimitive.Root shouldScaleBackground={shouldScaleBackground} {...props} />
}

export const DrawerTrigger = DrawerPrimitive.Trigger
export const DrawerPortal = DrawerPrimitive.Portal
export const DrawerClose = DrawerPrimitive.Close

export const DrawerOverlay = forwardRef(function DrawerOverlay(props, ref) {
  const { className, ...rest } = props
  return (
    <DrawerPrimitive.Overlay
      ref={ref}
      className={cn("fixed inset-0 z-50 bg-black/80", className)}
      {...rest}
    />
  )
})
DrawerOverlay.displayName = "DrawerOverlay"

export const DrawerContent = forwardRef(function DrawerContent(props, ref) {
  const { className, children, ...rest } = props
  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerPrimitive.Content
        ref={ref}
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background",
          className
        )}
        {...rest}
      >
        <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  )
})
DrawerContent.displayName = "DrawerContent"

export function DrawerHeader(props) {
  const { className, ...rest } = props
  return <div className={cn("grid gap-1.5 p-4 text-center sm:text-left", className)} {...rest} />
}
DrawerHeader.displayName = "DrawerHeader"

export function DrawerFooter(props) {
  const { className, ...rest } = props
  return <div className={cn("mt-auto flex flex-col gap-2 p-4", className)} {...rest} />
}
DrawerFooter.displayName = "DrawerFooter"

export const DrawerTitle = forwardRef(function DrawerTitle(props, ref) {
  const { className, ...rest } = props
  return (
    <DrawerPrimitive.Title
      ref={ref}
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...rest}
    />
  )
})
DrawerTitle.displayName = "DrawerTitle"

export const DrawerDescription = forwardRef(function DrawerDescription(props, ref) {
  const { className, ...rest } = props
  return (
    <DrawerPrimitive.Description
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...rest}
    />
  )
})
DrawerDescription.displayName = "DrawerDescription"
