"use client"

import React, { useState, useRef, useEffect } from "react"
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * مكوّن يعرض فيديو YouTube (أو Mock) مع عناصر تحكم
 * @param {Object} props
 * @param {string} props.videoId - معرف الفيديو على يوتيوب
 */
export function VideoPlayer({ videoId }) {
  const [showControls, setShowControls] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState("0:00")
  const [duration, setDuration] = useState("0:00")

  const playerRef = useRef(null)
  const iframeRef = useRef(null)

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerRef.current?.requestFullscreen().then(() => {
        setIsFullscreen(true)
      })
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false)
      })
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
    // من المفترض هنا أن تتحكم بـ (player.playVideo / player.pauseVideo) لو كنت تستعمل YouTube API
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    // من المفترض استدعاء (player.mute / player.unMute) لو كنت تستخدم YouTube API
  }

  // محاكاة التقدم / المؤشر الزمني
  useEffect(() => {
    let interval
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = Math.min(prev + 0.5, 100)
          const timeInSeconds = (newProgress / 100) * 345 // مثال: نفترض طول الفيديو 5:45 (345 ث)
          setCurrentTime(formatTime(timeInSeconds))
          return newProgress
        })
      }, 500)
    }
    return () => clearInterval(interval)
  }, [isPlaying])

  // ضبط مدة الفيديو (Mock)
  useEffect(() => {
    setDuration("5:45")
  }, [])

  return (
    <div
      ref={playerRef}
      className="relative w-full rounded-3xl overflow-hidden border border-gray-100 shadow-lg bg-black group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* iframe YouTube/mock */}
      <div className="relative w-full pt-[56.25%]">
        <iframe
          ref={iframeRef}
          src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&controls=0&showinfo=0&rel=0&modestbranding=1`}
          className="absolute top-0 left-0 w-full h-full border-0"
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />

        {/* Controls Overlay */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 transition-opacity duration-500",
            showControls || !isPlaying ? "opacity-100" : "opacity-0"
          )}
        >
          {/* Top Title Bar */}
          <div className="absolute top-0 left-0 right-0 p-6">
            <h3 className="text-white text-xl font-light tracking-wide truncate">
              Mock Video Title
            </h3>
          </div>

          {/* Center Play Button */}
          <button
            onClick={togglePlay}
            className={cn(
              "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-20 w-20 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md transition-transform duration-500 hover:scale-110",
              isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"
            )}
          >
            {isPlaying ? (
              <Pause className="h-10 w-10 text-white" />
            ) : (
              <Play className="h-10 w-10 text-white" />
            )}
          </button>

          {/* Bottom Control Bar */}
          <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col gap-3">
            {/* Progress Bar */}
            <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden cursor-pointer">
              <div
                className="h-full bg-gradient-to-r from-gray-300 to-white rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            {/* Controls Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <button
                  onClick={togglePlay}
                  className="h-10 w-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-300"
                >
                  {isPlaying ? <Pause className="h-5 w-5 text-white" /> : <Play className="h-5 w-5 text-white" />}
                </button>
                <button
                  onClick={toggleMute}
                  className="h-10 w-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-300"
                >
                  {isMuted ? <VolumeX className="h-5 w-5 text-white" /> : <Volume2 className="h-5 w-5 text-white" />}
                </button>
                <div className="text-white text-sm font-light">
                  <span>{currentTime}</span>
                  <span className="mx-1">/</span>
                  <span>{duration}</span>
                </div>
              </div>

              <button
                onClick={toggleFullscreen}
                className="h-10 w-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-300"
              >
                {isFullscreen ? (
                  <Minimize className="h-5 w-5 text-white" />
                ) : (
                  <Maximize className="h-5 w-5 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
