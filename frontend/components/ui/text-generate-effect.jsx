"use client"
import React, { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

export const TextGenerateEffect = ({ words, className }) => {
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showCursor, setShowCursor] = useState(true)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (currentIndex >= words.length) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    intervalRef.current = setInterval(() => {
      setDisplayedText((prev) => prev + words[currentIndex])
      setCurrentIndex((prev) => prev + 1)
    }, 30)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [currentIndex, words])

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 500)
    return () => clearInterval(cursorInterval)
  }, [])

  return (
    <div className={cn("", className)}>
      <p>
        {displayedText}
        {currentIndex < words.length && <span className={showCursor ? "opacity-100" : "opacity-0"}>|</span>}
      </p>
    </div>
  )
}
