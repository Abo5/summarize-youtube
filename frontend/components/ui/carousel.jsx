"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function Carousel({ opts, plugins, orientation = "horizontal", setApi, className, children, ...props }, ref) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
    },
    plugins
  )
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const onSelect = useCallback((embla) => {
    if (!embla) return
    setCanScrollPrev(embla.canScrollPrev())
    setCanScrollNext(embla.canScrollNext())
  }, [])

  const scrollPrev = useCallback(() => {
    api?.scrollPrev()
  }, [api])

  const scrollNext = useCallback(() => {
    api?.scrollNext()
  }, [api])

  const handleKeyDown = useCallback((event) => {
    if (orientation === "horizontal") {
      if (event.key === "ArrowLeft") {
        event.preventDefault()
        scrollPrev()
      } else if (event.key === "ArrowRight") {
        event.preventDefault()
        scrollNext()
      }
    } else {
      if (event.key === "ArrowUp") {
        event.preventDefault()
        scrollPrev()
      } else if (event.key === "ArrowDown") {
        event.preventDefault()
        scrollNext()
      }
    }
  }, [scrollPrev, scrollNext, orientation])

  useEffect(() => {
    if (api && setApi) {
      setApi(api)
    }
  }, [api, setApi])

  useEffect(() => {
    if (!api) return
    onSelect(api)
    api.on("reInit", onSelect)
    api.on("select", onSelect)
    return () => {
      api.off("select", onSelect)
    }
  }, [api, onSelect])

  return (
    <div
      ref={ref}
      onKeyDownCapture={handleKeyDown}
      className={cn("relative", className)}
      role="region"
      aria-roledescription="carousel"
      {...props}
    >
      <CarouselContext.Provider
        value={{
          carouselRef,
          api,
          orientation,
          scrollPrev,
          scrollNext,
          canScrollPrev,
          canScrollNext,
        }}
      >
        {children}
      </CarouselContext.Provider>
    </div>
  )
}

export function CarouselContent({ className, children, ...props }) {
  const { carouselRef, orientation } = useCarousel()

  return (
    <div ref={carouselRef} className="overflow-hidden" {...props}>
      <div className={cn(orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col", "flex", className)}>
        {children}
      </div>
    </div>
  )
}

export function CarouselItem({ className, children, ...props }) {
  const { orientation } = useCarousel()

  return (
    <div
      role="group"
      aria-roledescription="slide"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CarouselPrevious({ className, variant = "outline", size = "icon", ...props }) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel()

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        "absolute h-8 w-8 rounded-full",
        orientation === "horizontal"
          ? "-left-12 top-1/2 -translate-y-1/2"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
}

export function CarouselNext({ className, variant = "outline", size = "icon", ...props }) {
  const { orientation, scrollNext, canScrollNext } = useCarousel()

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        "absolute h-8 w-8 rounded-full",
        orientation === "horizontal"
          ? "-right-12 top-1/2 -translate-y-1/2"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ArrowRight className="h-4 w-4" />
      <span className="sr-only">Next slide</span>
    </Button>
  )
}

// سياق داخلي لمشاركة api.
const CarouselContext = React.createContext(null)

function useCarousel() {
  const ctx = React.useContext(CarouselContext)
  if (!ctx) throw new Error("useCarousel must be used within a CarouselContext")
  return ctx
}
