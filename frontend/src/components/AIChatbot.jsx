import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bot, X, Send, Loader2, Sparkles, ChevronDown } from "lucide-react"

const API = `${import.meta.env.VITE_API_URL}/chat`


// Format markdown bold (**text**) to <strong>
function formatReply(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**")
      ? <strong key={i} className="text-white">{p.slice(2, -2)}</strong>
      : p
  )
}

function Message({ msg }) {
  const isUser = msg.role === "user"
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div
          className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dark))", boxShadow: "0 0 10px var(--accent-glow)" }}
        >
          <Bot size={14} className="text-white" />
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${isUser ? "rounded-br-sm" : "rounded-bl-sm"}`}
        style={
          isUser
            ? { background: "linear-gradient(135deg, var(--accent), var(--accent-dark))", color: "white" }
            : { background: "rgba(19,25,40,0.9)", border: "1px solid rgba(30,42,58,0.8)", color: "#e8edf5" }
        }
      >
        {isUser ? msg.content : formatReply(msg.content)}
      </div>
    </motion.div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-2.5 justify-start">
      <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dark))" }}>
        <Bot size={14} className="text-white" />
      </div>
      <div className="rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center"
        style={{ background: "rgba(19,25,40,0.9)", border: "1px solid rgba(30,42,58,0.8)" }}>
        {[0, 1, 2].map(i => (
          <motion.div key={i} className="w-1.5 h-1.5 rounded-full"
            style={{ background: "var(--accent)" }}
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </div>
  )
}

// Suggested quick questions
const SUGGESTIONS = [
  "What is growth rate r?",
  "How does chemo strength work?",
  "What does reduction % mean?",
  "Explain the logistic model",
]

export default function AIChatbot({ simulationContext = null }) {
  const [open,    setOpen   ] = useState(false)
  const [input,   setInput  ] = useState("")
  const [history, setHistory] = useState([
    { role: "assistant", content: "Hi! I'm **OncoSim AI** 🧬 Ask me anything about the simulation, parameters, or what your results mean." }
  ])
  const [loading, setLoading] = useState(false)
  const [unread,  setUnread ] = useState(0)
  const bottomRef   = useRef(null)
  const inputRef    = useRef(null)

  // Auto-scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [history, loading])

  // Focus input when opened
  useEffect(() => {
    if (open) { setTimeout(() => inputRef.current?.focus(), 200) }
  }, [open])

  async function sendMessage(text) {
    const msg = text ?? input.trim()
    if (!msg || loading) return
    setInput("")

    const userMsg = { role: "user", content: msg }
    const newHistory = [...history, userMsg]
    setHistory(newHistory)
    setLoading(true)

    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          history: newHistory.slice(-10),
          context: simulationContext,
        }),
      })
      const data = await res.json()
      setHistory(h => [...h, { role: "assistant", content: data.reply }])
      if (!open) setUnread(u => u + 1)
    } catch {
      setHistory(h => [...h, { role: "assistant", content: "Sorry, I can't reach the backend right now. Make sure FastAPI is running at http://127.0.0.1:8000" }])
    } finally {
      setLoading(false)
    }
  }

  function handleOpen() {
    setOpen(true)
    setUnread(0)
  }

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={open ? () => setOpen(false) : handleOpen}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl"
        style={{
          background: "linear-gradient(135deg, var(--accent), var(--accent-dark))",
          boxShadow: `0 8px 32px var(--accent-glow)`,
        }}
      >
        <AnimatePresence mode="wait">
          {open
            ? <motion.div key="x"   initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}><X size={22} className="text-white" /></motion.div>
            : <motion.div key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}><Bot size={22} className="text-white" /></motion.div>
          }
        </AnimatePresence>

        {/* Unread badge */}
        {!open && unread > 0 && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
            style={{ background: "#ef4444" }}>
            {unread}
          </motion.div>
        )}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="fixed bottom-24 right-6 z-[9998] w-[360px] flex flex-col rounded-3xl overflow-hidden shadow-2xl"
            style={{
              height: "520px",
              background: "rgba(10,14,24,0.97)",
              border: "1px solid rgba(30,42,58,0.9)",
              boxShadow: "0 32px 80px rgba(0,0,0,0.8)",
              backdropFilter: "blur(20px)",
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 shrink-0"
              style={{ borderBottom: "1px solid rgba(30,42,58,0.8)", background: "rgba(15,20,32,0.8)" }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dark))", boxShadow: "0 0 12px var(--accent-glow)" }}>
                <Bot size={16} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white flex items-center gap-1.5">
                  OncoSim AI <Sparkles size={11} style={{ color: "var(--accent)" }} />
                </p>
                <p className="text-[10px]" style={{ color: "#4a5568" }}>
                  {simulationContext ? "✓ Simulation results loaded" : "Oncology simulation assistant"}
                </p>
              </div>
              <button onClick={() => setOpen(false)}>
                <ChevronDown size={16} style={{ color: "#4a5568" }} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {history.map((msg, i) => <Message key={i} msg={msg} />)}
              {loading && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>

            {/* Suggestions (only when first message) */}
            {history.length <= 1 && !loading && (
              <div className="px-4 pb-3 flex flex-wrap gap-1.5">
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => sendMessage(s)}
                    className="text-xs px-3 py-1.5 rounded-full transition-all"
                    style={{ background: "var(--accent-soft)", border: "1px solid var(--accent-border)", color: "var(--accent-light)" }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--accent-dim)"}
                    onMouseLeave={e => e.currentTarget.style.background = "var(--accent-soft)"}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-4 pb-4 shrink-0"
              style={{ borderTop: "1px solid rgba(30,42,58,0.8)", paddingTop: 12 }}>
              <div className="flex gap-2 items-end">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                  placeholder="Ask about the simulation…"
                  className="flex-1 px-4 py-2.5 rounded-2xl text-sm text-white outline-none resize-none"
                  style={{
                    background: "rgba(19,25,40,0.9)",
                    border: "1px solid rgba(30,42,58,0.8)",
                  }}
                  onFocus={e  => { e.currentTarget.style.borderColor = "var(--accent-border-hi)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--accent-soft)" }}
                  onBlur={e   => { e.currentTarget.style.borderColor = "rgba(30,42,58,0.8)"; e.currentTarget.style.boxShadow = "none" }}
                />
                <motion.button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 disabled:opacity-40"
                  style={{
                    background: "linear-gradient(135deg, var(--accent), var(--accent-dark))",
                    boxShadow: input.trim() ? "0 4px 16px var(--accent-glow)" : "none",
                  }}
                >
                  {loading
                    ? <Loader2 size={16} className="text-white animate-spin" />
                    : <Send size={16} className="text-white" />
                  }
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
