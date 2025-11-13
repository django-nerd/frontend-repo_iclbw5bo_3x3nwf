import { useEffect, useState } from 'react'

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

function App() {
  const [userId, setUserId] = useState('student@example.com')
  const [lang, setLang] = useState('python')
  const [progress, setProgress] = useState(null)
  const [selectedTopic, setSelectedTopic] = useState('Introduction to DSA')
  const [lesson, setLesson] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50 text-gray-800">
      <header className="sticky top-0 z-10 backdrop-blur bg-white/70 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold">DSA Tutor AI</h1>
          <div className="flex gap-2 items-center">
            <input
              className="border rounded px-2 py-1 text-sm"
              value={userId}
              onChange={(e)=>setUserId(e.target.value)}
              placeholder="your email or username"
            />
            <select className="border rounded px-2 py-1 text-sm" value={lang} onChange={(e)=>setLang(e.target.value)}>
              <option>python</option>
              <option>cpp</option>
              <option>java</option>
              <option>c</option>
            </select>
            <button onClick={init} className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700">Start / Resume</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        <aside className="md:col-span-3 bg-white rounded-lg shadow-sm border p-4">
          <h2 className="font-semibold mb-3">Roadmap</h2>
          <ol className="space-y-1 text-sm">
            {TOPICS.map(t => (
              <li key={t}>
                <button
                  onClick={()=>{ setSelectedTopic(t); loadLesson(t); }}
                  className={`w-full text-left px-2 py-1 rounded ${selectedTopic===t? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'hover:bg-gray-50'}`}
                >
                  {t}
                </button>
              </li>
            ))}
          </ol>
          {progress && (
            <div className="mt-4 text-xs text-gray-600">
              <div>Completed: {progress.completed_topics?.length || 0}</div>
              <div>Current: {progress.current_topic}</div>
              <div>Next: {progress.next_topic || 'All done 🎉'}</div>
            </div>
          )}
        </aside>

        <section className="md:col-span-9 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded">{error}</div>
          )}

          {!lesson && (
            <div className="bg-white border rounded-lg p-6 text-gray-600">Start or resume to load your personalized lesson.</div>
          )}

          {lesson && (
            <div className="bg-white border rounded-lg p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{lesson.topic}</h2>
                <button onClick={completeTopic} className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">Mark Complete</button>
              </div>

              <p className="text-gray-700">{lesson.overview}</p>

              {lesson.pseudocode && (
                <div>
                  <h3 className="font-semibold mb-2">Pseudocode</h3>
                  <pre className="bg-gray-50 border rounded p-3 overflow-auto text-sm"><code>{lesson.pseudocode}</code></pre>
                </div>
              )}

              {lesson.code && (
                <div>
                  <h3 className="font-semibold mb-2">Example Code ({lang})</h3>
                  <pre className="bg-gray-900 text-white rounded p-3 overflow-auto text-sm"><code>{lesson.code}</code></pre>
                </div>
              )}

              {lesson.practice && (
                <div className="bg-indigo-50 border border-indigo-200 rounded p-3">
                  <h3 className="font-semibold">Practice</h3>
                  <div className="text-sm"><span className="font-semibold">{lesson.practice.title}:</span> {lesson.practice.prompt}</div>
                  {lesson.practice.examples && (
                    <div className="text-xs mt-1 text-gray-700">Example: {lesson.practice.examples.in} → {lesson.practice.examples.out}</div>
                  )}
                  <div className="text-xs mt-2 text-gray-600">Note: {lesson.complexity_note}</div>
                </div>
              )}
            </div>
          )}

          <div className="text-xs text-gray-500">
            Boundaries: I only discuss Data Structures and Algorithms. For off-topic questions, I will reply: "Sorry, I can only discuss topics related to Data Structures and Algorithms."
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
