# 🚗 Road-Sense

A real-time driver drowsiness detection system that uses AI-powered computer vision to enhance road safety. Road-Sense monitors driver alertness and provides immediate alerts when drowsiness is detected, helping prevent accidents caused by driver fatigue.

**Live Demo:** [road-sense-coral.vercel.app](https://road-sense-coral.vercel.app)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [ML Model Details](#ml-model-details)
- [Architecture](#architecture)
- [License](#license)
- [Links](#links)

---

<a name="overview"></a>
## 🎯 Overview

Road-Sense is an intelligent transportation safety system designed to detect and alert drivers about drowsiness in real time. By leveraging YOLOv8 computer vision technology and real-time WebSocket communication, the application processes live camera feeds to identify drowsy or asleep states and triggers immediate audio/visual alerts.

This full-stack application combines:
- **Frontend**: A modern React-based web interface for live monitoring
- **Backend**: An Express.js server for user management and trip tracking
- **ML Pipeline**: A Python-based drowsiness detection engine using YOLOv8

---

<a name="features"></a>
## ✨ Features

### Core Features
- **Real-time Drowsiness Detection**: Uses YOLOv8 to detect drowsy and asleep states
- **Live Camera Feed Processing**: Processes webcam input at real-time speeds
- **Instant Alerts**: Visual and audio alerts triggered within 2 seconds of drowsiness detection
- **Trip Tracking**: Records trips with start/end locations and safety scores
- **User Authentication**: Secure user registration and JWT-based authentication
- **Safety Score System**: Calculates driver safety metrics based on drowsiness incidents
- **Vehicle Documentation**: Upload and store vehicle-related documents
- **Real-time Communication**: WebSocket-based frame transmission and results

### Additional Features
- Google Maps integration for location tracking
- Document upload with Cloudinary storage
- Email notifications via Resend
- User profile management
- Responsive UI with Chakra UI and Tailwind CSS

---

<a name="tech-stack"></a>
## 🛠 Tech Stack

### Frontend
- **Framework**: React 19.1.1 with Vite
- **UI Libraries**: Chakra UI, Tailwind CSS, Framer Motion
- **State Management**: React Context API
- **Maps**: Google Maps API integration
- **Communication**: Socket.io for real-time updates
- **HTTP Client**: Axios
- **Icons**: Lucide React, React Icons

### Backend
- **Server**: Express.js 5.1.0
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Security**: bcrypt, bcryptjs
- **File Upload**: Multer with Cloudinary storage
- **Email**: Resend API
- **Real-time**: Socket.io
- **Database Automation**: Puppeteer for web automation

### Machine Learning
- **Framework**: Python with Flask & Flask-SocketIO
- **Model**: YOLOv8 (Ultralytics)
- **Computer Vision**: OpenCV
- **Dataset**: Custom drowsiness detection dataset
- **Real-time Processing**: Base64 frame encoding/decoding

---

<a name="project-structure"></a>
## 📁 Project Structure

```
Road-Sense/
├── client/                          # Frontend React application
│   ├── src/
│   │   ├── components/             # React components
│   │   ├── pages/                  # Page components
│   │   ├── context/                # Context API setup
│   │   ├── assets/                 # Static assets
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── server/                          # Backend Express application
│   ├── db/
│   │   ├── models/
│   │   │   ├── user.js            # User schema
│   │   │   ├── trips.js           # Trip tracking schema
│   │   │   ├── score.js           # Safety score schema
│   │   │   └── vehicleDocuments.js # Document storage schema
│   │   └── dbConnect.js           # MongoDB connection
│   ├── middleware/
│   │   ├── auth.js                # JWT authentication
│   │   └── multer.js              # File upload middleware
│   ├── config/                    # Configuration files
│   ├── server.js                  # Main server file
│   └── package.json
│
├── ml/
│   └── Driver-Drowsiness-Detection/
│       ├── drowsiness_detector.py  # Flask ML server
│       ├── requirements.txt        # Python dependencies
│       ├── dataset.yaml           # Dataset configuration
│       └── runs/                  # Model training outputs
│
└── README.md
```

---

<a name="prerequisites"></a>
## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v16 or higher
- **Python**: v3.8 or higher
- **MongoDB**: Local or cloud instance (e.g., MongoDB Atlas)
- **Git**: For cloning the repository

### Required API Keys & Services
- Firebase credentials (for authentication)
- Cloudinary account (for image storage)
- Google Maps API key
- Resend API key (for emails)
- JWT Secret key

---

<a name="installation"></a>
## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/kad-link/Road-Sense.git
cd Road-Sense
```

### 2. Install Frontend Dependencies

```bash
cd client
npm install
cd ..
```

### 3. Install Backend Dependencies

```bash
cd server
npm install
cd ..
```

### 4. Install ML Dependencies

```bash
cd ml/Driver-Drowsiness-Detection
pip install -r requirements.txt
cd ../..
```

---

<a name="configuration"></a>
## ⚙️ Configuration

### Backend Configuration (`.env`)

Create a `.env` file in the `server/` directory:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key

# Firebase
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY=your_firebase_private_key

# Cloudinary
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email
RESEND_API_KEY=your_resend_api_key

# Server
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

### Frontend Configuration (`.env`)

Create a `.env` file in the `client/` directory:

```env
VITE_BACKEND_URL=http://localhost:5000
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
```

### ML Server Configuration

The ML server runs on port 8800 by default. Update the connection URL in the frontend if needed.

---

<a name="running-the-application"></a>
## 🎮 Running the Application

### Development Mode

Open three terminal windows and run each service:

**Terminal 1 - Frontend:**
```bash
cd client
npm run dev
```
Runs on `http://localhost:5173`

**Terminal 2 - Backend:**
```bash
cd server
node server.js
```
Runs on `http://localhost:5000`

**Terminal 3 - ML Server:**
```bash
cd ml/Driver-Drowsiness-Detection
python drowsiness_detector.py
```
Runs on `http://localhost:8800`

### Production Build

**Frontend:**
```bash
cd client
npm run build
npm run preview
```

**Backend:**
```bash
cd server
# Ensure all environment variables are set
node server.js
```

**ML Server:**
```bash
cd ml/Driver-Drowsiness-Detection
python drowsiness_detector.py
```

---

<a name="api-endpoints"></a>
## 📡 API Endpoints

### Authentication
- `POST /registeruser` - Register new user
- `POST /loginuser` - User login
- `POST /logout` - User logout

### Trip Management
- `POST /starttrip` - Start a new trip
- `POST /endtrip` - End an active trip
- `GET /usertrips` - Get all user trips
- `GET /tripdetails/:tripId` - Get trip details

### Vehicle Documents
- `POST /uploaddocs` - Upload vehicle documents
- `GET /getdocs` - Retrieve vehicle documents

### Scoring
- `POST /addscore` - Add safety score
- `GET /getscore` - Get user scores

### User Profile
- `GET /userprofile` - Get user information
- `POST /updateprofile` - Update user profile

---

<a name="ml-model-details"></a>
## 🧠 ML Model Details

### Drowsiness Detection Model

**Model Architecture**: YOLOv8 Nano (efficient for real-time processing)

**Classes Detected**:
- `asleep` - Eyes closed for an extended period
- `drowsy` - Eyes closing, head nodding, reduced alertness
- `alert` - Normal awake state

**Key Features**:
- Confidence threshold: 0.4
- Alert trigger: Drowsiness detected for ≥ 2 seconds
- Real-time inference at 30+ FPS
- Lightweight model (~7MB) for fast processing
- Custom-trained on drowsiness detection dataset

**Model Training**:
- Framework: Ultralytics YOLOv8
- Training output: `ml/Driver-Drowsiness-Detection/runs/detect/train/weights/last.pt`
- Automatic fallback to base YOLOv8 if custom model not found

### Frame Processing Pipeline
1. Receive base64-encoded frame from frontend
2. Decode to numpy array
3. Run YOLOv8 inference
4. Detect drowsiness/asleep states
5. Draw bounding boxes and annotations
6. Encode annotated frame back to base64
7. Send results with alert status

---

<a name="architecture"></a>
## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                  │
│  - User Interface                                           │
│  - Camera Feed Display                                      │
│  - Real-time Alert System                                   │
│  - Trip Management UI                                       │
└────────┬────────────────────────────────────────────────────┘
         │ HTTP/REST & WebSocket (Socket.io)
         │
┌────────▼────────────────────────────────────────────────────┐
│                  BACKEND (Express + MongoDB)                 │
│  - User Authentication (JWT)                               │
│  - Trip Tracking                                            │
│  - Safety Scoring                                           │
│  - Document Management                                      │
│  - Email Notifications                                      │
└────────┬────────────────────────────────────────────────────┘
         │ WebSocket Connection
         │
┌────────▼────────────────────────────────────────────────────┐
│           ML SERVER (Flask + YOLOv8 + Socket.io)            │
│  - Real-time Frame Processing                               │
│  - Drowsiness Detection                                     │
│  - Alert Generation                                         │
│  - Annotated Frame Output                                   │
└──────────────────────────────────────────────────────────────┘
```

---

<a name="license"></a>
## 📝 License

This project is licensed under the ISC License – see the LICENSE file for details.

---

<a name="links"></a>
## 🔗 Links

- **Live Application**: [road-sense-coral.vercel.app](https://road-sense-coral.vercel.app)
- **Repository**: [github.com/kad-link/Road-Sense](https://github.com/kad-link/Road-Sense)
- **Issues**: [Report Issues](https://github.com/kad-link/Road-Sense/issues)

---

**Made with ❤️ for safer roads**
