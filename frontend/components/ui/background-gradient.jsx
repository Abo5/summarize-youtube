"use client"
import React, { useRef, useState, useEffect } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export const BackgroundGradient = ({
  children,
  className,
  containerClassName,
  animate = true,
}) => {
  const wrapperRef = useRef(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(0)

  const updateMousePosition = (ev) => {
    if (!wrapperRef.current) return
    const rect = wrapperRef.current.getBoundingClientRect()
    setPosition({
      x: ev.clientX - rect.left,
      y: ev.clientY - rect.top,
    })
  }

  const handleMouseEnter = () => {
    setOpacity(1)
  }

  const handleMouseLeave = () => {
    setOpacity(0)
  }

  useEffect(() => {
    if (!animate) return
    window.addEventListener("mousemove", updateMousePosition)
    window.addEventListener("mouseenter", handleMouseEnter)
    window.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      window.removeEventListener("mousemove", updateMousePosition)
      window.removeEventListener("mouseenter", handleMouseEnter)
      window.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [animate])

  return (
    <div ref={wrapperRef} className={cn("relative overflow-hidden", containerClassName)}>
      {animate && (
        <motion.div
          className="absolute inset-0 z-0 bg-white opacity-20 pointer-events-none"
          animate={{
            background: [
              `radial-gradient(800px circle at ${position.x}px ${position.y}px, rgba(0,0,0,0.06), transparent 40%)`,
              `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(0,0,0,0.04), transparent 40%)`,
              `radial-gradient(800px circle at ${position.x}px ${position.y}px, rgba(0,0,0,0.02), transparent 40%)`,
            ],
            opacity: opacity,
          }}
          transition={{
            duration: 0.5,
            ease: "easeOut",
          }}
        />
      )}
      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  )
}
