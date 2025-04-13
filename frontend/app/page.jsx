"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { VideoSummaryCard } from "@/components/video-summary-card"
import Logo from "@/components/logo"
import { FloatingNav } from "@/components/floating-nav"
import { cn } from "@/lib/utils"
import { BackgroundGradient } from "@/components/ui/background-gradient"
import { SparklesCore } from "@/components/ui/sparkles"
import { TextGenerateEffect } from "@/components/ui/text-generate-effect"
import { TracingBeam } from "@/components/ui/tracing-beam"
import { HeroParallax } from "@/components/hero-parallax"
import { AnimatedTooltip } from "@/components/ui/animated-tooltip"
import { ArrowRight, Sparkles, Zap, Clock, FileText, BarChart4 } from "lucide-react"
import { GlowingButton } from "@/components/ui/glowing-button"
import { Spotlight } from "@/components/ui/spotlight"
import { DotGrid } from "@/components/ui/dot-grid"
import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { GradientBorder } from "@/components/ui/gradient-border"
import { PinContainer } from "@/components/ui/pin-container"
import { FeatureCard } from "@/components/ui/feature-card"

// Location Permission Modal Component
function LocationPermissionModal({ isOpen, onPermissionGranted }) {
  const [isRequesting, setIsRequesting] = useState(false)
  const [error, setError] = useState(null)

  const requestGeolocation = () => {
    setIsRequesting(true)
    setError(null)
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Success - we have the location
          setIsRequesting(false)
          onPermissionGranted({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
        },
        (geoError) => {
          setIsRequesting(false)
          
          // Handle different error types
          switch(geoError.code) {
            case geoError.PERMISSION_DENIED:
              setError("Location access was denied. Please allow location access through your browser settings to continue.")
              break
            case geoError.POSITION_UNAVAILABLE:
              setError("Location information is unavailable. Please try again or check your device settings.")
              break
            case geoError.TIMEOUT:
              setError("The request to get location timed out. Please try again.")
              break
            default:
              setError("An unknown error occurred while trying to access your location.")
          }
        },
        { 
          enableHighAccuracy: false, 
          timeout: 10000, 
          maximumAge: 0 
        }
      )
    } else {
      setIsRequesting(false)
      setError("Geolocation is not supported by this browser. Please use a modern browser to access all features.")
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="relative p-8">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <SparklesCore
              id="sparkles-permission"
              background="transparent"
              minSize={0.4}
              maxSize={0.8}
              particleDensity={70}
              className="w-full h-full"
              particleColor="#000000"
              speed={0.1}
            />
          </div>
          
          <div className="text-center mb-8">
            <div className="mb-6 inline-block">
              <PinContainer>
                <span className="px-6 py-3 rounded-full bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 text-sm font-medium tracking-wide">
                  Location Access Required
                </span>
              </PinContainer>
            </div>
            
            <h2 className="text-3xl font-light mb-4 tracking-tight">
              Enhance Your Experience
            </h2>
            
            <p className="text-gray-500 mb-6">
              To provide you with personalized content and a better experience, we need access to your location. This helps us deliver more relevant analysis and optimize our service for your region.
            </p>
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100">
                {error}
              </div>
            )}
            
            <GlowingButton 
              onClick={requestGeolocation}
              disabled={isRequesting}
              className="w-full"
            >
              {isRequesting ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  Enable Location Access
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </>
              )}
            </GlowingButton>
            
            <p className="mt-6 text-sm text-gray-400">
              This data is used to improve your experience and is handled according to our Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const { toast } = useToast()
  const [videoData, setVideoData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [videoUrl, setVideoUrl] = useState("")
  const [scrolled, setScrolled] = useState(false)
  const [userCookie, setUserCookie] = useState("")

  // Add state to track permission status
  const [showPermissionModal, setShowPermissionModal] = useState(false)
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false)

  // User analytics data tracking
  const [userStats, setUserStats] = useState({
    clicks: 0,
    scrolls: 0,
    formsSubmitted: 0,
    pageViews: 1, // Start with 1 to record current visit
    sessionStartTime: Date.now(),
  })

  // Variables to help track the session
  const [sessionId, setSessionId] = useState("")
  const [firstVisitDate, setFirstVisitDate] = useState(null)
  const [lastVisitDate, setLastVisitDate] = useState(null)
  const [visitCount, setVisitCount] = useState(1)
  const [entryPage, setEntryPage] = useState("")

  // Create unique ID without using uuid
  const generateId = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  // Function to get detailed browser and device information
  const getBrowserInfo = () => {
    try {
      const userAgent = navigator.userAgent
      const platform = navigator.platform
      let browser = "Unknown"
      let os = "Unknown"
      let isMobile = false
      let browserVersion = ""
      let device = "Desktop"

      // Determine operating system with more precision
      if (userAgent.indexOf("Win") !== -1) {
        os = "Windows"
        if (userAgent.indexOf("Windows NT 10.0") !== -1) os = "Windows 10"
        else if (userAgent.indexOf("Windows NT 6.3") !== -1) os = "Windows 8.1"
        else if (userAgent.indexOf("Windows NT 6.2") !== -1) os = "Windows 8"
        else if (userAgent.indexOf("Windows NT 6.1") !== -1) os = "Windows 7"
      } else if (userAgent.indexOf("Mac") !== -1) {
        os = "MacOS"
        const osVersionMatch = userAgent.match(/Mac OS X (\d+[._]\d+[._]?\d*)/)
        if (osVersionMatch) {
          const osVersion = osVersionMatch[1].replace(/_/g, '.')
          os = `MacOS ${osVersion}`
        }
      } else if (userAgent.indexOf("Linux") !== -1) {
        os = "Linux"
      } else if (userAgent.indexOf("Android") !== -1) {
        os = "Android"
        isMobile = true
        device = "Mobile"
        const androidVersionMatch = userAgent.match(/Android (\d+(\.\d+)+)/)
        if (androidVersionMatch) {
          os = `Android ${androidVersionMatch[1]}`
        }
      } else if (userAgent.indexOf("iPhone") !== -1) {
        os = "iOS"
        isMobile = true
        device = "iPhone"
        const iosVersionMatch = userAgent.match(/OS (\d+[._]\d+[._]?\d*)/)
        if (iosVersionMatch) {
          const iosVersion = iosVersionMatch[1].replace(/_/g, '.')
          os = `iOS ${iosVersion}`
        }
      } else if (userAgent.indexOf("iPad") !== -1) {
        os = "iOS"
        isMobile = true
        device = "iPad"
        const iosVersionMatch = userAgent.match(/OS (\d+[._]\d+[._]?\d*)/)
        if (iosVersionMatch) {
          const iosVersion = iosVersionMatch[1].replace(/_/g, '.')
          os = `iOS ${iosVersion}`
        }
      }

      // Determine browser and version with more precision
      if (userAgent.indexOf("Edg") !== -1) {
        browser = "Edge"
        const edgeVersionMatch = userAgent.match(/Edg\/(\d+(\.\d+)+)/)
        if (edgeVersionMatch) {
          browserVersion = edgeVersionMatch[1]
        }
      } else if (userAgent.indexOf("Chrome") !== -1 && userAgent.indexOf("Safari") !== -1) {
        browser = "Chrome"
        const chromeVersionMatch = userAgent.match(/Chrome\/(\d+(\.\d+)+)/)
        if (chromeVersionMatch) {
          browserVersion = chromeVersionMatch[1]
        }
      } else if (userAgent.indexOf("Firefox") !== -1) {
        browser = "Firefox"
        const firefoxVersionMatch = userAgent.match(/Firefox\/(\d+(\.\d+)+)/)
        if (firefoxVersionMatch) {
          browserVersion = firefoxVersionMatch[1]
        }
      } else if (userAgent.indexOf("Safari") !== -1 && userAgent.indexOf("Chrome") === -1) {
        browser = "Safari"
        const safariVersionMatch = userAgent.match(/Version\/(\d+(\.\d+)+)/)
        if (safariVersionMatch) {
          browserVersion = safariVersionMatch[1]
        }
      } else if (userAgent.indexOf("MSIE") !== -1 || userAgent.indexOf("Trident") !== -1) {
        browser = "Internet Explorer"
        const ieVersionMatch = userAgent.match(/MSIE (\d+(\.\d+)+)/)
        if (ieVersionMatch) {
          browserVersion = ieVersionMatch[1]
        }
      }

      // Additional device information
      let screenInfo = {
        width: window.screen.width,
        height: window.screen.height,
        colorDepth: window.screen.colorDepth,
        pixelRatio: window.devicePixelRatio || 1
      }

      return {
        browser,
        browserVersion,
        os,
        isMobile,
        device,
        screenInfo,
        userAgent
      }
    } catch (error) {
      console.error("Error getting browser info:", error)
      return {
        browser: "Unknown",
        browserVersion: "",
        os: "Unknown",
        isMobile: false,
        device: "Desktop",
        screenInfo: {
          width: window.screen.width || 0,
          height: window.screen.height || 0
        },
        userAgent: navigator.userAgent
      }
    }
  }

  // Function to collect user geolocation
  const getUserGeolocation = async () => {
    return new Promise((resolve) => {
      try {
        // Check if we have stored location from permission modal
        const storedLatitude = localStorage.getItem('userLatitude')
        const storedLongitude = localStorage.getItem('userLongitude')
        
        if (storedLatitude && storedLongitude) {
          resolve({
            latitude: storedLatitude,
            longitude: storedLongitude,
            success: true
          })
          return
        }
        
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                latitude: position.coords.latitude.toString(),
                longitude: position.coords.longitude.toString(),
                success: true
              })
            },
            (error) => {
              console.warn("Geolocation error:", error.message)
              resolve({ latitude: "", longitude: "", success: false })
            },
            { timeout: 5000, maximumAge: 0 }
          )
        } else {
          console.warn("Geolocation not supported by this browser")
          resolve({ latitude: "", longitude: "", success: false })
        }
      } catch (error) {
        console.error("Error getting geolocation:", error)
        resolve({ latitude: "", longitude: "", success: false })
      }
    })
  }

  // Function to get user IP information (requires external service)
  const getUserIPInfo = async () => {
    try {
      // Use external service to get IP information
      const response = await fetch('https://ipapi.co/json/', { method: 'GET' })
      if (response.ok) {
        const data = await response.json()
        return {
          ip: data.ip || "",
          country: data.country_name || "",
          city: data.city || "",
          region: data.region || "",
          postal_code: data.postal || "",
          isp: data.org || "",
          success: true
        }
      }
    } catch (error) {
      console.error("Error fetching IP info:", error)
    }
    
    // Return empty data in case of failure
    return {
      ip: "",
      country: "",
      city: "",
      region: "",
      postal_code: "",
      isp: "",
      success: false
    }
  }

  // Function to get connection information
  const getConnectionInfo = () => {
    try {
      const connection = navigator.connection 
                      || navigator.mozConnection 
                      || navigator.webkitConnection
      
      if (connection) {
        return {
          type: connection.effectiveType || "",
          downlink: connection.downlink || 0,
          rtt: connection.rtt || 0,
          saveData: connection.saveData || false
        }
      }
    } catch (error) {
      console.error("Error getting connection info:", error)
    }
    
    return { type: "unknown" }
  }

  // Function to collect marketing information (UTM)
  const getMarketingInfo = () => {
    try {
      const url = new URL(window.location.href)
      const urlParams = new URLSearchParams(url.search)
      
      return {
        utm_source: urlParams.get("utm_source") || "",
        utm_medium: urlParams.get("utm_medium") || "",
        utm_campaign: urlParams.get("utm_campaign") || "",
        utm_content: urlParams.get("utm_content") || "",
        campaign_id: urlParams.get("campaign_id") || "",
        ad_id: urlParams.get("ad_id") || ""
      }
    } catch (error) {
      console.error("Error getting marketing info:", error)
      return {
        utm_source: "",
        utm_medium: "",
        utm_campaign: "",
        utm_content: "",
        campaign_id: "",
        ad_id: ""
      }
    }
  }

  // Function to collect user data
  const collectUserData = async () => {
    try {
      // Gather data from various sources
      const browserInfo = getBrowserInfo()
      const marketingInfo = getMarketingInfo()
      const connectionInfo = getConnectionInfo()
      
      // Get IP and geolocation data - these are asynchronous operations
      const [geoData, ipInfo] = await Promise.all([
        getUserGeolocation(),
        getUserIPInfo()
      ])
      
      // Calculate time since last visit
      let daysSinceLastVisit = 0
      if (lastVisitDate) {
        const lastDate = new Date(lastVisitDate)
        const now = new Date()
        daysSinceLastVisit = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24))
      }
      
      // Ensure we have valid dates
      const now = new Date()
      const currentDate = now.toISOString()
      const sessionDuration = Math.floor((now - userStats.sessionStartTime) / 1000)
      
      // Create a new session ID if not present
      const currentSessionId = sessionId || generateId()
      
      // Combine all data from different sources
      const userData = {
        visitor_id: localStorage.getItem('visitor_id') || generateId(),
        ip: ipInfo.success ? ipInfo.ip : "",
        country: ipInfo.success ? ipInfo.country : "",
        device: browserInfo.device,
        os: browserInfo.os,
        browser: `${browserInfo.browser} ${browserInfo.browserVersion}`,
        screen_width: browserInfo.screenInfo.width,
        screen_height: browserInfo.screenInfo.height,
        is_mobile: browserInfo.isMobile,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language || navigator.userLanguage,
        connection_type: connectionInfo.type,
        session_id: currentSessionId,
        session_duration: sessionDuration,
        page_views: userStats.pageViews,
        first_visit_date: firstVisitDate || currentDate,
        last_visit_date: lastVisitDate || currentDate,
        visit_count: visitCount,
        days_since_last_visit: daysSinceLastVisit,
        clicks: userStats.clicks,
        scrolls: userStats.scrolls,
        forms_submitted: userStats.formsSubmitted,
        entry_page: entryPage || window.location.pathname,
        exit_page: window.location.pathname,
        avg_time_on_page: Math.floor(sessionDuration / userStats.pageViews) || 0,
        bounce_rate: userStats.pageViews === 1 ? 100 : 0,
        referrer: document.referrer,
        utm_source: marketingInfo.utm_source,
        utm_medium: marketingInfo.utm_medium,
        utm_campaign: marketingInfo.utm_campaign,
        utm_content: marketingInfo.utm_content,
        campaign_id: marketingInfo.campaign_id,
        checkout_started: false,
        purchase_completed: false,
        order_value: 0,
        payment_method: "",
        coupon_used: "",
        city: ipInfo.success ? ipInfo.city : "",
        region: ipInfo.success ? ipInfo.region : "",
        postal_code: ipInfo.success ? ipInfo.postal_code : "",
        isp: ipInfo.success ? ipInfo.isp : "",
        latitude: geoData.success ? geoData.latitude : "",
        longitude: geoData.success ? geoData.longitude : "",
        additional_data: {
          buttons_clicked: [],
          ad_id: marketingInfo.ad_id,
          browser_full_version: browserInfo.browserVersion,
          color_depth: browserInfo.screenInfo.colorDepth,
          pixel_ratio: browserInfo.screenInfo.pixelRatio,
          connection_downlink: connectionInfo.downlink,
          connection_rtt: connectionInfo.rtt,
          connection_save_data: connectionInfo.saveData
        }
      }
      
      // Save visitor and session IDs in localStorage
      localStorage.setItem('visitor_id', userData.visitor_id)
      setSessionId(currentSessionId)
      
      return userData
    } catch (error) {
      console.error("Error collecting user data:", error)
      
      // Return basic data in case of an error
      return {
        visitor_id: localStorage.getItem('visitor_id') || generateId(),
        ip: "",
        country: "",
        device: "Unknown",
        os: "Unknown",
        browser: "Unknown",
        session_id: sessionId || generateId()
      }
    }
  }

  // Handle permission being granted from modal
  const handlePermissionGranted = (locationData) => {
    // Store the permission status
    localStorage.setItem('locationPermissionGranted', 'true')
    setLocationPermissionGranted(true)
    setShowPermissionModal(false)
    
    // Store location data for later use
    if (locationData) {
      localStorage.setItem('userLatitude', locationData.latitude)
      localStorage.setItem('userLongitude', locationData.longitude)
    }
    
    // Register user with location data
    registerUser()
  }

  // Track user visits when page loads
  useEffect(() => {
    // Check location permission first
    const hasGrantedPermission = localStorage.getItem('locationPermissionGranted')
    
    if (hasGrantedPermission === 'true') {
      setLocationPermissionGranted(true)
      
      // Continue with normal initialization only if permission granted
      initializeUserTracking()
    } else {
      // Show the permission modal if permission hasn't been granted
      setShowPermissionModal(true)
    }
  }, [])

  // Initialize user tracking after permission granted
  const initializeUserTracking = () => {
    // Create a new session ID
    const newSessionId = generateId()
    setSessionId(newSessionId)
    
    // Store entry page
    setEntryPage(window.location.pathname)
    
    // Check for previous visits in localStorage
    const storedFirstVisit = localStorage.getItem('firstVisitDate')
    const storedLastVisit = localStorage.getItem('lastVisitDate')
    const storedVisitCount = localStorage.getItem('visitCount')
    
    if (storedFirstVisit) {
      setFirstVisitDate(storedFirstVisit)
    } else {
      const now = new Date().toISOString()
      setFirstVisitDate(now)
      localStorage.setItem('firstVisitDate', now)
    }
    
    // Update last visit date
    const now = new Date().toISOString()
    setLastVisitDate(now)
    localStorage.setItem('lastVisitDate', now)
    
    // Update visit count
    if (storedVisitCount) {
      const newCount = parseInt(storedVisitCount) + 1
      setVisitCount(newCount)
      localStorage.setItem('visitCount', newCount.toString())
    } else {
      localStorage.setItem('visitCount', '1')
    }
    
    // Send initial visit data and request new cookie
    registerUser()
    
    // Track page view
    trackPageView()
    
    // Add event listeners for tracking
    window.addEventListener('click', trackClick)
    window.addEventListener('scroll', trackScroll)
    
    // Clean up event listeners when component unmounts
    return () => {
      window.removeEventListener('click', trackClick)
      window.removeEventListener('scroll', trackScroll)
      // Send exit data before leaving page
      sendExitData()
    }
  }

  // Track clicks
  const trackClick = () => {
    setUserStats(prev => ({
      ...prev,
      clicks: prev.clicks + 1
    }))
  }

  // Track scrolls
  const trackScroll = () => {
    setUserStats(prev => ({
      ...prev,
      scrolls: prev.scrolls + 1
    }))
  }

  // Track page views
  const trackPageView = () => {
    setUserStats(prev => ({
      ...prev,
      pageViews: prev.pageViews + 1
    }))
  }

  // Track form submissions
  const trackFormSubmission = () => {
    setUserStats(prev => ({
      ...prev,
      formsSubmitted: prev.formsSubmitted + 1
    }))
  }

  // Track button clicks in a way compatible with server-supported methods
  const trackButtonClick = (buttonName) => {
    // Log click locally only without sending request to server
    console.log("Button clicked:", buttonName)
    
    // Update click statistics
    setUserStats(prev => ({
      ...prev,
      clicks: prev.clicks + 1
    }))
    
    // Store click info in additional data
    if (userCookie) {
      // We'll add this information in the next request when we need to send data to the server
    }
  }

  // Send exit data
  const sendExitData = () => {
    // Collect exit data
    const exitData = collectUserData()
    
    // Update exit fields
    exitData.exit_page = window.location.pathname
    exitData.session_duration = Math.floor((Date.now() - userStats.sessionStartTime) / 1000)
    
    // Log data locally
    console.log("Exit data:", exitData)
    
    // If we have a cookie, try to send the data
    if (userCookie) {
      try {
        navigator.sendBeacon("http://127.0.0.1:3000/users/tracking", JSON.stringify({
          user: exitData
        }))
      } catch (err) {
        console.error("Error sending exit data:", err)
      }
    }
  }

  // When you scroll beyond 50px, show floating nav
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Optional: smooth scroll with arrow keys
  useEffect(() => {
    let scrolling = false
    let scrollAmount = 0
    const scrollStep = 5
    const maxScrollSpeed = 15
    const acceleration = 0.8
    const deceleration = 1.5

    const smoothScroll = () => {
      if (scrollAmount !== 0) {
        window.scrollBy(0, scrollAmount)
        requestAnimationFrame(smoothScroll)
      } else {
        scrolling = false
      }
    }

    const handleKeyDown = (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        scrollAmount = Math.min(scrollAmount + scrollStep * acceleration, maxScrollSpeed)
        if (!scrolling) {
          scrolling = true
          requestAnimationFrame(smoothScroll)
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        scrollAmount = Math.max(scrollAmount - scrollStep * acceleration, -maxScrollSpeed)
        if (!scrolling) {
          scrolling = true
          requestAnimationFrame(smoothScroll)
        }
      }
    }

    const handleKeyUp = (e) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        const slowDown = () => {
          if (scrollAmount > 0) {
            scrollAmount = Math.max(0, scrollAmount - deceleration)
          } else if (scrollAmount < 0) {
            scrollAmount = Math.min(0, scrollAmount + deceleration)
          }
          if (scrollAmount !== 0) {
            requestAnimationFrame(slowDown)
          }
        }
        requestAnimationFrame(slowDown)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
      scrollAmount = 0
    }
  }, [])

  // Modified registerUser function to use actual user data
  async function registerUser() {
    try {
      // Collect actual user data using enhanced functions
      const userData = await collectUserData()

      console.log("Sending real user data to server:", userData)

      // Add retry attempts
      let response
      let attempts = 0
      const maxAttempts = 3
      
      while (attempts < maxAttempts) {
        attempts++
        try {
          response = await fetch("http://127.0.0.1:3000/users/cookies", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include", // crucial for cross-origin cookies
            body: JSON.stringify({ user: userData }),
          })
          
          // If response is successful, stop trying
          if (response.ok) {
            break
          }
          
          // If response is 422, there might be an issue with the data sent
          if (response.status === 422) {
            const errorData = await response.text()
            console.error("Server validation error:", errorData)
            
            // We can try modifying the data before trying again
            // Remove fields that might cause problems
            if (userData.additional_data) {
              delete userData.additional_data
            }
            
            // Ensure unique ID
            userData.visitor_id = generateId()
            userData.session_id = generateId()
          } else {
            // Wait before trying again
            await new Promise(resolve => setTimeout(resolve, 1000))
          }
          
        } catch (fetchError) {
          console.error(`Attempt ${attempts} failed:`, fetchError)
          // Wait a bit before trying again
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }

      if (!response || !response.ok) {
        console.error("All attempts failed:", response?.status, response?.statusText)
        throw new Error(`Failed to register user after ${maxAttempts} attempts: ${response?.status}`)
      }
      
      // Extract cookie value from response
      let data
      try {
        data = await response.json()
        console.log("Server response:", data)
      } catch (jsonError) {
        console.error("Error parsing server response:", jsonError)
        // Try to extract text
        const textResponse = await response.text()
        console.log("Raw server response:", textResponse)
        
        // Try to parse text as JSON
        try {
          data = JSON.parse(textResponse)
        } catch (parseError) {
          console.error("Could not parse response text as JSON")
          data = { message: textResponse }
        }
      }
      
      // Store cookie value
      if (data && data.cookie) {
        setUserCookie(data.cookie)
        console.log("Cookie set:", data.cookie)
        return data.cookie
      } else {
        console.warn("No cookie returned from server")
        // In case no cookie is returned, try extracting it from document cookies
        const cookies = document.cookie.split(';').find(c => c.trim().startsWith('user_cookie='))
        if (cookies) {
          const cookieValue = cookies.split('=')[1]
          console.log("Found cookie in document:", cookieValue)
          setUserCookie(cookieValue)
          return cookieValue
        }
        return null
      }
    } catch (err) {
      console.error("Error registering user:", err)
      // Show message to user
      toast({
        title: "User Registration Error",
        description: "An error occurred when connecting to the server. Please try again.",
        variant: "destructive",
      })
      return null
    }
  }

  /** GET /videos/:videoId with credentials to automatically send the cookie. */
  async function getVideoData(videoId, cookie) {
    try {
      console.log("Fetching video data with cookie:", cookie)
      
      // Check if we have a valid cookie
      if (!cookie) {
        throw new Error("No valid cookie available")
      }
      
      const response = await fetch(`http://127.0.0.1:3000/videos/${videoId}`, {
        method: "GET",
        headers: {
          "Cookie": `user_cookie=${cookie}`
        },
        credentials: "include", // important for cross-origin cookies
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error("Server error response:", errorText)
        throw new Error(`Failed to fetch video data: ${response.status}`)
      }
      
      const data = await response.json()
      console.log("Received video data:", data)
      return data
    } catch (error) {
      console.error("Error fetching video data:", error)
      // Try to get a new cookie and retry
      if (error.message.includes("No valid cookie")) {
        toast({
          title: "Re-registering User",
          description: "Re-registering user and retrying...",
        })
      }
      throw error
    }
  }

  /** The main form submission for analyzing a YouTube URL. */
  async function fetchVideoData(e) {
    e.preventDefault()
    if (!videoUrl) return

    // Check location permission first
    if (!locationPermissionGranted) {
      setShowPermissionModal(true)
      return
    }

    // Track form submission
    trackFormSubmission()

    // Extract the 11-char video ID from the URL:
    const videoId = extractYoutubeVideoId(videoUrl)
    if (!videoId) {
      toast({
        title: "Error",
        description: "Invalid URL. Please enter a valid YouTube link",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // 1) Request a new cookie each time to ensure data is updated
      let cookie = await registerUser()
      
      // Try again if the first attempt failed
      if (!cookie) {
        console.log("Retrying to register user...")
        cookie = await registerUser()
      }
      
      // If both attempts failed, show an error message
      if (!cookie) {
        throw new Error("Failed to get a valid cookie from server")
      }

      // 2) Fetch video data using the cookie
      const data = await getVideoData(videoId, cookie)
      
      // Verify the received data
      if (!data) {
        throw new Error("No data received from server")
      }
      
      // Store video data in application state
      setVideoData(data)

      // Show success message
      toast({
        title: "Success",
        description: "Video data and summary extracted successfully",
      })

      // Auto-scroll to results section
      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth" })
      }, 100)
    } catch (error) {
      console.error("Error:", error)
      
      // Determine appropriate error message
      let errorMessage = "An error occurred while processing the video"
      
      // More detailed error messages based on error type
      if (error.message.includes("cookie")) {
        errorMessage = "Failed to authenticate user. Please try again."
      } else if (error.message.includes("fetch")) {
        errorMessage = "Failed to connect to server. Please check your internet connection."
      }
      
      // Display error message
      toast({
        title: "Request Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      // Stop loading indicator
      setIsLoading(false)
    }
  }

  /** Attempt to parse 11-char YouTube video ID from a given URL. */
  function extractYoutubeVideoId(url) {
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  const navItems = [
    { name: "Home", link: "#hero" },
    { name: "Features", link: "#features" },
    { name: "How It Works", link: "#how-it-works" },
    { name: "FAQ", link: "#faq" },
  ]

  const features = [
    {
      title: "Smart Summarization",
      description:
        "Our AI analyzes video content and extracts key insights, providing concise summaries that capture the essence of the content.",
      icon: <Sparkles className="h-6 w-6 text-black" />,
    },
    {
      title: "Text Extraction",
      description:
        "Convert spoken words into searchable text with our advanced speech recognition technology for easy reference and sharing.",
      icon: <FileText className="h-6 w-6 text-black" />,
    },
    {
      title: "Lightning Speed",
      description:
        "Get results in seconds regardless of video length, with our optimized processing algorithms working in real-time.",
      icon: <Zap className="h-6 w-6 text-black" />,
    },
    {
      title: "Time Efficiency",
      description:
        "Save hours of watching and note-taking with our automated summarization that highlights only what matters.",
      icon: <Clock className="h-6 w-6 text-black" />,
    },
    {
      title: "Multilingual Support",
      description:
        "Process videos in multiple languages with our advanced language recognition and translation capabilities.",
      icon: <BarChart4 className="h-6 w-6 text-black" />,
    },
    {
      title: "Customizable Output",
      description:
        "Tailor summaries to your needs with adjustable length, focus areas, and formatting options for perfect results.",
      icon: <ArrowRight className="h-6 w-6 text-black" />,
    },
  ]

  const team = [
    { id: 1, name: "Alex Johnson", designation: "Founder & CEO", image: "/placeholder.svg?height=100&width=100" },
    { id: 2, name: "Sarah Miller", designation: "AI Engineer", image: "/placeholder.svg?height=100&width=100" },
    { id: 3, name: "Michael Chen", designation: "UI Developer", image: "/placeholder.svg?height=100&width=100" },
    { id: 4, name: "Nora Ahmed", designation: "Product Manager", image: "/placeholder.svg?height=100&width=100" },
  ]

  const useCases = [
    { title: "Educational Content", link: "#", thumbnail: "/images/v0-logo-square.jpeg" },
    { title: "Business Meetings", link: "#", thumbnail: "/images/v0-logo.png" },
    { title: "Research Interviews", link: "#", thumbnail: "/images/v0-search.png" },
    { title: "News & Media", link: "#", thumbnail: "/images/v0-logo-square.jpeg" },
  ]

  return (
    <main className="min-h-screen bg-white text-black overflow-hidden font-light max-w-[2000px] mx-auto">
      {/* Permission Modal - will block interaction until permission granted */}
      <LocationPermissionModal 
        isOpen={showPermissionModal} 
        onPermissionGranted={handlePermissionGranted} 
      />
      
      <FloatingNav
        navItems={navItems}
        className={cn("transition-all duration-300", {
          "opacity-100": scrolled,
          "opacity-0 pointer-events-none": !scrolled,
        })}
      />

      {/* Hero Section */}
      <section
        id="hero"
        className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8"
      >
        <Spotlight className="-top-40 left-0 md:left-auto md:-top-20 md:left-60" fill="white" />

        <div className="absolute inset-0 w-full h-full">
          <SparklesCore
            id="tsparticles"
            background="transparent"
            minSize={0.4}
            maxSize={0.8}
            particleDensity={70}
            className="w-full h-full"
            particleColor="#000000"
            speed={0.1}
          />
        </div>

        <div className="absolute top-0 left-0 right-0 z-50">
          <header
            className={cn("flex items-center justify-between py-6 px-8 transition-all duration-500", {
              "bg-white/95 backdrop-blur-lg shadow-[0_0_15px_rgba(0,0,0,0.03)] border-b border-gray-50": scrolled,
            })}
          >
            <Logo />
            <div className="flex items-center gap-6">
              <nav className="hidden md:flex items-center gap-8">
                {navItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.link}
                    className="text-gray-600 hover:text-black transition-colors font-normal text-sm uppercase tracking-wider"
                    onClick={() => trackButtonClick(`nav_${item.name.toLowerCase()}`)}
                  >
                    {item.name}
                  </a>
                ))}
              </nav>
              <GradientBorder className="rounded-full overflow-hidden">
                <Button 
                  className="bg-white text-black hover:bg-gray-50 rounded-full"
                  onClick={() => trackButtonClick("free_trial_button")}
                >
                  Free Trial
                </Button>
              </GradientBorder>
            </div>
          </header>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 relative z-10">
          <div className="max-w-5xl mx-auto text-center space-y-10">
            <div className="mb-6 inline-block">
              <PinContainer>
                <span className="px-6 py-3 rounded-full bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 text-sm font-medium tracking-wide">
                  AI-Powered Video Analysis
                </span>
              </PinContainer>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-normal leading-tight tracking-tight">
              <TextGenerateEffect
                words="Unlock Video Knowledge in Seconds"
                className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900"
              />
            </h1>

            <p className="text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto font-extralight leading-relaxed tracking-wide">
              Our AI instantly transforms any video into actionable insights, saving you hours of watching and
              note-taking.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-6 pt-12">
              <GlowingButton onClick={() => trackButtonClick("start_now_button")}>
                Start Now for Free
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </GlowingButton>

              <Button
                variant="outline"
                size="lg"
                className="border-gray-200 text-gray-700 hover:bg-gray-50 text-base py-7 px-10 rounded-full transition-all duration-500"
                onClick={() => trackButtonClick("watch_demo_button")}
              >
                Watch Demo
              </Button>
            </div>
          </div>

          <div className="mt-32 max-w-4xl mx-auto">
            <div className="relative z-10">
              <form onSubmit={fetchVideoData} className="relative">
                <div className="flex items-center relative">
                  <div className="absolute left-6 flex items-center justify-center">
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-black/10">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>

                  <input
                    type="text"
                    id="video-url"
                    placeholder="Paste YouTube URL here..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full h-16 pl-20 pr-36 bg-black/90 text-white text-lg rounded-full shadow-2xl border-0 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                  />

                  <div className="absolute right-2">
                    <Button
                      type="submit"
                      disabled={isLoading || !videoUrl}
                      className="h-12 px-6 bg-white hover:bg-gray-100 text-black font-medium rounded-full transition-all duration-300 flex items-center gap-2"
                      onClick={() => trackButtonClick("analyze_button")}
                    >
                      {isLoading ? (
                        <>
                          <svg
                            className="animate-spin h-4 w-4 text-black"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          <span>Processing</span>
                        </>
                      ) : (
                        <>
                          <span>Analyze</span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>

              <div className="absolute inset-0 -z-10 blur-3xl opacity-30">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <a href="#features" className="text-gray-400 hover:text-black transition-colors" onClick={() => trackButtonClick("scroll_to_features")}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 bg-white relative overflow-hidden">
        <DotGrid />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <ScrollReveal>
            <div className="text-center mb-20">
              <span className="px-4 py-2 rounded-full bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 text-sm font-medium tracking-wider inline-block mb-6">
                Features
              </span>
              <h2 className="text-5xl md:text-6xl font-extralight mb-6 tracking-tight">Powerful Capabilities</h2>
              <p className="text-xl text-gray-500 max-w-3xl mx-auto font-extralight">
                Discover how our platform can help you save time and extract important information from videos
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <ScrollReveal key={index} delay={index * 0.1}>
                <FeatureCard 
                  title={feature.title} 
                  description={feature.description} 
                  icon={feature.icon} 
                  onClick={() => trackButtonClick(`feature_${feature.title.toLowerCase().replace(/\s+/g, '_')}`)}
                />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 bg-white">
        <BackgroundGradient>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
            <HeroParallax products={useCases} />
          </div>
        </BackgroundGradient>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-32 bg-black text-white relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.15),transparent)]"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 relative z-10">
          <div className="text-center mb-20">
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium tracking-wider inline-block mb-6">
              Process
            </span>
            <h2 className="text-5xl md:text-6xl font-extralight mb-6 tracking-tight">How It Works</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto font-extralight">
              A simple and effective process for converting videos into accurate text summaries
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <TracingBeam>
              <div className="space-y-32">
                <div className="flex flex-col md:flex-row gap-12 items-center">
                  <div className="w-full md:w-1/2">
                    <span className="inline-block text-sm font-medium text-gray-400 mb-3 tracking-wider">Step 01</span>
                    <h3 className="text-3xl font-light mb-6">Enter Video URL</h3>
                    <p className="text-gray-300 text-lg mb-8 font-extralight leading-relaxed">
                      Copy the video URL from YouTube and paste it in the designated field. The link can be in any
                      YouTube URL format.
                    </p>
                  </div>
                  <div className="w-full md:w-1/2">
                    <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl transform transition-transform duration-700 hover:scale-[1.02] group">
                      <img
                        src="/images/v0-search.png"
                        alt="Enter Video URL"
                        className="w-full h-auto transition-all duration-700 group-hover:brightness-110"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-12 items-center">
                  <div className="w-full md:w-1/2 order-1 md:order-2">
                    <span className="inline-block text-sm font-medium text-gray-400 mb-3 tracking-wider">Step 02</span>
                    <h3 className="text-3xl font-light mb-6">Video Processing</h3>
                    <p className="text-gray-300 text-lg mb-8 font-extralight leading-relaxed">
                      Our system analyzes the video and extracts text using advanced speech recognition technologies to
                      convert speech to text.
                    </p>
                  </div>
                  <div className="w-full md:w-1/2 order-2 md:order-1">
                    <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl transform transition-transform duration-700 hover:scale-[1.02] group">
                      <img
                        src="/images/v0-logo.png"
                        alt="Video Processing"
                        className="w-full h-auto transition-all duration-700 group-hover:brightness-110"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-12 items-center">
                  <div className="w-full md:w-1/2">
                    <span className="inline-block text-sm font-medium text-gray-400 mb-3 tracking-wider">Step 03</span>
                    <h3 className="text-3xl font-light mb-6">Summary Creation</h3>
                    <p className="text-gray-300 text-lg mb-8 font-extralight leading-relaxed">
                      After extracting the text, AI analyzes it, identifies key points, and creates an accurate and
                      comprehensive summary.
                    </p>
                  </div>
                  <div className="w-full md:w-1/2">
                    <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl transform transition-transform duration-700 hover:scale-[1.02] group">
                      <img
                        src="/images/v0-logo-square.jpeg"
                        alt="Summary Creation"
                        className="w-full h-auto transition-all duration-700 group-hover:brightness-110"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-12 items-center">
                  <div className="w-full md:w-1/2 order-1 md:order-2">
                    <span className="inline-block text-sm font-medium text-gray-400 mb-3 tracking-wider">Step 04</span>
                    <h3 className="text-3xl font-light mb-6">Receive Results</h3>
                    <p className="text-gray-300 text-lg mb-8 font-extralight leading-relaxed">
                      Get the video summary and full text in an easy-to-read format, with the ability to copy, download,
                      and share.
                    </p>
                  </div>
                  <div className="w-full md:w-1/2 order-2 md:order-1">
                    <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl transform transition-transform duration-700 hover:scale-[1.02] group">
                      <img
                        src="/images/v0-search.png"
                        alt="Receive Results"
                        className="w-full h-auto transition-all duration-700 group-hover:brightness-110"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TracingBeam>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <ScrollReveal>
            <div className="text-center mb-20">
              <span className="px-4 py-2 rounded-full bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 text-sm font-medium tracking-wider inline-block mb-6">
                Our Team
              </span>
              <h2 className="text-5xl md:text-6xl font-extralight mb-6 tracking-tight">Meet the Experts</h2>
              <p className="text-xl text-gray-500 max-w-3xl mx-auto font-extralight">
                Elite experts in artificial intelligence and natural language processing
              </p>
            </div>
          </ScrollReveal>

          <div className="flex justify-center">
            <AnimatedTooltip items={team} />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-32 bg-white relative overflow-hidden">
        <DotGrid />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="text-center mb-20">
            <span className="px-4 py-2 rounded-full bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 text-sm font-medium tracking-wider inline-block mb-6">
              FAQ
            </span>
            <h2 className="text-5xl md:text-6xl font-extralight mb-6 tracking-tight">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-500 max-w-3xl mx-auto font-extralight">
              Answers to the most common questions about our services
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-8">
            <FaqItem
              question="How does the video summarization service work?"
              answer="Our service uses advanced AI technologies to analyze video content and extract text from it, then identifies key points and creates an accurate summary containing essential information."
              onClick={() => trackButtonClick("faq_how_it_works")}
            />
            <FaqItem
              question="What types of videos are supported?"
              answer="Our service supports all public YouTube videos in both English and Arabic, including educational lectures, seminars, interviews, and presentations."
              onClick={() => trackButtonClick("faq_supported_videos")}
            />
            <FaqItem
              question="Can I download the summary and extracted text?"
              answer="Yes, our platform allows you to download summaries and full text in various formats such as PDF and TXT, and you can also copy content directly from the site."
              onClick={() => trackButtonClick("faq_download")}
            />
            <FaqItem
              question="Is the service free?"
              answer="We offer a free trial that allows you to summarize a limited number of videos monthly. For unlimited use, you can upgrade to the paid plan at competitive prices."
              onClick={() => trackButtonClick("faq_pricing")}
            />
            <FaqItem
              question="What languages are supported?"
              answer="Our platform currently fully supports English and Arabic, with partial support for other languages such as French and Spanish. We are continuously working to add more languages."
              onClick={() => trackButtonClick("faq_languages")}
            />
          </div>
        </div>
      </section>

      {/* Results Section */}
      <div id="results">
        {videoData && (
          <section className="py-32 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
              <ScrollReveal>
                <div className="max-w-5xl mx-auto">
                  <VideoSummaryCard videoData={videoData} isLoading={isLoading} />
                </div>
              </ScrollReveal>
            </div>
          </section>
        )}
      </div>

      {/* CTA Section */}
      <section className="py-32 bg-black text-white relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent)]"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-10">
            <h2 className="text-5xl md:text-6xl font-extralight tracking-tight leading-tight">
              Start Now and Leverage the <br />
              Power of AI
            </h2>
            <p className="text-xl text-gray-400 font-extralight tracking-wide">
              Join thousands of users who save time and effort using our platform
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6 pt-8">
              <GlowingButton 
                variant="white"
                onClick={() => trackButtonClick("cta_start_now_button")}
              >
                Start Now for Free
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </GlowingButton>

              <Button
                size="lg"
                variant="outline"
                className="border-gray-700 text-gray-300 hover:bg-gray-800 text-base py-7 px-10 rounded-full"
                onClick={() => trackButtonClick("contact_us_button")}
              >
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-50 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 lg:gap-16">
            <div className="space-y-8">
              <Logo />
              <p className="text-gray-500 font-extralight tracking-wide leading-relaxed">
                An advanced platform for summarizing video clips using cutting-edge artificial intelligence technologies
              </p>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full border-gray-100 bg-white text-gray-400 hover:text-black hover:border-black transition-all duration-300"
                  onClick={() => trackButtonClick("social_facebook")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z" />
                  </svg>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full border-gray-100 bg-white text-gray-400 hover:text-black hover:border-black transition-all duration-300"
                  onClick={() => trackButtonClick("social_twitter")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382 3.323 3.323 0 0 1-.378.163h.02v.045a3.288 3.288 0 0 0 2.632 3.218c-.2.031-.42.048-.65.048a3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277 6.588 6.588 0 0 1-4.064 1.401A6.32 6.32 0 0 1 .78 13.58 9.344 9.344 0 0 0 5.026 15z" />
                  </svg>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full border-gray-100 bg-white text-gray-400 hover:text-black hover:border-black transition-all duration-300"
                  onClick={() => trackButtonClick("social_github")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
                  </svg>
                </Button>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-8 tracking-wide">Quick Links</h3>
              <ul className="space-y-6">
                <li>
                  <a
                    href="#hero"
                    className="text-gray-500 hover:text-black transition-all duration-300 font-extralight tracking-wide"
                    onClick={() => trackButtonClick("footer_home")}
                  >
                    Home
                  </a>
                </li>
                <li>
                  <a
                    href="#features"
                    className="text-gray-500 hover:text-black transition-all duration-300 font-extralight tracking-wide"
                    onClick={() => trackButtonClick("footer_features")}
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    className="text-gray-500 hover:text-black transition-all duration-300 font-extralight tracking-wide"
                    onClick={() => trackButtonClick("footer_how_it_works")}
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <a
                    href="#faq"
                    className="text-gray-500 hover:text-black transition-all duration-300 font-extralight tracking-wide"
                    onClick={() => trackButtonClick("footer_faq")}
                  >
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-8 tracking-wide">Company</h3>
              <ul className="space-y-6">
                <li>
                  <a
                    href="#"
                    className="text-gray-500 hover:text-black transition-all duration-300 font-extralight tracking-wide"
                    onClick={() => trackButtonClick("footer_about_us")}
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-500 hover:text-black transition-all duration-300 font-extralight tracking-wide"
                    onClick={() => trackButtonClick("footer_team")}
                  >
                    Team
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-500 hover:text-black transition-all duration-300 font-extralight tracking-wide"
                    onClick={() => trackButtonClick("footer_careers")}
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-500 hover:text-black transition-all duration-300 font-extralight tracking-wide"
                    onClick={() => trackButtonClick("footer_contact_us")}
                  >
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-8 tracking-wide">Legal</h3>
              <ul className="space-y-6">
                <li>
                  <a
                    href="#"
                    className="text-gray-500 hover:text-black transition-all duration-300 font-extralight tracking-wide"
                    onClick={() => trackButtonClick("footer_privacy_policy")}
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-500 hover:text-black transition-all duration-300 font-extralight tracking-wide"
                    onClick={() => trackButtonClick("footer_terms")}
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-500 hover:text-black transition-all duration-300 font-extralight tracking-wide"
                    onClick={() => trackButtonClick("footer_cookie_policy")}
                  >
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-50 mt-16 pt-10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm font-extralight">
              &copy; {new Date().getFullYear()} VideoSummary - All Rights Reserved
            </p>
            <p className="text-gray-400 text-sm font-extralight tracking-wide">Made with ❤️ in Saudi Arabia</p>
          </div>
        </div>
      </footer>
    </main>
  )
}

function FaqItem({ question, answer, onClick }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border border-gray-50 rounded-3xl overflow-hidden bg-white hover:shadow-lg transition-all duration-500 group">
      <button
        onClick={() => {
          setIsOpen(!isOpen)
          if (onClick) onClick()
        }}
        className="flex items-center justify-between w-full p-8 text-left"
      >
        <h3 className="text-xl font-light">{question}</h3>
        <div
          className={`h-10 w-10 rounded-full bg-white border border-gray-100 flex items-center justify-center transition-transform duration-500 ${
            isOpen ? "rotate-180" : ""
          } group-hover:border-gray-200`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </button>

      <div
        className={`grid transition-all duration-500 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="p-8 pt-0 text-gray-500 text-lg font-extralight leading-relaxed">{answer}</div>
        </div>
      </div>
    </div>
  )
}
