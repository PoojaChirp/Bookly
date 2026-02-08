# System Architecture Diagrams

## High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        A[Web Browser]
        A1[Chat Interface]
        A2[Analytics Dashboard]
    end
    
    subgraph "Application Layer"
        B[Express.js API Server]
        B1[Query Router]
        B2[Order Routes]
        B3[Knowledge Routes]
        B4[Analytics Routes]
    end
    
    subgraph "Data Layer"
        C[(MongoDB Atlas)]
        C1[Orders Collection]
        C2[KnowledgeBase Collection]
    end
    
    subgraph "AI Layer"
        D[Google Gemini AI]
        D1[Intent Classification]
        D2[Response Generation]
    end
    
    A --> A1
    A --> A2
    A1 -->|REST API| B
    A2 -->|REST API| B
    B --> B1
    B --> B2
    B --> B3
    B --> B4
    B1 -->|Query| C
    B1 -->|Generate| D
    B2 <-->|CRUD| C1
    B3 <-->|CRUD| C2
    B4 -->|Aggregate| C
    D1 --> D2
```

## Query Processing Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API Server
    participant M as MongoDB
    participant G as Gemini AI
    
    U->>F: "Where's my order ORD-12345?"
    F->>A: POST /api/query
    
    Note over A: Extract identifiers<br/>(order ID, email)
    
    A->>A: Analyze intent
    Note over A: Intent: order_status
    
    A->>M: Find order by ID
    M-->>A: Order data
    
    A->>M: Search knowledge base
    M-->>A: Relevant articles
    
    Note over A: Assemble context:<br/>- Order details<br/>- KB articles<br/>- User query
    
    A->>G: Generate response with context
    G-->>A: Natural language response
    
    A-->>F: Response + metadata
    F-->>U: Display response with tools used
```

## Data Flow Architecture

```mermaid
graph LR
    subgraph "User Input"
        A[Natural Language Query]
    end
    
    subgraph "Processing Pipeline"
        B[Intent Analysis]
        C[Identifier Extraction]
        D[Data Retrieval]
        E[Context Assembly]
        F[AI Processing]
        G[Response Formatting]
    end
    
    subgraph "Data Sources"
        H[(Orders DB)]
        I[(Knowledge Base)]
    end
    
    subgraph "Output"
        J[Natural Response]
        K[Metadata]
    end
    
    A --> B
    A --> C
    C --> D
    D --> H
    D --> I
    H --> E
    I --> E
    B --> E
    E --> F
    F --> G
    G --> J
    G --> K
```

## Database Schema

```mermaid
erDiagram
    ORDERS ||--o{ ITEMS : contains
    ORDERS {
        ObjectId _id PK
        String order_id UK
        String customer_email
        String status
        Array items
        String shipping_address
        Date order_date
        String tracking_number
        Date estimated_delivery
        Number total_amount
        Date createdAt
        Date updatedAt
    }
    
    ITEMS {
        String item_name
    }
    
    KNOWLEDGEBASE {
        ObjectId _id PK
        String category
        String title
        String content
        Array keywords
        Number priority
        Number views
        Number helpful_count
        Date createdAt
        Date updatedAt
    }
    
    ANALYTICS {
        String metric_name
        Number value
        Date timestamp
    }
    
    ORDERS ||--o{ ANALYTICS : generates
    KNOWLEDGEBASE ||--o{ ANALYTICS : generates
```

## System Components

```mermaid
graph TB
    subgraph "Frontend Components"
        UI[User Interface]
        Chat[Chat Container]
        Input[Message Input]
        Analytics[Analytics Panel]
    end
    
    subgraph "Backend Services"
        Router[Express Router]
        Query[Query Service]
        Orders[Order Service]
        KB[Knowledge Service]
        Stats[Analytics Service]
    end
    
    subgraph "External Services"
        Mongo[(MongoDB Atlas)]
        Gemini[Gemini AI API]
    end
    
    UI --> Chat
    UI --> Input
    UI --> Analytics
    
    Chat -->|WebSocket/REST| Router
    Input -->|POST /query| Router
    Analytics -->|GET /analytics| Router
    
    Router --> Query
    Router --> Orders
    Router --> KB
    Router --> Stats
    
    Query --> Mongo
    Query --> Gemini
    Orders --> Mongo
    KB --> Mongo
    Stats --> Mongo
```

## Deployment Architecture (Production)

```mermaid
graph TB
    subgraph "Edge Layer"
        CDN[CDN / Cloudflare]
        WAF[Web Application Firewall]
    end
    
    subgraph "Load Balancing"
        LB[Load Balancer]
    end
    
    subgraph "Application Tier"
        APP1[App Server 1]
        APP2[App Server 2]
        APP3[App Server 3]
    end
    
    subgraph "Caching Layer"
        Redis[(Redis Cache)]
    end
    
    subgraph "Data Tier"
        Primary[(MongoDB Primary)]
        Secondary1[(MongoDB Secondary)]
        Secondary2[(MongoDB Secondary)]
    end
    
    subgraph "External APIs"
        Gemini[Gemini AI]
    end
    
    subgraph "Monitoring"
        Logs[Log Aggregation]
        Metrics[Metrics/APM]
    end
    
    Internet --> CDN
    CDN --> WAF
    WAF --> LB
    
    LB --> APP1
    LB --> APP2
    LB --> APP3
    
    APP1 --> Redis
    APP2 --> Redis
    APP3 --> Redis
    
    APP1 --> Primary
    APP2 --> Primary
    APP3 --> Primary
    
    Primary --> Secondary1
    Primary --> Secondary2
    
    APP1 --> Gemini
    APP2 --> Gemini
    APP3 --> Gemini
    
    APP1 --> Logs
    APP2 --> Logs
    APP3 --> Logs
    
    APP1 --> Metrics
    APP2 --> Metrics
    APP3 --> Metrics
```

## Technology Stack Visualization

```mermaid
graph LR
    subgraph "Frontend"
        HTML[HTML5]
        CSS[CSS3]
        JS[JavaScript ES6+]
    end
    
    subgraph "Backend"
        Node[Node.js 18+]
        Express[Express.js 4.x]
        Mongoose[Mongoose ODM]
    end
    
    subgraph "Database"
        MongoDB[MongoDB Atlas]
        Indexes[Text Search Indexes]
    end
    
    subgraph "AI/ML"
        Gemini[Google Gemini 2.0]
        NLP[Natural Language Processing]
    end
    
    subgraph "DevOps"
        NPM[npm/package.json]
        ENV[Environment Variables]
        Git[Version Control]
    end
    
    HTML --> JS
    CSS --> JS
    JS -->|HTTP/REST| Express
    Express --> Node
    Express --> Mongoose
    Mongoose --> MongoDB
    MongoDB --> Indexes
    Express --> Gemini
    Gemini --> NLP
```

## Scaling Strategy

```mermaid
graph TB
    subgraph "Current State"
        S1[Single Server]
        S2[MongoDB Atlas Cluster]
        S3[Gemini API]
    end
    
    subgraph "Phase 1: 10K queries/day"
        P1[2 App Servers + LB]
        P2[MongoDB M10 Tier]
        P3[Redis Cache]
    end
    
    subgraph "Phase 2: 100K queries/day"
        P4[5+ App Servers]
        P5[MongoDB M30 Tier]
        P6[Distributed Cache]
        P7[CDN Integration]
    end
    
    subgraph "Phase 3: 1M queries/day"
        P8[Auto-scaling Group]
        P9[Sharded MongoDB]
        P10[Multi-region Deploy]
        P11[Edge Computing]
    end
    
    S1 --> P1
    S2 --> P2
    S3 --> P3
    
    P1 --> P4
    P2 --> P5
    P3 --> P6
    
    P4 --> P8
    P5 --> P9
    P7 --> P11
```
