# 🚀 ARANDU Backend - SchoolAI with Blockchain Integration

## 📋 Overview

**ARANDU** is a comprehensive educational platform backend that combines **Artificial Intelligence** with **Blockchain technology**. Built with modern technologies, it provides RESTful APIs for user management, educational content, progress tracking, AI-powered content generation, and complete blockchain integration for transparent educational rewards.

## 🔗 Blockchain Integration Features

### 🎯 Smart Contracts
- **ANDU Token**: ERC-20 token for educational rewards
- **AranduRewards**: Main contract for reward distribution
- **AranduBadges**: NFT contract for achievement badges
- **AranduCertificates**: NFT contract for course certificates
- **DataAnchor**: Contract for anchoring educational data on-chain

### 🌐 Network
- **Network**: Lisk Sepolia Testnet
- **Chain ID**: 4202
- **Explorer**: [Sepolia Blockscout](https://sepolia-blockscout.lisk.com)

### 🎓 Student Features
- ✅ Complete learning activities and earn ANDU tokens
- ✅ Collect NFT badges for achievements
- ✅ Earn NFT certificates for course completion
- ✅ View blockchain transaction history
- ✅ Real-time balance updates

### 👨‍🏫 Teacher Features
- ✅ Create NFT educational content
- ✅ Verify teacher credentials on-chain
- ✅ Distribute rewards to students
- ✅ Issue certificates for completed courses
- ✅ Track teaching impact through blockchain metrics

### 👨‍💼 Admin Features
- ✅ Batch reward distribution
- ✅ System-wide statistics and analytics
- ✅ Failed transaction retry mechanisms
- ✅ Real-time event monitoring
- ✅ Data anchoring for transparency

## 🏗️ Architecture

### Technology Stack
- **Runtime**: Node.js with ES Modules
- **Framework**: Express.js 4.18.2
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **AI Integration**: Google Generative AI (Gemini 2.0)
- **Blockchain**: Ethereum/Lisk Sepolia with Ethers.js
- **Documentation**: Swagger/OpenAPI 3.0
- **Validation**: Express-validator + Zod
- **Security**: bcrypt, CORS

### Project Structure
```
ARANDU-Back-Aleph/
├── prisma/                    # Database schema and migrations
│   ├── schema.prisma         # Data models with blockchain extensions
│   └── migrations/           # Database migrations
├── src/
│   ├── app.js               # Server configuration
│   ├── index.js             # Entry point with dotenv
│   ├── components/          # Feature modules
│   │   ├── user/            # User management
│   │   ├── role/            # Roles and permissions
│   │   ├── grade/           # Academic grades
│   │   ├── subject/         # Subjects and curriculum
│   │   ├── subtopic/        # Detailed learning topics
│   │   ├── classAssignment/ # Assignments and tasks
│   │   ├── schedule/        # Class scheduling
│   │   ├── progress/        # Learning progress tracking
│   │   ├── aiFeedback/      # AI-powered feedback
│   │   ├── AI/              # AI writing assistant
│   │   ├── AIGame/          # AI-generated educational games
│   │   └── blockchain/      # Complete blockchain integration
│   ├── services/            # External services and integrations
│   │   ├── auth/            # Authentication services
│   │   ├── AranduContractService.js  # Blockchain contract interactions
│   │   ├── BlockchainDatabaseService.js  # Blockchain data management
│   │   ├── BlockchainEventService.js     # Event listening and processing
│   │   ├── PrismaAranduService.js        # Database operations
│   │   └── nftService.js     # NFT and token services
│   ├── middlewares/         # Custom middlewares
│   ├── validators/          # Input validation
│   ├── helpers/             # Utility functions
│   ├── config/              # Configuration files
│   └── abis/                # Smart contract ABIs
├── scripts/
│   ├── testing/             # Test automation scripts
│   ├── utils/               # Utility and maintenance scripts
│   └── migrations/          # Database migration scripts
├── temp/                    # Temporary files (auto-cleaned)
└── public/                  # Static assets (if needed)
```

## 🗄️ Data Model (Prisma Schema)

### Main Entities

#### User (Users)

```prisma
model User {
  id         String       @id @default(uuid())
  name       String       @db.VarChar(100)
  email      String       @unique @db.VarChar(255)
  password   String       @db.VarChar(255)
  image      String?
  bio        String?      @db.Text
  createdAt  DateTime     @default(now())
  updatedAt  DateTime     @updatedAt

  userRoles     UserRole[]
  assignments   ClassAssignment[]
  progress      Progress[]
}
```

#### Role (Roles)

```prisma
model Role {
  id          String     @id @default(uuid())
  name        String     @unique @db.VarChar(50) // "teacher", "admin", "student"
  description String
  permissions String     @db.Text // JSON permissions
}
```

#### Academic Structure

- **Grade**: Academic grades (6th Grade A, etc.)
- **Subject**: Subjects (Mathematics, Science, etc.)
- **Subtopic**: Specific subtopics within a subject
- **ClassAssignment**: Teacher assignments to grades/subjects
- **Schedule**: Class schedules

#### Progress (Progress)

```prisma
model Progress {
  id           String   @id @default(uuid())
  userId       String   // teacher or student
  subtopicId   String
  progressType String   @db.VarChar(20) // "learning", "teaching", "mastery"
  percentage   Decimal  @db.Decimal(5,2) // 0.00–100.00
  completedAt  DateTime?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

#### AI Feedback

```prisma
model AIFeedBack {
  id              String   @id @default(uuid())
  subtopicId      String
  timeMinutes     Int      // total lesson time
  stepNumber      Int      // order of steps
  stepName        String   @db.VarChar(100)
  content         String   @db.Text
  studentActivity String?  @db.VarChar(455)
  timeAllocation  String   @db.VarChar(455)
  materialsNeeded String?  @db.VarChar(400)
  successIndicator String? @db.VarChar(400)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

## 🔌 API Endpoints

### Base URL

```bash
Development: http://localhost:3001/api-v1
Production: https://api.schoolai.com/api-v1
```

### Authentication

```bash
POST /api-v1/auth/login
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "user@example.com",
    "roles": ["teacher"]
  }
}
```

### Users
```
GET    /api-v1/usuario                    # List users
GET    /api-v1/usuario/:id                # Get user by ID
GET    /api-v1/usuario/email/:email       # Get user by email
POST   /api-v1/usuario                    # Create user
PUT    /api-v1/usuario                    # Update user
PATCH  /api-v1/usuario/password           # Change password
PATCH  /api-v1/usuario/token              # Renew token
POST   /api-v1/usuario/assign-rol         # Assign role
DELETE /api-v1/usuario/remove-rol         # Remove role
DELETE /api-v1/usuario/:id                # Delete user
```

### Roles
```
GET    /api-v1/roles                      # List roles
GET    /api-v1/roles/:id                  # Get role by ID
POST   /api-v1/roles                      # Create role
PUT    /api-v1/roles                      # Update role
DELETE /api-v1/roles/:id                  # Delete role
```

### Academic Structure

#### Grades
```
GET    /api-v1/grades                     # List grades
GET    /api-v1/grades/:id                 # Get grade by ID
POST   /api-v1/grades                     # Create grade
PUT    /api-v1/grades                     # Update grade
DELETE /api-v1/grades/:id                 # Delete grade
```

#### Subjects
```
GET    /api-v1/subjects                   # List subjects
GET    /api-v1/subjects/:id               # Get subject by ID
POST   /api-v1/subjects                   # Create subject
PUT    /api-v1/subjects                   # Update subject
DELETE /api-v1/subjects/:id               # Delete subject
```

#### Subtopics
```
GET    /api-v1/subtopics                  # List subtopics
GET    /api-v1/subtopics/:id              # Get subtopic by ID
POST   /api-v1/subtopics                  # Create subtopic
PUT    /api-v1/subtopics                  # Update subtopic
DELETE /api-v1/subtopics/:id              # Delete subtopic
```

### Assignments and Schedules

#### Class Assignments
```
GET    /api-v1/class-assignments          # List assignments
GET    /api-v1/class-assignments/:id      # Get assignment by ID
POST   /api-v1/class-assignments          # Create assignment
PUT    /api-v1/class-assignments          # Update assignment
DELETE /api-v1/class-assignments/:id      # Delete assignment
```

#### Schedules
```
GET    /api-v1/schedules                  # List schedules
GET    /api-v1/schedules/:id              # Get schedule by ID
POST   /api-v1/schedules                  # Create schedule
PUT    /api-v1/schedules                  # Update schedule
DELETE /api-v1/schedules/:id              # Delete schedule
```

### Progress
```
GET    /api-v1/progress                   # List progress
GET    /api-v1/progress/completado        # Completed progress
GET    /api-v1/progress/usuario/:userId   # Progress by user
GET    /api-v1/progress/subtopic/:subtopicId # Progress by subtopic
GET    /api-v1/progress/tipo/:progressType # Progress by type
GET    /api-v1/progress/:id               # Get progress by ID
POST   /api-v1/progress                   # Create progress
PUT    /api-v1/progress                   # Update progress
DELETE /api-v1/progress/:id               # Delete progress
```

### AI and Feedback

#### AI Feedback
```
GET    /api-v1/ai-feedback                # List AI feedback
GET    /api-v1/ai-feedback/:id            # Get feedback by ID
POST   /api-v1/ai-feedback                # Create feedback
PUT    /api-v1/ai-feedback                # Update feedback
DELETE /api-v1/ai-feedback/:id            # Delete feedback
```

#### AI Writing Assistant
```
POST   /api-v1/ai-writing-assistant/generate-feedback/:subtopicId
```

**Automatically generates educational content for a specific subtopic.**

**Response:**
```json
{
  "success": true,
  "message": "AI feedback generated successfully",
  "data": {
    "subtopic": {
      "id": "uuid",
      "name": "Basic Algebra",
      "description": "Fundamental algebra concepts",
      "subject": { "name": "Mathematics" }
    },
    "steps": [
      {
        "id": "uuid",
        "stepNumber": 1,
        "stepName": "Introduction and Engagement",
        "content": "Begin the lesson by introducing...",
        "timeMinutes": 15,
        "studentActivity": "Students participate in...",
        "timeAllocation": "5 min introduction, 8 min discussion...",
        "materialsNeeded": "Whiteboard, markers, projector",
        "successIndicator": "Students can articulate..."
      }
      // ... more steps
    ]
  }
}
```

## 🔐 Authentication and Authorization

### JWT Token
- **Algorithm**: HS256
- **Expiration**: Configurable (default 24 hours)
- **Header**: `Authorization: Bearer <token>`

### Authentication Middleware
```javascript
import { checkAuth } from '../middlewares/auth.js';

// Apply to protected routes
router.get('/protected', checkAuth, controllerFunction);
```

### Roles and Permissions
- **teacher**: Full access to course and student management
- **student**: Limited access to personal content and progress
- **admin**: Complete administrative access

## 🤖 AI Integration

### Google Generative AI (Gemini 2.0)
- **Model**: gemini-2.0-flash-exp
- **Configuration**: Temperature 0.8, Top-P 0.9, Top-K 40
- **Output**: Structured JSON
- **Retry Logic**: 3 attempts with validation

### AI Features
1. **Lesson Plan Generation**: 5 structured steps
2. **Educational Content**: Adapted to level and subject
3. **Student Activities**: Activity suggestions
4. **Success Indicators**: Evaluation metrics

## ⛓️ Blockchain Integration

### Mantle Network
- **Testnet**: Chain ID 5001
- **Mainnet**: Chain ID 5000
- **Currency**: MNT (Mantle Token)

### NFT Services
```javascript
// Connect wallet
const { provider, signer } = await nftService.connectWallet();

// Create certificate NFT
const nft = await nftService.createCertificateNFT(certificateData);

// Verify NFT
const verification = await nftService.verifyCertificate(tokenId);
```

### Smart Contracts
- **BookNFT**: Contract for educational certificates
- **ERC-721**: Standard for non-fungible tokens
- **Metadata**: IPFS for decentralized storage

## 📊 Swagger Documentation

### Documentation Access
```
Development: http://localhost:3001/api-docs
Production: https://api.schoolai.com/api-docs
```

### Features
- **OpenAPI 3.0**: Standard specification
- **Authentication**: Integrated Bearer token
- **Examples**: Request/Response examples
- **Schemas**: Model definitions

## 🔧 Configuration and Environment Variables

### Required Variables (.env)
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/schoolai"

# JWT
JWT_SECRET="your-super-secret-jwt-key"

# AI
GOOGLE_GENERATIVE_AI_API_KEY="your-gemini-api-key"

# Blockchain
NFT_CONTRACT_ADDRESS="0x..."
NFT_NETWORK="mantle" # or "mantleMainnet"

# Server
PORT=3001
NODE_ENV="development"

# Frontend
FRONTEND_URL="http://localhost:3000"
```

## 🚀 Installation and Execution

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### Installation
```bash
# Clone repository
git clone <repository-url>
cd SchoolAI

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your credentials

# Configure database
npm run build

# Run in development
npm run dev

# Run in production
npm start
```

### Available Scripts
```bash
npm run dev          # Development with nodemon
npm start            # Production
npm run build        # Generate Prisma client + push DB
npm run build-prod   # Production migrations
```

## 🔗 Integration with ARANDU Frontend

### Endpoint Mapping

#### Authentication
```javascript
// ARANDU Frontend -> SchoolAI Backend
POST /api/auth/login -> POST /api-v1/auth/login
POST /api/auth/register -> POST /api-v1/usuario
GET /api/auth/me -> GET /api-v1/usuario/email/:email
```

#### Users
```javascript
// ARANDU Frontend -> SchoolAI Backend
GET /api/users -> GET /api-v1/usuario
GET /api/users/:id -> GET /api-v1/usuario/:id
PUT /api/users/:id -> PUT /api-v1/usuario
GET /api/users/:id/progress -> GET /api-v1/progress/usuario/:userId
```

#### Courses (Conceptual Mapping)
```javascript
// "Courses" in ARANDU map to:
// - Subject (Subject)
// - Subtopic (Subtopic)
// - ClassAssignment (Class Assignment)

GET /api/courses -> GET /api-v1/subjects
GET /api/courses/:id -> GET /api-v1/subjects/:id
POST /api/courses -> POST /api-v1/subjects
```

#### Modules
```javascript
// "Modules" in ARANDU map to:
GET /api/modules/:id -> GET /api-v1/subtopics/:id
POST /api/modules/:id/complete -> POST /api-v1/progress
```

#### Assessments
```javascript
// "Assessments" in ARANDU can be implemented using:
// - Progress tracking
// - AI Feedback as assessment guides
POST /api/quizzes/:id/submit -> POST /api-v1/progress
```

#### Certificates
```javascript
// "Certificates" in ARANDU are implemented with:
// - NFT Service for blockchain certificates
// - Progress tracking for validation
POST /api/certificates -> nftService.createCertificateNFT()
GET /api/certificates/verify/:tokenId -> nftService.verifyCertificate()
```

### Required Adaptations

#### 1. Data Structure
```javascript
// ARANDU expects:
{
  "id": "course-id",
  "title": "Course Title",
  "instructor": { "name": "Instructor Name" },
  "modules": [...]
}

// SchoolAI provides:
{
  "id": "subject-id",
  "name": "Subject Name",
  "subtopics": [...],
  "assignments": [...]
}
```

#### 2. User Roles
```javascript
// ARANDU: "student" | "teacher" | "institution"
// SchoolAI: "student" | "teacher" | "admin"

// Mapping:
// ARANDU "institution" -> SchoolAI "admin"
```

#### 3. Progress
```javascript
// ARANDU: progressPercentage (0-100)
// SchoolAI: percentage (0.00-100.00)

// Conversion needed in frontend
```

## 🚧 Current Development Status

### ✅ **FULLY IMPLEMENTED**
- **Database Schema**: Complete Prisma models
- **API Endpoints**: All CRUD operations
- **Authentication**: JWT-based auth system
- **AI Integration**: Google Gemini AI integration
- **Progress Tracking**: User progress management
- **Role Management**: User roles and permissions
- **Academic Structure**: Grades, subjects, subtopics
- **Class Assignments**: Teacher-subject assignments
- **AI Feedback Generation**: Educational content generation
- **Documentation**: Swagger API documentation

### ⚠️ **PARTIALLY IMPLEMENTED**
- **Blockchain Integration**: NFT service structure ready, needs testing
- **Error Handling**: Basic error handling, needs enhancement
- **Validation**: Express-validator implemented, needs Zod integration
- **Testing**: Basic structure, needs comprehensive test suite

### ❌ **PENDING DEVELOPMENT**
- **Real-time Features**: WebSocket implementation
- **File Upload**: Document and media upload system
- **Email Service**: Notification system
- **Advanced Analytics**: Detailed reporting and metrics
- **Rate Limiting**: API protection
- **Caching**: Performance optimization
- **Monitoring**: Health checks and logging
- **Deployment**: Production deployment configuration

## 📈 Metrics and Monitoring

### Logs
- **Level**: INFO, WARN, ERROR
- **Format**: Structured JSON
- **Rotation**: Daily

### Available Metrics
- **Active users**: By role and period
- **Average progress**: By subject and grade
- **AI usage**: Content generations
- **Blockchain transactions**: NFTs created

### Health Check
```
GET /api-v1/health
```

## 🔒 Security

### Implemented
- **CORS**: Configured for frontend
- **Rate Limiting**: Protection against spam
- **Input Validation**: Express-validator + Zod
- **SQL Injection**: Prevented with Prisma ORM
- **XSS**: Input sanitization

### Recommendations
- **HTTPS**: In production
- **API Keys**: For external services
- **Audit Logs**: For critical actions
- **Backup**: Daily database backup

## 🐛 Debugging and Troubleshooting

### Development Logs
```bash
# View real-time logs
npm run dev

# AI-specific logs
DEBUG=ai:* npm run dev

# Database logs
DEBUG=prisma:* npm run dev
```

### Common Errors
1. **Database Connection**: Verify DATABASE_URL
2. **JWT**: Verify JWT_SECRET
3. **AI API**: Verify GOOGLE_GENERATIVE_AI_API_KEY
4. **CORS**: Verify domain configuration

## 📊 Development Metrics

- **Backend API**: 85% ✅
- **Database**: 100% ✅
- **Authentication**: 100% ✅
- **AI Integration**: 90% ✅
- **Blockchain**: 60% ⚠️
- **Testing**: 30% ❌
- **Documentation**: 95% ✅

**Estimated Time for Production**: 2-3 weeks
**Estimated Time for Full Features**: 4-6 weeks

--- 

**SchoolAI** - Empowering education with AI and Blockchain 🚀
