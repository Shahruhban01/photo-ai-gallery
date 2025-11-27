# Photo AI Gallery 📸

AI-Powered Photo Gallery with Facial Recognition - Similar to Google Photos

A full-stack web application that automatically organizes photos by detecting and grouping people using facial recognition AI.

## ✨ Features

- **User Authentication** - Secure JWT-based signup and login
- **Image Upload** - Drag-and-drop file upload with validation
- **Facial Recognition** - Automatic face detection in uploaded images
- **Face Grouping** - AI clustering to group same person across photos
- **Person Identification** - Tag and search photos by person
- **Album Management** - Create, edit, and delete albums
- **Photo Search** - Search by person, date, or tags
- **Timeline View** - Browse photos chronologically
- **Responsive UI** - Mobile-friendly design with TailwindCSS

## 🛠️ Tech Stack

### Frontend
- React 18 with TypeScript
- Redux Toolkit for state management
- TailwindCSS for styling
- React Router for navigation
- React Dropzone for file uploads
- Axios for API calls

### Backend
- Node.js with Express
- TypeScript
- MongoDB with Mongoose ODM
- JWT for authentication
- Multer for file uploads
- Sharp for image processing
- bcryptjs for password hashing

### AI/ML Service
- Python with Flask
- face_recognition library
- scikit-learn for clustering
- NumPy for numerical operations

### Infrastructure
- Docker & Docker Compose
- MongoDB for database
- Nginx for frontend serving

## 📁 Project Structure

```
photo-ai-gallery/
├── frontend/                      # React application
│   ├── src/
│   │   ├── components/           # Reusable React components
│   │   ├── pages/                # Page components
│   │   ├── services/             # API service calls
│   │   ├── store/                # Redux store & slices
│   │   ├── App.tsx               # Main app component
│   │   └── index.tsx             # Entry point
│   ├── public/                   # Static assets
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── Dockerfile
│
├── backend/                       # Express API server
│   ├── src/
│   │   ├── routes/               # API endpoints
│   │   ├── controllers/          # Business logic
│   │   ├── models/               # MongoDB schemas
│   │   ├── middleware/           # Auth, validation, upload
│   │   ├── services/             # Core services
│   │   ├── config/               # Configuration
│   │   └── server.ts             # Entry point
│   ├── uploads/                  # Image storage
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
├── ml/                            # AI/ML services
│   ├── facial_recognition.py     # Face detection
│   ├── face_clustering.py        # Face grouping
│   ├── requirements.txt
│   └── Dockerfile
│
├── docker-compose.yml            # Container orchestration
├── .env.example                  # Environment template
├── .gitignore
├── LICENSE
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB 6+
- Docker & Docker Compose (optional)
- Python 3.9+ (for ML service)

### Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/photo-ai-gallery.git
   cd photo-ai-gallery
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   # Edit .env and set a secure JWT_SECRET
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - ML Service: http://localhost:5001

### Manual Setup

#### Backend Setup

```bash
cd backend
npm install
cp ../.env.example .env
# Edit .env with your configuration
npm run dev
```

#### Frontend Setup

```bash
cd frontend
npm install
npm start
```

#### ML Service Setup

```bash
cd ml
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m flask run --port 5001
```

## 📚 API Documentation

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/profile` | Get user profile |
| PUT | `/api/auth/profile` | Update user profile |

### Photos

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/photos/upload` | Upload photos |
| GET | `/api/photos` | Get all photos |
| GET | `/api/photos/search` | Search photos |
| GET | `/api/photos/:id` | Get photo details |
| GET | `/api/photos/:id/image` | Get photo file |
| GET | `/api/photos/:id/thumbnail` | Get thumbnail |
| PUT | `/api/photos/:id` | Update photo |
| DELETE | `/api/photos/:id` | Delete photo |

### Albums

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/albums` | Create album |
| GET | `/api/albums` | Get all albums |
| GET | `/api/albums/:id` | Get album details |
| PUT | `/api/albums/:id` | Update album |
| DELETE | `/api/albums/:id` | Delete album |
| POST | `/api/albums/:id/photos` | Add photos to album |
| DELETE | `/api/albums/:id/photos` | Remove photos from album |

### Face Recognition

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/faces/persons` | Get all recognized people |
| GET | `/api/faces/persons/:id` | Get person details |
| PUT | `/api/faces/persons/:id` | Update person name |
| POST | `/api/faces/persons/merge` | Merge two people |
| POST | `/api/faces/cluster` | Trigger face clustering |
| POST | `/api/faces/assign` | Assign face to person |

## 🔐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/photo-ai-gallery` |
| `JWT_SECRET` | Secret key for JWT tokens | Required |
| `JWT_EXPIRES_IN` | Token expiration time | `7d` |
| `UPLOAD_DIR` | Upload directory path | `./uploads` |
| `MAX_FILE_SIZE` | Max file size in bytes | `10485760` (10MB) |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |
| `REACT_APP_API_URL` | API URL for frontend | `http://localhost:5000/api` |

## 🧪 Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📦 Building for Production

```bash
# Build backend
cd backend
npm run build

# Build frontend
cd frontend
npm run build

# Or use Docker
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [face-api.js](https://github.com/justadudewhohacks/face-api.js) for face detection
- [face_recognition](https://github.com/ageitgey/face_recognition) for Python face recognition
- [TailwindCSS](https://tailwindcss.com/) for the beautiful UI
- [React](https://reactjs.org/) for the frontend framework
