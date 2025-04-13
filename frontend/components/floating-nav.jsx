"use client"
import React, { useState } from "react"
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion"
import { cn } from "@/lib/utils"

export const FloatingNav = ({ navItems, className }) => {
  const { scrollYProgress } = useScroll()
  const [visible, setVisible] = useState(false)

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const prev = scrollYProgress.getPrevious()
    const direction = latest - prev
    if (scrollYProgress.get() < 0.05) {
      setVisible(false)
    } else {
      if (direction < 0) setVisible(true)
      else setVisible(false)
    }
  })

  return (
    <AnimatePresence mode="wait">
      {(
        <motion.div
          initial={{
            opacity: 1,
            y: -100,
          }}
          animate={{
            y: visible ? 0 : -100,
            opacity: visible ? 1 : 0,
          }}
          transition={{
            duration: 0.2,
          }}
          className={cn(
            "flex max-w-fit fixed top-4 sm:top-10 inset-x-0 mx-auto border border-gray-50 bg-white/90 backdrop-blur-md shadow-lg z-[5000] rounded-full p-2 items-center justify-center space-x-2 sm:space-x-4 overflow-x-auto",
            className
          )}
        >
          {navItems.map((navItem, idx) => (
            <a
              key={`link=${idx}`}
              href={navItem.link}
              className={cn(
                "relative px-5 py-2 text-gray-500 hover:text-black transition-colors duration-300 text-sm font-normal tracking-wider",
                "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-gray-800 after:origin-left after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300"
              )}
            >
              <span>{navItem.name}</span>
            </a>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
