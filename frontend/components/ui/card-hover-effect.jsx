"use client"
import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"

export const HoverEffect = ({ items, className }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null)

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 py-10", className)}>
      {items.map((item, idx) => (
        <div
          key={idx}
          className="relative group block p-2 h-full w-full"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className="absolute inset-0 h-full w-full bg-black/5 block rounded-3xl"
                layoutId="hoverBackground"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { duration: 0.15 },
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.15, delay: 0.2 },
                }}
              />
            )}
          </AnimatePresence>
          <Card>
            <div className="h-12 w-12 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              {item.icon}
            </div>
            <CardTitle>{item.title}</CardTitle>
            <CardDescription>{item.description}</CardDescription>
          </Card>
        </div>
      ))}
    </div>
  )
}

export const Card = ({ className, children }) => {
  return (
    <div
      className={cn(
        "rounded-2xl h-full w-full p-6 overflow-hidden border border-gray-100 bg-white shadow-sm relative z-20",
        className
      )}
    >
      {children}
    </div>
  )
}

export const CardTitle = ({ className, children }) => {
  return <h4 className={cn("text-xl font-medium tracking-wide text-black mt-4", className)}>{children}</h4>
}

export const CardDescription = ({ className, children }) => {
  return (
    <p className={cn("mt-2 text-gray-600 tracking-wide leading-relaxed font-light", className)}>{children}</p>
  )
}
