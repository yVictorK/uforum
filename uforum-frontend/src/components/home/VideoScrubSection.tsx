"use client"
import React, { useRef, useEffect, useState } from "react"
import { motion, useScroll, useTransform, useMotionValueEvent, useSpring } from "framer-motion"
import Link from 'next/link'
import { ArrowRight } from '@phosphor-icons/react'

export function VideoScrubSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    // Começa quando o topo do container bate no topo, termina quando o fim do container bate no fim.
    offset: ["start start", "end end"]
  })

  // Física de mola ajustada para ser mais responsiva e fluida com rolagens pequenas
  const smoothProgress = useSpring(scrollYProgress, {
    damping: 25,
    stiffness: 100,
    mass: 0.3
  })

  const [duration, setDuration] = useState(5)

  useEffect(() => {
    if (videoRef.current) {
      if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
        setDuration(videoRef.current.duration)
      } else {
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current && !isNaN(videoRef.current.duration)) {
            setDuration(videoRef.current.duration)
          }
        }
      }
    }
  }, [])

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (videoRef.current && !isNaN(duration) && duration > 0 && videoRef.current.readyState >= 1) {
      requestAnimationFrame(() => {
        if (videoRef.current) {
          const progressToVideo = Math.min(1, latest / 0.50);
          videoRef.current.currentTime = progressToVideo * duration;
        }
      });
    }
  })

  return (
    <section ref={containerRef} className="relative h-[250vh] w-full" style={{ background: 'var(--bg-primary)' }}>
      <div className="sticky top-0 h-[100dvh] w-full overflow-hidden flex items-center justify-center">
        <video
          ref={videoRef}
          src="/ufam-scrub.mp4"
          className="absolute inset-0 w-full h-full object-cover scale-[1.05]"
          muted
          playsInline
          preload="auto"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-primary)]/80 via-transparent to-[var(--bg-primary)]" />

        <motion.div
          style={{
            opacity: useTransform(smoothProgress, [0, 0.25], [1, 0]),
            y: useTransform(smoothProgress, [0, 0.25], [0, -100]),
            scale: useTransform(smoothProgress, [0, 0.25], [1, 0.95]),
            pointerEvents: useTransform(smoothProgress, (val) => val > 0.15 ? "none" : "auto")
          }}
          className="absolute z-10 page-wrap w-full flex flex-col items-center justify-center text-center px-4"
        >
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full mb-8 text-[13px] font-semibold border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-glow-emerald animate-pulse" />
            Rede Exclusiva UFAM
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-[6rem] font-black leading-[0.95] tracking-tighter mb-6 text-balance drop-shadow-2xl"
            style={{ color: 'var(--text-primary)' }}>
            O seu campus.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              agora digital.
            </span>
          </h1>
          <p className="text-lg md:text-xl max-w-[45ch] mb-10 leading-relaxed font-medium text-balance drop-shadow-lg"
            style={{ color: 'var(--text-secondary)' }}>
            Conecte-se com colegas, discuta disciplinas nos fóruns e descubra o ecossistema da universidade através do scroll.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
            <Link href="/auth/register" className="btn-green w-full sm:w-auto text-base py-3.5 px-8 shadow-glow-emerald bg-[var(--emerald-500)] text-white">
              Acessar Fóruns <ArrowRight weight="bold" className="w-5 h-5 ml-1" />
            </Link>
          </div>
        </motion.div>

        <motion.div
          style={{
            opacity: useTransform(smoothProgress, [0.3, 0.5, 0.65], [0, 1, 0]),
            y: useTransform(smoothProgress, [0.35, 0.65], [100, -100]),
            scale: useTransform(smoothProgress, [0.35, 0.65], [0.95, 1])
          }}
          className="absolute z-10 page-wrap w-full flex flex-col items-center justify-center text-center pointer-events-none px-4"
        >
          <h2 className="text-5xl md:text-7xl lg:text-[5rem] font-black leading-none tracking-tight mb-4 drop-shadow-2xl"
            style={{ color: 'var(--text-primary)' }}>
            O campus de cima.
          </h2>
          <p className="text-lg md:text-xl font-medium max-w-[45ch] mx-auto drop-shadow-lg"
            style={{ color: 'var(--text-secondary)' }}>
            Desvende o complexo universitário navegando suavemente pela plataforma construída por alunos.
          </p>
        </motion.div>

        <motion.div
          style={{
            opacity: useTransform(smoothProgress, [0.7, 0.85, 1], [0, 1, 1]),
            y: useTransform(smoothProgress, [0.7, 1], [100, -50]),
            scale: useTransform(smoothProgress, [0.7, 1], [0.95, 1])
          }}
          className="absolute z-10 page-wrap w-full flex flex-col items-center justify-center text-center pointer-events-none px-4"
        >
          <h2 className="text-6xl md:text-8xl font-black tracking-tight mb-4 drop-shadow-[0_4px_24px_rgba(0,0,0,0.2)]"
            style={{ color: 'var(--text-primary)' }}>
            Integração Real.
          </h2>
          <p className="text-lg md:text-xl font-medium max-w-[45ch] mx-auto drop-shadow-lg"
            style={{ color: 'var(--text-secondary)' }}>
            Explore ferramentas modulares desenhadas para a fluidez extrema no seu cotidiano e nas suas pesquisas.
          </p>
        </motion.div>

        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[var(--bg-primary)] to-transparent z-20 pointer-events-none" />
      </div>
    </section>
  )
}
