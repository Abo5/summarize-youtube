"use client"

import React, { useState, useRef } from "react"
import { motion, useSpring } from "framer-motion"
import { cn } from "@/lib/utils"

export function ThreeDCard({ children, className, containerClassName }) {
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)
  const ref = useRef(null)

  const handleMouseMove = (e) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()

    const width = rect.width
    const height = rect.height

    const mouseX = (e.clientX - rect.left) / width - 0.5
    const mouseY = (e.clientY - rect.top) / height - 0.5

    const rotateXValue = mouseY * 10
    const rotateYValue = mouseX * -10

    setRotateX(rotateXValue)
    setRotateY(rotateYValue)
  }

  const handleMouseLeave = () => {
    setRotateX(0)
    setRotateY(0)
  }

  const springConfig = { damping: 20, stiffness: 150 }
  const springRotateX = useSpring(rotateX, springConfig)
  const springRotateY = useSpring(rotateY, springConfig)

  return (
    <div className={cn("perspective-1000", containerClassName)}>
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX: springRotateX,
          rotateY: springRotateY,
          transformStyle: "preserve-3d",
        }}
        className={cn("w-full h-full transform transition-transform duration-300 ease-out", className)}
      >
        {children}
        <div
          className="absolute left-0 bottom-0 w-full h-[40px] bg-gradient-to-t from-white/30 to-transparent rounded-b-3xl transform-gpu rotate-x-90 translate-y-[20px] origin-bottom opacity-30 blur-sm"
          style={{
            transform: "rotateX(90deg) translateZ(-20px)",
          }}
        />
      </motion.div>
    </div>
  )
}
