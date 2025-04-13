"use client"

import React, { useEffect, useState } from "react"

// A helper function to generate a random 20-character visitor ID
function generateVisitorId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < 20; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export default function VideoFetcher() {
  const [userCookie, setUserCookie] = useState(null)
  const [videoData, setVideoData] = useState(null)
  const [loading, setLoading] = useState(false)

  // The video ID you want to fetch data for:
  const videoId = "IWczFdqUcWg"

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        // 1. POST user data to /users/cookies
        const visitorId = generateVisitorId()
        const userPayload = {
          user: {
            visitor_id: visitorId,
            ip: "127.0.0.1", // example IP
            country: "Saudi Arabia",
            device: "Desktop, Chrome", 
          },
        }

        const resCookies = await fetch("http://localhost:3000/users/cookies", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userPayload),
        })

        if (!resCookies.ok) {
          throw new Error("Failed to send user data to /users/cookies")
        }

        const dataCookies = await resCookies.json()
        const cookieFromServer = dataCookies.cookie
        setUserCookie(cookieFromServer)

        // 2. Now GET /videos/:videoId using that cookie
        const resVideo = await fetch(`http://localhost:3000/videos/${videoId}`, {
          method: "GET",
          headers: {
            Cookie: `user_cookie=${cookieFromServer}`,
          },
        })

        if (!resVideo.ok) {
          throw new Error("Failed to fetch video data from /videos/:videoId")
        }

        const videoInfo = await resVideo.json()
        setVideoData(videoInfo)

      } catch (err) {
        console.error("Error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!videoData) {
    return <div>No video data yet.</div>
  }

  // Once the data arrives, render it:
  return (
    <div style={{ marginTop: "2rem" }}>
      <h2>Video Information:</h2>
      <p><strong>Video ID:</strong> {videoData.video_id}</p>
      <p><strong>Title:</strong> {videoData.video_title}</p>
      <p><strong>Channel:</strong> {videoData.creator_channel}</p>
      <p><strong>Description:</strong> {videoData.description}</p>
      <p><strong>Words:</strong> {videoData.words}</p>
      <p><strong>Length (seconds):</strong> {videoData.video_length}</p>
      <p><strong>Publication Date:</strong> {videoData.publication_date}</p>

      {/* 
        If AI summary is available, you could display it here 
        e.g.: videoData.ai_summary_clean 
      */}
      {videoData.ai_summary_clean && (
        <div style={{ marginTop: "1rem" }}>
          <h4>AI Summary:</h4>
          <p>{videoData.ai_summary_clean}</p>
        </div>
      )}

      {/* 
        Similarly, if you have transcript data, you can render it here 
      */}
      {videoData.transcript_clean && (
        <div style={{ marginTop: "1rem" }}>
          <h4>Transcript:</h4>
          <p>{videoData.transcript_clean}</p>
        </div>
      )}
    </div>
  )
}
