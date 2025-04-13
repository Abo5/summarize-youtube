"use client"
import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function FlashCards({ cards }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(null)
  const [recentlyRemoved, setRecentlyRemoved] = useState([])
  const constraintsRef = useRef(null)

  if (!cards) return null

  const removeCard = (dir) => {
    if (currentIndex >= cards.length) return
    setRecentlyRemoved([...recentlyRemoved, { card: cards[currentIndex], direction: dir }])
    setDirection(dir)
    setCurrentIndex((prev) => prev + 1)
    setTimeout(() => {
      setDirection(null)
    }, 300)
  }

  const undoRemove = () => {
    if (recentlyRemoved.length === 0) return
    const lastRemoved = recentlyRemoved[recentlyRemoved.length - 1]
    setRecentlyRemoved(recentlyRemoved.slice(0, -1))
    setCurrentIndex((prev) => prev - 1)
  }

  // handleDragEnd بدلاً من استعمال PanInfo, نستقبل info كمعلومة عادية
  const handleDragEnd = (_e, info) => {
    if (Math.abs(info.offset.x) > 100) {
      if (info.offset.x > 0) {
        removeCard("right")
      } else {
        removeCard("left")
      }
    }
  }

  const variants = {
    enter: (dir) => ({
      x: dir === "right" ? -300 : dir === "left" ? 300 : 0,
      opacity: 0,
      scale: 0.8,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3 },
    },
    exit: (dir) => ({
      x: dir === "left" ? -300 : dir === "right" ? 300 : 0,
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.3 },
    }),
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="relative w-full max-w-md h-[400px] mx-auto" ref={constraintsRef}>
        <AnimatePresence initial={false} custom={direction}>
          {currentIndex < cards.length ? (
            <motion.div
              key={cards[currentIndex].id}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.7}
              onDragEnd={handleDragEnd}
              className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
            >
              <div className="w-full h-full bg-white rounded-3xl shadow-lg border border-gray-100 p-8 flex flex-col">
                <div className="mb-4 pb-4 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500">{cards[currentIndex].timestamp}</span>
                  <h3 className="text-2xl font-medium mt-2">{cards[currentIndex].title}</h3>
                </div>
                <div className="flex-grow overflow-auto custom-scrollbar">
                  <p className="text-gray-600 font-light leading-relaxed">{cards[currentIndex].content}</p>
                </div>
                <div className="mt-6 text-center text-sm text-gray-400">Swipe left or right to navigate</div>
              </div>
            </motion.div>
          ) : (
            <div className="absolute inset-0 w-full h-full flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-2xl font-light mb-4">No more cards</h3>
                {recentlyRemoved.length > 0 && (
                  <Button onClick={undoRemove} variant="outline" className="rounded-full border-gray-200">
                    Undo Last Card
                  </Button>
                )}
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex justify-center mt-8 gap-4">
        <Button
          onClick={() => removeCard("left")}
          disabled={currentIndex >= cards.length}
          variant="outline"
          size="icon"
          className="rounded-full h-12 w-12 border-gray-200"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        {recentlyRemoved.length > 0 && (
          <Button onClick={undoRemove} variant="outline" className="rounded-full border-gray-200">
            Undo ({recentlyRemoved.length})
          </Button>
        )}
        <Button
          onClick={() => removeCard("right")}
          disabled={currentIndex >= cards.length}
          variant="outline"
          size="icon"
          className="rounded-full h-12 w-12 border-gray-200"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="mt-4 text-center">
        <span className="text-sm text-gray-500">
          {currentIndex} / {cards.length} cards viewed
        </span>
      </div>
    </div>
  )
}
