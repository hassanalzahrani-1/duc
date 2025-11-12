from pathlib import Path
from typing import Iterable, List

from langchain_openai import OpenAIEmbeddings
from langchain_chroma import Chroma
from langchain_core.documents import Document


def get_embeddings(api_key: str, base_url: str = None) -> OpenAIEmbeddings:
    """Initialize OpenAI embeddings (uses text-embedding-3-small by default)."""
    kwargs = {"api_key": api_key}
    if base_url:
        # OpenAIEmbeddings uses 'openai_api_base' parameter, not 'base_url'
        kwargs["openai_api_base"] = base_url
    return OpenAIEmbeddings(**kwargs)


def get_chroma(persist_directory: str, collection_name: str, embeddings: OpenAIEmbeddings) -> Chroma:
    """Initialize or load a persistent Chroma vector database."""
    Path(persist_directory).mkdir(parents=True, exist_ok=True)
    return Chroma(
        collection_name=collection_name,
        embedding_function=embeddings,
        persist_directory=persist_directory,
    )


def add_documents(
    vectordb: Chroma, docs: Iterable[Document]
) -> List[str]:
    """Add documents to the vector store (auto-persists in newer ChromaDB)."""
    ids = vectordb.add_documents(list(docs))
    return ids
