# Echelon - RAG-Powered Chatbot

Live Demo: [RAG ChatBot - AI Assistant](https://ragchatbot-client.vercel.app/)

A modern, full-stack RAG (Retrieval-Augmented Generation) chatbot that indexes websites and answers questions based on the indexed content. Built with FastAPI, React, LangChain, and Qdrant vector database.

![Python](https://img.shields.io/badge/python-3.10+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.121+-green.svg)
![React](https://img.shields.io/badge/React-19.2-blue.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## Features

- **Website Indexing**: Scrape and index any website URL into a vector database
- **Intelligent Q&A**: Ask questions and get contextual answers from indexed content
- **Source Attribution**: View source URLs for each answer
- **Modern UI**: Clean, responsive interface with dark mode support
- **Real-time Chat**: Smooth chat experience with loading states and animations
- **Vector Search**: Powered by Qdrant for efficient semantic search
- **LLM Integration**: Uses OpenRouter API for flexible model selection

## Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│                 │         │                  │         │                 │
│  React Frontend │◄───────►│  FastAPI Backend │◄───────►│ Qdrant Vector DB│
│   (Vite + TW)   │         │   (LangChain)    │         │                 │
│                 │         │                  │         │                 │
└─────────────────┘         └──────────────────┘         └─────────────────┘
                                     │
                                     ▼
                            ┌──────────────────┐
                            │                  │
                            │  OpenRouter API  │
                            │  (GPT-3.5 Turbo) │
                            │                  │
                            └──────────────────┘
```

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **LangChain** - LLM orchestration framework
- **Qdrant** - Vector database for embeddings
- **OpenRouter** - LLM API gateway
- **BeautifulSoup4** - Web scraping
- **Python 3.10+**

### Frontend
- **React 19** - UI library
- **Vite** - Build tool
- **TailwindCSS 4** - Styling
- **Axios** - HTTP client
- **React Router** - Navigation

## Prerequisites

- Python 3.10 or higher
- Node.js 18 or higher
- OpenRouter API key ([Get one here](https://openrouter.ai/))
- Qdrant instance (Cloud or self-hosted)

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd echelon
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your credentials
```

**Required Environment Variables:**

```env
PORT=8000
CLIENT_URL=http://localhost:5173
QDRANT_URL=your_qdrant_url
QDRANT_API_KEY=your_qdrant_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
COLLECTION_NAME=my_collection
```

**Start the backend:**

```bash
uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env if needed
```

**Environment Variables:**

```env
VITE_BASE_URL=http://localhost:8000
```

**Start the frontend:**

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Usage

### Indexing a Website

1. Click the "Index Website" button in the header
2. Enter a valid URL (e.g., `https://example.com`)
3. Click "Index" and wait for confirmation
4. The website content will be scraped, chunked, and stored in the vector database

### Asking Questions

1. Type your question in the chat input
2. Press Enter or click "Send"
3. The system will:
   - Retrieve relevant context from indexed documents
   - Generate an answer using the LLM
   - Display the answer with source links

### Managing Chat

- **Clear Chat**: Click the trash icon to delete conversation history
- **Dark Mode**: Toggle theme using the moon/sun icon
- **Suggested Questions**: Click on starter questions when chat is empty

## API Endpoints

### `GET /`
Health check endpoint

**Response:**
```json
{
  "message": "Server is live"
}
```

### `POST /chat`
Send a question and get an answer

**Parameters:**
- `message` (query string): The question to ask

**Response:**
```json
{
  "question": "What is RAG?",
  "answer": "RAG stands for...",
  "docs": [
    {
      "page_content": "...",
      "metadata": {
        "source_url": "https://example.com"
      }
    }
  ]
}
```

### `POST /indexing`
Index a website URL

**Parameters:**
- `url` (query string): The website URL to index

**Response:**
```json
{
  "message": "Website indexed successfully"
}
```

## Project Structure

```
echelon/
├── backend/
│   ├── app/
│   │   ├── app.py           # FastAPI application
│   │   ├── rag.py           # RAG chain logic
│   │   └── qdrant.py        # Vector store operations
│   ├── main.py              # Entry point
│   ├── requirements.txt     # Python dependencies
│   └── .env                 # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── App.jsx          # Main app component
│   │   └── utils.js         # API client
│   ├── package.json         # Node dependencies
│   └── .env                 # Environment variables
└── README.md
```

## Development

### Backend Development

```bash
cd backend

# Run with auto-reload
uvicorn main:app --reload --port 8000

# Run tests (if available)
pytest

# Format code
black app/
```

### Frontend Development

```bash
cd frontend

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Deployment

### Backend (Render)

The backend includes a `render.yaml` configuration for easy deployment to Render:

1. Push your code to GitHub
2. Connect your repository to Render
3. Set environment variables in Render dashboard
4. Deploy

### Frontend (Vercel)

The frontend includes a `vercel.json` configuration:

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the frontend directory
3. Follow the prompts
4. Set `VITE_BASE_URL` to your backend URL

## Configuration

### Customizing the LLM

Edit `backend/app/rag.py`:

```python
model = ChatOpenAI(
    model="openai/gpt-4",  # Change model here
    api_key=OPENROUTER_API_KEY,
    base_url="https://openrouter.ai/api/v1",
    temperature=0.7,  # Adjust creativity
)
```

### Customizing Embeddings

Edit `backend/app/qdrant.py`:

```python
embeddings = OpenRouterEmbeddings(
    api_key=OPENROUTER_API_KEY,
    model="openai/text-embedding-3-large",  # Change embedding model
    batch_size=16,
)
```

### Adjusting Chunk Size

Edit `backend/app/qdrant.py`:

```python
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,  # Adjust chunk size
    chunk_overlap=20,  # Adjust overlap
    length_function=len,
)
```

## Troubleshooting

### Backend Issues

**Import errors:**
```bash
# Ensure virtual environment is activated
source .venv/bin/activate
pip install -r requirements.txt
```

**Qdrant connection errors:**
- Verify `QDRANT_URL` and `QDRANT_API_KEY` in `.env`
- Check if Qdrant instance is running

**OpenRouter API errors:**
- Verify `OPENROUTER_API_KEY` is valid
- Check API quota and rate limits

### Frontend Issues

**CORS errors:**
- Ensure `CLIENT_URL` in backend `.env` matches frontend URL
- Check CORS middleware configuration in `backend/app/app.py`

**Build errors:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Performance Optimization

- **Caching**: Implement Redis for caching frequent queries
- **Batch Processing**: Index multiple pages concurrently
- **CDN**: Use a CDN for frontend assets
- **Database**: Use Qdrant's filtering for faster retrieval
- **Streaming**: Implement streaming responses for better UX

## Security Considerations

- Never commit `.env` files to version control
- Use environment variables for all secrets
- Implement rate limiting on API endpoints
- Validate and sanitize all user inputs
- Use HTTPS in production
- Implement authentication for production use

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

For issues, questions, or contributions, please open an issue on GitHub.

---
