# Bookly AI Customer Support System

An intelligent customer support system that combines MongoDB database operations with Google Gemini AI to provide automated, natural language responses to customer queries.

## 🎯 Project Overview

This system demonstrates a production-ready approach to customer support automation by:
- Understanding natural language queries
- Querying MongoDB for structured data (orders, knowledge base)
- Using Google Gemini AI for response generation
- Providing transparent insights into system operations

## ✨ Key Features

- **Natural Language Processing:** Understands customer queries in conversational language
- **Smart Data Retrieval:** Extracts order IDs, emails from queries and fetches relevant data
- **Intent Classification:** Automatically determines query type (order status, returns, shipping, etc.)
- **Hybrid AI:** Combines database lookups with LLM-generated responses
- **Transparent Operations:** Shows which tools were used to generate each response
- **Real-time Analytics:** Dashboard showing support metrics and trends
- **Knowledge Base:** Searchable repository of policies and FAQs

## 🛠 Technology Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB Atlas** - Cloud database
- **Mongoose** - MongoDB ODM
- **Google Gemini AI** - LLM for response generation

### Frontend
- **Vanilla JavaScript** - No framework overhead
- **Modern CSS** - Flexbox, Grid, animations
- **Fetch API** - RESTful communication

## 📋 Prerequisites

- Node.js 16+ installed
- MongoDB Atlas account (free tier works)
- Google AI Studio API key (Gemini)
- Git

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd bookly-demo
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# MongoDB
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/bookly?retryWrites=true&w=majority

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Server
PORT=3000
NODE_ENV=development
```

**Getting MongoDB Atlas URI:**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Create database user
4. Get connection string
5. Replace `<password>` with your password

**Getting Gemini API Key:**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create new API key
3. Copy key to `.env` file

### 4. Seed the Database

```bash
npm run seed
```

This creates:
- 100 realistic order records
- 17 knowledge base articles across 6 categories
- Text search indexes

### 5. Start the Server

```bash
npm start
```

Or for development with auto-restart:

```bash
npm run dev
```

### 6. Access the Application

Open your browser to:
```
http://localhost:3000
```

## 📁 Project Structure

```
bookly-demo/
├── models/
│   ├── Order.js              # Order data model
│   └── KnowledgeBase.js      # Knowledge base model
├── routes/
│   ├── orders.js             # Order CRUD operations
│   ├── knowledge.js          # Knowledge base operations
│   ├── query.js              # Main AI query endpoint
│   └── analytics.js          # Analytics and metrics
├── seed/
│   └── seedData.js           # Database seeding script
├── public/
│   ├── index.html            # Frontend HTML
│   ├── script.js             # Frontend JavaScript
│   └── style.css             # Frontend styles
├── docs/
│   └── INTERVIEW_PREP.md     # Comprehensive interview guide
├── .env                      # Environment variables (create this)
├── server.js                 # Main application entry
└── package.json              # Dependencies and scripts
```

## 🔌 API Endpoints

### Query API
- `POST /api/query` - Main query endpoint
  - Request: `{ query: "What's the status of ORD-12345?" }`
  - Response: `{ success: true, response: "...", tools_used: [...], metadata: {...} }`

### Orders API
- `GET /api/orders` - List orders (with filters)
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Cancel order
- `GET /api/orders/stats/overview` - Order statistics

### Knowledge Base API
- `GET /api/knowledge` - List knowledge articles
- `GET /api/knowledge/search?q=shipping` - Search articles
- `GET /api/knowledge/:id` - Get single article
- `POST /api/knowledge` - Create article
- `PUT /api/knowledge/:id` - Update article
- `DELETE /api/knowledge/:id` - Delete article
- `POST /api/knowledge/:id/helpful` - Mark as helpful

### Analytics API
- `GET /api/analytics/dashboard` - Complete dashboard metrics
- `GET /api/analytics/customers` - Customer analytics

### Health Check
- `GET /api/health` - System health status

## 💡 Usage Examples

### Example Queries to Try

1. **Order Status by ID:**
   ```
   "What's the status of order ORD-45231?"
   ```

2. **Order Status by Email:**
   ```
   "Show me orders for john.doe@email.com"
   ```

3. **Policy Questions:**
   ```
   "How do I return a book?"
   "What's your shipping policy?"
   "How do I reset my password?"
   ```

4. **Complex Queries:**
   ```
   "I want to return order ORD-45231, can I still do that?"
   "My order is late, what should I do?"
   ```

### Sample Response

```json
{
  "success": true,
  "response": "Your order ORD-45231 is currently shipped. It contains The Great Gatsby and 1984. The tracking number is TRK1234567890, and the estimated delivery date is February 10, 2026.",
  "tools_used": [
    "MongoDB:OrderLookup",
    "Gemini:2.5-Flash"
  ],
  "intent": "order_status",
  "metadata": {
    "found_orders": 1,
    "found_knowledge": 0
  }
}
```

## 🧪 Testing

### Manual Testing

1. **Test Order Lookup:**
   - Open browser console
   - Look for "ORD-" IDs in seed data output
   - Query for specific order

2. **Test Knowledge Base:**
   - Ask about shipping, returns, password reset
   - Verify relevant articles are retrieved

3. **Test Analytics:**
   - Click "Analytics" button
   - Verify metrics display correctly

### Automated Testing (Future)

```bash
npm test
```

## 🔐 Security Considerations

**Current Implementation:**
- Environment variables for secrets
- Input validation via Mongoose schemas
- HTML escaping on frontend
- HTTPS recommended for production

**Production Enhancements:**
- Add authentication (JWT, OAuth)
- Implement rate limiting
- Add CSRF protection
- Enable MongoDB encryption at rest
- Implement audit logging
- Add input sanitization middleware

## 📊 Performance Optimization

**Current:**
- Database indexes on frequently queried fields
- Text search indexes for knowledge base
- Efficient query projections

**Production Improvements:**
- Add Redis caching layer
- Implement CDN for static assets
- Enable MongoDB connection pooling
- Add response caching with TTL
- Implement database query optimization
- Set up application monitoring (Datadog, New Relic)

## 🚀 Deployment

### Development
```bash
npm start
```

### Production (Example with PM2)

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start server.js --name bookly-api

# Monitor
pm2 logs bookly-api
pm2 monit

# Auto-restart on reboot
pm2 startup
pm2 save
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

```bash
docker build -t bookly-api .
docker run -p 3000:3000 --env-file .env bookly-api
```

## 📈 Monitoring & Analytics

**Key Metrics to Track:**
- Query response time
- Automation rate (% queries handled by AI)
- Customer satisfaction (CSAT)
- Error rate
- Popular knowledge articles
- Order statistics

**Logging:**
All requests are logged with timestamp and endpoint. In production, integrate with:
- Datadog
- Splunk
- CloudWatch
- ELK Stack

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Interview & Demo

For interview preparation, see [docs/INTERVIEW_PREP.md](docs/INTERVIEW_PREP.md) which includes:
- Technical deep dives
- Business impact analysis
- Case studies
- Architecture diagrams
- Demo script
- Common interview questions

## 🆘 Troubleshooting

### MongoDB Connection Error
- Verify `MONGO_URI` in `.env`
- Check MongoDB Atlas network access (allow your IP)
- Ensure database user has correct permissions

### Gemini API Error
- Verify `GEMINI_API_KEY` in `.env`
- Check API quota limits
- Ensure API is enabled in Google Cloud Console

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 npm start
```

## 📞 Support

For questions or issues:
- Create an issue in the repository
- Email: your-email@example.com

---

**Built with ❤️ for demonstrating modern full-stack development practices**
