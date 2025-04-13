"use client"
import React, { useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export const TextRevealCard = ({
  text,
  revealText,
  children,
  className,
}) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative w-full max-w-5xl mx-auto h-auto rounded-3xl p-10 overflow-hidden bg-white border border-gray-100",
        className
      )}
    >
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: isHovered ? 0 : 1 }}
          transition={{ duration: 0.3 }}
          className="text-4xl md:text-5xl font-bold text-center"
        >
          {text}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-4xl md:text-5xl font-bold text-center absolute top-0 left-0 right-0"
        >
          {revealText}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="mt-4"
      >
        {children}
      </motion.div>
    </div>
  )
}
