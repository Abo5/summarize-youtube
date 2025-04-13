"use client"

import React, { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

export function DotGrid({ className, gridSize = 30, dotSize = 1, dotColor = "#e5e7eb" }) {
  const canvasRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const { width, height } = canvasRef.current.getBoundingClientRect()
        setDimensions({ width, height })
        const dpr = window.devicePixelRatio || 1
        canvasRef.current.width = width * dpr
        canvasRef.current.height = height * dpr

        const ctx = canvasRef.current.getContext("2d")
        if (ctx) {
          ctx.scale(dpr, dpr)
        }
        drawGrid()
      }
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const drawGrid = () => {
    if (!canvasRef.current) return
    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, dimensions.width, dimensions.height)
    ctx.fillStyle = dotColor

    const cols = Math.floor(dimensions.width / gridSize)
    const rows = Math.floor(dimensions.height / gridSize)

    for (let i = 0; i <= cols; i++) {
      for (let j = 0; j <= rows; j++) {
        ctx.beginPath()
        ctx.arc(i * gridSize, j * gridSize, dotSize, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }

  useEffect(() => {
    drawGrid()
  }, [dimensions, dotColor, dotSize, gridSize])

  return <canvas ref={canvasRef} className={cn("absolute inset-0 -z-10", className)} />
}
