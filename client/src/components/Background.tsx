import { motion } from 'framer-motion'
import type { Theme } from '../App'

export function Background({ theme }: { theme: Theme }) {
  // theme is used so the orbs re-render / CSS variables update when theme changes
  void theme

  return (
    <div className="bg-mesh">
      <motion.div
        className="absolute w-72 h-72 rounded-full opacity-20 blur-3xl"
        style={{
          background: 'var(--accent-3)',
          top: '30%',
          left: '60%'
        }}
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -40, 20, 0],
          scale: [1, 1.1, 0.9, 1]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-48 h-48 rounded-full opacity-15 blur-2xl"
        style={{
          background: 'var(--accent)',
          bottom: '20%',
          left: '20%'
        }}
        animate={{
          x: [0, -25, 15, 0],
          y: [0, 25, -15, 0]
        }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}
