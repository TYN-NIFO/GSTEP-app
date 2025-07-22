# GStep - Recruiter Module

A comprehensive recruitment management system built with the MERN stack (MongoDB, Express, React, Node.js) that enables companies to manage their campus recruitment drives efficiently.

## 🚀 Features

### Core Functionalities

1. **Company Registration**
   - Fields: Company name, HR name, HR email, password
   - Password hashing with bcrypt
   - JWT-based authentication
   - Company profile management

2. **Company HR Login**
   - Secure authentication with HR email and password
   - JWT tokens for session management
   - Protected routes for authenticated users

3. **Submit Drive Request**
   - Job title, description, date, eligibility criteria
   - Online/Offline mode selection
   - Drive requests associated with logged-in recruiter
   - Status tracking (Pending, Accepted, Rejected)

4. **View Submitted Drive Requests**
   - List all drive requests by the company
   - Filter by status (All, Pending, Accepted, Rejected)
   - Detailed view with eligibility criteria
   - Real-time status updates

5. **View Applied Students for Each Drive**
   - Student details: name, email, resume link, department, CGPA
   - Application status tracking
   - Skills and contact information
   - Direct resume access

6. **View Statistics of Placed Students**
   - Overall placement statistics
   - Department-wise analytics
   - Drive-wise performance metrics
   - Visual progress indicators

## 🛠 Tech Stack

- **Frontend**: React 18, Tailwind CSS, Framer Motion, Lucide React
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **HTTP Client**: Axios
- **Development**: Vite, Nodemon

## 📁 Project Structure

```
gstep/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database configuration
│   ├── controllers/
│   │   ├── companyController.js  # Company-related operations
│   │   └── poController.js       # Placement office operations
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT authentication middleware
│   ├── models/
│   │   ├── Company.js            # Company schema
│   │   ├── DriveRequest.js       # Drive request schema
│   │   ├── Student.js            # Student schema
│   │   └── Application.js        # Application schema
│   ├── routes/
│   │   ├── companyRoutes.js      # Company API routes
│   │   └── poRoutes.js           # Placement office routes
│   ├── seedData.js               # Database seeding script
│   ├── createTestCompany.js      # Test company creation
│   └── server.js                 # Express server setup
├── web/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js          # API configuration
│   │   ├── components/
│   │   │   ├── Layout.jsx        # Main layout component
│   │   │   ├── Navbar.jsx        # Navigation bar
│   │   │   ├── Sidebar.jsx       # Sidebar navigation
│   │   │   └── ProtectedRoute.jsx # Route protection
│   │   ├── pages/
│   │   │   ├── AuthPage.jsx      # Authentication context
│   │   │   ├── Home.jsx          # Landing page
│   │   │   ├── Login.jsx         # Login page
│   │   │   ├── Register.jsx      # Registration page
│   │   │   ├── Dashboard.jsx     # Main dashboard
│   │   │   ├── PostDrive.jsx     # Drive submission form
│   │   │   ├── Requests.jsx      # Drive requests list
│   │   │   ├── DriveApplications.jsx # Student applications view
│   │   │   └── Statistics.jsx    # Analytics dashboard
│   │   └── App.jsx               # Main app component
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gstep
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd ../web
   npm install
   ```

4. **Environment Configuration**
   Create a `.env` file in the backend directory:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   NODE_ENV=development
   ```

5. **Database Setup**
   ```bash
   cd backend
   npm run create-test-company
   npm run seed
   ```

### Running the Application

1. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   Server runs on http://localhost:5000

2. **Start Frontend Development Server**
   ```bash
   cd web
   npm run dev
   ```
   Application runs on http://localhost:3000

## 🔐 Test Credentials

**Test Company Account:**
- Email: `test@company.com`
- Password: `password123`

## 📊 API Endpoints

### Authentication
- `POST /api/company/register` - Company registration
- `POST /api/company/login` - Company login

### Drive Management
- `POST /api/company/request-drive` - Submit drive request
- `GET /api/company/requests` - Get company's drive requests
- `GET /api/company/drive/:id/applications` - Get applications for a drive

### Analytics
- `GET /api/company/statistics` - Get placement statistics

### Placement Office
- `PATCH /api/po/drive-request/:id` - Update drive request status

## 🎨 UI Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: Clean, professional interface with Tailwind CSS
- **Animations**: Smooth transitions with Framer Motion
- **Interactive Elements**: Hover effects, loading states, and feedback
- **Data Visualization**: Progress bars and statistics cards

## 🔒 Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Protected API routes
- Input validation and sanitization
- CORS configuration

## 📈 Future Enhancements

- Email notifications for drive status updates
- Advanced filtering and search capabilities
- Bulk operations for student management
- Integration with external job portals
- Mobile application
- Advanced analytics with charts and graphs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

Developed as part of the GStep campus recruitment management system.
