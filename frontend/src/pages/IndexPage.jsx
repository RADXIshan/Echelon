import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils.js'

const IndexPage = () => {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [indexingMessage, setIndexingMessage] = useState('')
  const navigate = useNavigate()

  const handleIndex = async () => {
    if (!url.trim() || loading) return
    setLoading(true)
    setIndexingMessage('⏳ Indexing in progress...')
    try {
      const res = await api.post('/indexing', null, { params: { url } })
      setIndexingMessage('✅ ' + res.data.message)
      setUrl('')
      setTimeout(() => {
        navigate('/chat')
      }, 1500)
    } catch (err) {
      console.error(err)
      setIndexingMessage('❌ Indexing failed. Please check the URL and try again.')
      setTimeout(() => setIndexingMessage(''), 5000)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 via-purple-50 to-pink-50 flex justify-center items-center p-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8 animate-fadeIn">
          <div className="w-20 h-20 bg-linear-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
            RAG ChatBot
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            Index a website to start chatting with its content
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Enter Website URL
          </label>
          <div className="flex flex-col gap-3">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-gray-50 transition-all"
              onKeyDown={(e) => e.key === 'Enter' && handleIndex()}
              autoFocus
            />
            <button
              onClick={handleIndex}
              className="cursor-pointer duration-300 w-full bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg flex items-center justify-center gap-3"
              disabled={loading || !url.trim()}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Indexing...</span>
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Index Website</span>
                </>
              )}
            </button>
          </div>
          {indexingMessage && (
            <div className="mt-4 text-sm text-gray-700 bg-gray-50 px-4 py-3 rounded-xl animate-fadeIn border border-gray-200">
              {indexingMessage}
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="text-md text-gray-500 mb-3">💡 Try indexing a blog post, documentation page, or article</p>
          <button
            onClick={() => navigate('/chat')}
            className="cursor-pointer duration-300 text-lg text-indigo-600 hover:text-indigo-800 underline"
          >
            Skip to chat →
          </button>
        </div>
      </div>
    </div>
  )
}

export default IndexPage
