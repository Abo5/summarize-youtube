"use client"

import React, { useEffect, useRef, useState } from "react"
import { motion, useAnimation } from "framer-motion"
import { cn } from "@/lib/utils"

export function ScrollReveal({
  children,
  className,
  threshold = 0.1,
  delay = 0,
  duration = 0.8,
  distance = 40,
  once = true,
}) {
  const controls = useAnimation()
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        const isEntryIntersecting = entry.isIntersecting
        if (isEntryIntersecting && !isVisible) {
          setIsVisible(true)
          controls.start("visible")
        } else if (!isEntryIntersecting && !once) {
          setIsVisible(false)
          controls.start("hidden")
        }
      },
      { threshold }
    )

    const element = ref.current
    if (element) observer.observe(element)

    return () => {
      if (element) observer.unobserve(element)
    }
  }, [controls, isVisible, once, threshold])

  const variants = {
    hidden: { opacity: 0, y: distance },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  }

  return (
    <motion.div ref={ref} initial="hidden" animate={controls} variants={variants} className={cn(className)}>
      {children}
    </motion.div>
  )
}
