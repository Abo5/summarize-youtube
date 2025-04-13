"use client"

import React, { useState } from "react"
import { cn } from "@/lib/utils"

export function GlowingButton({
  children,
  className,
  containerClassName,
  variant = "black",
  ...props
}) {
  const [hovered, setHovered] = useState(false)

  const baseStyles = "relative z-0 group overflow-hidden rounded-full"
  const blackVariantStyles = "bg-black text-white hover:bg-gray-900"
  const whiteVariantStyles = "bg-white text-black hover:bg-gray-50"

  return (
    <div
      className={cn("rounded-full p-[1px] overflow-hidden", containerClassName)}
      style={{
        background: hovered
          ? variant === "black"
            ? "linear-gradient(to right, rgb(200, 200, 200), rgb(30, 30, 30), rgb(200, 200, 200))"
            : "linear-gradient(to right, rgb(30, 30, 30), rgb(200, 200, 200), rgb(30, 30, 30))"
          : "transparent",
        transition: "all 0.5s ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        className={cn(
          baseStyles,
          variant === "black" ? blackVariantStyles : whiteVariantStyles,
          "text-base font-normal py-7 px-10 flex items-center transition-all duration-500",
          className
        )}
        {...props}
      >
        {children}
        <div
          className={cn(
            "absolute inset-0 h-full w-full bg-gradient-to-r opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500",
            variant === "black"
              ? "from-gray-900 via-gray-100 to-gray-900"
              : "from-gray-100 via-gray-900 to-gray-100"
          )}
        />
      </button>
    </div>
  )
}
