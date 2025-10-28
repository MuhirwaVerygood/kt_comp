"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Play, Download, FileText, Video, MessageCircle, Heart, Share2, ChevronLeft, ChevronRight, X } from "lucide-react"
import { MessageCircle as WhatsApp } from "lucide-react"
import { Roboto } from "next/font/google"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"





const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export default function HeroSection() {
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [key, setKey] = useState(0)
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)

  const slides = [
    {
      subtitle: "Skip the impossible.",
      title: "Welcome To",
      titleBold: "KT Computer supply",
      image: "/herosection/hero_pc.png"
    },
    {
      subtitle: "Be online always and anywhere",
      title: "For All Seasons",
      titleBold: "Any Circumstances",
      image: "/herosection/kt_pad.png"
    }
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
    setKey(prev => prev + 1)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    setKey(prev => prev + 1)
  }

  const currentSlideData = slides[currentSlide]

  // Auto-slide every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide()
    }, 13000)

    return () => clearInterval(interval)
  }, [currentSlide])

  const container = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0,
      },
    },
  }

  const zoomOut = {
    hidden: { opacity: 0, scale: 1.5 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.8 },
    },
  }

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.85 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 1,
        delay: 1.2,
        onComplete: () => setImagesLoaded(true),
      },
    },
  }

  const contourAnimation = {
    y: imagesLoaded ? 0 : [0, -15, 0],
    transition: imagesLoaded
      ? { duration: 0 }
      : {
          duration: 4,
          repeat: Number.POSITIVE_INFINITY,
        },
  }

  const floatAnimation = {
    y: [0, -15, 0],
    transition: {
      duration: 4,
      repeat: Number.POSITIVE_INFINITY,
    },
  }

  return (
    <section className={`${roboto.variable} relative bg-white overflow-hidden min-h-fit`}>
      <motion.a
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        href="https://wa.me/250793095605"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 left-8 w-16 h-16 bg-[#25D366] hover:bg-[#128C7E] rounded-full flex items-center justify-center shadow-lg z-50 transition-colors"
        aria-label="Chat on WhatsApp"
      >
        <WhatsApp className="w-7 h-7 text-white" />
      </motion.a>

      
      <div className="max-w-7xl lg:max-w-[90%] mx-auto grid lg:grid-cols-2 gap-12 items-center px-6">
        <motion.div key={`text-${key}`} variants={container} initial="hidden" animate="visible" className="space-y-6 z-10 overflow-hidden">
          <motion.p variants={zoomOut} className="text-base tracking-wider text-gray-600 md:text-3xl font-roboto max-w-full">
            {currentSlideData.subtitle}
          </motion.p>

          <motion.h1 variants={zoomOut} className="text-5xl sm:text-6xl lg:text-7xl font-light tracking-wide leading-tight max-w-full">
            <span className="text-gray-900 font-roboto lg:text-[70px]">{currentSlideData.title}</span>
            <br />
            <span className="font-extrabold text-black font-roboto">{currentSlideData.titleBold}</span>
          </motion.h1>

          <motion.div variants={zoomOut} className="flex flex-wrap gap-4 pt-4">
            <a href="/computers" className="inline-flex items-center gap-2 bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-medium px-8 py-3.5 rounded-full transition-colors font-roboto shadow-2xl shadow-sky-300">
              Purchase Now
            </a>
            <Dialog open={isVideoModalOpen} onOpenChange={setIsVideoModalOpen}>
              <DialogTrigger asChild>
                <button className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-black font-medium px-8 py-3.5 rounded-full border-2 border-black transition-colors font-roboto shadow-2xl shadow-sky-300">
                  <Play className="w-4 h-4 fill-black" />
                  Watch Video
                </button>
              </DialogTrigger>
              <DialogContent className="w-[50vw] h-[80vh] p-0 bg-black flex items-center justify-center">
                <DialogHeader className="sr-only">
                  <DialogTitle>Hero Video</DialogTitle>
                </DialogHeader>
                <div className="relative w-full h-full">
                  <video
                    src="/herosection/herovideo.mp4"
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                    onLoadedData={() => console.log('Video loaded')}
                  >
                    Your browser does not support the video tag.
                  </video>
                  <button
                    onClick={() => setIsVideoModalOpen(false)}
                    className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
                    aria-label="Close video modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>
        </motion.div>

        <motion.div
          key={`image-${key}`}
          variants={imageVariants}
          initial="hidden"
          animate="visible"
          className="relative flex justify-center items-center"
        >
          <motion.div className="absolute -top-20 -right-24 w-[600px] h-[600px] z-0" animate={contourAnimation}>
            <Image src="/herosection/contourlines.png" alt="" fill className="object-contain opacity-50" />
          </motion.div>

          <motion.div className="absolute -bottom-32 -left-32 w-[550px] h-[550px] z-0" animate={contourAnimation}>
            <Image src="/herosection/contourlines2.png" alt="" fill className="object-contain opacity-50" />
          </motion.div>

          {/* Watch image */}
          <motion.div animate={floatAnimation} className="relative w-full h-[500px] z-10 ">
            <Image
              src={currentSlideData.image}
              alt="Smartwatches"
              fill
              className="object-contain"
              priority
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Navigation Chevrons */}
      <div className="absolute bottom-0 right-8 flex gap-2 z-50">
        <button
          onClick={prevSlide}
          className="w-12 h-12 flex items-center justify-center transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        <button
          onClick={nextSlide}
          className="w-12 h-12 rounded-full flex items-center justify-center transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6 text-gray-700" />
        </button>
      </div>
    </section>
  )
}