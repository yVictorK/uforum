"use client"
import { motion } from 'framer-motion'
import { UsersThree, CalendarBlank, MapTrifold, CurrencyDollar, ArrowUpRight } from '@phosphor-icons/react'

export function BentoGrid() {
  const cards = [
    {
      id: 1,
      title: "Comunidades Setoriais",
      desc: "Espaços exclusivos para cada curso e departamento.",
      icon: <UsersThree className="w-8 h-8 text-emerald-400" weight="duotone" />,
      colSpan: "md:col-span-2",
      delay: 0.1
    },
    {
      id: 2,
      title: "Eventos & Agendas",
      desc: "Acompanhe todo o calendário universitário.",
      icon: <CalendarBlank className="w-8 h-8 text-emerald-400" weight="duotone" />,
      colSpan: "md:col-span-1",
      delay: 0.2
    },
    {
      id: 3,
      title: "Geomapeamento",
      desc: "Guia online para encontrar todos os blocos do campus.",
      icon: <MapTrifold className="w-8 h-8 text-emerald-400" weight="duotone" />,
      colSpan: "md:col-span-1",
      delay: 0.3
    },
    {
      id: 4,
      title: "Marketplace Zero Taxas",
      desc: "Comércio estudantil autônomo entre os centros acadêmicos.",
      icon: <CurrencyDollar className="w-8 h-8 text-emerald-400" weight="duotone" />,
      colSpan: "md:col-span-2",
      delay: 0.4
    }
  ]

  return (
    <section className="py-32 page-wrap relative">
      <div className="mb-20 flex flex-col items-center text-center">
        <span className="text-emerald-500 font-mono text-sm tracking-widest uppercase mb-4 opacity-80">Arquitetura Integrada</span>
        <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-zinc-100 mb-6">Plataforma Modular.</h2>
        <p className="text-zinc-400 max-w-[50ch] text-lg leading-relaxed">Substitua grupos bagunçados por uma arquitetura elegante focada exclusivamente na vida universitária.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-fr">
        {cards.map((card) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: card.delay, type: "spring", bounce: 0.4 }}
            className={`card group !p-10 flex flex-col justify-between min-h-[300px] cursor-pointer hover:border-zinc-700/50 ${card.colSpan}`}
          >
            <div className="absolute top-8 right-8 text-zinc-700 group-hover:text-emerald-400 transform translate-x-2 -translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300">
               <ArrowUpRight className="w-6 h-6" />
            </div>

            <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 border border-zinc-700 flex items-center justify-center mb-12 shadow-[inset_0_2px_4px_rgba(255,255,255,0.05),_0_8px_16px_rgba(0,0,0,0.4)] group-hover:bg-zinc-800 transition-colors duration-300">
               {card.icon}
            </div>
            
            <div>
              <h3 className="text-2xl font-bold tracking-tight text-zinc-100 mb-2">{card.title}</h3>
              <p className="text-zinc-500 leading-relaxed font-medium">{card.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
