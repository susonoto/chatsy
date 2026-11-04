import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, 
  Zap, 
  Lock, 
  Users, 
  KeyRound, 
  ArrowRight,
  Sparkles,
  EyeOff,
  Trash2
} from 'lucide-react'
import { cn } from '../utils/cn'

interface Props {
  connected: boolean
  onCreate: (name: string) => void
  onJoin: (code: string, name: string) => void
}

export function Lobby({ connected, onCreate, onJoin }: Props) {
  const [mode, setMode] = useState<'home' | 'create' | 'join'>('home')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')

  const handleCreate = () => {
    if (!name.trim()) return
    onCreate(name.trim())
  }

  const handleJoin = () => {
    if (!name.trim() || code.length !== 6) return
    onJoin(code, name.trim())
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10 max-w-2xl"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm mb-6 text-[var(--accent)]">
          <Lock size={14} className="animate-pulse" />
          <span>Zero-trace • End-to-end encrypted • No server storage</span>
        </div>
        <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight mb-4">
          <span className="bg-gradient-to-r from-[var(--accent)] via-[var(--accent-2)] to-[var(--accent-3)] bg-clip-text text-transparent">
            Chatsy
          </span>
        </h1>
        <p className="text-[var(--text-secondary)] text-lg md:text-xl max-w-md mx-auto">
          Chat that vanishes. Messages live only in memory and your browser. Late joiners see nothing.
        </p>
      </motion.div>

      {/* Bento Grid */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        {/* Main action card - spans 2 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-2 glass p-6 md:p-8 flex flex-col"
        >
          {mode === 'home' && (
            <div className="flex flex-col h-full justify-between gap-6">
              <div>
                <h2 className="text-2xl font-semibold mb-2 font-display">Start chatting</h2>
                <p className="text-[var(--text-muted)] text-sm">Create a private room or join with a 6-digit code. Nothing is saved on our servers.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setMode('create')}
                  className="flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-medium text-[var(--bg-primary)]"
                  style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
                >
                  <Sparkles size={20} />
                  Create Room
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setMode('join')}
                  className="flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-medium glass border border-[var(--border)]"
                >
                  <KeyRound size={20} />
                  Join with Code
                </motion.button>
              </div>
            </div>
          )}

          {mode === 'create' && (
            <div className="flex flex-col gap-5">
              <button onClick={() => setMode('home')} className="text-sm text-[var(--text-muted)] self-start hover:text-[var(--accent)]">← Back</button>
              <h2 className="text-2xl font-semibold font-display">Create a room</h2>
              <input
                type="text"
                placeholder="Your display name"
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={24}
                className="w-full px-5 py-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] outline-none"
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreate}
                disabled={!name.trim() || !connected}
                className="flex items-center justify-center gap-2 py-4 rounded-2xl font-medium text-[var(--bg-primary)] disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
              >
                Generate 6-digit code <ArrowRight size={18} />
              </motion.button>
            </div>
          )}

          {mode === 'join' && (
            <div className="flex flex-col gap-5">
              <button onClick={() => setMode('home')} className="text-sm text-[var(--text-muted)] self-start hover:text-[var(--accent)]">← Back</button>
              <h2 className="text-2xl font-semibold font-display">Join a room</h2>
              <input
                type="text"
                placeholder="Your display name"
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={24}
                className="w-full px-5 py-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] outline-none"
              />
              <input
                type="text"
                placeholder="6-digit invite code"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="w-full px-5 py-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] outline-none tracking-[0.4em] text-center text-2xl font-mono"
                onKeyDown={e => e.key === 'Enter' && handleJoin()}
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleJoin}
                disabled={!name.trim() || code.length !== 6 || !connected}
                className="flex items-center justify-center gap-2 py-4 rounded-2xl font-medium text-[var(--bg-primary)] disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
              >
                Enter Room <ArrowRight size={18} />
              </motion.button>
            </div>
          )}
        </motion.div>

        {/* Status card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="glass p-6 flex flex-col justify-between"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className={cn('w-3 h-3 rounded-full', connected ? 'bg-[var(--success)] pulse-online' : 'bg-[var(--danger)]')} />
            <span className="text-sm font-medium">{connected ? 'Connected' : 'Connecting…'}</span>
          </div>
          <div className="space-y-3 text-sm text-[var(--text-muted)]">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-[var(--accent)]" />
              <span>AES-256-GCM encryption</span>
            </div>
            <div className="flex items-center gap-2">
              <EyeOff size={16} className="text-[var(--accent)]" />
              <span>Server sees only ciphertext</span>
            </div>
            <div className="flex items-center gap-2">
              <Trash2 size={16} className="text-[var(--accent)]" />
              <span>No history • No recovery</span>
            </div>
          </div>
        </motion.div>

        {/* Feature cards */}
        <FeatureCard
          delay={0.2}
          icon={<Zap className="text-[var(--accent)]" size={22} />}
          title="Instant rooms"
          desc="6-digit codes generated instantly. Share and chat."
        />
        <FeatureCard
          delay={0.25}
          icon={<Users className="text-[var(--accent-2)]" size={22} />}
          title="Late joiners blind"
          desc="New arrivals cannot see past messages. Nothing is stored."
        />
        <FeatureCard
          delay={0.3}
          icon={<Lock className="text-[var(--accent-3)]" size={22} />}
          title="Zero storage"
          desc="Nothing is saved — not even in your browser."
        />
      </div>

      <p className="mt-10 text-xs text-[var(--text-muted)] text-center max-w-lg">
        Messages exist only in RAM while the room is active.
        Leave the room or refresh → gone forever.
      </p>
    </div>
  )
}

function FeatureCard({ icon, title, desc, delay }: { icon: React.ReactNode; title: string; desc: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4 }}
      className="glass p-5 flex flex-col gap-3"
    >
      <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-[var(--bg-secondary)] icon-hover">
        {icon}
      </div>
      <h3 className="font-semibold font-display">{title}</h3>
      <p className="text-sm text-[var(--text-muted)] leading-relaxed">{desc}</p>
    </motion.div>
  )
}
