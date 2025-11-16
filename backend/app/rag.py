import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough, RunnableParallel
from operator import itemgetter
from app.qdrant import vector_store

# load envs
load_dotenv()

# get API key
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
if not OPENROUTER_API_KEY:
    raise RuntimeError("OPENROUTER_API_KEY not found in environment. Set it in .env and re-run.")

# instantiate model pointing to OpenRouter (if that's your target)
model = ChatOpenAI(
    model="openai/gpt-3.5-turbo",
    api_key=OPENROUTER_API_KEY,
    base_url="https://openrouter.ai/api/v1",  # ensure correct base for OpenRouter
    temperature=0.7,
)

prompt_template = """
Answer the question based on the context provided, in a concise and clear manner using bullet points.

Context: {context}
Question: {question}
Answer:
"""

prompt = ChatPromptTemplate.from_template(prompt_template)

# Use the vectorstore from qdrant.py
retriever = vector_store.as_retriever()

def create_chain():
    chain = (
        {
            "context": retriever.with_config(top_k=4),
            "question": RunnablePassthrough(),
        }
        | RunnableParallel(
             {
                "answer": prompt | model,
                "context": itemgetter("context"),
             }
         )
    )
    return chain

def get_answer_and_docs(question: str):
    chain = create_chain()
    response = chain.invoke(question)
    answer = response["answer"].content
    context = response["context"]
    return {"answer": answer, "context": context}

# response = get_answer_and_docs("Who is the author of the article?")
# print(response)
