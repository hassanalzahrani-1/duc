from pathlib import Path
from typing import List

from langchain_community.document_loaders import (
    PyPDFLoader,
    Docx2txtLoader,
    TextLoader,
    UnstructuredHTMLLoader,
    UnstructuredMarkdownLoader,
    CSVLoader,
)
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter


def load_file(path: Path, metadata: dict = None) -> List[Document]:
    """Load a document from file based on its extension with optional metadata."""
    suffix = path.suffix.lower()
    
    # Prepare base metadata
    base_metadata = metadata or {}
    base_metadata.update({
        "filename": path.name,
        "file_type": suffix,
    })

    if suffix == ".pdf":
        loader = PyPDFLoader(str(path))
        docs = loader.load()
    elif suffix in {".docx", ".doc"}:  # docx2txt supports .docx best
        loader = Docx2txtLoader(str(path))
        docs = loader.load()
    elif suffix in {".md"}:
        loader = UnstructuredMarkdownLoader(str(path))
        docs = loader.load()
    elif suffix in {".htm", ".html"}:
        loader = UnstructuredHTMLLoader(str(path))
        docs = loader.load()
    elif suffix in {".csv"}:
        loader = CSVLoader(str(path))
        docs = loader.load()
    else:
        # Fallback to plain text for .txt and unknown texty formats
        loader = TextLoader(str(path), autodetect_encoding=True)
        docs = loader.load()

    # Enrich metadata for citations
    for i, d in enumerate(docs):
        # Merge base metadata with document-specific metadata
        enriched_metadata = base_metadata.copy()
        enriched_metadata.update(d.metadata or {})
        enriched_metadata["chunk_id"] = i
        # Ensure source is set (use original_filename if available, otherwise filename)
        if "original_filename" not in enriched_metadata:
            enriched_metadata["source"] = path.name
        else:
            enriched_metadata["source"] = enriched_metadata["original_filename"]
        d.metadata = enriched_metadata

    return docs


def split_docs(docs: List[Document], chunk_size: int, chunk_overlap: int) -> List[Document]:
    """Split documents into smaller chunks for embedding."""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
        is_separator_regex=False,
    )
    return splitter.split_documents(docs)
