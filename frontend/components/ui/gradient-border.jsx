"use client"

import React, { useState } from "react"
import { cn } from "@/lib/utils"

export function GradientBorder({
  children,
  className,
  containerClassName,
  borderWidth = 1,
  gradientStart = "rgba(0,0,0,0.3)",
  gradientEnd = "rgba(0,0,0,0.1)",
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={cn("relative inline-block group", containerClassName)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `linear-gradient(45deg, ${gradientStart}, ${gradientEnd})`,
          opacity: isHovered ? 1 : 0.5,
          transition: "opacity 0.5s ease",
        }}
      />
      <div
        className={cn("relative rounded-full overflow-hidden", className)}
        style={{
          padding: borderWidth,
        }}
      >
        {children}
      </div>
    </div>
  )
}
