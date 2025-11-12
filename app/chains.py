from typing import Dict, List
from langchain_openai import ChatOpenAI
from langchain_chroma import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import HumanMessage
from langchain_core.chat_history import InMemoryChatMessageHistory as ChatMessageHistory
from app.utils.citations import build_citations

# In-memory conversation store by session_id (swap to Redis/DynamoDB for prod)
_SESSION_STORE: Dict[str, ChatMessageHistory] = {}


SYSTEM_PROMPT = (
    "You are Duc, an expert document assistant specializing in helping users understand and retrieve information from their uploaded documents. "
    "\n\n**Your Core Purpose:**\n"
    "Help users extract insights, understand complex content, and find specific information within their documents quickly and accurately. "
    "\n\n**Instructions:**\n"
    "1. **COMPREHEND**: Thoroughly read and understand the provided document context\n"
    "2. **REFERENCE BY NAME**: When citing information, mention the document name (e.g., 'According to Contract_Final.pdf...' or 'Budget_2024.pdf states...')\n"
    "3. **SYNTHESIZE**: Connect related information across different sections and documents\n"
    "4. **EXPLAIN**: Break down complex concepts into clear, digestible explanations\n"
    "5. **CITE ACCURATELY**: Base all answers on the actual document content provided - each context section shows [Source: filename, Page: number]\n"
    "6. **BE PRECISE**: Give specific details and reference document names naturally in your response\n"
    "7. **FORMAT WITH MARKDOWN**: Always use proper markdown formatting with correct newlines:\n"
    "   - Use ## for section headings (with blank lines before and after)\n"
    "   - Use - or * for bullet points (with blank line before list)\n"
    "   - Use **bold** for emphasis\n"
    "   - Use numbered lists (1. 2. 3.) for sequential items (with blank line before list)\n"
    "   - Use > for important quotes or callouts (with blank line before and after)\n"
    "   - Use code blocks with ``` for technical content (with blank lines before and after)\n"
    "8. **STRUCTURE WELL**: Break long responses into clear sections with headings and lists\n"
    "9. **ACKNOWLEDGE LIMITS**: If information isn't in the documents, clearly state that\n"
    "\n"
    "**Response Style:**\n"
    "- Direct and informative - get to the answer quickly\n"
    "- ALWAYS use markdown formatting (headings, bullets, bold) for readability\n"
    "- CRITICAL: Include proper blank lines between paragraphs and before/after lists and headings\n"
    "- Format: '\n\n## Heading\n\nParagraph\n\n- List item\n- List item\n\nNext paragraph'\n"
    "- Reference documents by their filenames naturally (e.g., 'In Report.pdf, it mentions...')\n"
    "- Use the user's terminology when they ask specific questions\n"
    "- Structure responses with clear sections for easy scanning\n"
    "- Keep responses focused and relevant\n"
    "\n"
    "**Important**: \n"
    "- Each piece of context is labeled with [Source: filename, Page: number]. Use these document names in your answers.\n"
    "- Your responses will be rendered as markdown, so ALWAYS use proper markdown syntax for formatting.\n"
    "\n"
    "You're a helpful, knowledgeable assistant - make document understanding effortless! 🦆"
)

PROMPT = ChatPromptTemplate.from_messages(
    [
        ("system", SYSTEM_PROMPT),
        ("human", "Context:\n{context}\n\nQuestion: {question}\n\nChat history (may help):\n{history}"),
    ]
)


def get_history(session_id: str) -> ChatMessageHistory:
    """Retrieve or create chat history for a session."""
    if session_id not in _SESSION_STORE:
        _SESSION_STORE[session_id] = ChatMessageHistory()
    return _SESSION_STORE[session_id]


def retrieve_context(vectordb: Chroma, question: str, k: int, filter_docs: List[str] = None) -> List:
    """Retrieve relevant documents from vector store.
    
    Args:
        vectordb: ChromaDB vector store
        question: User's question
        k: Number of chunks to retrieve
        filter_docs: Optional list of filenames to restrict search to
    """
    # Use direct similarity search with optional filtering
    if filter_docs:
        filter_dict = {"source": {"$in": filter_docs}}
        return vectordb.similarity_search(question, k=k, filter=filter_dict)
    else:
        return vectordb.similarity_search(question, k=k)


def answer_question(
    *,
    llm: ChatOpenAI,
    vectordb: Chroma,
    question: str,
    session_id: str,
    k: int,
    filter_docs: List[str] = None,
) -> Dict:
    """
    Main RAG pipeline: retrieve context, build prompt with history, query LLM, return answer with citations.
    
    Args:
        filter_docs: Optional list of document filenames to restrict search to
    """
    # 1) Retrieve relevant docs (optionally filtered)
    docs = retrieve_context(vectordb, question, k=k, filter_docs=filter_docs)
    
    # Format context with document names and page numbers for better referencing
    context_parts = []
    for d in docs:
        source = d.metadata.get("source", "Unknown")
        page = d.metadata.get("page", "?")
        context_parts.append(f"[Source: {source}, Page: {page}]\n{d.page_content}")
    
    context_text = "\n\n---\n\n".join(context_parts)

    # 2) Build prompt with recent history for coherence (last 3 turns = 6 messages)
    history = get_history(session_id)
    recent_messages = history.messages[-6:]
    history_text = "\n".join(f"{msg.type.upper()}: {msg.content}" for msg in recent_messages)

    # 3) LLM call
    msg = PROMPT.format_messages(context=context_text, question=question, history=history_text)
    response = llm.invoke(msg)

    # 4) Update history
    history.add_user_message(question)
    history.add_ai_message(response.content)

    return {
        "answer": response.content,
        "citations": build_citations(docs),
    }
