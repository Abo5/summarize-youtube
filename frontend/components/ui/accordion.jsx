"use client"

import React, { forwardRef } from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export const Accordion = AccordionPrimitive.Root

export const AccordionItem = forwardRef(function AccordionItem(props, ref) {
  const { className, ...rest } = props
  return (
    <AccordionPrimitive.Item ref={ref} className={cn("border-b", className)} {...rest} />
  )
})
AccordionItem.displayName = "AccordionItem"

export const AccordionTrigger = forwardRef(function AccordionTrigger(props, ref) {
  const { className, children, ...rest } = props
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(
          "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline",
          "[&[data-state=open]>svg]:rotate-180",
          className
        )}
        {...rest}
      >
        {children}
        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
})
AccordionTrigger.displayName = "AccordionTrigger"

export const AccordionContent = forwardRef(function AccordionContent(props, ref) {
  const { className, children, ...rest } = props
  return (
    <AccordionPrimitive.Content
      ref={ref}
      className={cn(
        "overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
        className
      )}
      {...rest}
    >
      <div className="pb-4 pt-0">{children}</div>
    </AccordionPrimitive.Content>
  )
})
AccordionContent.displayName = "AccordionContent"
