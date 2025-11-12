# 🦆 Duc - Your Intelligent Document Assistant

A beautiful, production-ready application for chatting with your documents! Upload PDFs, Word docs, and more, then ask Duc anything about them. Features a gorgeous duck-themed UI with AI-powered search, source citations, and conversational memory.

**Powered by:** FastAPI • React • LangChain • OpenAI • Chroma

## ✨ Features

- **📚 Multi-format document upload**: PDF, DOCX, TXT, CSV, Markdown, HTML
- **🔍 Vector-based retrieval**: Persistent Chroma database with OpenAI embeddings
- **🤖 LangChain RAG pipeline**: Retrieval-Augmented Generation with LCEL
- **💬 Conversational memory**: Per-session + browser localStorage for persistent chat history
- **📎 Source citations**: Every answer includes source references with page numbers
- **🎨 OpenAI-style chat**: Syntax highlighting, math rendering, mermaid diagrams
- **🚀 Production-ready**: Docker + Elastic Beanstalk deployment with health checks
- **☁️ AWS-ready**: Simple deployment to Elastic Beanstalk with one command
- **🎨 Beautiful UI**: Modern React frontend with dark mode and responsive design
- **🦆 Duck Mascot**: Custom animated SVG duck that reads your documents

## 🏗️ Architecture

```
FastAPI (REST API)
    ↓
LangChain (Document Processing & RAG)
    ↓
OpenAI (Embeddings + LLM)
    ↓
Chroma (Vector Store - Persistent)
```

## 📁 Project Structure

```
intelligent-doc-assistant/
├── app/                         # Backend (FastAPI)
│   ├── main.py                  # API endpoints (upload, chat, health, documents)
│   ├── chains.py                # LangChain RAG pipeline + memory
│   ├── settings.py              # Configuration from .env
│   └── utils/
│       ├── loaders.py           # Multi-format document loaders
│       ├── embeddings.py        # OpenAI embeddings + Chroma
│       └── citations.py         # Citation formatter
├── frontend/                    # Frontend (React + TypeScript + Vite)
│   ├── src/
│   │   ├── components/          # All React components
│   │   │   ├── ChatMessage.tsx  # Message with syntax highlighting
│   │   │   ├── CodeBlock.tsx    # Code block with copy/download
│   │   │   ├── MermaidDiagram.tsx
│   │   │   ├── ConversationList.tsx
│   │   │   ├── DocumentUpload.tsx
│   │   │   ├── SettingsPanel.tsx
│   │   │   └── DuckIcon.tsx     # SVG duck mascot
│   │   ├── App.tsx              # Main application
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.ts
├── .ebextensions/               # Elastic Beanstalk configuration
│   ├── 01_packages.config       # System dependencies
│   ├── 02_python.config         # Python settings
│   ├── 03_storage.config        # Chroma DB storage
│   └── 04_nginx.config          # Nginx proxy settings
├── .platform/                   # EB platform hooks
│   └── nginx/conf.d/
│       └── cors.conf            # CORS configuration
├── .env.example                 # Environment variables template
├── env.yaml.example             # EB environment config template
├── requirements.txt             # Python dependencies
├── Procfile                     # EB startup command
├── Dockerfile                   # Backend container (for local dev)
├── docker-compose.yml           # Local development with Docker
├── README.md                    # Main documentation
├── EB_DEPLOYMENT.md             # AWS Elastic Beanstalk guide
├── DEPLOYMENT_CHECKLIST.md      # Pre-deployment checklist
└── PERSISTENCE.md               # Chat history persistence docs
```

## 🚀 Quick Start

### Prerequisites

- **Backend**: Python 3.11+, OpenAI API key
- **Frontend**: Node.js 18+
- **Optional**: Docker & Docker Compose

### Option 1: Full Stack Development (Recommended)

1. **Clone and setup**:
   ```bash
   cd intelligent-doc-assistant
   copy .env.example .env
   # Edit .env and add your OPENAI_API_KEY
   ```

2. **Start Backend** (Terminal 1):
   ```bash
   python -m venv .venv
   .venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload --port 8000
   ```

3. **Start Frontend** (Terminal 2):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Open your browser**:
   - **Frontend UI**: http://localhost:3000 🦆
   - **Backend API**: http://localhost:8000/docs

### Option 2: Docker Compose (Easiest)

```bash
copy .env.example .env
# Edit .env and add your OPENAI_API_KEY
docker compose up --build
```

Then open http://localhost:3000

### Docker Setup

1. **Configure environment**:
   ```bash
   copy .env.example .env
   # Add your OPENAI_API_KEY to .env
   ```

2. **Run with Docker Compose**:
   ```bash
   docker compose up --build
   ```

3. **Access the API**:
   - API: http://localhost:8000
   - Docs: http://localhost:8000/docs
   - Health: http://localhost:8000/health

## 📡 API Endpoints

### 1. Health Check
```http
GET /health
```

**Response**:
```json
{
  "status": "ok"
}
```

### 2. Upload Documents
```http
POST /upload
Content-Type: multipart/form-data
```

**Parameters**:
- `files`: One or more files (PDF, DOCX, TXT, CSV, MD, HTML)

**Example (curl)**:
```bash
curl -X POST http://localhost:8000/upload \
  -F "files=@./handbook.pdf" \
  -F "files=@./notes.docx" \
  -F "files=@./guide.md"
```

**Response**:
```json
{
  "indexed_files": ["handbook.pdf", "notes.docx", "guide.md"],
  "chunks": 142
}
```

### 3. Chat with Documents
```http
POST /chat
Content-Type: application/x-www-form-urlencoded
```

**Parameters**:
- `question` (required): Your question about the documents
- `session_id` (optional): Session identifier for conversation history (default: "default")
- `k` (optional): Number of relevant chunks to retrieve (default: 4)

**Example (curl)**:
```bash
curl -X POST http://localhost:8000/chat \
  -F "question=What are the PTO policies?" \
  -F "session_id=user123"
```

**Response**:
```json
{
  "answer": "According to the handbook, employees receive 15 days of PTO annually...",
  "citations": [
    {
      "source": "handbook.pdf",
      "page": 12,
      "chunk_id": 34,
      "snippet": "Paid time off (PTO): Full-time employees receive 15 days..."
    },
    {
      "source": "notes.docx",
      "page": null,
      "chunk_id": 7,
      "snippet": "Remember: PTO requests must be submitted 2 weeks in advance..."
    }
  ]
}
```

## 🧪 Testing

### Using Python Requests
```python
import requests

# Upload documents
files = {
    'files': [
        ('files', open('document1.pdf', 'rb')),
        ('files', open('document2.docx', 'rb'))
    ]
}
response = requests.post('http://localhost:8000/upload', files=files)
print(response.json())

# Ask a question
data = {
    'question': 'What is the main topic?',
    'session_id': 'test_session'
}
response = requests.post('http://localhost:8000/chat', data=data)
print(response.json())
```

### Using Swagger UI
1. Navigate to http://localhost:8000/docs
2. Click on `/upload` → "Try it out"
3. Upload test documents
4. Click on `/chat` → "Try it out"
5. Enter your question and session ID

## ⚙️ Configuration

All settings are loaded from environment variables in `.env`. The app uses Pydantic's `BaseSettings` to automatically load these from your `.env` file:

```python
# app/settings.py
class Settings(BaseSettings):
    # Settings are loaded from .env file
    class Config:
        env_file = ".env"
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENAI_API_KEY` | (required) | Your OpenAI API key |
| `OPENAI_MODEL` | `gpt-4o-mini` | OpenAI model to use |
| `OPENAI_BASE_URL` | `https://api.openai.com/v1` | OpenAI API base URL |
| `CHROMA_PATH` | `./chroma_store` | Vector database storage path |
| `COLLECTION_NAME` | `docs` | Chroma collection name |
| `CHUNK_SIZE` | `1500` | Document chunk size for embeddings |
| `CHUNK_OVERLAP` | `200` | Overlap between chunks |
| `MAX_CONTEXT_DOCS` | `6` | Max documents to retrieve per query |
| `HOST` | `0.0.0.0` | Host to bind server to |
| `PORT` | `8000` | Port to run server on |

### Setting Up Environment

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your values:
   ```bash
   # Required
   OPENAI_API_KEY=sk-your-api-key-here
   
   # Optional - these have sensible defaults
   OPENAI_MODEL=gpt-4o-mini
   CHUNK_SIZE=1500
   ```

## 🚢 Deployment

### AWS Elastic Beanstalk (Recommended)

**Easiest deployment to AWS with automatic scaling and persistent storage!**

See **[EB_DEPLOYMENT.md](./EB_DEPLOYMENT.md)** for complete guide.

Quick start:
```bash
# 1. Install EB CLI
pip install awsebcli

# 2. Initialize and create environment
eb init -p python-3.11 duc-document-assistant
eb create duc-prod-env --instance-type t3.medium --envvars-file env.yaml

# 3. Deploy updates
eb deploy

# 4. Open in browser
eb open
```

**Features:**
- ✅ Simple deployment (3 commands)
- ✅ Auto-scaling and load balancing
- ✅ Persistent Chroma DB with EBS/EFS
- ✅ Built-in monitoring and health checks
- ✅ HTTPS with free SSL certificates
- ✅ ~$35/month starting cost
- ✅ CloudWatch logging included

### Local Production (Docker)

```bash
# Start backend with Docker
docker compose up --build

# Access:
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

## 🔒 Security Best Practices

- **Never commit `.env`**: Always use `.env.example` as template
- **Rotate API keys regularly**: Use AWS Secrets Manager or Parameter Store
- **Enable authentication**: Add JWT/OAuth for production (consider AWS Cognito)
- **Restrict CORS**: Update `allow_origins` in `main.py` to specific domains
- **Use HTTPS**: Always deploy behind SSL/TLS (ALB, CloudFront, or Nginx)
- **Rate limiting**: Add rate limiting middleware for production use

## 🧠 How It Works

### RAG Pipeline

1. **Document Ingestion**:
   - User uploads documents via `/upload`
   - Documents are parsed based on format (PDF, DOCX, etc.)
   - Text is split into chunks with overlap
   - Chunks are embedded using OpenAI embeddings
   - Embeddings stored in persistent Chroma database

2. **Question Answering**:
   - User asks question via `/chat`
   - Question is embedded and used to search vector database
   - Top-k most relevant chunks retrieved
   - Context + conversation history + question sent to LLM
   - LLM generates answer based on retrieved context
   - Citations extracted from source documents
   - Response and citations returned to user

3. **Conversation Memory**:
   - Each session maintains separate chat history
   - Last 6 messages included in context for continuity
   - Stored in-memory (upgrade to Redis for production)

## 📊 Performance Tips

- **Chunk size**: Smaller chunks (500-800) for precise answers, larger (1000-1500) for context
- **Overlap**: 10-20% of chunk size to maintain continuity
- **Model selection**: 
  - `gpt-4o-mini`: Fast, cost-effective
  - `gpt-4o`: Higher quality, slower
- **Retrieval**: Increase `k` for complex queries, decrease for speed
- **Embeddings**: `text-embedding-3-small` (default) balances speed/quality

## 🛠️ Troubleshooting

### Issue: "ChromaDB not persisting"
- Ensure `chroma_store/` directory has write permissions
- Check Docker volume mount in `docker-compose.yml`

### Issue: "Unstructured loader fails"
- Some formats require system dependencies (poppler, tesseract)
- These are included in Dockerfile
- For local dev: Install via `apt` (Linux) or `brew` (macOS)

### Issue: "Out of memory"
- Reduce `CHUNK_SIZE` and `MAX_CONTEXT_DOCS`
- Use smaller OpenAI model
- Increase Docker memory limits

## 🎯 Future Enhancements

- [ ] **Reranking**: Add Cohere Rerank or cross-encoder for better relevance
- [ ] **UI**: Build Streamlit/React frontend with citation highlighting
- [ ] **Multi-tenancy**: Add user namespaces and JWT authentication
- [ ] **Background processing**: Use Celery/Lambda for async large file uploads
- [ ] **Evaluation**: Integrate RAGAS for RAG quality metrics
- [ ] **Observability**: Add LangSmith/Langfuse for tracing and monitoring
- [ ] **Advanced chunking**: Semantic chunking or recursive summarization
- [ ] **Multi-modal**: Support images, tables, charts with vision models

## 📚 Tech Stack

- **Framework**: FastAPI 0.115
- **LLM**: OpenAI (GPT-4o-mini)
- **Embeddings**: OpenAI text-embedding-3-small
- **Vector Store**: Chroma 0.5.5 (persistent)
- **Orchestration**: LangChain 0.2.14 + LCEL
- **Loaders**: PyPDF, docx2txt, unstructured
- **Deployment**: Docker, Docker Compose

## 📄 License

MIT License - feel free to use for personal or commercial projects.

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request with clear description

## 📞 Support

For issues or questions:
- Open a GitHub issue
- Check existing documentation
- Review LangChain docs: https://python.langchain.com/

---

**Built with ❤️ using FastAPI, LangChain, and OpenAI**
