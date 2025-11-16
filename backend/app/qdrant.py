import os
import time
import requests
from dotenv import load_dotenv
from qdrant_client import QdrantClient, models
from qdrant_client.http import models as http_models 
from langchain_qdrant import Qdrant
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import WebBaseLoader
from langchain.embeddings.base import Embeddings

load_dotenv()

# --- Basic config (pull from .env) ---
QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY") 
collection_name = os.getenv("COLLECTION_NAME", "my_collection")

# Ensure we have a sensible USER_AGENT (Web loaders warn otherwise)
if not os.getenv("USER_AGENT"):
    os.environ["USER_AGENT"] = "my-scraper/1.0 (mailto:you@example.com)"

if not OPENROUTER_API_KEY:
    raise RuntimeError("OPENROUTER_API_KEY not found in environment. Set it in .env and re-run.")

# Initialize Qdrant client
qdrant_client = QdrantClient(
    url=QDRANT_URL,
    api_key=QDRANT_API_KEY,
)

# Text splitter
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=20,
    length_function=len,
)

# -----------------------------
# OpenRouter embeddings (LangChain-compatible)
# -----------------------------
class OpenRouterEmbeddings(Embeddings):
    """
    LangChain-compatible embeddings wrapper for OpenRouter embeddings endpoint.
    Implements embed_documents, embed_query, and makes the object callable.
    """
    def __init__(self, api_key: str, model: str = "openai/text-embedding-3-small", batch_size: int = 16, timeout: int = 60):
        self.api_key = api_key
        self.model = model
        self.endpoint = "https://openrouter.ai/api/v1/embeddings"
        self.batch_size = batch_size
        self.timeout = timeout
        self.session = requests.Session()
        # include a User-Agent too (some servers/checkers reject requests without it)
        user_agent = os.getenv("USER_AGENT", "openrouter-client/1.0 (mailto:you@example.com)")
        self.session.headers.update(
            {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "User-Agent": user_agent,
            }
        )

    def _call(self, inputs):
        """
        inputs: list[str]
        returns: list[list[float]]
        """
        payload = {"model": self.model, "input": inputs}
        resp = self.session.post(self.endpoint, json=payload, timeout=self.timeout)
        resp.raise_for_status()
        data = resp.json()

        # Normalize response format: support both {"data": [{"embedding": [...]}, ...]}
        # and potential {"data": [{"vector": [...]}, ...]} variants.
        embeddings = []
        if "data" in data and isinstance(data["data"], list):
            for item in data["data"]:
                if isinstance(item, dict) and "embedding" in item:
                    embeddings.append(item["embedding"])
                elif isinstance(item, dict) and "vector" in item:
                    embeddings.append(item["vector"])
                else:
                    # if item is a list itself, assume it's an embedding vector directly
                    if isinstance(item, list):
                        embeddings.append(item)
                    else:
                        raise ValueError(f"Unexpected embedding item format: {item}")
        else:
            raise ValueError(f"Unexpected embeddings response structure: {data}")
        return embeddings

    def embed_documents(self, texts):
        """
        texts: list[str]
        returns: list[list[float]]
        """
        all_embs = []
        for i in range(0, len(texts), self.batch_size):
            batch = texts[i: i + self.batch_size]
            embs = self._call(batch)
            all_embs.extend(embs)
            # tiny sleep to avoid hitting rate limits aggressively
            time.sleep(0.05)
        return all_embs

    def embed_query(self, text):
        """
        text: str
        returns: list[float]
        """
        embs = self._call([text])
        if not embs:
            raise ValueError("Empty embedding returned for query")
        return embs[0]

    def __call__(self, inputs):
        """
        Backwards-compatible callable support used by some LangChain integrations:
        - If inputs is a single string -> returns single vector (embed_query)
        - If inputs is a list/tuple of strings -> returns list of vectors (embed_documents)
        """
        if isinstance(inputs, str):
            return self.embed_query(inputs)
        elif isinstance(inputs, (list, tuple)):
            return self.embed_documents(list(inputs))
        else:
            # Try to coerce to list
            try:
                return self.embed_documents(list(inputs))
            except Exception as e:
                raise TypeError("Unsupported input type for embeddings call") from e

# instantiate embeddings shim (LangChain-friendly)
embeddings = OpenRouterEmbeddings(api_key=OPENROUTER_API_KEY)

# Vector store wrapper (Qdrant expects an embeddings object with embed_documents/embed_query or a callable)
vector_store = Qdrant(
    client=qdrant_client,
    collection_name=collection_name,
    embeddings=embeddings,
)

def create_collection_if_not_exists(collection_name: str):
    try:
        sample_vec = embeddings.embed_query("detect-dim-sample")
        dim = len(sample_vec)
        qdrant_client.create_collection(
            collection_name=collection_name,
            vectors_config=models.VectorParams(
                size=dim,
                distance=models.Distance.COSINE,
            ),
        )
        print(f"Collection {collection_name} created successfully with dim={dim}")
    except Exception as e:
        msg = str(e).lower()
        if "already exists" in msg or "collection already exists" in msg or "409" in msg:
            print(f"Collection {collection_name} already exists — continuing.")
        else:
            raise

def upload_website_to_collection(url: str):
    try:
        # Ensure collection exists before attempting to upload
        create_collection_if_not_exists(collection_name)
        
        # Configure comprehensive headers to avoid being blocked by websites
        header_template = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Cache-Control': 'max-age=0'
        }
        
        # Configure requests with timeout and retries
        requests_kwargs = {
            'timeout': 30,
            'verify': True,
            'allow_redirects': True
        }
        
        loader = WebBaseLoader(
            web_paths=[url], 
            header_template=header_template,
            requests_kwargs=requests_kwargs
        )
        documents = loader.load()
        
        if not documents:
            raise ValueError(f"No content could be extracted from {url}. The site may be blocking scrapers or the URL may be invalid.")
        
        # Split documents
        split_documents = text_splitter.split_documents(documents)
        
        if not split_documents:
            raise ValueError(f"No content could be split from {url}. The page may be empty.")
        
        # Add metadata
        for doc in split_documents:
            metadata = dict(doc.metadata) if getattr(doc, "metadata", None) else {}
            metadata["source_url"] = url
            doc.metadata = metadata

        vector_store.add_documents(split_documents)
        return f"Successfully uploaded {len(split_documents)} documents to collection {collection_name}"
    except Exception as e:
        raise Exception(f"Failed to index {url}: {str(e)}")

# create_collection_if_not_exists(collection_name)
# upload_website_to_collection("https://hamel.dev/blog/posts/evals")
