# 🎓 Tutor Match Platform

A comprehensive tutor matching platform built with the MERN stack, featuring real-time chat, video sessions, and advanced booking management.

## 🚀 Features

### 👤 User Roles
- **Students**: Find and book tutors, manage sessions, leave reviews
- **Tutors**: Create profiles, manage availability, conduct sessions
- **Admin**: Approve tutors, manage platform, view analytics

### 🔐 Authentication & Security
- JWT-based authentication with bcrypt password hashing
- Role-based access control
- Tutor approval workflow

### 📋 Core Functionality
- **Profile Management**: Complete CRUD operations with image upload
- **Tutor Discovery**: Search by subject, rating, availability, location
- **Booking System**: Session requests with approval workflow
- **Real-time Chat**: Socket.io powered messaging for approved sessions
- **Video Sessions**: Daily.co API integration for video calls
- **Rating & Reviews**: 5-star rating system with comments
- **Notifications**: Real-time updates for all platform activities

## 🛠️ Tech Stack

- **Frontend**: React.js (Vite), CSS3, React Router
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Real-time**: Socket.io
- **Video**: Daily.co API
- **Authentication**: JWT + bcrypt
- **File Upload**: Multer + Cloudinary

## 📁 Project Structure

```
tutor-match/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context
│   │   ├── services/       # API services
│   │   ├── styles/         # CSS files
│   │   └── utils/          # Utility functions
│   └── public/             # Static assets
└── server/                 # Express backend
    ├── models/             # MongoDB schemas
    ├── controllers/        # Route controllers
    ├── routes/             # API routes
    ├── middleware/         # Custom middleware
    ├── sockets/            # Socket.io handlers
    └── config/             # Configuration files
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tutor-match
   ```

2. **Install dependencies**
   ```bash
   npm run install-deps
   ```

3. **Environment Setup**
   Create `.env` files in both client and server directories with required variables.

4. **Start the application**
   ```bash
   npm run dev
   ```

This will start both the client (http://localhost:5173) and server (http://localhost:5000) concurrently.

## 🔧 Environment Variables

### Server (.env)
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tutormatch
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
DAILY_API_KEY=your_daily_api_key
```

### Client (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_DAILY_DOMAIN=your_daily_domain
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/upload-avatar` - Upload profile picture

### Tutors
- `GET /api/tutors` - Get all approved tutors
- `GET /api/tutors/search` - Search tutors
- `PUT /api/tutors/availability` - Update availability

### Sessions
- `POST /api/sessions` - Create session request
- `GET /api/sessions` - Get user sessions
- `PUT /api/sessions/:id` - Update session status

### Admin
- `GET /api/admin/pending-tutors` - Get pending tutor approvals
- `PUT /api/admin/approve-tutor/:id` - Approve/reject tutor
- `GET /api/admin/analytics` - Get platform analytics

## 🎨 Styling

The application uses modern CSS with:
- Responsive design for all screen sizes
- Smooth animations and transitions
- Hover effects and interactive elements
- Professional color scheme and typography
- CSS Grid and Flexbox layouts

## 🧪 Testing

Run the seed script to populate the database with test data:
```bash
cd server && npm run seed
```

## � Deployment

This project is configured for deployment on Vercel. Follow these steps:

### Quick Deploy
```bash
npm run deploy
```

### Manual Deploy
1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Build the project:
```bash
npm run build
```

3. Deploy:
```bash
vercel --prod
```

### Environment Variables
Set these in your Vercel dashboard:
- `NODE_ENV`: `production`
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: Your JWT secret key
- `CLIENT_URL`: Your Vercel app URL
- `CLOUDINARY_CLOUD_NAME`: For image uploads
- `CLOUDINARY_API_KEY`: For image uploads
- `CLOUDINARY_API_SECRET`: For image uploads
- `DAILY_API_KEY`: For video calls
- `DAILY_DOMAIN`: For video calls

For detailed deployment instructions, see:
- [`DEPLOYMENT_GUIDE.md`](DEPLOYMENT_GUIDE.md)
- [`DEPLOYMENT_CHECKLIST.md`](DEPLOYMENT_CHECKLIST.md)

## �📝 License

This project is licensed under the ISC License.
