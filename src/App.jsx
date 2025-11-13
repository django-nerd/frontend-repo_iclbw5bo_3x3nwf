import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Sun, Moon, Sparkles } from 'lucide-react'

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

const TOPICS = [
  'Introduction to DSA',
  'Arrays & Strings',
  'Linked Lists',
  'Stacks & Queues',
  'Recursion',
  'Trees & Binary Trees',
  'Heaps & Hashing',
  'Graphs',
  'Sorting & Searching Algorithms',
  'Advanced Algorithms',
  'Problem Solving',
]

function cx(...classes) {
  return classes.filter(Boolean).join(' ')
}

function shimmerClass() {
  return 'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent'
}

function LoadingSkeleton({ dark }) {
  return (
    <div className={cx(
      'border rounded-lg p-6 shadow-sm space-y-4',
      dark ? 'bg-white/5 border-white/10' : 'bg-white/80'
    )}>
      <div className={cx('h-6 w-48 rounded', dark ? 'bg-white/10' : 'bg-gray-200', shimmerClass())}></div>
      <div className={cx('h-4 w-full rounded', dark ? 'bg-white/10' : 'bg-gray-200', shimmerClass())}></div>
      <div className={cx('h-4 w-5/6 rounded', dark ? 'bg-white/10' : 'bg-gray-200', shimmerClass())}></div>
      <div className={cx('h-40 w-full rounded', dark ? 'bg-white/10' : 'bg-gray-200', shimmerClass())}></div>
      <div className={cx('h-32 w-full rounded', dark ? 'bg-white/10' : 'bg-gray-200', shimmerClass())}></div>
    </div>
  )
}

function ConfettiBurst({ show, onDone }) {
  if (!show) return null
  const pieces = Array.from({ length: 36 })
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-visible">
      {pieces.map((_, i) => {
        const angle = (i / pieces.length) * Math.PI * 2
        const distance = 240 + Math.random() * 120
        const x = Math.cos(angle) * distance
        const y = Math.sin(angle) * distance
        const delay = Math.random() * 0.05
        const size = 6 + Math.random() * 8
        const colors = ['#6366F1', '#22D3EE', '#F59E0B', '#10B981', '#EF4444']
        const color = colors[i % colors.length]
        return (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, scale: 0.9, opacity: 1, rotate: 0 }}
            animate={{ x, y, scale: 1, opacity: 0, rotate: 180 + Math.random() * 180 }}
            transition={{ duration: 1.2 + Math.random() * 0.4, delay, ease: 'easeOut' }}
            onAnimationComplete={i === pieces.length - 1 ? onDone : undefined}
            className="absolute left-1/2 top-1/2"
          >
            <div style={{ width: size, height: size, background: color }} className="rounded-sm shadow" />
          </motion.div>
        )
      })}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <div className="flex items-center gap-2 rounded-full px-4 py-2 bg-white/80 backdrop-blur border shadow-sm">
          <Sparkles size={16} className="text-indigo-600" />
          <span className="text-sm font-medium text-gray-700">Topic completed!</span>
        </div>
      </motion.div>
    </div>
  )
}

function ChatWidget({ userId, topic, dark }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [err, setErr] = useState('')

  const sendMessage = async () => {
    if (!input.trim() || sending) return
    setErr('')
    const userTurn = { role: 'user', message: input }
    setMessages((m) => [...m, userTurn])
    setInput('')
    setSending(true)
    try {
      const res = await fetch(`${BACKEND}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, message: userTurn.message, topic }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Failed to get reply')
      const assistantTurn = { role: 'assistant', message: data.reply }
      setMessages((m) => [...m, assistantTurn])
    } catch (e) {
      setErr(e.message)
    } finally {
      setSending(false)
    }
  }

  const containerClass = cx(
    'fixed bottom-4 right-4 z-40',
  )

  return (
    <div className={containerClass}>
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className={cx('w-[92vw] sm:w-96 rounded-xl shadow-lg border overflow-hidden backdrop-blur', dark ? 'bg-slate-900/90 border-white/10' : 'bg-white/95 border-gray-200')}
          >
            <div className={cx('px-4 py-3 border-b flex items-center justify-between', dark ? 'border-white/10' : 'border-gray-200')}>
              <div className="flex items-center gap-2">
                <div className={cx('h-6 w-6 rounded-md grid place-items-center', dark ? 'bg-indigo-500/20 text-indigo-200' : 'bg-indigo-600/10 text-indigo-700')}>
                  <Sparkles size={14} />
                </div>
                <div className="text-sm font-semibold">Ask a doubt</div>
              </div>
              <button onClick={() => setOpen(false)} className={cx('text-xs px-2 py-1 rounded border', dark ? 'border-white/10 hover:bg-white/5' : 'border-gray-200 hover:bg-gray-50')}>Close</button>
            </div>

            <div className={cx('max-h-80 overflow-y-auto p-3 space-y-2 text-sm', dark ? 'text-slate-100' : 'text-gray-800')}>
              {messages.length === 0 && (
                <div className={cx('text-xs', dark ? 'text-slate-400' : 'text-gray-500')}>Tips: Ask about arrays, graphs, DP, complexity… Off-topic questions get a gentle reminder.</div>
              )}
              {messages.map((m, idx) => (
                <div key={idx} className={cx('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                  <div className={cx('px-3 py-2 rounded-lg border max-w-[80%]',
                    m.role === 'user'
                      ? (dark ? 'bg-indigo-500/20 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200')
                      : (dark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200')
                  )}>{m.message}</div>
                </div>
              ))}
              {err && (
                <div className={cx('text-xs', dark ? 'text-red-300' : 'text-red-600')}>{err}</div>
              )}
            </div>

            <div className={cx('p-3 border-t flex items-center gap-2', dark ? 'border-white/10' : 'border-gray-200')}>
              <input
                value={input}
                onChange={(e)=>setInput(e.target.value)}
                onKeyDown={(e)=>{ if(e.key==='Enter') sendMessage() }}
                placeholder={`Ask about ${topic || 'DSA'}…`}
                className={cx('flex-1 rounded-md px-3 py-2 text-sm border focus:outline-none focus:ring-2', dark ? 'bg-slate-800/80 border-white/10 text-slate-100 focus:ring-indigo-500' : 'bg-white border-gray-300 focus:ring-indigo-500')}
              />
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                disabled={sending}
                onClick={sendMessage}
                className={cx('px-3 py-2 rounded-md text-sm shadow-sm', sending ? (dark ? 'bg-slate-700 text-slate-300' : 'bg-gray-200 text-gray-500') : (dark ? 'bg-indigo-500 text-white hover:bg-indigo-500/90' : 'bg-indigo-600 text-white hover:bg-indigo-700'))}
              >
                {sending ? 'Sending…' : 'Send'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen(v => !v)}
        aria-label="Open chat"
        className={cx('rounded-full shadow-lg border p-3 flex items-center gap-2', dark ? 'bg-indigo-500 text-white border-indigo-400/40 hover:bg-indigo-500/90' : 'bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-700')}
      >
        <Sparkles size={18} />
        <span className="hidden sm:inline text-sm font-medium">Chat</span>
      </motion.button>
    </div>
  )
}

function App() {
  const [userId, setUserId] = useState('student@example.com')
  const [lang, setLang] = useState('python')
  const [progress, setProgress] = useState(null)
  const [selectedTopic, setSelectedTopic] = useState('Introduction to DSA')
  const [lesson, setLesson] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dark, setDark] = useState(false)
  const [confetti, setConfetti] = useState(false)

  const nextTopic = useMemo(() => progress?.next_topic ?? null, [progress])

  const init = async () => {
    setError('')
    try {
      const res = await fetch(`${BACKEND}/api/progress/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, preferred_language: lang }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Init failed')
      setProgress(data)
      setSelectedTopic(data.next_topic || TOPICS[0])
    } catch (e) {
      setError(e.message)
    }
  }

  const loadLesson = async (topic) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${BACKEND}/api/lesson/${encodeURIComponent(topic)}?lang=${lang}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Failed to load lesson')
      setLesson(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const completeTopic = async () => {
    setError('')
    try {
      const res = await fetch(`${BACKEND}/api/progress/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, topic: selectedTopic }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Failed to update progress')
      setProgress(data)
      // Confetti micro-celebration
      setConfetti(true)
      const timer = setTimeout(() => setConfetti(false), 1600)
      // Load next topic if available
      const nxt = data.next_topic
      if (nxt) {
        setSelectedTopic(nxt)
        loadLesson(nxt)
      }
      return () => clearTimeout(timer)
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => {
    if (progress && (progress.next_topic || TOPICS[0])) {
      loadLesson(progress.next_topic || TOPICS[0])
    }
  }, [progress])

  // Variants for motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6 } },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
  }

  const listItemVariants = {
    initial: { opacity: 0, x: -8 },
    in: { opacity: 1, x: 0, transition: { duration: 0.25 } },
  }

  const rootBg = dark
    ? 'bg-[radial-gradient(1200px_800px_at_100%_-10%,rgba(99,102,241,0.12),transparent_60%)] from-slate-950 via-slate-900 to-slate-900 text-slate-100'
    : 'bg-[radial-gradient(1200px_800px_at_100%_-10%,rgba(99,102,241,0.08),transparent_60%)] from-indigo-50 via-white to-sky-50 text-gray-800'

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={cx('min-h-screen bg-gradient-to-br', rootBg)}
    >
      {/* Background orbs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className={cx('absolute -top-10 -right-10 h-56 w-56 rounded-full blur-3xl', dark ? 'bg-indigo-400/20' : 'bg-indigo-400/10')} />
        <div className={cx('absolute bottom-0 left-10 h-64 w-64 rounded-full blur-3xl', dark ? 'bg-sky-400/20' : 'bg-sky-400/10')} />
      </div>

      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45 }}
        className={cx(
          'sticky top-0 z-10 backdrop-blur border-b shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.4)]',
          dark ? 'bg-slate-900/50 border-white/10' : 'bg-white/60 border-white/60'
        )}
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cx('h-8 w-8 rounded-lg grid place-items-center font-bold shadow-lg', dark ? 'bg-indigo-500/30 text-indigo-200 shadow-indigo-600/10' : 'bg-indigo-600/90 text-white shadow-indigo-600/20')}>D</div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">DSA Tutor AI</h1>
          </div>
          <div className="flex gap-2 items-center">
            <input
              className={cx('rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 transition border', dark ? 'bg-slate-800/70 border-white/10 text-slate-100 placeholder:text-slate-400 focus:ring-indigo-500' : 'bg-white border-gray-300 text-gray-800 focus:ring-indigo-500')}
              value={userId}
              onChange={(e)=>setUserId(e.target.value)}
              placeholder="your email or username"
            />
            <select
              className={cx('rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 transition border', dark ? 'bg-slate-800/70 border-white/10 text-slate-100 focus:ring-indigo-500' : 'bg-white border-gray-300 text-gray-800 focus:ring-indigo-500')}
              value={lang}
              onChange={(e)=>setLang(e.target.value)}
            >
              <option>python</option>
              <option>cpp</option>
              <option>java</option>
              <option>c</option>
            </select>
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={init}
              className={cx('px-4 py-2 rounded-md text-sm shadow-sm transition', dark ? 'bg-indigo-500 text-white hover:bg-indigo-500/90' : 'bg-indigo-600 text-white hover:bg-indigo-700')}
            >
              Start / Resume
            </motion.button>
            <motion.button
              whileHover={{ rotate: 10 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDark(v => !v)}
              aria-label="Toggle theme"
              className={cx('p-2 rounded-md border transition', dark ? 'bg-slate-800/70 border-white/10 text-slate-100' : 'bg-white/80 border-gray-200 text-gray-700')}
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </motion.button>
          </div>
        </div>
      </motion.header>

      <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        <motion.aside
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
          className={cx('md:col-span-3 rounded-xl shadow-sm border p-4 backdrop-blur', dark ? 'bg-white/5 border-white/10' : 'bg-white/80')}
        >
          <h2 className="font-semibold mb-3">Roadmap</h2>
          <ol className="space-y-1 text-sm">
            {TOPICS.map((t, idx) => (
              <motion.li
                key={t}
                variants={listItemVariants}
                initial="initial"
                animate="in"
                transition={{ delay: 0.02 * idx }}
              >
                <motion.button
                  onClick={()=>{ setSelectedTopic(t); loadLesson(t); }}
                  whileHover={{ x: 2 }}
                  className={cx(
                    'group w-full text-left px-3 py-2 rounded-md flex items-center justify-between border transition',
                    selectedTopic===t
                      ? (dark ? 'bg-indigo-500/10 text-indigo-200 border-indigo-500/30' : 'bg-indigo-50 text-indigo-700 border-indigo-200')
                      : (dark ? 'hover:bg-white/5 border-transparent' : 'hover:bg-gray-50 border-transparent')
                  )}
                >
                  <span className="truncate">{t}</span>
                  {progress?.completed_topics?.includes(t) && (
                    <span className={cx('text-[10px] px-2 py-0.5 rounded border', dark ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' : 'bg-green-100 text-green-700 border-green-200')}>Done</span>
                  )}
                </motion.button>
              </motion.li>
            ))}
          </ol>
          {progress && (
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="mt-4 text-xs grid grid-cols-3 gap-2"
            >
              <div className={cx('rounded-md p-2 border', dark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border') }>
                <div className={cx('text-[10px] uppercase tracking-wide', dark ? 'text-slate-400' : 'text-gray-500')}>Completed</div>
                <div className="font-semibold">{progress.completed_topics?.length || 0}</div>
              </div>
              <div className={cx('rounded-md p-2 border', dark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border') }>
                <div className={cx('text-[10px] uppercase tracking-wide', dark ? 'text-slate-400' : 'text-gray-500')}>Current</div>
                <div className="font-semibold truncate">{progress.current_topic || '-'}</div>
              </div>
              <div className={cx('rounded-md p-2 border', dark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border') }>
                <div className={cx('text-[10px] uppercase tracking-wide', dark ? 'text-slate-400' : 'text-gray-500')}>Next</div>
                <div className="font-semibold truncate">{nextTopic || 'All done 🎉'}</div>
              </div>
            </motion.div>
          )}
        </motion.aside>

        <section className="md:col-span-9 space-y-4">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className={cx('border p-3 rounded-md', dark ? 'bg-red-500/10 text-red-200 border-red-500/30' : 'bg-red-50 text-red-700 border-red-200')}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {!lesson && !loading && (
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className={cx('border rounded-xl p-8 shadow-sm backdrop-blur', dark ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-white/80 text-gray-600')}
            >
              Start or resume to load your personalized lesson.
            </motion.div>
          )}

          <AnimatePresence mode="popLayout">
            {loading && (
              <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <LoadingSkeleton dark={dark} />
              </motion.div>
            )}

            {lesson && !loading && (
              <motion.div
                key={lesson.topic}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                whileHover={{ y: -2, rotate: -0.15 }}
                transition={{ type: 'spring', stiffness: 220, damping: 22 }}
                className={cx('border rounded-xl p-6 space-y-4 shadow-sm backdrop-blur', dark ? 'bg-white/5 border-white/10' : 'bg-white/90')}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className={cx('h-8 w-8 rounded-lg grid place-items-center', dark ? 'bg-indigo-500/10 text-indigo-200' : 'bg-indigo-600/10 text-indigo-700')}>{lesson.topic.charAt(0)}</div>
                    <h2 className="text-xl font-semibold tracking-tight">{lesson.topic}</h2>
                  </div>
                  <motion.button
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={completeTopic}
                    className={cx('px-3 py-2 rounded-md text-sm shadow-sm', dark ? 'bg-emerald-500 text-white hover:bg-emerald-500/90' : 'bg-green-600 text-white hover:bg-green-700')}
                  >
                    Mark Complete
                  </motion.button>
                </div>

                {lesson.overview && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }} className={cx('leading-relaxed', dark ? 'text-slate-200' : 'text-gray-700')}>
                    {lesson.overview}
                  </motion.p>
                )}

                {lesson.pseudocode && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                    <h3 className="font-semibold mb-2">Pseudocode</h3>
                    <pre className={cx('rounded-lg p-3 overflow-auto text-sm border', dark ? 'bg-slate-900 text-slate-100 border-white/10' : 'bg-gray-50 text-gray-800') }>
                      <code>{lesson.pseudocode}</code>
                    </pre>
                  </motion.div>
                )}

                {lesson.code && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.02 }}>
                    <h3 className="font-semibold mb-2">Example Code ({lang})</h3>
                    <pre className={cx('rounded-lg p-3 overflow-auto text-sm border', dark ? 'bg-slate-900 text-slate-100 border-white/10' : 'bg-gray-900 text-white') }>
                      <code>{lesson.code}</code>
                    </pre>
                  </motion.div>
                )}

                {lesson.practice && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.04 }} className={cx('rounded-lg p-3 border', dark ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-indigo-50/80 border-indigo-200')}>
                    <h3 className="font-semibold">Practice</h3>
                    <div className="text-sm"><span className="font-semibold">{lesson.practice.title}:</span> {lesson.practice.prompt}</div>
                    {lesson.practice.examples && (
                      <div className={cx('text-xs mt-1', dark ? 'text-slate-300' : 'text-gray-700')}>Example: {lesson.practice.examples.in} → {lesson.practice.examples.out}</div>
                    )}
                    <div className={cx('text-xs mt-2', dark ? 'text-slate-400' : 'text-gray-600')}>Note: {lesson.complexity_note}</div>
                  </motion.div>
                )}

                <div className={cx('flex items-center justify-between pt-1 text-xs', dark ? 'text-slate-400' : 'text-gray-500')}>
                  <div>Language: <span className={cx('font-medium', dark ? 'text-slate-200' : 'text-gray-700')}>{lang}</span></div>
                  <div className="italic">Smooth transitions enabled</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className={cx('text-xs', dark ? 'text-slate-400' : 'text-gray-500')}
          >
            Boundaries: I only discuss Data Structures and Algorithms. For off-topic questions, I will reply: "Sorry, I can only discuss topics related to Data Structures and Algorithms."
          </motion.div>
        </section>
      </main>

      <AnimatePresence>
        {confetti && (
          <ConfettiBurst show={confetti} onDone={() => setConfetti(false)} />
        )}
      </AnimatePresence>

      {/* Floating Chat Widget */}
      <ChatWidget userId={userId} topic={selectedTopic} dark={dark} />

      <style>{`
        @keyframes shimmer { 100% { transform: translateX(100%); } }
      `}</style>
    </motion.div>
  )
}

export default App
