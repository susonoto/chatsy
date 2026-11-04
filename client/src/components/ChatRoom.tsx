import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  LogOut, 
  Copy, 
  Check, 
  Users, 
  ShieldCheck
} from 'lucide-react'
import type { Message, RoomUser } from '../App'
import { cn } from '../utils/cn'

interface Props {
  code: string
  username: string
  userId: string
  messages: Message[]
  users: RoomUser[]
  typingUsers: string[]
  onSend: (text: string) => void
  onLeave: () => void
  onTyping: (isTyping: boolean) => void
}

export function ChatRoom({
  code,
  username: _username,
  userId,
  messages,
  users,
  typingUsers,
  onSend,
  onLeave,
  onTyping
}: Props) {
  const [text, setText] = useState('')
  const [copied, setCopied] = useState(false)
  const [showUsers, setShowUsers] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const typingTimeout = useRef<number | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typingUsers])

  const handleSend = () => {
    if (!text.trim()) return
    onSend(text)
    setText('')
    onTyping(false)
  }

  const handleChange = (val: string) => {
    setText(val)
    onTyping(true)
    if (typingTimeout.current) clearTimeout(typingTimeout.current)
    typingTimeout.current = window.setTimeout(() => onTyping(false), 1500)
  }

  const copyCode = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen flex flex-col max-w-5xl mx-auto p-3 md:p-6">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass flex items-center justify-between gap-3 p-3 md:p-4 mb-3 md:mb-4 sticky top-3 z-20"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}>
            <ShieldCheck size={20} className="text-[var(--bg-primary)]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-semibold font-display truncate">Room {code}</h1>
              <button
                onClick={copyCode}
                className="p-1 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--accent)]"
                title="Copy invite code"
              >
                {copied ? <Check size={16} className="text-[var(--success)]" /> : <Copy size={16} />}
              </button>
            </div>
            <p className="text-xs text-[var(--text-muted)] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
              {users.length} online • Encrypted
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUsers(!showUsers)}
            className="p-2.5 rounded-xl glass hover:scale-105 relative"
            title="Participants"
          >
            <Users size={18} />
            <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] rounded-full flex items-center justify-center text-[var(--bg-primary)] font-bold"
              style={{ background: 'var(--accent)' }}>
              {users.length}
            </span>
          </button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLeave}
            className="p-2.5 rounded-xl flex items-center gap-2 text-[var(--danger)] hover:bg-[var(--danger)]/10"
            title="Leave room"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline text-sm font-medium">Leave</span>
          </motion.button>
        </div>
      </motion.header>

      {/* Users drawer */}
      <AnimatePresence>
        {showUsers && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="glass mb-3 overflow-hidden"
          >
            <div className="p-4 flex flex-wrap gap-2">
              {users.map(u => (
                <div key={u.id} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-secondary)] text-sm">
                  <div className="w-2 h-2 rounded-full bg-[var(--success)]" />
                  {u.name}{u.id === userId ? ' (you)' : ''}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages area */}
      <div className="flex-1 glass overflow-hidden flex flex-col min-h-[50vh]">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center text-[var(--text-muted)] py-20">
              <ShieldCheck size={48} className="mb-4 opacity-40" />
              <p className="font-medium">No messages yet</p>
              <p className="text-sm mt-1">This room has zero history. Say hi!</p>
              <p className="text-xs mt-4 max-w-xs opacity-70">
                Anyone who joins later will not see messages sent before they arrived.
              </p>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={cn(
                  'flex flex-col max-w-[85%] md:max-w-[70%]',
                  msg.isMine ? 'ml-auto items-end' : 'items-start'
                )}
              >
                {!msg.isMine && (
                  <span className="text-xs text-[var(--text-muted)] mb-1 px-1">{msg.senderName}</span>
                )}
                <div
                  className={cn(
                    'px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed break-words',
                    msg.isMine
                      ? 'rounded-br-md text-[var(--bg-primary)]'
                      : 'rounded-bl-md glass'
                  )}
                  style={msg.isMine ? {
                    background: 'linear-gradient(135deg, var(--accent), var(--accent-2))'
                  } : undefined}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-[var(--text-muted)] mt-1 px-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {typingUsers.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] px-1">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] typing-dot" />
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] typing-dot" />
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] typing-dot" />
              </div>
              <span>{typingUsers.join(', ')} typing…</span>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-3 md:p-4 border-t border-[var(--border)]">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                value={text}
                onChange={e => handleChange(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="Type a message… (encrypted end-to-end)"
                rows={1}
                className="w-full resize-none px-4 py-3 pr-12 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] outline-none max-h-32"
                style={{ minHeight: '48px' }}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={handleSend}
              disabled={!text.trim()}
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
            >
              <Send size={20} className="text-[var(--bg-primary)]" />
            </motion.button>
          </div>
          <p className="text-[10px] text-[var(--text-muted)] mt-2 text-center">
            Messages are encrypted in your browser. Server only relays ciphertext. No logs. No history.
          </p>
        </div>
      </div>
    </div>
  )
}
