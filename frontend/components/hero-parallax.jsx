"use client"
import React, { useRef, useState } from "react"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"
import Image from "next/image"
import Link from "next/link"

export const HeroParallax = ({ products }) => {
  // قسم المنتجات
  const firstRow = products.slice(0, 2)
  const secondRow = products.slice(2, 4)

  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })

  const springConfig = { stiffness: 300, damping: 30, bounce: 100 }

  const translateX = useSpring(useTransform(scrollYProgress, [0, 1], [0, 1000]), springConfig)
  const translateXReverse = useSpring(useTransform(scrollYProgress, [0, 1], [0, -1000]), springConfig)
  const rotateX = useSpring(useTransform(scrollYProgress, [0, 0.2], [15, 0]), springConfig)
  const opacity = useSpring(useTransform(scrollYProgress, [0, 0.2], [0.2, 1]), springConfig)
  const rotateZ = useSpring(useTransform(scrollYProgress, [0, 0.2], [20, 0]), springConfig)
  const translateY = useSpring(useTransform(scrollYProgress, [0, 0.2], [-700, 0]), springConfig)

  return (
    <div
      ref={ref}
      className="h-[300vh] py-20 sm:py-40 overflow-hidden antialiased relative flex flex-col self-auto [perspective:1000px] [transform-style:preserve-3d]"
    >
      <Header />
      <motion.div
        style={{
          rotateX,
          rotateZ,
          translateY,
          opacity,
        }}
      >
        <motion.div className="flex flex-row-reverse space-x-reverse space-x-20 mb-20">
          {firstRow.map((product) => (
            <ProductCard key={product.title} product={product} translate={translateX} />
          ))}
        </motion.div>
        <motion.div className="flex flex-row mb-20 space-x-20 ">
          {secondRow.map((product) => (
            <ProductCard key={product.title} product={product} translate={translateXReverse} />
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}

export const Header = () => {
  return (
    <div className="max-w-7xl relative mx-auto py-10 sm:py-20 md:py-40 px-4 w-full left-0 top-0">
      <span className="px-3 py-1 rounded-full bg-black/5 border border-black/10 text-sm font-medium inline-block mb-4">
        Use Cases
      </span>
      <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
        Various Applications
        <br />
        <span className="text-3xl md:text-4xl text-gray-600">for Video Summarization</span>
      </h2>
      <p className="max-w-2xl text-base md:text-xl mt-8 text-gray-600 font-light">
        Discover how our platform can be used in different fields and applications to save time and extract important
        information
      </p>
    </div>
  )
}

export const ProductCard = ({ product, translate }) => {
  return (
    <motion.div
      style={{
        x: translate,
      }}
      whileHover={{
        y: -20,
      }}
      className="group/product h-96 w-[30rem] relative flex-shrink-0"
    >
      <Link href={product.link} className="block group-hover/product:shadow-2xl">
        <Image
          src={product.thumbnail || "/placeholder.svg"}
          height="600"
          width="800"
          className="object-cover object-left-top absolute h-full w-full inset-0 rounded-3xl"
          alt={product.title}
        />
      </Link>
      <div className="absolute inset-0 h-full w-full rounded-3xl bg-black opacity-40 group-hover/product:opacity-20 transition duration-300"></div>
      <div className="absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10">
        <h2 className="font-bold text-xl text-white">{product.title}</h2>
      </div>
    </motion.div>
  )
}
