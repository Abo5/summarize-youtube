"use client"

import React, { createContext, useContext } from "react"
import { Slot } from "@radix-ui/react-slot"
import {
  Controller,
  FormProvider,
  useFormContext,
} from "react-hook-form"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

export const Form = FormProvider

const FormFieldContext = createContext({})

export function FormField({ name, ...props }) {
  return (
    <FormFieldContext.Provider value={{ name }}>
      <Controller name={name} {...props} />
    </FormFieldContext.Provider>
  )
}

export function useFormField() {
  const fieldContext = useContext(FormFieldContext)
  const itemContext = useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  const fieldState = getFieldState(fieldContext.name, formState)
  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

const FormItemContext = createContext({})

export const FormItem = React.forwardRef(function FormItem(props, ref) {
  const { className, ...rest } = props
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn("space-y-2", className)} {...rest} />
    </FormItemContext.Provider>
  )
})
FormItem.displayName = "FormItem"

export const FormLabel = React.forwardRef(function FormLabel(props, ref) {
  const { className, ...rest } = props
  const { error, formItemId } = useFormField()

  return (
    <Label
      ref={ref}
      className={cn(error && "text-destructive", className)}
      htmlFor={formItemId}
      {...rest}
    />
  )
})
FormLabel.displayName = "FormLabel"

export const FormControl = React.forwardRef(function FormControl(props, ref) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()
  const { ...rest } = props

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={!error ? formDescriptionId : `${formDescriptionId} ${formMessageId}`}
      aria-invalid={!!error}
      {...rest}
    />
  )
})
FormControl.displayName = "FormControl"

export const FormDescription = React.forwardRef(function FormDescription(props, ref) {
  const { className, ...rest } = props
  const { formDescriptionId } = useFormField()

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn("text-sm text-muted-foreground", className)}
      {...rest}
    />
  )
})
FormDescription.displayName = "FormDescription"

export const FormMessage = React.forwardRef(function FormMessage(props, ref) {
  const { className, children, ...rest } = props
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message) : children

  if (!body) return null

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn("text-sm font-medium text-destructive", className)}
      {...rest}
    >
      {body}
    </p>
  )
})
FormMessage.displayName = "FormMessage"
