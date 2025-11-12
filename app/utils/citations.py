from typing import List, Dict
from langchain_core.documents import Document


def build_citations(docs: List[Document]) -> List[Dict]:
    """Build citation metadata from retrieved documents.
    
    Deduplicates sources to avoid showing the same source multiple times.
    """
    # Track unique sources to avoid duplicates
    unique_sources = {}
    
    # First pass - collect all citations
    for d in docs:
        meta = d.metadata or {}
        source = meta.get("source")
        
        # Skip if no source
        if not source:
            continue
            
        # Create a unique key for this source
        source_key = f"{source}:{meta.get('page', 'none')}"
        
        # If we haven't seen this source yet, or this chunk has more content
        if source_key not in unique_sources or len(d.page_content) > len(unique_sources[source_key]["content"]):
            unique_sources[source_key] = {
                "source": source,
                "page": meta.get("page"),
                "chunk_id": meta.get("chunk_id"),
                "content": d.page_content,
                "snippet": (d.page_content[:240] + "…") if len(d.page_content) > 240 else d.page_content,
            }
    
    # Convert to list and remove the temporary content field
    citations = []
    for citation in unique_sources.values():
        del citation["content"]
        citations.append(citation)
    
    return citations
