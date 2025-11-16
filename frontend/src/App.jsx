import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import IndexPage from './pages/IndexPage'
import ChatPage from './pages/ChatPage'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
