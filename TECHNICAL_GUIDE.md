# Economic Analysis and Decision-Making Tool for Software Projects

A comprehensive full-stack web application that helps software engineering teams evaluate economic decisions throughout the Software Development Life Cycle (SDLC).

## 🚀 Features

### Core Modules
- **Cost Estimation Module**: COCOMO, Function Points, Regression Analysis
- **Budgeting & Cost Management**: ROI, NPV, IRR, Payback Period calculations
- **Risk Management**: Sensitivity Analysis, Decision Trees, Monte Carlo Simulation
- **Resource Allocation & Optimization**: Resource leveling and smoothing algorithms

### Technical Features
- 🔐 **Authentication**: Secure user registration and login
- 📊 **Interactive Charts**: Real-time data visualization with Chart.js
- 💾 **Data Persistence**: PostgreSQL database via Supabase
- 🎨 **Modern UI**: Built with shadcn/ui components
- 📱 **Responsive Design**: Works on desktop and mobile devices

## 🛠 Technology Stack

### Frontend
- **React.js** with **Vite** build tool
- **shadcn/ui** component library
- **Chart.js** for data visualization
- **Tailwind CSS** for styling
- **React Router** for navigation

### Backend
- **Node.js** with **Express.js** framework
- **RESTful API** architecture
- **JWT** authentication
- **Supabase Client** for database operations

### Database & Authentication
- **Supabase** (PostgreSQL + Auth)
- **Row Level Security** for data protection

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or pnpm package manager
- Supabase account

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Dashboard-Economics
```

### 2. Environment Setup

Create `.env` files in both frontend and backend directories:

**Frontend (.env):**
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:3001
```

**Backend (.env):**
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret
PORT=3001
NODE_ENV=development
```

### 3. Supabase Setup

1. Create a new Supabase project
2. Run the SQL migrations found in `backend/supabase/migrations/`
3. Enable Row Level Security (RLS) on all tables
4. Copy your project URL and API keys to the `.env` files

### 4. Backend Setup
```bash
cd backend
npm install
npm run dev
```

### 5. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 6. Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## 📊 Usage Examples

### Cost Estimation
1. Navigate to "Cost Estimation"
2. Input project parameters (team size, KLOC, complexity)
3. Select estimation models (COCOMO, Function Points)
4. View and compare results

### Financial Analysis
1. Go to "Budget Management"
2. Enter project costs and expected revenues
3. Calculate ROI, NPV, IRR, and Payback Period
4. Visualize financial projections

### Risk Assessment
1. Access "Risk Management"
2. Define risk scenarios and probabilities
3. Run Monte Carlo simulations
4. Analyze sensitivity and decision trees

## 🏗 Project Structure

```
Dashboard-Economics/
├── frontend/                 # React.js application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Main application pages
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API service functions
│   │   ├── utils/           # Utility functions
│   │   └── lib/            # Configuration and helpers
│   ├── public/              # Static assets
│   └── package.json
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Custom middleware
│   │   ├── models/          # Data models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── utils/           # Utility functions
│   ├── supabase/
│   │   └── migrations/      # Database schema
│   └── package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Projects
- `GET /api/projects` - Get user projects
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Calculations
- `POST /api/calculations/cost-estimation` - Perform cost estimation
- `POST /api/calculations/financial-analysis` - Calculate financial metrics
- `POST /api/calculations/risk-analysis` - Run risk analysis
- `POST /api/calculations/monte-carlo` - Monte Carlo simulation

## 🚢 Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
# Deploy to Vercel
```

### Backend (Railway/Heroku)
```bash
cd backend
# Set environment variables
# Deploy to your preferred platform
```

---
