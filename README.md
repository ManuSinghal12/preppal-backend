# PrepPal — Backend API Server

The backend service for PrepPal provides RESTful endpoints for user authentication, DSA problem tracking, spaced repetition scheduling, and a vector search pipeline for document-grounded AI interaction.

## Architecture Highlights

- **Decoupled Document Chunks:** Uploaded PDFs are parsed and stored in a dedicated `chunks` collection rather than embedded within single documents, avoiding the MongoDB 16MB document size limit for large files.
- **MongoDB Atlas Vector Search:** Text chunks are converted into 384-dimensional dense vector embeddings using `all-MiniLM-L6-v2` via Hugging Face and indexed natively in MongoDB Atlas using HNSW vector indexes.
- **LLM Inference:** Integrates Groq's LPU infrastructure (Llama 3.3 70B) via LangChain.js to achieve an average sub-2-second inference latency for document Q&A and mock interview generation.
- **Database Batch Processing:** Ingestion pipelines utilize `insertMany` bulk operations to optimize network roundtrips during document processing.

## Tech Stack

- **Runtime & Framework:** Node.js, Express.js
- **Database:** MongoDB Atlas (Mongoose ODM)
- **Vector Search:** MongoDB Atlas Vector Search
- **Embeddings:** Hugging Face API (`sentence-transformers/all-MiniLM-L6-v2`)
- **LLM Provider:** Groq (Llama 3.3 70B) via LangChain.js
- **Auth & Middleware:** JWT, Bcrypt.js, Multer
- **Deployment:** Render

## Key API Endpoints

### Auth (`/api/auth`)
- `POST /api/auth/register` - Create user account
- `POST /api/auth/login` - Authenticate & receive JWT Token
- `GET /api/auth/me` - Fetch authenticated user profile

### DSA Tracker (`/api/problems`)
- `GET /api/problems` - Query problems (supports search, topic, status filters)
- `POST /api/problems` - Add a problem record
- `PUT /api/problems/:id` - Update status, notes, or revision date
- `DELETE /api/problems/:id` - Delete a problem record

### RAG & Notes (`/api/notes`)
- `POST /api/notes/upload` - Upload PDF, extract text, chunk, embed, and index
- `GET /api/notes` - List user uploaded documents
- `POST /api/notes/chat` - Vector similarity search & LLM response generation
