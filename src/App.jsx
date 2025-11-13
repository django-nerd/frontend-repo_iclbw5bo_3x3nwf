import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

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

function shimmerClass() {
  return 'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent'
}

function LoadingSkeleton() {
  return (
    <div className="bg-white/80 border rounded-lg p-6 shadow-sm space-y-4">
      <div className={`h-6 w-48 bg-gray-200 rounded ${shimmerClass()}`}></div>
      <div className={`h-4 w-full bg-gray-200 rounded ${shimmerClass()}`}></div>
      <div className={`h-4 w-5/6 bg-gray-200 rounded ${shimmerClass()}`}></div>
      <div className={`h-40 w-full bg-gray-200 rounded ${shimmerClass()}`}></div>
      <div className={`h-32 w-full bg-gray-200 rounded ${shimmerClass()}`}></div>
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
      const nxt = data.next_topic
      if (nxt) {
        setSelectedTopic(nxt)
        loadLesson(nxt)
      }
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => {
    // auto-load initial lesson after init
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

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-[radial-gradient(1200px_800px_at_100%_-10%,rgba(99,102,241,0.08),transparent_60%)] \
      bg-gradient-to-br from-indigo-50 via-white to-sky-50 text-gray-800"
    >
      {/* Floating gradient orbs for subtle depth */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-10 -right-10 h-56 w-56 rounded-full bg-indigo-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-10 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl" />
      </div>

      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45 }}
        className="sticky top-0 z-10 backdrop-blur bg-white/60 border-b border-white/60 shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.4)]"
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-600/90 grid place-items-center text-white font-bold shadow-lg shadow-indigo-600/20">D</div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">DSA Tutor AI</h1>
          </div>
          <div className="flex gap-2 items-center">
            <input
              className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              value={userId}
              onChange={(e)=>setUserId(e.target.value)}
              placeholder="your email or username"
            />
            <select
              className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
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
              className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm shadow-sm hover:bg-indigo-700 transition"
            >
              Start / Resume
            </motion.button>
          </div>
        </div>
      </motion.header>

      <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        <motion.aside
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
          className="md:col-span-3 bg-white/80 rounded-xl shadow-sm border p-4 backdrop-blur"
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
                  className={`group w-full text-left px-3 py-2 rounded-md flex items-center justify-between border transition ${selectedTopic===t ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'hover:bg-gray-50 border-transparent'}`}
                >
                  <span className="truncate">{t}</span>
                  {progress?.completed_topics?.includes(t) && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-green-100 text-green-700 border border-green-200">Done</span>
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
              className="mt-4 text-xs text-gray-700 grid grid-cols-3 gap-2"
            >
              <div className="rounded-md bg-gray-50 p-2 border">
                <div className="text-[10px] uppercase tracking-wide text-gray-500">Completed</div>
                <div className="font-semibold">{progress.completed_topics?.length || 0}</div>
              </div>
              <div className="rounded-md bg-gray-50 p-2 border">
                <div className="text-[10px] uppercase tracking-wide text-gray-500">Current</div>
                <div className="font-semibold truncate">{progress.current_topic || '-'}</div>
              </div>
              <div className="rounded-md bg-gray-50 p-2 border">
                <div className="text-[10px] uppercase tracking-wide text-gray-500">Next</div>
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
                className="bg-red-50 text-red-700 border border-red-200 p-3 rounded-md"
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
              className="bg-white/80 border rounded-xl p-8 text-gray-600 shadow-sm backdrop-blur"
            >
              Start or resume to load your personalized lesson.
            </motion.div>
          )}

          <AnimatePresence mode="popLayout">
            {loading && (
              <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <LoadingSkeleton />
              </motion.div>
            )}

            {lesson && !loading && (
              <motion.div
                key={lesson.topic}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="bg-white/90 border rounded-xl p-6 space-y-4 shadow-sm backdrop-blur"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-indigo-600/10 grid place-items-center text-indigo-700">{lesson.topic.charAt(0)}</div>
                    <h2 className="text-xl font-semibold tracking-tight">{lesson.topic}</h2>
                  </div>
                  <motion.button
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={completeTopic}
                    className="bg-green-600 text-white px-3 py-2 rounded-md text-sm hover:bg-green-700 shadow-sm"
                  >
                    Mark Complete
                  </motion.button>
                </div>

                {lesson.overview && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }} className="text-gray-700 leading-relaxed">
                    {lesson.overview}
                  </motion.p>
                )}

                {lesson.pseudocode && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                    <h3 className="font-semibold mb-2">Pseudocode</h3>
                    <pre className="bg-gray-50 border rounded-lg p-3 overflow-auto text-sm">
                      <code>{lesson.pseudocode}</code>
                    </pre>
                  </motion.div>
                )}

                {lesson.code && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.02 }}>
                    <h3 className="font-semibold mb-2">Example Code ({lang})</h3>
                    <pre className="bg-gray-900 text-white rounded-lg p-3 overflow-auto text-sm">
                      <code>{lesson.code}</code>
                    </pre>
                  </motion.div>
                )}

                {lesson.practice && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.04 }} className="bg-indigo-50/80 border border-indigo-200 rounded-lg p-3">
                    <h3 className="font-semibold">Practice</h3>
                    <div className="text-sm"><span className="font-semibold">{lesson.practice.title}:</span> {lesson.practice.prompt}</div>
                    {lesson.practice.examples && (
                      <div className="text-xs mt-1 text-gray-700">Example: {lesson.practice.examples.in} → {lesson.practice.examples.out}</div>
                    )}
                    <div className="text-xs mt-2 text-gray-600">Note: {lesson.complexity_note}</div>
                  </motion.div>
                )}

                <div className="flex items-center justify-between pt-1 text-xs text-gray-500">
                  <div>Language: <span className="font-medium text-gray-700">{lang}</span></div>
                  <div className="italic">Smooth transitions enabled</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="text-xs text-gray-500"
          >
            Boundaries: I only discuss Data Structures and Algorithms. For off-topic questions, I will reply: "Sorry, I can only discuss topics related to Data Structures and Algorithms."
          </motion.div>
        </section>
      </main>

      <style>{`
        @keyframes shimmer { 100% { transform: translateX(100%); } }
      `}</style>
    </motion.div>
  )
}

export default App
