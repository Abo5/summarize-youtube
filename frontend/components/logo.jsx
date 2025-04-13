import React from "react"

export default function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="size-14 rounded-2xl bg-gradient-to-br from-black to-gray-800 p-3 flex items-center justify-center shadow-lg relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-gray-800 to-black opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <span className="text-white font-light text-2xl relative z-10">V</span>
      </div>
      <div className="font-light text-3xl tracking-tight">
        <span className="text-black">Video</span>
        <span className="text-gray-400">Summary</span>
      </div>
    </div>
  )
}
