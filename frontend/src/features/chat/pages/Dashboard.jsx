import { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setUser } from '../../auth/auth.slice'
import { setChats, setCurrentChatId } from '../chat.slice'
import { useChat } from '../hooks/useChat'
import { DotmSpiral, DotmDisplay } from '../../../components/DotMatrix'
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true,
})

const Dashboard = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { initializeSocketConnection } = useChat()

  const chats = useSelector((state) => state.chat.chats)
  const currentChatId = useSelector((state) => state.chat.currentChatId)

  const [activeChatTitle, setActiveChatTitle] = useState('')
  const [messages, setMessages] = useState([])
  const [messageText, setMessageText] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [sysLog, setSysLog] = useState('SYSTEM READY')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Socket setup
  useEffect(() => {
    const socket = initializeSocketConnection()
    return () => {
      socket?.disconnect()
    }
  }, [initializeSocketConnection])

  // Fetch all chats on load
  const fetchChats = async () => {
    try {
      setSysLog('FETCHING SESSIONS...')
      const response = await api.get('/api/chats')
      if (response.data?.chats) {
        dispatch(setChats(response.data.chats))
        setSysLog('SESSIONS SYNCHRONIZED')
      }
    } catch (error) {
      console.error(error)
      setSysLog('ERR: SYNC_FAILED')
    }
  }

  useEffect(() => {
    fetchChats()
  }, [dispatch])

  // Fetch messages for active chat
  const fetchMessages = async (chatId) => {
    try {
      setSysLog(`LOADING SESSION...`)
      const response = await api.get(`/api/chats/${chatId}/messages`)
      if (response.data?.messages) {
        setMessages(response.data.messages)
        setSysLog('SESSION ACTIVE')
      }
    } catch (error) {
      console.error(error)
      setSysLog('ERR: LOAD_FAILED')
    }
  }

  const handleSelectChat = (chat) => {
    dispatch(setCurrentChatId(chat._id))
    setActiveChatTitle(chat.title)
    fetchMessages(chat._id)
  }

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isGenerating])

  // Handle Send Message
  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!messageText.trim() || isGenerating) return

    const inputMsg = messageText
    setMessageText('')
    setIsGenerating(true)
    setSysLog('TRANSMITTING...')

    const tempUserMsg = {
      _id: Date.now().toString(),
      sender: 'user',
      content: inputMsg,
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, tempUserMsg])

    try {
      const response = await api.post('/api/chats/message', {
        message: inputMsg,
        chat: currentChatId,
      })

      if (response.data?.success) {
        const { chat: newChat, aiMessageDoc } = response.data

        if (!currentChatId) {
          dispatch(setCurrentChatId(newChat._id))
          setActiveChatTitle(newChat.title)
          setMessages((prev) => [
            ...prev.filter((m) => m._id !== tempUserMsg._id),
            response.data.userMessage,
            aiMessageDoc,
          ])
          fetchChats()
        } else {
          setMessages((prev) => [
            ...prev.filter((m) => m._id !== tempUserMsg._id),
            response.data.userMessage,
            aiMessageDoc,
          ])
        }
        setSysLog('TRANSMISSION COMPLETE')
      }
    } catch (error) {
      console.error(error)
      setSysLog('ERR: TRANSMISSION_FAILED')
      setMessages((prev) => [
        ...prev,
        {
          _id: 'err-' + Date.now(),
          sender: 'ai',
          content: '⚠️ System Error: Unable to complete transmission. Check connection status.',
          createdAt: new Date().toISOString(),
        },
      ])
    } finally {
      setIsGenerating(false)
    }
  }

  // Handle Delete Chat
  const handleDeleteChat = async (chatId, e) => {
    e.stopPropagation()
    if (!window.confirm('WARNING: Deleting this session will purge all records. Proceed?')) return

    try {
      setSysLog(`PURGING SESSION...`)
      const response = await api.delete(`/api/chats/${chatId}`)
      if (response.data?.success) {
        setSysLog('SESSION PURGED')
        if (currentChatId === chatId) {
          dispatch(setCurrentChatId(null))
          setActiveChatTitle('')
          setMessages([])
        }
        fetchChats()
      }
    } catch (error) {
      console.error(error)
      setSysLog('ERR: PURGE_FAILED')
    }
  }

  // Handle Logout
  const handleLogout = () => {
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    dispatch(setUser(null))
  }

  const suggestions = [
    'Explain quantum physics in simple terms',
    'Draft a system report on cybersec standards',
    'Suggest code optimizations for my Node.js app',
    'Generate a startup checklist for a SaaS product',
  ]

  return (
    <div className="h-screen w-screen flex bg-[#080808] text-neutral-300 font-mono relative overflow-hidden dot-matrix-bg terminal-grid">
      <div className="scanning-line" />

      {/* ── Sidebar ──────────────────────────────────────────────────────────── */}
      <aside
        className={`${sidebarOpen ? 'w-72' : 'w-0'} h-full border-r border-neutral-900 bg-[#080808]/98 flex flex-col z-20 relative backdrop-blur-xl overflow-hidden transition-all duration-300 ease-in-out shrink-0`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-neutral-900 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            {/* Logo + Title */}
            <div className="flex items-center gap-2.5">
              <DotmDisplay size={22} dotSize={3} color="#737373" pattern="full" />
              <span className="text-white text-[11px] font-bold tracking-widest select-none uppercase">
                Core Terminal
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="text-[9px] text-neutral-600 hover:text-white px-2 py-1 border border-neutral-800 hover:border-neutral-600 rounded transition-all font-mono select-none cursor-pointer hover:bg-neutral-900"
            >
              LOGOUT
            </button>
          </div>

          {/* User status */}
          <div className="flex items-center justify-between px-0.5">
            <div className="text-[10px] text-neutral-600 font-mono">
              <span className="text-neutral-500">USER</span>{' '}
              <span className="text-neutral-300 font-semibold">{user?.username || 'GUEST'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-500 animate-pulse block" />
              <span className="text-[9px] text-neutral-600 select-none">ONLINE</span>
            </div>
          </div>
        </div>

        {/* New Session Button */}
        <div className="p-3.5">
          <button
            id="new-session-btn"
            onClick={() => {
              dispatch(setCurrentChatId(null))
              setActiveChatTitle('')
              setMessages([])
              setSysLog('NEW SESSION INITIALIZED')
              inputRef.current?.focus()
            }}
            className="w-full py-3 text-[11px] font-bold uppercase rounded-lg border dot-matrix-btn tracking-widest select-none"
          >
            + New Session
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1.5">
          <div className="text-[9px] text-neutral-700 font-bold uppercase tracking-widest mb-2.5 px-1 select-none">
            [ sessions ]
          </div>

          {!chats || chats.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <DotmDisplay size={32} dotSize={4} color="#2a2a2a" pattern="diamond" className="mx-auto block" />
              <p className="text-[10px] text-neutral-700 select-none">NO ACTIVE SESSIONS</p>
            </div>
          ) : (
            chats.map((chat) => {
              const isActive = chat._id === currentChatId
              return (
                <div
                  key={chat._id}
                  onClick={() => handleSelectChat(chat)}
                  className={`group w-full p-3 rounded-lg border text-left cursor-pointer transition-all duration-200 relative overflow-hidden ${
                    isActive
                      ? 'bg-neutral-900/80 border-neutral-700 text-white shadow-[0_0_20px_rgba(255,255,255,0.03)] dot-matrix-panel'
                      : 'bg-transparent border-neutral-900 hover:bg-neutral-900/40 hover:border-neutral-800 text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  <div className="flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-2 min-w-0">
                      {isActive && (
                        <span className="w-1 h-1 rounded-full bg-neutral-400 shrink-0 animate-pulse" />
                      )}
                      <span className="text-[11px] truncate font-medium">{chat.title}</span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteChat(chat._id, e)}
                      className="opacity-0 group-hover:opacity-100 text-neutral-700 hover:text-neutral-300 p-1 rounded hover:bg-neutral-800 transition-all cursor-pointer shrink-0 ml-1"
                      title="Delete session"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <div className="text-[9px] text-neutral-700 mt-1 select-none pl-3">
                    {isActive ? '' : `ID: ${chat._id.substring(0, 8)}...`}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Sidebar Status Footer */}
        <div className="p-3 border-t border-neutral-900 flex items-center justify-between select-none">
          <span className="text-[9px] text-neutral-700 truncate">{sysLog}</span>
          <DotmDisplay size={14} dotSize={2} color="#333" pattern="cross" />
        </div>
      </aside>

      {/* ── Main Area ─────────────────────────────────────────────────────────── */}
      <main className="flex-1 h-full flex flex-col bg-[#060606]/98 z-10 relative min-w-0">

        {/* Chat Header */}
        <header className="h-14 border-b border-neutral-900 px-5 flex justify-between items-center bg-[#060606]/90 backdrop-blur-xl relative z-10 select-none shrink-0">
          <div className="flex items-center gap-3">
            {/* Sidebar toggle */}
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="text-neutral-600 hover:text-neutral-300 p-1.5 rounded hover:bg-neutral-900 transition-all cursor-pointer"
              title="Toggle sidebar"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
              </svg>
            </button>

            <div className="w-px h-4 bg-neutral-900" />

            <div className="flex items-center gap-2.5">
              {currentChatId ? (
                <DotmDisplay size={16} dotSize={2} color="#525252" pattern="full" />
              ) : (
                <span className="w-2 h-2 rounded-full border border-neutral-800 block" />
              )}
              <div>
                {/* <h2 className="text-white text-[11px] uppercase tracking-widest font-bold leading-tight">
                  {currentChatId ? activeChatTitle : '// STANDBY'}
                </h2> */}
                {currentChatId && (
                  <p className="text-[9px] text-neutral-700 leading-tight">
                    {currentChatId.substring(0, 16)}...
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isGenerating && (
              <div className="flex items-center gap-2">
                <DotmSpiral size={18} dotSize={2} color="#525252" speed={2} pattern="full" animated />
                <span className="text-[9px] text-neutral-600 tracking-widest">GENERATING</span>
              </div>
            )}
            <span className="text-[9px] text-neutral-700 font-mono">
              {currentChatId ? (
                <span className="text-neutral-500">● ACTIVE</span>
              ) : (
                <span>○ STANDBY</span>
              )}
            </span>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 min-h-0">
          {!currentChatId && messages.length === 0 ? (
            /* Welcome Screen */
            <div className="h-full flex flex-col justify-center items-center text-center max-w-lg mx-auto space-y-8 select-none">

              {/* Hero dot matrix */}
              <div className="relative flex flex-col items-center gap-5">
                <DotmSpiral
                  size={80}
                  dotSize={10}
                  color="#2a2a2a"
                  speed={0.8}
                  pattern="full"
                  animated
                  opacityBase={0.08}
                  opacityMid={0.25}
                  opacityPeak={0.9}
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-3 h-3 rounded-full bg-neutral-700 animate-pulse" />
                </div>
              </div>

              {/* Title card */}
              <div className="p-7 border border-neutral-900 bg-neutral-950/60 rounded-2xl relative overflow-hidden max-w-sm w-full dot-matrix-panel shadow-[0_0_60px_rgba(255,255,255,0.015)]">
                <p className="text-[9px] uppercase tracking-[0.5em] text-neutral-600 font-bold">
                  // HOST_READY
                </p>
                <h1 className="mt-3 text-lg font-bold text-white uppercase tracking-wider leading-tight">
                  Establish Neural<br />Connection
                </h1>
                <p className="mt-3 text-[11px] text-neutral-600 leading-relaxed font-medium">
                  Send a prompt below to launch a generative agent session.
                </p>
              </div>

              {/* Suggestion Grid */}
              <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
                {suggestions.map((promptText, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setMessageText(promptText)
                      inputRef.current?.focus()
                    }}
                    className="p-3 text-[10px] text-left border border-neutral-900 bg-neutral-950/60 hover:bg-neutral-900/60 hover:border-neutral-800 rounded-xl text-neutral-600 hover:text-neutral-300 transition-all cursor-pointer font-mono leading-relaxed"
                  >
                    <span className="text-neutral-700 mr-1">&gt;</span> {promptText}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Messages List */
            <div className="max-w-2xl mx-auto space-y-5 w-full">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user'
                return (
                  <div key={msg._id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                    {/* Sender label */}
                    <div className="flex items-center gap-2 mb-1.5">
                      {!isUser && (
                        <DotmDisplay size={12} dotSize={1.5} color="#404040" pattern="diamond" />
                      )}
                      <span className="text-[9px] text-neutral-700 uppercase font-bold tracking-widest select-none">
                        {isUser ? 'YOU' : 'AGENT'}
                      </span>
                    </div>

                    {/* Bubble */}
                    <div
                      className={`p-4 rounded-xl text-[12px] leading-relaxed max-w-[88%] font-mono whitespace-pre-wrap border message-content ${
                        isUser
                          ? 'bg-neutral-950 border-neutral-800 text-neutral-200 rounded-tr-sm'
                          : 'bg-[#090909] border-neutral-900 text-neutral-400 rounded-tl-sm shadow-[0_0_40px_rgba(255,255,255,0.01)]'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                )
              })}

              {/* AI Generating indicator */}
              {isGenerating && (
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-2 mb-1.5">
                    <DotmSpiral size={12} dotSize={1.5} color="#525252" speed={2} animated />
                    <span className="text-[9px] text-neutral-700 uppercase font-bold tracking-widest select-none">
                      AGENT
                    </span>
                  </div>
                  <div className="p-4 rounded-xl rounded-tl-sm bg-[#090909] border border-neutral-900 flex items-center gap-3">
                    <DotmSpiral
                      size={28}
                      dotSize={4}
                      color="#404040"
                      speed={1.4}
                      pattern="full"
                      animated
                      opacityBase={0.1}
                      opacityMid={0.3}
                      opacityPeak={0.85}
                    />
                    <span className="text-[11px] text-neutral-600 italic font-mono">Thinking...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Footer */}
        <footer className="p-4 border-t border-neutral-900 bg-[#060606]/90 backdrop-blur-xl relative z-20 shrink-0">
          <form onSubmit={handleSendMessage} className="max-w-2xl mx-auto flex gap-2.5">
            <input
              ref={inputRef}
              id="chat-input"
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="> Enter prompt..."
              disabled={isGenerating}
              className="flex-1 px-4 py-3.5 border border-neutral-900 bg-neutral-950/80 text-[12px] font-mono text-white placeholder:text-neutral-700 outline-none transition focus:border-neutral-700 focus:ring-1 focus:ring-neutral-800 rounded-xl disabled:opacity-40"
            />
            <button
              id="send-btn"
              type="submit"
              disabled={!messageText.trim() || isGenerating}
              className="px-6 rounded-xl text-[11px] font-bold uppercase tracking-wider dot-matrix-btn select-none transition-all flex items-center gap-2"
            >
              {isGenerating ? (
                <DotmSpiral size={12} dotSize={1.5} color="#737373" speed={2} animated />
              ) : (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                </svg>
              )}
              SEND
            </button>
          </form>
        </footer>
      </main>
    </div>
  )
}

export default Dashboard