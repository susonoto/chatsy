import { motion } from 'framer-motion'
import { Sun, Moon, Sparkles } from 'lucide-react'
import type { Theme } from '../App'
import { cn } from '../utils/cn'

const themes: { id: Theme; icon: typeof Sun; label: string }[] = [
  { id: 'glass', icon: Sparkles, label: 'Glass' },
  { id: 'neomorphism', icon: Sun, label: 'Neo' },
  { id: 'night', icon: Moon, label: 'Night' }
]

export function ThemeSwitcher({ theme, setTheme }: { theme: Theme; setTheme: (t: Theme) => void }) {
  return (
    <div className="glass flex items-center gap-1 p-1.5 rounded-2xl">
      {themes.map((t) => {
        const Icon = t.icon
        const active = theme === t.id
        return (
          <motion.button
            key={t.id}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setTheme(t.id)}
            className={cn(
              'relative flex items-center justify-center w-10 h-10 rounded-xl transition-colors',
              active ? 'text-[var(--bg-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            )}
            title={t.label}
          >
            {active && (
              <motion.div
                layoutId="theme-pill"
                className="absolute inset-0 rounded-xl"
                style={{ background: 'var(--accent)' }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <Icon size={18} className="relative z-10 icon-hover" strokeWidth={active ? 2.5 : 2} />
          </motion.button>
        )
      })}
    </div>
  )
}
