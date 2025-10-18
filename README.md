# MedLearn - Medical Learning Platform

A comprehensive medical learning platform built with React, Node.js, and MongoDB. Features include quizzes, flashcards, competitions, leaderboards, and a digital library.

## 🚀 Features

- **Interactive Quizzes**: Create and take medical quizzes with instant feedback
- **Flashcard System**: Study with digital flashcards for medical concepts
- **Competitions**: Participate in timed medical competitions
- **Leaderboard**: Track progress and compete with other learners
- **Digital Library**: Upload and access medical documents and resources
- **User Management**: Secure authentication and user profiles
- **Admin Dashboard**: Comprehensive admin panel for content management

## 🛠️ Tech Stack

### Frontend
- React 19 with Vite
- Material-UI (MUI) for components
- React Router for navigation
- Framer Motion for animations
- Three.js for 3D elements

### Backend
- Node.js with Express
- MongoDB with Mongoose
- GridFS for file storage
- Multer for file uploads
- CORS and Helmet for security

### AI Integration
- Google Generative AI
- Cohere AI for enhanced learning

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd medlearn
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   Edit `.env` with your configuration:
   - MongoDB connection string
   - API keys for AI services
   - CORS origins for your domains

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🚀 Deployment

### Vercel Deployment
1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Firebase Deployment
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init`
4. Deploy: `firebase deploy`

### Manual Deployment
1. Build the project: `npm run build`
2. Start production server: `npm start`

## 📁 Project Structure

```
medlearn/
├── src/                    # Frontend source code
│   ├── components/         # Reusable React components
│   ├── pages/             # Page components
│   ├── context/           # React context providers
│   ├── lib/               # Utility libraries
│   └── routes/            # Frontend routing
├── routes/                # Backend API routes
├── models/                # MongoDB models
├── middleware/            # Express middleware
├── functions/             # Firebase functions
├── dist/                  # Built frontend files
├── uploads/               # File uploads directory
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── vercel.json            # Vercel configuration
├── firebase.json          # Firebase configuration
└── vite.config.js         # Vite configuration
```

## 🔧 Configuration

### Environment Variables
- `MONGO_URI`: MongoDB connection string
- `PORT`: Server port (default: 4000)
- `NODE_ENV`: Environment (development/production)
- `CORS_ORIGINS`: Allowed CORS origins
- `GOOGLE_AI_API_KEY`: Google AI API key
- `COHERE_API_KEY`: Cohere API key

### Database Setup
1. Create a MongoDB database (local or Atlas)
2. Update `MONGO_URI` in your environment variables
3. The application will automatically create collections

## 📝 API Endpoints

- `GET /api/quizzes` - Get all quizzes
- `POST /api/quizzes` - Create new quiz
- `GET /api/flashcards` - Get all flashcards
- `POST /api/flashcards` - Create new flashcard
- `GET /api/leaderboard` - Get leaderboard data
- `POST /api/library/upload` - Upload file to library
- `GET /api/library` - Get library files

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository.