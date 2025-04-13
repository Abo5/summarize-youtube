import React, { forwardRef } from "react"
import { Slot } from "@radix-ui/react-slot"
import { ChevronRight, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

export const Breadcrumb = forwardRef(function Breadcrumb(props, ref) {
  const { separator, ...rest } = props
  return <nav ref={ref} aria-label="breadcrumb" {...rest} />
})
Breadcrumb.displayName = "Breadcrumb"

export const BreadcrumbList = forwardRef(function BreadcrumbList(props, ref) {
  const { className, ...rest } = props
  return (
    <ol ref={ref} className={cn("flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5", className)} {...rest} />
  )
})
BreadcrumbList.displayName = "BreadcrumbList"

export const BreadcrumbItem = forwardRef(function BreadcrumbItem(props, ref) {
  const { className, ...rest } = props
  return <li ref={ref} className={cn("inline-flex items-center gap-1.5", className)} {...rest} />
})
BreadcrumbItem.displayName = "BreadcrumbItem"

export const BreadcrumbLink = forwardRef(function BreadcrumbLink(props, ref) {
  const { asChild, className, ...rest } = props
  const Comp = asChild ? Slot : "a"
  return <Comp ref={ref} className={cn("transition-colors hover:text-foreground", className)} {...rest} />
})
BreadcrumbLink.displayName = "BreadcrumbLink"

export const BreadcrumbPage = forwardRef(function BreadcrumbPage(props, ref) {
  const { className, ...rest } = props
  return <span ref={ref} role="link" aria-disabled="true" aria-current="page" className={cn("font-normal text-foreground", className)} {...rest} />
})
BreadcrumbPage.displayName = "BreadcrumbPage"

export function BreadcrumbSeparator({ children, className, ...props }) {
  return (
    <li
      role="presentation"
      aria-hidden="true"
      className={cn("[&>svg]:w-3.5 [&>svg]:h-3.5", className)}
      {...props}
    >
      {children ?? <ChevronRight />}
    </li>
  )
}
BreadcrumbSeparator.displayName = "BreadcrumbSeparator"

export function BreadcrumbEllipsis({ className, ...props }) {
  return (
    <span
      role="presentation"
      aria-hidden="true"
      className={cn("flex h-9 w-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">More</span>
    </span>
  )
}
BreadcrumbEllipsis.displayName = "BreadcrumbEllipsis"
