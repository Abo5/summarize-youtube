"use client"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

/**
 * مكوّن لإنشاء مؤثر "Sparkles" (نجوم أو جسيمات متحركة) في الخلفية.
 * يقبل عدة خواص للتحكم في اللون والحجم والسرعة والكثافة... إلخ.
 */
export function SparklesCore({
  id,
  background,
  minSize,
  maxSize,
  speed,
  particleColor,
  className,
  particleDensity,
}) {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })
  const canvasRef = useRef(null)

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const particlesArray = []
    // حساب عدد الجسيمات بناءً على حجم النافذة
    const particleCount = Math.min(
      Math.max(Math.floor((windowSize.width * windowSize.height) / 8000), 100),
      particleDensity || 300
    )

    canvas.width = windowSize.width
    canvas.height = windowSize.height

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * (maxSize || 3) + (minSize || 0.5)
        this.speedX = Math.random() * (speed || 0.5) - (speed || 0.5) / 2
        this.speedY = Math.random() * (speed || 0.5) - (speed || 0.5) / 2
        this.color = particleColor || "#ffffff"
      }
      update() {
        this.x += this.speedX
        this.y += this.speedY
        if (this.size > 0.1) this.size -= 0.01

        // إعادة الجسيمات عندما تتجاوز حدود الشاشة
        if (this.x > canvas.width) this.x = 0
        else if (this.x < 0) this.x = canvas.width

        if (this.y > canvas.height) this.y = 0
        else if (this.y < 0) this.y = canvas.height
      }
      draw() {
        if (!ctx) return
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.closePath()
        ctx.fill()
      }
    }

    const init = () => {
      for (let i = 0; i < particleCount; i++) {
        particlesArray.push(new Particle())
      }
    }

    const animate = () => {
      if (!ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update()
        particlesArray[i].draw()
      }
      requestAnimationFrame(animate)
    }

    init()
    animate()
  }, [windowSize, minSize, maxSize, speed, particleColor, particleDensity])

  return (
    <canvas
      ref={canvasRef}
      id={id || "tsparticles"}
      style={{ background: background || "transparent" }}
      className={cn("fixed inset-0 -z-10", className)}
    />
  )
}
