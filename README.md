# HealthPal Server 🏥

**Backend API Server for HealthPal - A Comprehensive AI-Powered Health & Wellness Platform**

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

## 📋 About The Project

HealthPal Server is the core backend API powering the HealthPal ecosystem - a comprehensive health and wellness application that integrates AI-powered features, food recognition, smart wearable device synchronization, and community engagement tools.

**Project Team:**

- **Developers:** Khổng Huỳnh Ngọc Hân (23520427), Nguyễn Hữu Duy (23520374)
- **Supervisor:** ThS. Trần Thị Hồng Yến
- **Timeline:** September 2025 - December 2025

### 🎯 Project Vision

To build a holistic health management system that empowers users to establish and maintain healthy lifestyle habits through personalized AI-driven recommendations, seamless wearable device integration, and an engaging community platform.

## 🌟 Key Features

### 🔐 Authentication & User Management

- Multi-provider authentication (Email/Password, Google OAuth2)
- JWT-based secure authentication with refresh tokens
- Email verification system
- Role-based access control (User, Admin, Moderator)
- User profile management with health metrics

### 📊 Health Tracking & Analytics

- **Daily Health Logs:** Track calories, macronutrients, water intake, and exercises
- **Body Metrics Monitoring:** BMI, blood pressure, blood glucose tracking
- **Visual Progress Reports:** Interactive charts and graphs for health data visualization
- **Fitness Profiles:** Personalized fitness profiles with BMR, TDEE calculations

### 🏃 Smart Device Integration

- Google Fit API integration for automatic data synchronization
- Activity tracking (steps, calories burned, workouts)
- Real-time wearable device data sync
- Extensible architecture for future integrations (Health Connect, Apple HealthKit)

### 🤖 AI-Powered Features

- **Food Recognition:** YOLOv5-based computer vision for meal identification
- **Nutritional Analysis:** Automatic calorie and macro calculation from images
- **AI Chatbot:** Gemini API-powered health assistant for personalized advice
- **Smart Recommendations:** ML-based meal planning using GradientBoostingRegressor

### 🎯 Goals & Motivation System

- Customizable personal health goals (weight loss, muscle gain, maintenance)
- Personalized workout and meal plans based on TDEE and fitness goals
- Challenge system with achievement badges and medals
- Progress tracking and milestone celebrations

### 👥 Social & Community Features

- Create, share, and discover health-related posts
- Comment and like system for community engagement
- Real-time chat messaging between users
- Content moderation tools for safe community interactions

### 📝 User Contributions

- Community-sourced ingredient and recipe database
- Nutritional information submission with admin approval workflow
- Contribution status tracking (PENDING, APPROVED, REJECTED)

### 🔔 Smart Notifications & Reminders

- Intelligent alerts for over-exercising or unsafe dieting patterns
- Scheduled reminders for water intake, meals, and sleep
- Context-aware notifications based on user behavior

### 💎 Premium Features

- Premium package management
- Extended features for subscribed users
- Flexible subscription tier system

## 🏗️ Architecture & Tech Stack

### Backend Framework

- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe development
- **TypeORM** - Database ORM with entity management

### Database

- **PostgreSQL 17** - Primary relational database
- **Supabase** - Backend-as-a-Service for auth and storage

### Authentication & Security

- **Passport.js** - Authentication middleware
- **JWT** - Token-based authentication
- **bcryptjs** - Password hashing
- **Google OAuth2** - Social login integration

### Storage & Media

- **Supabase Storage** - Cloud storage for images and media
- **Multer** - File upload handling

### API Documentation

- **Swagger/OpenAPI** - Interactive API documentation
- **Class Validator** - Request validation
- **Class Transformer** - DTO transformation

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks for quality assurance
- **Jest** - Unit and e2e testing
- **Commitlint** - Conventional commit enforcement

### DevOps & Deployment

- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **GitHub Actions** - CI/CD (planned)

## 📁 Project Structure

```
health-pal-server/
├── src/
│   ├── activities/              # Exercise activities management
│   ├── activity_records/        # User activity tracking
│   ├── auth/                    # Authentication & authorization
│   │   ├── guards/              # Auth guards (JWT, Google, Supabase)
│   │   └── strategies/          # Passport strategies
│   ├── challenges/              # Health challenges system
│   ├── challenges_users/        # User challenge participation
│   ├── chat_messages/           # Real-time messaging
│   ├── chat_participants/       # Chat room participants
│   ├── chat_sessions/           # Chat sessions management
│   ├── comments/                # Post comments
│   ├── contribution_ingres/     # User-contributed ingredients
│   ├── contribution_meals/      # User-contributed meals
│   ├── daily_ingres/            # Daily ingredient consumption
│   ├── daily_logs/              # Daily health logs
│   ├── daily_meals/             # Daily meal tracking
│   ├── devices/                 # Connected device management
│   ├── diet_types/              # Diet type categories
│   ├── fav_ingres/              # Favorite ingredients
│   ├── fav_meals/               # Favorite meals
│   ├── fitness_goals/           # User fitness goals
│   ├── fitness_profiles/        # User fitness profiles
│   ├── ingredients/             # Ingredient database
│   ├── ingre_meals/             # Meal ingredient relationships
│   ├── likes/                   # Post likes
│   ├── meals/                   # Meal database
│   ├── medals/                  # Achievement medals
│   ├── medals_users/            # User medal awards
│   ├── notifications/           # Push notifications
│   ├── posts/                   # Community posts
│   ├── posts_medias/            # Post media attachments
│   ├── premium_packages/        # Premium subscription packages
│   ├── roles/                   # User role management
│   ├── users/                   # User management
│   ├── supabase/                # Supabase integration
│   ├── supabase-storage/        # Supabase storage service
│   ├── config/                  # Configuration management
│   ├── helpers/                 # Utility functions & interceptors
│   └── interfaces/              # TypeScript interfaces
├── database/
│   ├── data-sources.ts          # TypeORM configuration
│   └── data/                    # Seed data
│       ├── activities/
│       └── food/
├── test/                        # E2E tests
├── compose.yaml                 # Docker Compose configuration
├── Dockerfile                   # Docker image definition
├── nest-cli.json                # NestJS CLI configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Dependencies & scripts
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v22.19.0 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v17 or higher)
- **Docker** & **Docker Compose** (for containerized deployment)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/health-pal-uit/health-pal-server.git
   cd health-pal-server
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory (see `.env.example` for reference):

   ```env
   # Database Configuration
   DB_TARGET=local

   # Local database (used when DB_TARGET=local)
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   DB_DATABASE=health-pal-db

   # Cloud database (used when DB_TARGET=cloud)
   CLOUD_DB_HOST=your_cloud_host
   CLOUD_DB_PORT=5432
   CLOUD_DB_USERNAME=your_cloud_username
   CLOUD_DB_PASSWORD=your_cloud_password
   CLOUD_DB_DATABASE=your_cloud_database

   # Supabase Configuration
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   SUPABASE_JWT_SECRET=your_jwt_secret

   # Google OAuth2
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback

   # Storage Buckets
   AVATAR_BUCKET_NAME=avatars
   POST_IMG_BUCKET_NAME=post-imgs
   POST_VIDEO_BUCKET_NAME=post-videos
   CHAT_IMG_BUCKET_NAME=chat-imgs
   CHALLENGE_IMG_BUCKET_NAME=challenge-imgs
   MEDAL_IMG_BUCKET_NAME=medal-imgs
   ```

4. **Run database migrations** (if available)
   ```bash
   npm run migration:run
   ```

### Running the Application

#### Development Mode

```bash
npm run start:dev
```

The API will be available at `http://localhost:3001`

#### Production Mode

```bash
npm run build
npm run start:prod
```

#### Using Docker Compose

```bash
docker-compose up -d
```

### API Documentation

Once the server is running, access the Swagger documentation at:

```
http://localhost:3001/api
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📝 Available Scripts

| Script                | Description                          |
| --------------------- | ------------------------------------ |
| `npm run start`       | Start the application                |
| `npm run start:dev`   | Start in development mode with watch |
| `npm run start:debug` | Start in debug mode                  |
| `npm run start:prod`  | Start in production mode             |
| `npm run build`       | Build the application                |
| `npm run format`      | Format code with Prettier            |
| `npm run lint`        | Lint code with ESLint                |
| `npm run test`        | Run unit tests                       |
| `npm run test:e2e`    | Run end-to-end tests                 |

## 📡 API Endpoints Overview

### Authentication

- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `GET /auth/logout` - User logout
- `GET /auth/google/login` - Initiate Google OAuth
- `GET /auth/google/callback` - Google OAuth callback
- `GET /auth/check-verification/:email` - Check email verification

### Users

- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Health Tracking

- `GET /daily-logs` - Get daily health logs
- `POST /daily-logs` - Create daily log
- `GET /fitness-profiles` - Get fitness profiles
- `POST /fitness-goals` - Create fitness goal

### Nutrition

- `GET /ingredients` - Get ingredients
- `GET /meals` - Get meals
- `POST /contribution-meals` - Contribute meal
- `POST /contribution-ingres` - Contribute ingredient

### Social

- `GET /posts` - Get community posts
- `POST /posts` - Create post
- `POST /comments` - Add comment
- `POST /likes` - Like post

### Challenges & Achievements

- `GET /challenges` - Get challenges
- `GET /medals` - Get medals
- `POST /challenges-users` - Join challenge

_(For complete API documentation, visit the Swagger UI)_

## 🗄️ Database Schema

### Core Entities

- **users** - User accounts and profiles
- **roles** - User role definitions
- **fitness_profiles** - User fitness metrics (BMI, BMR, TDEE)
- **fitness_goals** - Personal health goals
- **daily_logs** - Daily health tracking summary
- **ingredients** - Food ingredient database
- **meals** - Meal database with nutritional info
- **activities** - Exercise activity types
- **activity_records** - User exercise logs
- **challenges** - Health challenges
- **medals** - Achievement badges
- **posts** - Community posts
- **comments** - Post comments
- **likes** - Post likes
- **chat_sessions** - Chat conversations
- **chat_messages** - Chat message history
- **notifications** - User notifications
- **premium_packages** - Subscription packages

_(For detailed schema, refer to entity files in `src/_/entities/`)\*

## 🔒 Security Features

- ✅ JWT-based authentication with refresh token rotation
- ✅ Password hashing with bcryptjs
- ✅ Rate limiting on authentication endpoints
- ✅ Input validation with class-validator
- ✅ SQL injection prevention via TypeORM
- ✅ CORS configuration for allowed origins
- ✅ Environment variable validation
- ✅ Secure HTTP-only cookies for tokens

## 🌐 CORS Configuration

The server allows requests from:

- `http://localhost:3000` (Web Admin)
- `http://localhost:8081` (Mobile Development)

Modify in `src/main.ts` for production deployment.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: bug fix
docs: documentation changes
style: code style changes
refactor: code refactoring
test: add tests
chore: maintenance tasks
```

## 📄 License

This project is licensed under the UNLICENSED License - see the package.json for details.

## 👥 Related Repositories

- **Mobile App:** [health-pal-mobile](https://github.com/health-pal-uit/health-pal-mobile) - Flutter mobile application
- **Web Admin:** [health-pal-web](https://github.com/health-pal-uit/health-pal-web) - React.js admin dashboard
- **AI Service:** [health-pal-ai](https://github.com/health-pal-uit/health-pal-ai) - Python AI/ML service (Food recognition, Chatbot)

## 🎯 Future Roadmap

- [ ] **Expert Health Consultation** - Video call and messaging with certified health professionals
- [ ] **Advanced Social Features** - Video calls, group management, friend suggestions, feeds, reels
- [ ] **Context-Aware Reminders** - Smart notifications based on user context and behavior
- [ ] **Sleep Support** - Phone locking during designated sleep hours
- [ ] **Blockchain Integration** - Transparent and secure payment wallet
- [ ] **Apple HealthKit Integration** - iOS health data synchronization
- [ ] **Health Connect Integration** - Android health data platform support
- [ ] **Advanced AI Models** - Improved food recognition and personalized recommendations
- [ ] **Multi-language Support** - Internationalization (i18n)
- [ ] **WebSocket Integration** - Real-time features for chat and notifications

## 📞 Contact & Support

For questions, issues, or contributions, please:

- Open an issue on GitHub
- Contact the development team
- Refer to the API documentation

---

**Built with ❤️ by the HealthPal Team**

_Empowering healthier lives through technology_
