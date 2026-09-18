# PrepPal — Backend API Server

The backend service for PrepPal provides RESTful endpoints for user authentication, DSA problem tracking, spaced repetition scheduling, and a vector search pipeline for document-grounded AI interaction.

## Architecture Highlights

- **Decoupled Document Chunks:** Uploaded PDFs are parsed and stored in a dedicated `chunks` collection rather than embedded within single documents.
- **MongoDB Atlas Vector Search:** Text chunks are converted into 384-dimensional dense vector embeddings using `all-MiniLM-L6-v2` via Hugging Face.
- **LLM Inference:** Integrates Groq's LPU infrastructure (GPT-OSS-120B) via LangChain.js for document Q&A and mock interview generation.

## Tech Stack

- **Runtime & Framework:** Node.js, Express.js
- **Database:** MongoDB Atlas 
- **Vector Search:** MongoDB Atlas Vector Search
- **Embeddings:** Hugging Face API (`sentence-transformers/all-MiniLM-L6-v2`)
- **LLM Provider:** Groq (GPT-OSS-120B) via LangChain.js
- **Auth & Middleware:** JWT, Bcrypt.js, Multer
- **Deployment:** Render

## Key API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Authenticate & receive JWT
- `GET /api/auth/profile` - Fetch user profile

### DSA Tracker (`/api/problems`)
- `GET /api/problems` - Fetch & filter problems
- `POST /api/problems` - Add a problem
- `PUT /api/problems/:id` - Update a problem
- `GET /api/problems/revise-today` - Fetch problems due for revision
- `PUT /api/problems/:id/revise` - Mark problem as revised

### Notes & AI (`/api/notes`, `/api/ai`)
- `POST /api/notes/upload` - Upload, process, embed & index notes
- `POST /api/ai/ask` - Ask questions using RAG
- `POST /api/ai/generate-questions` - Generate practice questions
- `POST /api/ai/mock-interview` - Run an AI mock interview
