"use client"
import React, { useState } from "react"
import { motion } from "framer-motion"

export const AnimatedTooltip = ({ items }) => {
  return (
    <div className="flex flex-row items-center justify-center gap-4">
      {items.map((item) => (
        <TooltipComponent key={item.id} item={item} />
      ))}
    </div>
  )
}

const TooltipComponent = ({ item }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="group relative" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.6 }}
        animate={{
          opacity: isHovered ? 1 : 0,
          y: isHovered ? 0 : 20,
          scale: isHovered ? 1 : 0.6,
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        style={{ translateX: "-50%" }}
        className="absolute bottom-full left-1/2 z-50 mb-3 rounded-xl bg-white p-4 shadow-xl border border-gray-100"
      >
        <div className="flex flex-col items-center gap-2">
          <p className="whitespace-nowrap text-center text-lg font-bold text-black">{item.name}</p>
          <p className="whitespace-nowrap text-center text-sm text-gray-600">{item.designation}</p>
        </div>
        <div
          className="absolute left-1/2 top-full h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-white"
          style={{
            boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.05)",
          }}
        ></div>
      </motion.div>
      <div className="relative h-24 w-24 rounded-full border-2 border-gray-100 p-1 transition-all duration-300 group-hover:border-gray-300">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-30"></div>
        <img
          src={item.image || "/placeholder.svg"}
          alt={item.name}
          className="h-full w-full rounded-full object-cover"
        />
      </div>
    </div>
  )
}
