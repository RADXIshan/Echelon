import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils.js'
import ThemeToggle from '../components/ThemeToggle'

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
    <div className="min-h-screen bg-white dark:bg-gray-900 flex justify-center items-center p-6 transition-colors">
      <div className="cursor-pointer absolute top-6 right-6">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8 animate-fadeIn">
          <div className="w-16 h-16 bg-black dark:bg-white rounded-xl flex items-center justify-center mx-auto mb-6">
            <img src="/logo.png" alt="Echelon Logo" className="w-12 h-12" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-3">
            Echelon
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">
            Index a website to start chatting with its content
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 border border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
            Enter Website URL
          </label>
          <div className="flex flex-col gap-3">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all"
              onKeyDown={(e) => e.key === 'Enter' && handleIndex()}
              autoFocus
            />
            <button
              onClick={handleIndex}
              className="cursor-pointer duration-200 w-full bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black px-6 py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-base flex items-center justify-center gap-2"
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
            <div className="mt-4 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 px-4 py-3 rounded-lg animate-fadeIn border border-gray-200 dark:border-gray-600">
              {indexingMessage}
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">� Try indexing a blog post, documentation page, or article</p>
          <button
            onClick={() => navigate('/chat')}
            className="cursor-pointer duration-200 text-md text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 underline font-medium"
          >
            Skip to chat →
          </button>
        </div>
      </div>
    </div>
  )
}

export default IndexPage
