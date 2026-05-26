import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setUser } from '../../auth/auth.slice'
import { useChat } from '../hooks/useChat'
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
})

const Dashboard = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { initializeSocketConnection } = useChat()

  const [chats, setChats] = useState([])
  const [activeChatId, setActiveChatId] = useState(null)
  const [activeChatTitle, setActiveChatTitle] = useState('')
  const [messages, setMessages] = useState([])
  const [messageText, setMessageText] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [sysLog, setSysLog] = useState('SYSTEM READY - NODE STABLE')

  const messagesEndRef = useRef(null)

  // Socket setup
  useEffect(() => {
    const socket = initializeSocketConnection()
    return () => {
      socket?.disconnect()
    }
  }, [])

  // Fetch all chats on load
  const fetchChats = async () => {
    try {
      setSysLog('FETCHING CHAT SESSIONS...')
      const response = await api.get('/api/chats')
      if (response.data?.chats) {
        setChats(response.data.chats)
        setSysLog('SESSIONS SYNCHRONIZED')
      }
    } catch (error) {
      console.error(error)
      setSysLog('ERROR: SYNC_FAILED')
    }
  }

  useEffect(() => {
    fetchChats()
  }, [])

  // Fetch messages for active chat
  const fetchMessages = async (chatId) => {
    try {
      setSysLog(`DECRYPTING SESSION: ${chatId.substring(0, 8)}...`)
      const response = await api.get(`/api/chats/${chatId}/messages`)
      if (response.data?.messages) {
        setMessages(response.data.messages)
        setSysLog('LINK ESTABLISHED - ENCRYPTED')
      }
    } catch (error) {
      console.error(error)
      setSysLog('ERROR: DECRYPTION_FAILED')
    }
  }

  // Handle active chat selection
  const handleSelectChat = (chat) => {
    setActiveChatId(chat._id)
    setActiveChatTitle(chat.title)
    fetchMessages(chat._id)
  }

  // Scroll to bottom of chat
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
    setSysLog('TRANSMITTING PACKETS...')

    // Optimistically add user message to list
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
        chat: activeChatId,
      })

      if (response.data?.success) {
        const { chat: newChat, aiMessageDoc } = response.data

        if (!activeChatId) {
          // New chat was created
          setActiveChatId(newChat._id)
          setActiveChatTitle(newChat.title)
          // Add the AI response message
          setMessages((prev) => {
            // Remove the temporary message and append the correct DB docs
            return [
              ...prev.filter((m) => m._id !== tempUserMsg._id),
              response.data.userMessage,
              aiMessageDoc,
            ]
          })
          fetchChats()
        } else {
          // Existing chat
          setMessages((prev) => {
            return [
              ...prev.filter((m) => m._id !== tempUserMsg._id),
              response.data.userMessage,
              aiMessageDoc,
            ]
          })
        }
        setSysLog('TRANSMISSION COMPLETE')
      }
    } catch (error) {
      console.error(error)
      setSysLog('ERROR: REFUSED_BY_HOST')
      // Append system error warning to chat
      setMessages((prev) => [
        ...prev,
        {
          _id: 'err-' + Date.now(),
          sender: 'ai',
          content: '⚠️ System Error: Unable to complete transmission. Check link status.',
          createdAt: new Date().toISOString(),
        },
      ])
    } finally {
      setIsGenerating(false)
    }
  }

  // Handle Delete Chat
  const handleDeleteChat = async (chatId, e) => {
    e.stopPropagation() // prevent activating chat on delete click
    if (!window.confirm('WARNING: Deleting this node will purge all records. Proceed?')) return

    try {
      setSysLog(`PURGING NODE: ${chatId.substring(0, 8)}`)
      const response = await api.delete(`/api/chats/${chatId}`)
      if (response.data?.success) {
        setSysLog('NODE PURGED SUCCESSFULLY')
        if (activeChatId === chatId) {
          setActiveChatId(null)
          setActiveChatTitle('')
          setMessages([])
        }
        fetchChats()
      }
    } catch (error) {
      console.error(error)
      setSysLog('ERROR: PURGE_REFUSED')
    }
  }

  // Handle Logout
  const handleLogout = () => {
    // Clear token cookie
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    // Reset redux user state
    dispatch(setUser(null))
  }

  return (
    <div className="h-screen w-screen flex bg-black text-neutral-300 font-mono relative overflow-hidden terminal-grid dot-matrix-bg">
      <div className="scanning-line"></div>

      {/* Sidebar - Chat Sessions List */}
      <aside className="w-80 h-full border-r border-neutral-800 bg-black/95 flex flex-col z-20 relative backdrop-blur-md">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-neutral-800 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-white text-xs font-bold tracking-widest font-mono select-none">
              // CORE_TERMINAL_V1
            </span>
            <button
              onClick={handleLogout}
              className="text-[10px] text-neutral-500 hover:text-white px-2 py-0.5 border border-neutral-800 hover:border-neutral-500 rounded transition-colors font-mono select-none cursor-pointer"
            >
              LOGOUT
            </button>
          </div>
          <div className="text-[10px] text-neutral-500 flex justify-between select-none">
            <span>USER: <span className="text-neutral-300">{user?.username || 'GUEST'}</span></span>
            <span className="animate-pulse">● ONLINE</span>
          </div>
        </div>

        {/* New Session Button */}
        <div className="p-4">
          <button
            onClick={() => {
              setActiveChatId(null)
              setActiveChatTitle('')
              setMessages([])
              setSysLog('INITIALIZED NEW CHAT NODE')
            }}
            className="w-full py-3.5 text-xs font-bold uppercase rounded-lg border dot-matrix-btn select-none"
          >
            + Create New Link
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
          <div className="text-[10px] text-neutral-600 font-bold uppercase tracking-wider mb-2 select-none">
            [ active_nodes ]
          </div>
          {chats.length === 0 ? (
            <div className="text-center py-8 text-neutral-600 text-xs select-none">
              NO ACTIVE LINKS
            </div>
          ) : (
            chats.map((chat) => {
              const isActive = chat._id === activeChatId
              return (
                <div
                  key={chat._id}
                  onClick={() => handleSelectChat(chat)}
                  className={`group w-full p-3 rounded-lg border text-left cursor-pointer transition-all duration-200 relative overflow-hidden ${
                    isActive
                      ? 'bg-neutral-900 border-neutral-500 text-white shadow-[0_0_10px_rgba(255,255,255,0.05)]'
                      : 'bg-neutral-950/80 border-neutral-900 hover:bg-neutral-900 hover:border-neutral-700 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {/* Subtle dot matrix grid on active node */}
                  {isActive && (
                    <div className="absolute inset-0 opacity-[0.03] dot-matrix-panel pointer-events-none"></div>
                  )}

                  <div className="flex justify-between items-center relative z-10">
                    <span className="text-xs truncate pr-2 max-w-[180px] font-semibold">
                      {chat.title}
                    </span>
                    <button
                      onClick={(e) => handleDeleteChat(chat._id, e)}
                      className="text-neutral-600 hover:text-neutral-200 p-1 rounded hover:bg-neutral-800 transition-colors cursor-pointer"
                      title="Purge Node"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="text-[9px] text-neutral-600 mt-1 select-none">
                    ID: {chat._id.substring(0, 10)}...
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Sidebar Status Footer */}
        <div className="p-3 border-t border-neutral-800 bg-neutral-950 text-[10px] text-neutral-600 flex justify-between select-none">
          <span>{sysLog}</span>
        </div>
      </aside>

      {/* Main Area - Conversation Log */}
      <main className="flex-1 h-full flex flex-col bg-black/98 z-10 relative">
        {/* Chat Header */}
        <header className="h-16 border-b border-neutral-800 px-6 flex justify-between items-center bg-black/90 backdrop-blur-md relative z-10 select-none">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-neutral-600 animate-pulse"></div>
            <div>
              <h2 className="text-white text-xs uppercase tracking-widest font-bold font-mono">
                {activeChatId ? `SESSION: ${activeChatTitle}` : '// STANDBY_MODE'}
              </h2>
              <p className="text-[9px] text-neutral-600">
                {activeChatId ? `NODE_ID: ${activeChatId}` : 'Awaiting host link initialization...'}
              </p>
            </div>
          </div>

          <div className="text-[10px] text-neutral-500 font-mono">
            SYS_STATUS: <span className="text-neutral-300 font-semibold">{activeChatId ? 'COMM_LIVE' : 'STANDBY'}</span>
          </div>
        </header>

        {/* Messages Logger Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!activeChatId && messages.length === 0 ? (
            /* System Welcome Dashboard */
            <div className="h-full flex flex-col justify-center items-center text-center max-w-xl mx-auto space-y-6 select-none font-mono">
              <div className="p-6 border border-neutral-800 bg-[#080808]/80 rounded-xl relative overflow-hidden max-w-lg shadow-[0_0_50px_rgba(255,255,255,0.01)] dot-matrix-panel">
                <p className="text-xs uppercase tracking-[0.45em] text-neutral-500 font-bold">
                  // HOST_READY
                </p>
                <h1 className="mt-4 text-xl font-bold text-white uppercase tracking-wider">
                  Establish Neural Connection
                </h1>
                <p className="mt-2 text-xs text-neutral-500 leading-relaxed font-semibold">
                  Send a prompt below to launch a new generative agent connection. The AI will assist with diagnostics, queries, or analysis.
                </p>
              </div>

              {/* Suggestions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                {[
                  'Explain quantum physics like a Gen Z helper',
                  'Draft a system report on cybersec standards',
                  'Suggest code optimization for Node.js app',
                  'Generate a startup prompt checklist',
                ].map((promptText, i) => (
                  <button
                    key={i}
                    onClick={() => setMessageText(promptText)}
                    className="p-3 text-[11px] text-left border border-neutral-900 bg-neutral-950/80 hover:bg-neutral-900/60 hover:border-neutral-700 rounded-lg text-neutral-500 hover:text-white transition-all cursor-pointer font-mono"
                  >
                    &gt; {promptText}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Messages List */
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user'
                return (
                  <div
                    key={msg._id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    {/* Message Header Label */}
                    <div className="text-[10px] text-neutral-600 mb-1.5 uppercase font-bold select-none">
                      {isUser ? `[ USER_NODE ]` : `[ AGENT_RESPONSE ]`}
                    </div>

                    {/* Message Content */}
                    <div
                      className={`p-4 rounded-xl text-xs leading-relaxed max-w-[85%] border font-mono whitespace-pre-wrap ${
                        isUser
                          ? 'bg-neutral-950 border-neutral-800 text-white shadow-[0_0_15px_rgba(255,255,255,0.01)]'
                          : 'bg-[#0b0b0b]/90 border-neutral-900 text-neutral-300 shadow-[0_0_30px_rgba(255,255,255,0.02)]'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                )
              })}

              {/* Generative / Thinking indicator */}
              {isGenerating && (
                <div className="flex flex-col items-start">
                  <div className="text-[10px] text-neutral-600 mb-1.5 uppercase font-bold select-none">
                    [ AGENT_STATE ]
                  </div>
                  <div className="p-4 rounded-xl text-xs leading-relaxed bg-[#0b0b0b] border border-neutral-950 text-neutral-500 font-mono italic animate-pulse">
                    Thinking... [PACKETS_IN_TRANSIT]
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar Footer */}
        <footer className="p-4 border-t border-neutral-800 bg-black/90 backdrop-blur-md relative z-20">
          <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto flex gap-3">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="&gt; enter packet instructions..."
              disabled={isGenerating}
              className="flex-1 px-4 py-3.5 border border-neutral-800 bg-[#060606] text-xs font-mono text-white placeholder:text-neutral-700 outline-none transition focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 rounded-lg"
            />
            <button
              type="submit"
              disabled={!messageText.trim() || isGenerating}
              className="px-6 rounded-lg text-xs font-bold uppercase tracking-wider dot-matrix-btn disabled:opacity-30 select-none"
            >
              SEND
            </button>
          </form>
        </footer>
      </main>
    </div>
  )
}

export default Dashboard