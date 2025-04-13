"use client"

import React, { useState, useRef } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export function PinContainer({
  children,
  title,
  containerClassName,
  className,
  href,
}) {
  const [transform, setTransform] = useState({ translateX: 0, translateY: 0, scale: 1 })
  const containerRef = useRef(null)
  const targetRef = useRef(null)

  const handleMouseMove = (e) => {
    if (!containerRef.current || !targetRef.current) return
    const containerRect = containerRef.current.getBoundingClientRect()
    const diffX = e.clientX - (containerRect.left + containerRect.width / 2)
    const diffY = e.clientY - (containerRect.top + containerRect.height / 2)

    const translateX = diffX / 10
    const translateY = diffY / 10

    setTransform({ translateX, translateY, scale: 1.05 })
  }

  const handleMouseLeave = () => {
    setTransform({ translateX: 0, translateY: 0, scale: 1 })
  }

  const inner = (
    <div
      ref={containerRef}
      className={cn(
        "relative h-full w-full p-px bg-gradient-to-b from-white/30 to-transparent rounded-full shadow-input transition-transform-colors duration-200",
        containerClassName
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        ref={targetRef}
        animate={{
          translateX: transform.translateX,
          translateY: transform.translateY,
          scale: transform.scale,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 20,
          mass: 1,
        }}
        className="bg-white h-full w-full flex items-center justify-center text-black rounded-full"
      >
        <div className={cn(className)}>
          {title && <div className="text-xs font-medium opacity-70">{title}</div>}
          {children}
        </div>
      </motion.div>
    </div>
  )

  if (href) {
    return (
      <a href={href} className="block h-full w-full">
        {inner}
      </a>
    )
  }

  return inner
}
