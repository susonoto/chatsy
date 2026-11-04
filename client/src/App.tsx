import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { io, Socket } from 'socket.io-client'
import { Lobby } from './components/Lobby'
import { ChatRoom } from './components/ChatRoom'
import { ThemeSwitcher } from './components/ThemeSwitcher'
import { Background } from './components/Background'
import { encryptMessage, decryptMessage } from './utils/crypto'
import { clearAllChatData } from './utils/storage'

// Clear any old message data from previous versions
clearAllChatData()

export type Theme = 'glass' | 'neomorphism' | 'night'

export interface Message {
  id: string
  text: string
  senderId: string
  senderName: string
  timestamp: number
  isMine: boolean
}

export interface RoomUser {
  id: string
  name: string
}

function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('chatsy_theme') as Theme) || 'glass'
  })
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [roomCode, setRoomCode] = useState<string | null>(null)
  const [username, setUsername] = useState('')
  const [userId, setUserId] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [users, setUsers] = useState<RoomUser[]>([])
  const [typingUsers, setTypingUsers] = useState<string[]>([])

  // Apply theme (only theme preference is stored)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'glass' ? '' : theme)
    localStorage.setItem('chatsy_theme', theme)
  }, [theme])

  // Connect socket
  useEffect(() => {
    const s = io(import.meta.env.DEV ? 'http://localhost:3001' : window.location.origin, {
      transports: ['websocket', 'polling'],
      autoConnect: true
    })
    setSocket(s)

    s.on('connect', () => setConnected(true))
    s.on('disconnect', () => setConnected(false))

    return () => {
      s.disconnect()
    }
  }, [])

  // Socket listeners for the current room
  useEffect(() => {
    if (!socket || !roomCode) return

    const onReceive = async (payload: {
      ciphertext: string
      iv: string
      senderId: string
      senderName: string
      timestamp: number
    }) => {
      // Only accept messages that arrive AFTER we joined.
      // No history is ever sent by the server.
      const text = await decryptMessage(payload.ciphertext, payload.iv, roomCode)
      const msg: Message = {
        id: crypto.randomUUID(),
        text,
        senderId: payload.senderId,
        senderName: payload.senderName,
        timestamp: payload.timestamp,
        isMine: false
      }
      setMessages(prev => [...prev, msg])
    }

    socket.on('receive-message', onReceive)

    socket.on('room-update', (data: { users: RoomUser[] }) => {
      setUsers(data.users)
    })

    socket.on('user-joined', () => {
      // Do nothing — we never re-send old messages
    })

    socket.on('user-left', () => {})

    socket.on('user-typing', ({ username: name, isTyping }: { username: string; isTyping: boolean }) => {
      setTypingUsers(prev => {
        if (isTyping) return prev.includes(name) ? prev : [...prev, name]
        return prev.filter(n => n !== name)
      })
    })

    return () => {
      socket.off('receive-message')
      socket.off('room-update')
      socket.off('user-joined')
      socket.off('user-left')
      socket.off('user-typing')
    }
  }, [socket, roomCode])

  const createRoom = useCallback((name: string) => {
    if (!socket) return
    socket.emit('create-room', { username: name }, (res: any) => {
      if (res.success) {
        setUsername(name)
        setUserId(res.userId)
        setRoomCode(res.code)
        setMessages([]) // always start empty
      }
    })
  }, [socket])

  const joinRoom = useCallback((code: string, name: string) => {
    if (!socket) return
    socket.emit('join-room', { code, username: name }, (res: any) => {
      if (res.success) {
        setUsername(name)
        setUserId(res.userId)
        setRoomCode(code)
        setMessages([]) // LATE JOINERS ALWAYS START WITH EMPTY CHAT
      } else {
        alert(res.error || 'Failed to join')
      }
    })
  }, [socket])

  const sendMessage = useCallback(async (text: string) => {
    if (!socket || !roomCode || !text.trim()) return

    const { ciphertext, iv } = await encryptMessage(text.trim(), roomCode)
    const timestamp = Date.now()

    // Show immediately for the sender
    const msg: Message = {
      id: crypto.randomUUID(),
      text: text.trim(),
      senderId: userId,
      senderName: username,
      timestamp,
      isMine: true
    }
    setMessages(prev => [...prev, msg])

    // Broadcast only ciphertext — server never stores it
    socket.emit('send-message', {
      ciphertext,
      iv,
      senderId: userId,
      senderName: username,
      timestamp
    })
  }, [socket, roomCode, userId, username])

  const leaveRoom = useCallback(() => {
    if (socket) socket.emit('leave-room')
    setRoomCode(null)
    setMessages([])
    setUsers([])
    setTypingUsers([])
  }, [socket])

  const handleTyping = useCallback((isTyping: boolean) => {
    socket?.emit('typing', { isTyping })
  }, [socket])

  return (
    <div className="min-h-full w-full relative overflow-hidden">
      <Background theme={theme} />
      <div className="fixed top-4 right-4 z-50">
        <ThemeSwitcher theme={theme} setTheme={setTheme} />
      </div>

      <AnimatePresence mode="wait">
        {!roomCode ? (
          <motion.div
            key="lobby"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="min-h-full"
          >
            <Lobby
              connected={connected}
              onCreate={createRoom}
              onJoin={joinRoom}
            />
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.35 }}
            className="min-h-full"
          >
            <ChatRoom
              code={roomCode}
              username={username}
              userId={userId}
              messages={messages}
              users={users}
              typingUsers={typingUsers}
              onSend={sendMessage}
              onLeave={leaveRoom}
              onTyping={handleTyping}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
