import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.rag import get_answer_and_docs
from app.qdrant import upload_website_to_collection, create_collection_if_not_exists, collection_name

load_dotenv()

CLIENT_URL = os.getenv("CLIENT_URL", "http://localhost:5173")

app = FastAPI(
    title="RAG ChatBot API",
    version="1.0",
    description="API for RAG ChatBot",
)

@app.on_event("startup")
def startup_event():
    create_collection_if_not_exists(collection_name)

origins = [
    CLIENT_URL,
    "https://ragchatbot-client.vercel.app",
    "https://localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def server_status():
    return JSONResponse(content={ "message": "Server is live" }, status_code=200)

@app.post("/chat", description="Chat with RAG API through this endpoint")
def chat(message: str):
    response = get_answer_and_docs(message)
    response_content = {
        "question": message,
        "answer": response["answer"],
        "docs": [doc.dict() for doc in response["context"]],
    }
    return JSONResponse(content=response_content, status_code=200)

@app.post("/indexing", description="Index a website URL through this endpoint")
def indexing(url: str):
    try:
        print(f"Attempting to index URL: {url}")
        
        # Validate URL format
        if not url or not url.strip():
            return JSONResponse(content={ "message": "URL cannot be empty" }, status_code=400)
        
        if not (url.startswith("http://") or url.startswith("https://")):
            return JSONResponse(content={ "message": "URL must start with http:// or https://" }, status_code=400)
        
        result = upload_website_to_collection(url)
        print(f"Indexing result: {result}")
        return JSONResponse(content={ "message": "Website indexed successfully" }, status_code=200)
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Error indexing website: {error_details}")
        return JSONResponse(content={ "message": f"Error indexing website: {str(e)}" }, status_code=500)