"use client"

import React, { useEffect, useRef, useState } from "react"
import { motion, useAnimation, useScroll, useSpring, useTransform } from "framer-motion"
import { cn } from "@/lib/utils"

export function TracingBeam({ children, className }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })

  // تحريك المسارين Y1, Y2
  const y1 = useSpring(useTransform(scrollYProgress, [0, 0.8], [50, 1000]), {
    stiffness: 500,
    damping: 90,
  })
  const y2 = useSpring(useTransform(scrollYProgress, [0, 1], [50, 800]), {
    stiffness: 500,
    damping: 90,
  })

  return (
    <motion.div ref={ref} className={cn("relative mx-auto h-full w-full max-w-4xl", className)}>
      <div className="absolute -left-20 top-3 md:-left-12 md:top-0">
        <motion.div
          transition={{
            duration: 0.2,
            delay: 0.5,
          }}
          animate={{
            boxShadow: scrollYProgress.get() > 0 ? "none" : "rgba(138, 43, 226, 0.5) 0px 0px 30px 10px",
          }}
          className="relative flex h-4 w-4 items-center justify-center rounded-full border border-white/20 bg-white/20"
        >
          <motion.div
            transition={{
              duration: 0.2,
              delay: 0.5,
            }}
            animate={{
              backgroundColor: scrollYProgress.get() > 0 ? "white" : "rgba(138, 43, 226, 1)",
              scale: scrollYProgress.get() > 0 ? 0.5 : 1,
            }}
            className="h-1.5 w-1.5 rounded-full bg-white"
          />
        </motion.div>
        <svg
          viewBox="0 0 20 1000"
          width="20"
          height="1000"
          className="block"
          aria-hidden="true"
        >
          <motion.path
            d="M 1 0 V 1000"
            fill="none"
            stroke="white"
            strokeOpacity="0.2"
            strokeWidth="1"
            initial={{
              strokeDasharray: 1000,
              strokeDashoffset: 1000,
            }}
            style={{
              strokeDashoffset: y1,
            }}
          />
          <motion.path
            d="M 10 0 V 1000"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="2"
            initial={{
              strokeDasharray: 1000,
              strokeDashoffset: 1000,
            }}
            style={{
              strokeDashoffset: y2,
            }}
          />
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <stop stopColor="#000000" stopOpacity="0" offset="0" />
              <stop stopColor="#000000" offset="0.2" />
              <stop stopColor="#000000" offset="0.8" />
              <stop stopColor="#000000" stopOpacity="0" offset="1" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="relative">{children}</div>
    </motion.div>
  )
}
