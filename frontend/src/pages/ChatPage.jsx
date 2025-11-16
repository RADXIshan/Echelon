import { useState, useRef, useEffect } from 'react'
import api from '../utils.js'

const ChatPage = () => {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [url, setUrl] = useState('')
  const [indexingMessage, setIndexingMessage] = useState('')
  const [showIndexing, setShowIndexing] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const chatContainerRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!question.trim() || loading) return
    
    const userQuestion = question
    setQuestion('')
    setMessages((prev) => [...prev, { question: userQuestion, answer: null, docs: [] }])
    setLoading(true)
    
    try {
      const res = await api.post('/chat', null, { params: { message: userQuestion } })
      const data = res.data
      setMessages((prev) => {
        const newMessages = [...prev]
        newMessages[newMessages.length - 1] = {
          question: data.question,
          answer: data.answer,
          docs: data.docs,
        }
        return newMessages
      })
    } catch (err) {
      console.error(err)
      setMessages((prev) => {
        const newMessages = [...prev]
        newMessages[newMessages.length - 1] = {
          question: userQuestion,
          answer: '❌ Sorry, there was an error processing your request. Please try again.',
          docs: [],
        }
        return newMessages
      })
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const clearChat = () => {
    setMessages([])
    setShowDeleteModal(false)
  }

  const handleIndex = async () => {
    if (!url.trim() || loading) return
    setLoading(true)
    setIndexingMessage('⏳ Indexing in progress...')
    try {
      const res = await api.post('/indexing', null, { params: { url } })
      setIndexingMessage('✅ ' + res.data.message)
      setUrl('')
      setShowIndexing(false)
      setTimeout(() => setIndexingMessage(''), 5000)
    } catch (err) {
      console.error(err)
      setIndexingMessage('❌ Indexing failed. Please check the URL and try again.')
      setTimeout(() => setIndexingMessage(''), 5000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 via-purple-50 to-pink-50 flex justify-center items-stretch">
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 animate-scaleIn">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Clear Chat History</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete all messages? This will permanently remove your entire conversation history.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="cursor-pointer flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-300 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={clearChat}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-300 cursor-pointer font-medium"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-4xl mx-auto flex flex-col h-screen">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-indigo-100 sticky top-0 z-10">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  RAG ChatBot
                </h1>
                <p className="text-xs text-gray-500">Powered by AI</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="cursor-pointer flex items-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all duration-300 font-medium text-sm"
                  title="Clear chat history"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span className="hidden sm:inline">Clear</span>
                </button>
              )}
              <button
                onClick={() => setShowIndexing(!showIndexing)}
                className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-all duration-200 font-medium text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showIndexing ? "M6 18L18 6M6 6l12 12" : "M12 6v6m0 0v6m0-6h6m-6 0H6"} />
                </svg>
                <span className="hidden sm:inline">{showIndexing ? 'Close' : 'Index Website'}</span>
              </button>
            </div>
          </div>

          {/* Indexing section */}
          {showIndexing && (
            <div className="px-6 pb-4 animate-slideDown">
              <div className="bg-linear-to-r from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add a website to the knowledge base
                </label>
                <div className="flex gap-2">
                  <input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="flex-1 px-4 py-2.5 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-white"
                    onKeyDown={(e) => e.key === 'Enter' && handleIndex()}
                  />
                  <button
                    onClick={handleIndex}
                    className="bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    disabled={loading}
                  >
                    {loading ? (
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      'Index'
                    )}
                  </button>
                </div>
                {indexingMessage && (
                  <div className="mt-3 text-sm text-gray-700 bg-white px-3 py-2 rounded-lg animate-fadeIn">
                    {indexingMessage}
                  </div>
                )}
              </div>
            </div>
          )}
        </header>

        {/* Chat messages */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scroll-smooth">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center animate-fadeIn">
              <div className="w-24 h-24 bg-linear-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-6 shadow-lg animate-pulse-slow">
                <svg className="w-12 h-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-3">Welcome to RAG ChatBot</h2>
              <p className="text-gray-500 max-w-md mb-6 leading-relaxed">
                Start a conversation by asking a question below. I can help you find information from indexed websites.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full px-4">
                <button
                  onClick={() => setQuestion("What information do you have?")}
                  className="p-4 bg-white hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 rounded-xl transition-all duration-200 text-left group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-indigo-200 transition-colors">
                      <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 group-hover:text-indigo-700">What information do you have?</p>
                      <p className="text-xs text-gray-500 mt-1">Learn about available knowledge</p>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => setQuestion("How does this chatbot work?")}
                  className="p-4 bg-white hover:bg-purple-50 border border-gray-200 hover:border-purple-300 rounded-xl transition-all duration-200 text-left group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-purple-200 transition-colors">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 group-hover:text-purple-700">How does this work?</p>
                      <p className="text-xs text-gray-500 mt-1">Understand the technology</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} className="space-y-4 animate-fadeIn">
                {/* User bubble */}
                <div className="flex justify-end">
                  <div className="flex items-start gap-2 max-w-[80%]">
                    <div className="bg-linear-to-r from-indigo-500 to-purple-600 text-white px-5 py-3 rounded-2xl rounded-tr-sm shadow-md hover:shadow-lg transition-shadow duration-200">
                      <p className="text-sm leading-relaxed">{m.question}</p>
                    </div>
                    <div className="w-8 h-8 bg-linear-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center shrink-0 shadow-sm">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Bot bubble */}
                <div className="flex justify-start">
                  <div className="flex items-start gap-2 max-w-[80%]">
                    <div className="w-8 h-8 bg-linear-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shrink-0 shadow-md">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div className="bg-white px-5 py-3 rounded-2xl rounded-tl-sm shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-200">
                      {m.answer === null ? (
                        <div className="flex items-center gap-3 text-gray-500">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                          </div>
                          <span className="text-sm font-medium">Thinking...</span>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">{m.answer}</p>
                          {m.docs?.length > 0 && (() => {
                            const uniqueUrls = [...new Set(m.docs.map(d => d.metadata?.source_url).filter(Boolean))]
                            return uniqueUrls.length > 0 ? (
                              <div className="mt-4 pt-3 border-t border-gray-200">
                                <div className="flex items-center gap-1 text-xs font-semibold text-gray-600 mb-2">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Sources
                                </div>
                                <div className="space-y-1.5">
                                  {uniqueUrls.map((url, idx) => (
                                    <a
                                      key={idx}
                                      href={url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="flex items-center gap-2 text-xs text-indigo-600 hover:text-indigo-800 hover:underline transition-colors group"
                                    >
                                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                      </svg>
                                      <span className="truncate">{url}</span>
                                    </a>
                                  ))}
                                </div>
                              </div>
                            ) : null
                          })()}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input (sticky footer) */}
        <div className="bg-white/90 backdrop-blur-xl border-t border-gray-200 px-6 py-4 shadow-lg">
          <form onSubmit={handleSend} className="flex gap-3 max-w-4xl mx-auto relative">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask me anything..."
                className="w-full px-5 py-3.5 pr-12 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-white transition-all duration-200 placeholder:text-gray-400"
                disabled={loading}
              />
              {question && (
                <button
                  type="button"
                  onClick={() => setQuestion('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="cursor-pointer duration-300 bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-3.5 rounded-xl shadow-md hover:shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-medium flex items-center gap-2"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <>
                  <span className="hidden sm:inline">Send</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </>
              )}
            </button>
          </form>
          <p className="text-xs text-gray-400 text-center mt-2">Press Enter to send • Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  )
}

export default ChatPage
