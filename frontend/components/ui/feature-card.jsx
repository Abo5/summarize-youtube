"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export function FeatureCard({ title, description, icon, className }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      className={cn(
        "relative rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-500",
        isHovered && "shadow-md",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative z-10">
        <div
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300",
            isHovered && "scale-110"
          )}
        >
          {icon}
        </div>
        <h3 className="mt-6 text-xl font-medium text-black">{title}</h3>
        <p className="mt-3 text-gray-600 font-light leading-relaxed">{description}</p>
      </div>

      <div
        className={cn(
          "absolute inset-0 rounded-3xl bg-gradient-to-br from-gray-50 to-white opacity-0 transition-opacity duration-500",
          isHovered && "opacity-100"
        )}
      />
    </motion.div>
  )
}
