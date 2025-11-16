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
        upload_website_to_collection(url)
        return JSONResponse(content={ "message": "Website indexed successfully" }, status_code=200)
    except Exception as e:
        return JSONResponse(content={ "message": f"Error indexing website: {str(e)}" }, status_code=500)