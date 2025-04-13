"use client"

import React, { useState } from "react"
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { VideoPlayer } from "@/components/video-player"
import { ThreeDCard } from "@/components/ui/3d-card"
import { GradientBorder } from "@/components/ui/gradient-border"
import { FlashCards } from "@/components/flash-cards"
import { Copy, Download, Share2, ExternalLink } from "lucide-react"
import { AISummaryRenderer } from "@/components/ai-summary-renderer"

export function VideoSummaryCard({ videoData, isLoading = false }) {
  const [copied, setCopied] = useState(null)
  const [isTypingEffect, setIsTypingEffect] = useState(true)

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const generateFlashCards = () => {
    if (!videoData?.transcript_with_time) return []

    const cards = []
    const transcript = videoData.transcript_with_time
    const totalLength = convertToSeconds(videoData.video_length)
    const sectionInterval = 60
    let currentTime = 0

    while (currentTime < totalLength) {
      const relevant = transcript.filter(
        (entry) => entry.start >= currentTime && entry.start < currentTime + sectionInterval
      )
      if (relevant.length > 0) {
        const title = relevant[0].text.length > 30
          ? relevant[0].text.substring(0, 30) + "..."
          : relevant[0].text
        const content = relevant.map((e) => e.text).join(" ")
        const minutes = Math.floor(currentTime / 60)
        const seconds = Math.floor(currentTime % 60)
        const timestamp = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
        cards.push({
          id: String(currentTime),
          title,
          timestamp,
          content,
        })
      }
      currentTime += sectionInterval
    }

    return cards.length > 0 ? cards : []
  }

  const convertToSeconds = (length) => {
    if (typeof length === "string" && length.includes(":")) {
      const [m, s] = length.split(":")
      return parseInt(m, 10) * 60 + parseInt(s, 10)
    }
    if (typeof length === "number") return length
    return 0
  }

  const formatVideoLength = (length) => {
    if (typeof length === "string" && length.includes(":")) return length
    const seconds = typeof length === "number" ? length : Number.parseInt(length)
    const minutes = Math.floor(seconds / 60)
    const remaining = seconds % 60
    return `${minutes}:${String(remaining).padStart(2, "0")}`
  }

  const formatPublicationDate = (dateString) => {
    if (!dateString) return ""
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch (e) {
      return dateString
    }
  }

  // إذا كان isLoading غير فعال، وكان videoData غير موجود، ارجع null
  if (!isLoading && !videoData) return null

  const getAISummary = () => {
    if (!videoData) return ""
    
    if (typeof videoData.summarize_ai === "string") {
      return videoData.summarize_ai
    } else if (typeof videoData.ai_summary_clean === "string") {
      return videoData.ai_summary_clean
    } else if (typeof videoData.ai_summary_clean === "object" && videoData.ai_summary_clean?.summarize_ai) {
      return videoData.ai_summary_clean.summarize_ai
    } else if (typeof videoData.ai_summary_with_time === "object" && videoData.ai_summary_with_time?.summarize_ai) {
      return videoData.ai_summary_with_time.summarize_ai
    } else {
      return "No summary found. Possibly the AI hasn't generated one."
    }
  }

  const aiSummary = getAISummary()

  return (
    <ThreeDCard>
      <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-xl overflow-hidden rounded-3xl h-full w-full">
        <CardHeader className="pb-4 border-b border-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
            <CardTitle className="text-2xl sm:text-3xl font-light tracking-tight">
              {isLoading ? <Skeleton width={300} /> : videoData?.video_title}
            </CardTitle>
          </div>
          <CardDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span className="text-gray-700 text-lg">
              {isLoading ? <Skeleton width={150} /> : videoData?.creator_channel}
            </span>
            <span className="text-gray-500 text-sm bg-white border border-gray-50 px-4 py-1 rounded-full">
              {isLoading ? (
                <Skeleton width={120} />
              ) : (
                `${formatPublicationDate(videoData.publication_date)} • ${formatVideoLength(videoData.video_length)}`
              )}
            </span>
          </CardDescription>
        </CardHeader>

        <div className="px-6 py-8">
          {isLoading ? <Skeleton height={200} /> : <VideoPlayer videoId={videoData.video_id} />}
        </div>

        <CardContent className="pt-2">
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="w-full mb-8 bg-white border border-gray-50 p-1 rounded-full">
              <TabsTrigger value="summary" className="w-full data-[state=active]:bg-black data-[state=active]:text-white rounded-full py-3 transition-all duration-300">
                Summary
              </TabsTrigger>
              <TabsTrigger value="transcript" className="w-full data-[state=active]:bg-black data-[state=active]:text-white rounded-full py-3 transition-all duration-300">
                Full Text
              </TabsTrigger>
              <TabsTrigger value="flashcards" className="w-full data-[state=active]:bg-black data-[state=active]:text-white rounded-full py-3 transition-all duration-300">
                Flash Cards
              </TabsTrigger>
              <TabsTrigger value="info" className="w-full data-[state=active]:bg-black data-[state=active]:text-white rounded-full py-3 transition-all duration-300">
                Information
              </TabsTrigger>
            </TabsList>

            {/* Summary Tab Content */}
            <TabsContent value="summary" className="animate-in fade-in-50 duration-500">
              <div className="space-y-8">
                <div className="rounded-3xl bg-white border border-gray-50 p-10 relative overflow-hidden shadow-sm">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-900 to-gray-700"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-2xl font-light tracking-tight">Video Summary</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setIsTypingEffect(!isTypingEffect)}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        {isTypingEffect ? "إيقاف تأثير الكتابة" : "تشغيل تأثير الكتابة"}
                      </Button>
                    </div>
                    <div className="text-gray-700 leading-relaxed text-lg font-extralight">
                      {isLoading ? (
                        <Skeleton count={6} height={20} />
                      ) : (
                        <AISummaryRenderer markdown={aiSummary} typingEffect={isTypingEffect} />
                      )}
                    </div>
                  </div>
                </div>
                {!isLoading && (
                  <div className="flex flex-wrap gap-4 justify-end">
                    <GradientBorder>
                      <Button
                        variant="outline"
                        size="lg"
                        className="border-0 bg-white text-gray-700 hover:bg-gray-50 hover:text-black rounded-full group"
                        onClick={() => copyToClipboard(aiSummary, "summary")}
                      >
                        {copied === "summary" ? (
                          "Copied!"
                        ) : (
                          <>
                            <Copy className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                            Copy Summary
                          </>
                        )}
                      </Button>
                    </GradientBorder>

                    <GradientBorder>
                      <Button
                        variant="outline"
                        size="lg"
                        className="border-0 bg-white text-gray-700 hover:bg-gray-50 hover:text-black rounded-full group"
                      >
                        <Download className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                        Download as File
                      </Button>
                    </GradientBorder>

                    <Button size="lg" className="bg-black hover:bg-gray-800 rounded-full group">
                      <Share2 className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                      Share
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Transcript Tab Content */}
            <TabsContent value="transcript" className="animate-in fade-in-50 duration-500">
              <div className="space-y-8">
                <div className="max-h-[400px] overflow-y-auto rounded-3xl bg-white border border-gray-50 p-10 relative custom-scrollbar shadow-sm">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-900 to-gray-700"></div>
                  <div className="relative">
                    {isLoading ? (
                      <Skeleton count={10} height={20} />
                    ) : (
                      <p className="text-gray-700 whitespace-pre-line leading-relaxed text-justify font-extralight">
                        {videoData.transcript_clean || "Transcript not available for this video."}
                      </p>
                    )}
                  </div>
                </div>
                {!isLoading && (
                  <div className="flex flex-wrap gap-4 justify-end">
                    <GradientBorder>
                      <Button
                        variant="outline"
                        size="lg"
                        className="border-0 bg-white text-gray-700 hover:bg-gray-50 hover:text-black rounded-full group"
                        onClick={() =>
                          copyToClipboard(videoData.transcript_clean || "Transcript not available", "transcript")
                        }
                      >
                        {copied === "transcript" ? (
                          "Copied!"
                        ) : (
                          <>
                            <Copy className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                            Copy Text
                          </>
                        )}
                      </Button>
                    </GradientBorder>

                    <GradientBorder>
                      <Button
                        variant="outline"
                        size="lg"
                        className="border-0 bg-white text-gray-700 hover:bg-gray-50 hover:text-black rounded-full group"
                      >
                        <Download className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                        Download as File
                      </Button>
                    </GradientBorder>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Flash Cards Tab Content */}
            <TabsContent value="flashcards" className="animate-in fade-in-50 duration-500">
              <div className="space-y-8">
                <div className="rounded-3xl bg-white border border-gray-50 p-6 relative overflow-hidden shadow-sm min-h-[500px]">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-900 to-gray-700"></div>
                  <div className="relative h-full">
                    {isLoading ? (
                      <Skeleton count={5} height={80} className="mb-4" />
                    ) : (
                      <FlashCards cards={generateFlashCards()} />
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Info Tab Content */}
            <TabsContent value="info" className="animate-in fade-in-50 duration-500">
              <div className="space-y-8">
                <div className="rounded-3xl bg-white border border-gray-50 p-10 relative shadow-sm">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-900 to-gray-700"></div>
                  <div className="relative">
                    <div className="flex items-center mb-8">
                      <h3 className="text-2xl font-light tracking-tight">Video Information</h3>
                    </div>
                    {isLoading ? (
                      <Skeleton count={7} height={30} className="mb-4" />
                    ) : (
                      <ul className="space-y-6 text-gray-700">
                        <li className="flex justify-between border-b border-gray-50 pb-4">
                          <span className="text-gray-500 font-light">Video ID:</span>
                          <span dir="ltr" className="font-mono bg-white border border-gray-50 px-4 py-1 rounded-full">
                            {videoData.video_id}
                          </span>
                        </li>
                        <li className="flex justify-between border-b border-gray-50 pb-4">
                          <span className="text-gray-500 font-light">Channel:</span>
                          <span className="font-light">{videoData.creator_channel}</span>
                        </li>
                        <li className="flex justify-between border-b border-gray-50 pb-4">
                          <span className="text-gray-500 font-light">Publication Date:</span>
                          <span className="font-light">{formatPublicationDate(videoData.publication_date)}</span>
                        </li>
                        <li className="flex justify-between border-b border-gray-50 pb-4">
                          <span className="text-gray-500 font-light">Duration:</span>
                          <span className="font-light">{formatVideoLength(videoData.video_length)}</span>
                        </li>
                        {videoData.words && (
                          <li className="flex justify-between border-b border-gray-50 pb-4">
                            <span className="text-gray-500 font-light">Word Count:</span>
                            <span className="font-light">{videoData.words} words</span>
                          </li>
                        )}
                        <li>
                          <span className="text-gray-500 block mb-3 font-light">Description:</span>
                          <p className="mt-1 text-sm bg-white border border-gray-50 p-6 rounded-2xl font-extralight leading-relaxed">
                            {videoData.description}
                          </p>
                        </li>
                      </ul>
                    )}
                  </div>
                </div>
                {!isLoading && (
                  <div className="flex justify-end">
                    <Button
                      size="lg"
                      className="bg-black hover:bg-gray-800 rounded-full group"
                      onClick={() =>
                        window.open(`https://www.youtube.com/watch?v=${videoData.video_id}`, "_blank")
                      }
                    >
                      <ExternalLink className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                      Open in YouTube
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </ThreeDCard>
  )
}