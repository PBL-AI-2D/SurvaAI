<div align="center">
  <img src="https://i.imgur.com/0N69Y4a.png" alt="SurvaAI Logo" width="200"/>
</div>

# SurvaAI

A comprehensive AI-powered survey platform that enables users to create, distribute, and analyze surveys with advanced sentiment analysis, satisfaction scoring, and respondent segmentation capabilities.

## 🚀 Features

### Core Features
- **Survey Management**: Create, edit, and manage surveys with multiple question types (essay, scale, radio, checkbox, dropdown)
- **Response Collection**: User-friendly survey interface with auto-save functionality
- **Payment Integration**: Xendit payment gateway integration for survey payments
- **Reward System**: Point-based reward system for survey respondents
- **Admin Dashboard**: Comprehensive admin panel for managing users, surveys, and responses

### AI-Powered Analytics
- **Sentiment Analysis**: AI-driven sentiment analysis using transformer models
- **Satisfaction Analysis**: Automated satisfaction scoring and trend analysis
- **Respondent Segmentation**: K-means clustering for customer segmentation
- **Preference Analysis**: Product/service preference identification
- **Predictive Analytics**: Trend forecasting and satisfaction prediction
- **Real-time Dashboard**: Interactive charts and visualizations

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15.3.0 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand, TanStack Query
- **Charts**: Recharts, Chart.js
- **UI Components**: Radix UI, shadcn/ui
- **Form Handling**: React Hook Form, Zod

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 5
- **ORM**: Sequelize
- **Database**: PostgreSQL
- **Cache**: Redis
- **Authentication**: JWT
- **Email**: Nodemailer
- **Payment**: Xendit

### AI Service
- **Framework**: FastAPI
- **ML Libraries**: 
  - PyTorch
  - Transformers (Hugging Face)
  - scikit-learn
  - Sentence Transformers
- **Data Processing**: NumPy, Pandas
- **Visualization**: Matplotlib

## 📁 Project Structure

```
SurvaAI/
├── client/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/           # Next.js app router pages
│   │   ├── components/    # React components
│   │   ├── features/      # Feature-based modules
│   │   └── lib/          # Utilities and configurations
│   └── public/           # Static assets
│
├── server/                # Express.js backend API
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── models/       # Sequelize models
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   └── utils/        # Helper functions
│   └── test/            # Unit tests
│
└── service_python/       # FastAPI AI service
    ├── app/
    │   └── src/
    │       ├── routers/  # API endpoints
    │       ├── services/ # AI analysis services
    │       └── schemas/  # Pydantic models
    ├── ai_models/        # Trained ML models
    └── ai_training/     # Training notebooks and data
```

## 🚦 Getting Started

### Prerequisites

- Node.js 20+ 
- Python 3.10+
- PostgreSQL 14+
- Redis 6+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SurvaAI
   ```

2. **Install Client Dependencies**
   ```bash
   cd client
   npm install
   ```

3. **Install Server Dependencies**
   ```bash
   cd ../server
   npm install
   ```

4. **Install Python Service Dependencies**
   ```bash
   cd ../service_python
   pip install -r requirements.txt
   ```

### Environment Setup

1. **Client Environment** (`client/.env.local`)
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   NEXT_PUBLIC_PYTHON_API_URL=http://localhost:8000
   ```

2. **Server Environment** (`server/.env`)
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=survaai
   DB_USER=postgres
   DB_PASSWORD=your_password
   REDIS_HOST=localhost
   REDIS_PORT=6379
   JWT_SECRET=your_jwt_secret
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email
   EMAIL_PASS=your_password
   XENDIT_SECRET_KEY=your_xendit_key
   ```

3. **Python Service Environment** (`service_python/.env`)
   ```env
   APP_NAME=SurvaAI Python Service
   CLIENT_URL=http://localhost:3000
   ```

### Running the Application

1. **Start PostgreSQL and Redis**
   ```bash
   # PostgreSQL
   # Start your PostgreSQL service

   # Redis
   redis-server
   ```

2. **Start the Backend Server**
   ```bash
   cd server
   npm run dev
   ```
   Server will run on `http://localhost:5000`

3. **Start the Python AI Service**
   ```bash
   cd service_python
   python -m uvicorn app.src.main:app --reload --port 8000
   ```
   Or use the provided script:
   ```bash
   # Windows
   start_service.bat
   
   # Linux/Mac
   ./start_service.sh
   ```
   Service will run on `http://localhost:8000`

4. **Start the Frontend Client**
   ```bash
   cd client
   npm run dev
   ```
   Application will run on `http://localhost:3000`

## 📖 Usage

### For Survey Creators

1. **Register/Login**: Create an account or login to the platform
2. **Create Survey**: Navigate to "Manage Survey" and create a new survey
3. **Add Questions**: Add various question types (essay, scale, multiple choice, etc.)
4. **Configure Settings**: Set target respondents, dates, and reward points
5. **Publish**: Submit survey for verification
6. **View Analytics**: Access AI-powered analytics dashboard after responses are collected

### For Respondents

1. **Browse Surveys**: Explore available surveys on the explore page
2. **Start Survey**: Click on a survey to begin responding
3. **Submit Responses**: Complete and submit your responses
4. **Earn Rewards**: Receive points for completed surveys
5. **Redeem Rewards**: Exchange points for rewards

### For Administrators

1. **Dashboard**: View platform statistics and analytics
2. **Survey Verification**: Review and approve pending surveys
3. **User Management**: Manage users and their permissions
4. **Payment Monitoring**: Track survey payments and transactions
5. **AI Monitoring**: Monitor AI model performance and training

## 🔬 AI Features

### Sentiment Analysis
- Analyzes text responses using transformer-based models
- Classifies sentiment as positive, neutral, or negative
- Provides sentiment scores for each response

### Satisfaction Analysis
- Calculates satisfaction scores from Likert scale responses
- Combines sentiment and scale data for comprehensive analysis
- Generates satisfaction trends over time

### Respondent Segmentation
- K-means clustering based on satisfaction and preferences
- PCA visualization for segment distribution
- Segment profiling with demographics and preferences

### Preference Analysis
- Identifies major product/service preferences
- Categorical data analysis for preference patterns
- Preference distribution visualization

## 🧪 Testing

### Backend Tests
```bash
cd server
npm test
```

### Python Service Tests
```bash
cd service_python
pytest
```

## 🐳 Docker Support

Each service includes a Dockerfile for containerized deployment:

```bash
# Build and run with Docker Compose (if available)
docker-compose up
```

## 📝 API Documentation

### Backend API
- Base URL: `http://localhost:5000/api`
- Authentication: JWT Bearer Token
- Main endpoints:
  - `/api/auth/*` - Authentication
  - `/api/users/*` - User management
  - `/api/survei/*` - Survey management
  - `/api/respon-survei/*` - Response management

### Python AI Service API
- Base URL: `http://localhost:8000/api`
- Main endpoints:
  - `/api/dashboard/overview` - Dashboard analytics
  - `/api/sentiment-analysis` - Sentiment analysis
  - `/api/satisfaction-analysis` - Satisfaction analysis
  - `/api/segmentation` - Respondent segmentation

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 👥 Contributors

This project is developed by:

1. **3312411050** – Ridho Putrawan
2. **3312411017** – Bindhu Owen Batami Hutagalung
3. **3312411084** – Melky Win Onassis M.
4. **3312411052** – Braja Tsaqivul Ilham

## 📄 License

This project is licensed under the terms specified in the LICENSE file.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Hugging Face for transformer models
- FastAPI for the Python web framework
- All open-source contributors whose libraries made this project possible

---

Made with ❤️ by Group 2 PBL

