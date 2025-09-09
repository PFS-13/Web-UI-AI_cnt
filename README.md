# ChatGPT-like Application

A full-stack web application that mimics ChatGPT functionality with real-time messaging, conversation history, and search capabilities.

## 🏗️ Architecture

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Axios** for HTTP requests

### Backend
- **Python 3.11+** with FastAPI (Primary backend)
- **PostgreSQL** (Primary database)
- **Elasticsearch 8.x** (Search indexing)
- **Redis** (Caching and session storage)

## 📁 Project Structure

```
Chatgpt/
├── frontend/                 # React TypeScript frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── package.json
│   └── Dockerfile
├── backend/                  # Python FastAPI backend
│   ├── app/
│   │   ├── core/
│   │   ├── models/
│   │   ├── routers/
│   │   └── schemas/
│   ├── main.py
│   └── requirements.txt
├── database/                 # Database initialization
│   └── init.sql
├── env.example              # Environment variables template
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL 15+
- Redis 7+
- Elasticsearch 8.11.0

### Setup Instructions

1. **Clone and setup environment:**
   ```bash
   git clone <repository-url>
   cd Chatgpt
   cp env.example .env
   ```

2. **Update environment variables:**
   Edit `.env` file with your configuration:
   ```env
   SECRET_KEY=your-secret-key-here
   JWT_SECRET=your-jwt-secret-here
   OPENAI_API_KEY=your-openai-api-key
   ```

3. **Install and start services:**
   ```bash
   # Install dependencies for all services
   cd frontend && npm install
   cd ../backend && pip install -r requirements.txt
   ```

4. **Start the application:**
   ```bash
   # Terminal 1 - Backend
   cd backend && uvicorn main:app --reload

   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

5. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Elasticsearch: http://localhost:9200

### Local Development

#### 1. Database Setup
```bash
# Install and start services locally:
# - PostgreSQL 15+
# - Redis 7+
# - Elasticsearch 8.11.0

# Create database
createdb chatgpt_db

# Run database initialization
psql -d chatgpt_db -f database/init.sql
```

#### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp env.example .env
# Edit .env with your configuration
uvicorn main:app --reload
```

#### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/chatgpt_db
REDIS_URL=redis://localhost:6379
ELASTICSEARCH_URL=http://localhost:9200
SECRET_KEY=your-secret-key-here
OPENAI_API_KEY=your-openai-api-key
```


## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/token` - User login

### Chat Endpoints
- `GET /api/chat/conversations` - Get user conversations
- `POST /api/chat/conversations` - Create new conversation
- `GET /api/chat/conversations/{id}` - Get specific conversation
- `POST /api/chat/send` - Send message

### Search Endpoints
- `GET /api/search/conversations?query={query}` - Search conversations
- `POST /api/search/index` - Index conversation for search


## 🗄️ Database Schema

### Users Table
- `id` (Primary Key)
- `email` (Unique)
- `username` (Unique)
- `hashed_password`
- `is_active`
- `created_at`, `updated_at`

### Conversations Table
- `id` (Primary Key)
- `user_id` (Foreign Key)
- `title`
- `created_at`, `updated_at`

### Messages Table
- `id` (Primary Key)
- `conversation_id` (Foreign Key)
- `content`
- `role` (user/assistant)
- `created_at`

## 🔍 Search Features

The application uses Elasticsearch for:
- Full-text search across conversation history
- Highlighted search results
- User-specific search filtering
- Real-time indexing of new messages

## 🚀 Deployment

### Production Considerations

1. **Security:**
   - Change default secrets
   - Use HTTPS
   - Configure proper CORS
   - Set up rate limiting

2. **Database:**
   - Use managed PostgreSQL service
   - Set up database backups
   - Configure connection pooling

3. **Caching:**
   - Use managed Redis service
   - Configure Redis persistence
   - Set up Redis clustering for high availability

4. **Search:**
   - Use managed Elasticsearch service
   - Configure index templates
   - Set up proper sharding

### Production Deployment
```bash
# Build and deploy manually or use your preferred deployment method
# Ensure all services are properly configured for production
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm run lint
```


## 📝 Development

### Adding New Features

1. **Backend API:**
   - Add models in `app/models/`
   - Create schemas in `app/schemas/`
   - Implement routes in `app/routers/`

2. **Frontend Components:**
   - Create components in `frontend/src/components/`
   - Update routing in `App.tsx`

### Code Style
- Python: Follow PEP 8
- TypeScript: Use ESLint and Prettier
- JavaScript: Use ESLint and Prettier

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **Port conflicts:**
   - Check if ports 3000, 3001, 5432, 6379, 8000, 9200 are available

2. **Database connection:**
   - Ensure PostgreSQL is running
   - Check database credentials

3. **Redis connection:**
   - Ensure Redis is running
   - Check Redis URL configuration

4. **Elasticsearch issues:**
   - Ensure Elasticsearch is running
   - Check memory allocation (minimum 512MB)

### Logs
```bash
# View service logs directly from terminal where services are running
# Or check system logs for each service
```

## 🔮 Future Enhancements

- [ ] AI model integration (OpenAI, Anthropic, etc.)
- [ ] File upload support
- [ ] Voice message support
- [ ] Multi-language support
- [ ] Advanced search filters
- [ ] Conversation sharing
- [ ] User profiles and preferences
- [ ] Admin dashboard
- [ ] Analytics and metrics
- [ ] Mobile app support
