"use client"

import React, { useRef, useState, useEffect } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export function Spotlight({ className, fill = "white" }) {
  const divRef = useRef(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const handleMouseMove = (event) => {
      if (divRef.current) {
        const div = divRef.current
        const rect = div.getBoundingClientRect()
        setMousePosition({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        })
      }
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <motion.div
      ref={divRef}
      className={cn("pointer-events-none absolute z-0 h-[50vh] w-[40vw] opacity-30", className)}
      animate={{
        opacity: isHovered ? 0.5 : 0.12,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 880 880" fill="none" className="h-full w-full">
        <motion.g
          animate={{ x: mousePosition.x - 440, y: mousePosition.y - 440, scale: isHovered ? 1.1 : 1 }}
        >
          <motion.circle
            animate={{ scale: [0.95, 1.05, 0.95] }}
            transition={{
              repeat: Infinity,
              duration: 6,
              ease: "easeInOut",
            }}
            cx="440"
            cy="440"
            r="230"
            fill={fill}
            fillOpacity="0.1"
          />
          <motion.circle
            animate={{ scale: [0.9, 1.1, 0.9] }}
            transition={{
              repeat: Infinity,
              duration: 8,
              ease: "easeInOut",
            }}
            cx="440"
            cy="440"
            r="340"
            fill={fill}
            fillOpacity="0.05"
          />
          <motion.circle
            animate={{ scale: [0.85, 1.15, 0.85] }}
            transition={{
              repeat: Infinity,
              duration: 10,
              ease: "easeInOut",
            }}
            cx="440"
            cy="440"
            r="440"
            fill={fill}
            fillOpacity="0.025"
          />
        </motion.g>
      </svg>
    </motion.div>
  )
}
