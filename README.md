<div align="center">

<img src="frontend/public/duck-icon.svg" alt="Duc Logo" width="120" height="120"/>

# Duc - Your Intelligent Document Assistant

<p align="center">
  <strong>Transform how you interact with documents through natural conversation, powered by state-of-the-art AI</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-0.115+-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"/>
  <img src="https://img.shields.io/badge/LangChain-0.2+-1C3C3C?style=for-the-badge&logo=chainlink&logoColor=white" alt="LangChain"/>
  <img src="https://img.shields.io/badge/OpenAI-API-412991?style=for-the-badge&logo=openai&logoColor=white" alt="OpenAI"/>
  <img src="https://img.shields.io/badge/ChromaDB-0.5+-FF6F00?style=for-the-badge" alt="ChromaDB"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square" alt="License"/>
  <img src="https://img.shields.io/badge/TypeScript-5+-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python"/>
  <img src="https://img.shields.io/badge/Docker-Multi--Container-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"/>
  <img src="https://img.shields.io/badge/AWS-EB_Docker-FF9900?style=flat-square&logo=amazonaws&logoColor=white" alt="AWS"/>
</p>

</div>

---

## 👋 Welcome to Duc!

**Meet Duc, your friendly AI-powered document companion!** <img src="frontend/public/duck-icon.svg" alt="Duc" width="24" height="24" style="vertical-align: middle;"/>

Duc is a production-ready, enterprise-grade application that brings your documents to life. Upload PDFs, Word files, spreadsheets, and more—then chat naturally with Duc to extract insights, find information, and understand complex content instantly. With its beautiful duck-themed interface, intelligent RAG pipeline, and persistent memory, Duc makes document analysis effortless and enjoyable.

**⚡ Powered by:** FastAPI • React • TypeScript • LangChain • OpenAI • ChromaDB • Docker • Nginx

**🐳 Deployment:** Multi-container Docker on AWS Elastic Beanstalk

## 📖 Table of Contents

- [✨ Features](#-features)
- [🎬 What Can Duc Do?](#-what-can-duc-do)
- [🏗️ Architecture](#️-architecture)
- [📁 Project Structure](#-project-structure)
- [🚀 Quick Start](#-quick-start)
- [📡 API Endpoints](#-api-endpoints)
- [🧪 Testing](#-testing)
- [⚙️ Configuration](#️-configuration)
- [🚢 Deployment](#-deployment)
- [🔒 Security Best Practices](#-security-best-practices)
- [🧠 How It Works](#-how-it-works)
- [📊 Performance Tips](#-performance-tips)
- [🛠️ Troubleshooting](#️-troubleshooting)
- [🎯 Future Enhancements](#-future-enhancements)
- [📚 Tech Stack](#-tech-stack)
- [🤝 Contributing](#-contributing)

## ✨ Features

### <img src="frontend/public/duck-icon.svg" alt="Duc" width="20" height="20" style="vertical-align: middle;"/> Core Capabilities
- **🧠 AI-Powered Conversations**: Chat naturally with your documents using GPT-4o-mini
- **📚 Multi-Format Support**: PDF, DOCX, TXT, CSV, Markdown, HTML—Duc reads them all
- **🔍 Smart Search**: Vector-based semantic search with OpenAI embeddings
- **📎 Source Citations**: Every answer includes precise document references with page numbers
- **💾 Document Management**: Upload, view, filter, and delete documents with full control
- **🎯 Filtered Search**: Restrict queries to specific documents for focused results
- **💬 Conversation Memory**: Maintains context across messages with persistent session history

### 🎨 Beautiful Interface
- **Modern React UI**: Built with TypeScript, Vite, and shadcn/ui components
- **🌙 Dark Mode**: Elegant dark theme with smooth transitions
- **📱 Fully Responsive**: Perfect experience on desktop, tablet, and mobile
- **<img src="frontend/public/duck-icon.svg" alt="Duc" width="18" height="18" style="vertical-align: middle;"/> Duck-Themed Design**: Custom animated SVG duck mascot and playful UI elements
- **✨ Rich Formatting**: Markdown rendering, syntax highlighting, LaTeX math, Mermaid diagrams
- **📊 Document Browser**: Visual interface to manage your document library

### 🚀 Production-Ready
- **⚡ High Performance**: FastAPI backend with async support and GZip compression
- **🏥 Health Monitoring**: Comprehensive health checks with dependency verification
- **☁️ Cloud-Native**: Multi-container Docker deployment to AWS Elastic Beanstalk
- **🐳 Docker Architecture**: Separate containers for backend and frontend+nginx
- **💾 Persistent Storage**: Chroma vector database with automatic persistence
- **🔒 Secure by Default**: CORS protection, environment-based configuration, backend not exposed

## 🎬 What Can Duc Do?

**Real-World Use Cases:**

📋 **Business Documents**
- Parse contracts and extract key terms instantly
- Analyze financial reports and generate summaries
- Search through employee handbooks for specific policies

📚 **Research & Education**
- Quickly find information across multiple research papers
- Generate study guides from textbook PDFs
- Cross-reference information from various academic sources

💼 **Enterprise Knowledge Base**
- Build an intelligent company wiki
- Enable employees to query internal documentation
- Maintain compliance by tracking document sources

🔬 **Technical Documentation**
- Search API documentation and code guides
- Extract troubleshooting steps from manuals
- Compare specifications across multiple documents

## 🏗️ Architecture

Duc uses a **multi-container Docker architecture** with nginx as a reverse proxy:

```
                      ┌─────────────────────┐
                      │   User's Browser    │
                      └──────────┬──────────┘
                                 │ HTTP (Port 80)
                      ┌──────────▼──────────┐
                      │  Nginx Container    │
                      │  ┌──────────────┐   │
                      │  │   Frontend   │   │  ← Dockerfile.frontend
                      │  │ (React Build)│   │     (Builds React in container)
                      │  └──────────────┘   │
                      │  ┌──────────────┐   │
                      │  │ Proxy /api/* │   │
                      │  └──────┬───────┘   │
                      └─────────┼───────────┘
                                │ Internal Network
                      ┌─────────▼───────────┐
                      │ Backend Container   │
                      │  ┌──────────────┐   │
                      │  │   FastAPI    │   │  ← Dockerfile
                      │  │  (Port 8000) │   │     (Python + deps)
                      │  └──────┬───────┘   │
                      │         │           │
                      │  ┌──────▼───────┐   │
                      │  │  LangChain   │   │
                      │  │  RAG Pipeline│   │
                      │  └──────┬───────┘   │
                      │         │           │
                      │  ┌──────▼───────┐   │
                      │  │   ChromaDB   │◄──┼── Persistent Volume
                      │  │ Vector Store │   │
                      │  └──────────────┘   │
                      └─────────────────────┘
                                │
                      ┌─────────▼───────────┐
                      │   OpenAI API        │
                      │ (Embeddings + LLM)  │
                      └─────────────────────┘
```

**Container Communication:**
- **Nginx** listens on port 80 (public)
- **Backend** only accessible via internal Docker network (secure!)
- **Nginx** proxies `/api/*` → `http://backend:8000`
- **Frontend** served directly by nginx

**Data Flow:**
1. **Document Upload** → Parse & Split → Generate Embeddings → Store in ChromaDB
2. **User Question** → Embed Query → Similarity Search → Retrieve Context → LLM Generation → Return Answer + Citations

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
│   ├── nginx.conf               # Nginx routing config (serves frontend, proxies API)
│   ├── package.json
│   └── vite.config.ts
├── .ebextensions/               # Elastic Beanstalk Docker configuration
│   └── 01_storage_docker.config # Creates persistent storage directories
├── Dockerfile                   # Backend container (FastAPI + Python)
├── Dockerfile.frontend          # Frontend container (React build + Nginx)
├── Dockerrun.aws.json           # EB multi-container orchestration
├── .ebignore                    # Files to exclude from deployment zip
├── .env.example                 # Environment variables template
├── requirements.txt             # Python dependencies
├── DEPLOY.txt                   # Simple deployment instructions
└── README.md                    # This file
```

## 🚀 Quick Start

### Prerequisites

- **Backend**: Python 3.11+, OpenAI API key
- **Frontend**: Node.js 18+
- **Deployment**: Docker, AWS Account

### Local Development

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
   - **Frontend UI**: http://localhost:3001 <img src="frontend/public/duck-icon.svg" alt="Duc" width="20" height="20" style="vertical-align: middle;"/>
   - **Backend API**: http://localhost:8000/docs

## 📡 API Endpoints

Duc provides a comprehensive REST API for document management and conversational AI:

### 1. 🏥 Health Check
```http
GET /health
```
Monitor application health with detailed dependency checks.

**Response**:
```json
{
  "status": "healthy",
  "timestamp": 1699564800.123,
  "version": "1.0.0",
  "checks": {
    "embeddings": "ok",
    "vectordb": "ok",
    "llm": "ok"
  }
}
```

### 2. 📤 Upload Documents
```http
POST /upload
Content-Type: multipart/form-data
```
Upload and automatically index multiple documents. Supports batch uploads.

**Parameters**:
- `files` (required): One or more document files

**Supported Formats**: PDF, DOCX, TXT, CSV, MD, HTML

**Example**:
```bash
curl -X POST http://localhost:8000/upload \
  -F "files=@./contract.pdf" \
  -F "files=@./notes.docx" \
  -F "files=@./readme.md"
```

**Response**:
```json
{
  "indexed_files": ["contract.pdf", "notes.docx", "readme.md"],
  "chunks": 142
}
```

### 3. 💬 Chat with Documents
```http
POST /chat
Content-Type: application/x-www-form-urlencoded
```
Ask questions about your documents with full conversation context and citations.

**Parameters**:
- `question` (required): Your question
- `session_id` (optional): Conversation ID for history (default: "default")
- `k` (optional): Number of chunks to retrieve (default: 4)
- `documents` (optional): Comma-separated filenames to filter search (e.g., "doc1.pdf,doc2.pdf")

**Example**:
```bash
curl -X POST http://localhost:8000/chat \
  -F "question=What are the project deliverables?" \
  -F "session_id=user123" \
  -F "documents=contract.pdf,notes.docx"
```

**Response**:
```json
{
  "answer": "According to contract.pdf, the project deliverables include...",
  "citations": [
    {
      "source": "contract.pdf",
      "page": 5,
      "chunk_id": 12,
      "snippet": "Project deliverables: 1. Design mockups 2. API implementation..."
    }
  ]
}
```

### 4. 📚 List Documents
```http
GET /documents
```
Retrieve all indexed documents with metadata.

**Response**:
```json
{
  "total_documents": 3,
  "total_chunks": 142,
  "documents": [
    {
      "filename": "contract.pdf",
      "upload_id": "1699564800_a1b2c3d4",
      "upload_timestamp": 1699564800,
      "file_type": "pdf",
      "file_size": 245760,
      "chunks": 48
    }
  ]
}
```

### 5. 🗑️ Delete Document
```http
DELETE /documents/{filename}
```
Remove a specific document and all its chunks from the database.

**Example**:
```bash
curl -X DELETE http://localhost:8000/documents/contract.pdf
```

**Response**:
```json
{
  "message": "Successfully deleted 'contract.pdf'",
  "chunks_deleted": 48
}
```

### 6. 🧹 Clear All Documents
```http
DELETE /documents
```
Remove **all** documents from the database. Use with caution.

**Response**:
```json
{
  "message": "Successfully deleted all documents",
  "chunks_deleted": 142
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

### ☁️ AWS Elastic Beanstalk (Multi-Container Docker)

Duc uses a **multi-container Docker architecture** for production deployment:

```
┌─────────────────────────────────────┐
│     Internet (Port 80)              │
└─────────────┬───────────────────────┘
              │
     ┌────────▼────────┐
     │ Nginx Container  │  ← Dockerfile.frontend
     │ - Serves Frontend│
     │ - Proxies /api/* │
     └────────┬─────────┘
              │
     ┌────────▼────────┐
     │Backend Container│  ← Dockerfile
     │ - FastAPI:8000  │
     │ - ChromaDB      │
     └─────────────────┘
```

**Why Multi-Container Docker?**
- 🐳 True container isolation
- 🔒 Backend not directly exposed to internet
- ⚡ Nginx handles static assets and proxying
- 📦 Same setup works locally and in production
- 🚀 Fast deployments with container caching

### Quick Deployment (3 Steps)

#### 1. Create Deployment Zip

```powershell
# In project root
Compress-Archive -Path * -DestinationPath duc-eb-deploy.zip
```

#### 2. Upload to AWS

1. Go to [AWS Elastic Beanstalk Console](https://console.aws.amazon.com/elasticbeanstalk)
2. Click **"Create Application"**
3. Choose:
   - **Platform**: Docker
   - **Platform branch**: Multi-container Docker
   - **Upload your code**: Select `duc-eb-deploy.zip`
   - **Instance type**: `t3.small` (testing) or `t3.medium` (production)

#### 3. Set Environment Variable

- Go to **Configuration → Software → Environment properties**
- Add: `OPENAI_API_KEY` = `sk-your-actual-key`
- Click **"Apply"**

Wait 5-10 minutes for deployment, then access:
- **Frontend**: `http://your-env.elasticbeanstalk.com/`
- **API**: `http://your-env.elasticbeanstalk.com/api/`
- **Health**: `http://your-env.elasticbeanstalk.com/health`
- **Docs**: `http://your-env.elasticbeanstalk.com/docs`

### What Gets Deployed

**Files Included:**
- ✅ `Dockerfile` - Backend container
- ✅ `Dockerfile.frontend` - Frontend + Nginx container
- ✅ `Dockerrun.aws.json` - Container orchestration
- ✅ `app/` - Backend code
- ✅ `frontend/` - Frontend source (built in container)
- ✅ `.ebextensions/` - Storage configuration

**Files Excluded (via `.ebignore`):**
- ❌ `.env` - Set in EB console instead
- ❌ `node_modules` - Installed in container
- ❌ `chroma_store` - Created on instance
- ❌ `frontend/build` - Built in container

### Cost Estimate

- **t3.small**: ~$15/month (testing)
- **t3.medium**: ~$30/month (production)
- **Data transfer**: Varies by usage

### 🌐 Other Cloud Platforms

Duc can be deployed to any platform supporting multi-container Docker:

- **AWS ECS**: Use the Dockerfiles with ECS task definitions
- **Google Cloud Run**: Deploy both containers separately
- **Azure Container Instances**: Use container groups
- **Kubernetes**: Create deployments for both containers
- **DigitalOcean App Platform**: Upload the same zip

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

Duc is constantly evolving! Here's what's on the roadmap:

### 🚀 Coming Soon
- [ ] **🔐 Multi-User Authentication**: JWT-based auth with user-specific document libraries
- [ ] **📊 Analytics Dashboard**: Track usage, popular queries, and document insights
- [ ] **🎨 Citation Highlighting**: Visual inline citations in the UI
- [ ] **🔍 Advanced Search**: Hybrid search combining vector + keyword matching
- [ ] **📱 Mobile App**: Native iOS and Android applications
- [ ] **🌍 Multi-Language**: Support for non-English documents

### 🧪 Experimental Features
- [ ] **🤖 Reranking**: Cohere Rerank or cross-encoders for precision
- [ ] **⚡ Background Processing**: Async uploads with Celery/Lambda
- [ ] **📈 RAG Evaluation**: RAGAS integration for quality metrics
- [ ] **🔭 Observability**: LangSmith/Langfuse tracing and monitoring
- [ ] **🧩 Semantic Chunking**: Context-aware document splitting
- [ ] **👁️ Multi-Modal**: Vision models for images, tables, charts
- [ ] **🗣️ Voice Interface**: Speech-to-text for voice queries
- [ ] **🔗 Web Scraping**: Direct URL ingestion

## 📚 Tech Stack

### Backend
- **🚀 Framework**: FastAPI 0.115+ (async, high-performance)
- **🧠 LLM**: OpenAI GPT-4o-mini (customizable)
- **📊 Embeddings**: OpenAI text-embedding-3-small
- **💾 Vector Store**: ChromaDB 0.5.5 (persistent local storage)
- **🔗 Orchestration**: LangChain 0.2.14 + LCEL chains
- **📄 Document Loaders**: PyPDF, python-docx, unstructured, csv
- **✅ Validation**: Pydantic for settings management

### Frontend
- **⚛️ Framework**: React 18+ with TypeScript
- **⚡ Build Tool**: Vite 6+ (lightning-fast HMR)
- **🎨 UI Components**: shadcn/ui + Radix UI primitives
- **🎨 Styling**: TailwindCSS 4+ (utility-first CSS)
- **📝 Markdown**: react-markdown with syntax highlighting
- **📐 Math**: KaTeX for LaTeX rendering
- **📊 Diagrams**: Mermaid for flowcharts and diagrams
- **🎭 Icons**: Lucide React icon library

### DevOps & Infrastructure
- **🐳 Containerization**: Docker + Docker Compose
- **☁️ Cloud**: AWS Elastic Beanstalk
- **📊 Monitoring**: CloudWatch (AWS)
- **🔒 Security**: CORS, environment-based config
- **📝 API Docs**: Swagger UI + ReDoc (auto-generated)

## 📄 License

MIT License - Duc is free for personal and commercial use! Feel free to build amazing things with it. <img src="frontend/public/duck-icon.svg" alt="Duc" width="20" height="20" style="vertical-align: middle;"/>

## 🤝 Contributing

We welcome contributions from the community! Duc is better with your help.

**How to Contribute:**
1. 🍴 Fork the repository
2. 🌿 Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. 💾 Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. 📤 Push to the branch (`git push origin feature/AmazingFeature`)
5. 🎉 Open a Pull Request

**Contribution Ideas:**
- 🐛 Bug fixes and improvements
- 📚 Documentation enhancements
- ✨ New features from the roadmap
- 🧪 Test coverage improvements
- 🌍 Internationalization

## 📞 Support & Community

Need help? We're here for you! <img src="frontend/public/duck-icon.svg" alt="Duc" width="20" height="20" style="vertical-align: middle;"/>

- **📖 Documentation**: Check our comprehensive guides
- **🐛 Bug Reports**: [Open a GitHub Issue](https://github.com/hassanalzahrani-1/duc/issues)
- **💡 Feature Requests**: Share your ideas via GitHub Issues
- **📚 LangChain Docs**: [python.langchain.com](https://python.langchain.com/)
- **🤖 OpenAI API**: [platform.openai.com/docs](https://platform.openai.com/docs)

## <img src="frontend/public/duck-icon.svg" alt="Duc" width="24" height="24" style="vertical-align: middle;"/> About Duc

Duc is more than just a document assistant—it's your intelligent companion for understanding and extracting insights from any document. Named after our friendly duck mascot, Duc makes complex document analysis simple, intuitive, and even fun!

**Why choose Duc?**
- 🎯 **Focused on UX**: Beautiful, intuitive interface that's a joy to use
- 🔒 **Privacy-First**: Your documents stay secure and under your control
- 🚀 **Production-Ready**: Battle-tested architecture with real-world deployment
- 🛠️ **Highly Customizable**: Easy to extend and adapt to your needs
- 📚 **Well-Documented**: Comprehensive guides for every feature

---

*Powered by FastAPI • React • LangChain • OpenAI • ChromaDB*
