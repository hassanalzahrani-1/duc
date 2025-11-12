import os
import logging
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from typing import List
import time
import uuid
import tempfile

from app.settings import get_settings
from app.utils.loaders import load_file, split_docs
from app.utils.embeddings import get_embeddings, get_chroma, add_documents
from app.chains import answer_question
from langchain_openai import ChatOpenAI

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Duc - Intelligent Document Assistant",
    description="🦆 Your friendly AI-powered document reading duck! Upload documents and chat with them.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS - configure for production with specific origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: Replace with specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# GZip compression
app.add_middleware(GZipMiddleware, minimum_size=1000)

settings = get_settings()

# Global resource holders
_embeddings = None
_vectordb = None
_llm = None

@app.on_event("startup")
async def startup_event():
    """Initialize resources on startup."""
    global _embeddings, _vectordb, _llm
    logger.info("Starting Duc application...")
    try:
        logger.info("Initializing OpenAI embeddings...")
        _embeddings = get_embeddings(settings.openai_api_key, settings.openai_base_url)
        
        logger.info(f"Connecting to Chroma DB at {settings.chroma_path}...")
        _vectordb = get_chroma(
            persist_directory=settings.chroma_path,
            collection_name=settings.collection_name,
            embeddings=_embeddings,
        )
        
        logger.info(f"Initializing LLM ({settings.openai_model})...")
        llm_kwargs = {
            "model": settings.openai_model,
            "api_key": settings.openai_api_key,
            "temperature": 0,
        }
        if settings.openai_base_url:
            llm_kwargs["base_url"] = settings.openai_base_url
        _llm = ChatOpenAI(**llm_kwargs)
        
        logger.info("Duc application started successfully!")
    except Exception as e:
        logger.error(f"Failed to initialize application: {e}")
        raise

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    logger.info("Shutting down Duc application...")
    # Add cleanup logic if needed


@app.get("/health")
def health():
    """Enhanced health check with dependency verification."""
    health_status = {
        "status": "healthy",
        "timestamp": time.time(),
        "version": "1.0.0",
        "checks": {}
    }
    
    # Check embeddings
    try:
        if _embeddings is None:
            raise Exception("Embeddings not initialized")
        health_status["checks"]["embeddings"] = "ok"
    except Exception as e:
        health_status["checks"]["embeddings"] = f"error: {str(e)}"
        health_status["status"] = "unhealthy"
    
    # Check vector database
    try:
        if _vectordb is None:
            raise Exception("Vector database not initialized")
        health_status["checks"]["vectordb"] = "ok"
    except Exception as e:
        health_status["checks"]["vectordb"] = f"error: {str(e)}"
        health_status["status"] = "unhealthy"
    
    # Check LLM
    try:
        if _llm is None:
            raise Exception("LLM not initialized")
        health_status["checks"]["llm"] = "ok"
    except Exception as e:
        health_status["checks"]["llm"] = f"error: {str(e)}"
        health_status["status"] = "unhealthy"
    
    status_code = 200 if health_status["status"] == "healthy" else 503
    return JSONResponse(content=health_status, status_code=status_code)


@app.post("/upload")
async def upload(files: List[UploadFile] = File(...)):
    """
    Upload multiple documents for indexing.
    Supports: PDF, DOCX, TXT, CSV, MD, HTML
    """
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")
    
    logger.info(f"Received {len(files)} files for upload")
    uploaded = []
    all_docs = []
    timestamp = int(time.time())
    
    try:
        for f in files:
            logger.info(f"Processing file: {f.filename}")
            
            # Use temporary file for processing
            file_suffix = Path(f.filename).suffix
            unique_id = uuid.uuid4().hex[:8]
            
            # Create temp file with proper extension
            file_content = await f.read()
            file_size = len(file_content)
            with tempfile.NamedTemporaryFile(delete=False, suffix=file_suffix) as tmp:
                tmp.write(file_content)
                tmp_path = Path(tmp.name)
            
            try:
                # Prepare metadata for citations (stored in ChromaDB)
                file_metadata = {
                    "original_filename": f.filename,
                    "upload_id": f"{timestamp}_{unique_id}",
                    "upload_timestamp": timestamp,
                    "file_size": file_size,
                }
                
                # Load file with metadata
                docs = load_file(tmp_path, metadata=file_metadata)
                all_docs.extend(docs)
                uploaded.append(f.filename)
                logger.info(f"Successfully processed {f.filename}: {len(docs)} documents")
            finally:
                # Delete temporary file after processing
                tmp_path.unlink(missing_ok=True)

        # Split and index
        chunks = split_docs(all_docs, settings.chunk_size, settings.chunk_overlap)
        add_documents(_vectordb, chunks)
        
        logger.info(f"Successfully indexed {len(uploaded)} files into {len(chunks)} chunks")
        return {"indexed_files": uploaded, "chunks": len(chunks)}
    except Exception as e:
        logger.error(f"Upload failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@app.get("/documents")
async def list_documents():
    """
    List all documents currently indexed in ChromaDB.
    Returns unique documents with metadata.
    """
    try:
        # Get all documents from ChromaDB
        collection = _vectordb._collection
        result = collection.get()
        
        # Extract unique documents from metadata
        documents = {}
        if result and result['metadatas']:
            for metadata in result['metadatas']:
                filename = metadata.get('original_filename', metadata.get('source', 'Unknown'))
                if filename not in documents:
                    documents[filename] = {
                        "filename": filename,
                        "upload_id": metadata.get('upload_id', 'N/A'),
                        "upload_timestamp": metadata.get('upload_timestamp', 'N/A'),
                        "file_type": metadata.get('file_type', 'N/A'),
                        "file_size": metadata.get('file_size', 0),
                        "chunks": 0
                    }
                documents[filename]["chunks"] += 1
        
        return {
            "total_documents": len(documents),
            "total_chunks": len(result['ids']) if result else 0,
            "documents": list(documents.values())
        }
    except Exception as e:
        logger.error(f"Failed to list documents: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to list documents: {str(e)}")


@app.delete("/documents/{filename}")
async def delete_document(filename: str):
    """
    Delete a document and all its chunks from ChromaDB.
    Use the original filename from the /documents list.
    """
    try:
        # Get all documents from ChromaDB
        collection = _vectordb._collection
        result = collection.get()
        
        # Find IDs of chunks belonging to this document
        ids_to_delete = []
        chunks_deleted = 0
        
        if result and result['metadatas']:
            for i, metadata in enumerate(result['metadatas']):
                doc_filename = metadata.get('original_filename', metadata.get('source', ''))
                if doc_filename == filename:
                    ids_to_delete.append(result['ids'][i])
                    chunks_deleted += 1
        
        if not ids_to_delete:
            raise HTTPException(status_code=404, detail=f"Document '{filename}' not found")
        
        # Delete the chunks
        collection.delete(ids=ids_to_delete)
        
        logger.info(f"Deleted document '{filename}' ({chunks_deleted} chunks)")
        return {
            "message": f"Successfully deleted '{filename}'",
            "chunks_deleted": chunks_deleted
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete document: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete document: {str(e)}")


@app.delete("/documents")
async def delete_all_documents():
    """
    Delete ALL documents from ChromaDB.
    Use with caution - this clears the entire database.
    """
    try:
        collection = _vectordb._collection
        result = collection.get()
        
        if result and result['ids']:
            total_chunks = len(result['ids'])
            collection.delete(ids=result['ids'])
            logger.info(f"Deleted all documents ({total_chunks} chunks)")
            return {
                "message": "Successfully deleted all documents",
                "chunks_deleted": total_chunks
            }
        else:
            return {
                "message": "No documents to delete",
                "chunks_deleted": 0
            }
    except Exception as e:
        logger.error(f"Failed to delete all documents: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete all documents: {str(e)}")


@app.post("/chat")
async def chat(
    question: str = Form(...),
    session_id: str = Form("default"),
    k: int = Form(None),
    documents: str = Form(None),  # Comma-separated list of filenames to search
):
    """
    Ask a question about indexed documents.
    Returns answer with source citations and maintains conversation history per session.
    
    Args:
        question: User's question
        session_id: Conversation ID for history
        k: Number of chunks to retrieve (optional)
        documents: Comma-separated filenames to restrict search (optional)
                  Example: "doc1.pdf,doc2.pdf" or empty for all documents
    """
    if not question or not question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")
    
    logger.info(f"Chat request - Session: {session_id}, Question: {question[:100]}...")
    
    try:
        top_k = k or settings.max_context_docs
        
        # Parse document filter if provided
        filter_docs = None
        if documents and documents.strip():
            filter_docs = [doc.strip() for doc in documents.split(",") if doc.strip()]
            logger.info(f"Filtering search to documents: {filter_docs}")
        
        result = answer_question(
            llm=_llm,
            vectordb=_vectordb,
            question=question,
            session_id=session_id,
            k=top_k,
            filter_docs=filter_docs,
        )
        logger.info(f"Chat response generated successfully for session {session_id}")
        return JSONResponse(result)
    except Exception as e:
        logger.error(f"Chat error - Session: {session_id}, Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")
