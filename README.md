# HOD & Staff Management System

A comprehensive web application for managing HOD (Head of Department) and Staff operations, including placement statistics, test management, and performance tracking.

## 🚀 Features

### HOD Module
- **Authentication**: Secure login for HOD users
- **Placement Statistics**: View department-wise placement data with filtering
- **Test Performance Reports**: Analyze student performance in aptitude and technical tests
- **Data Export**: Export reports as Excel/PDF (optional)
- **Department Overview**: Comprehensive dashboard with key metrics

### Staff Module
- **Authentication**: Secure login for Staff users
- **Test Management**: Create, edit, and delete tests with questions and answers
- **Department-specific Access**: Manage tests within assigned departments only
- **Performance Analytics**: View test results and student performance
- **Placement Insights**: Access to department placement statistics

### System Features
- **Role-based Access Control**: Secure access based on user roles
- **Responsive Design**: Mobile-first approach with modern UI
- **Real-time Updates**: Live data synchronization
- **Audit Logging**: Track all critical operations
- **Scalable Architecture**: Built for growth and performance

## 🛠️ Technology Stack

- **Frontend**: Next.js 14 with TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes with Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js with JWT
- **Styling**: Tailwind CSS with custom components
- **State Management**: React Query for server state
- **Form Handling**: React Hook Form with Zod validation

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database
- Git

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd hodandStaff
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Setup
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/hod_staff_db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
JWT_SECRET="your-jwt-secret-here"
```

### 4. Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Seed the database with sample data
npx tsx prisma/seed.ts
```

### 5. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to access the application.

## 👥 Demo Credentials

### HOD Users
- **Email**: hod.cse@example.com
- **Password**: password123
- **Department**: Computer Science Engineering

- **Email**: hod.ece@example.com
- **Password**: password123
- **Department**: Electronics and Communication Engineering

### Staff Users
- **Email**: staff.cse1@example.com
- **Password**: password123
- **Department**: Computer Science Engineering

- **Email**: staff.cse2@example.com
- **Password**: password123
- **Department**: Computer Science Engineering

### Admin User
- **Email**: admin@example.com
- **Password**: password123

## 📁 Project Structure

```
hodandStaff/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts               # Database seeding
├── src/
│   ├── app/                  # Next.js app directory
│   │   ├── api/             # API routes
│   │   ├── auth/            # Authentication pages
│   │   ├── hod/             # HOD module pages
│   │   ├── staff/           # Staff module pages
│   │   └── globals.css      # Global styles
│   ├── components/          # Reusable components
│   │   ├── ui/             # UI components
│   │   └── layout/         # Layout components
│   ├── lib/                # Utility libraries
│   │   ├── auth.ts         # Authentication config
│   │   ├── prisma.ts       # Database client
│   │   ├── utils.ts        # Utility functions
│   │   └── validations.ts  # Form validations
│   └── types/              # TypeScript types
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm test` - Run tests

## 🎯 Key Features Implementation

### Authentication & Authorization
- JWT-based authentication with NextAuth.js
- Role-based access control (HOD, Staff, Admin)
- Secure password hashing with bcrypt
- Session management and automatic redirects

### Database Design
- Comprehensive schema with proper relationships
- Support for multiple departments and users
- Test management with questions and submissions
- Placement tracking with company information
- Audit logging for security and compliance

### User Interface
- Modern, responsive design with Tailwind CSS
- Intuitive navigation with role-based menus
- Interactive dashboards with key metrics
- Form validation and error handling
- Loading states and user feedback

### Performance & Scalability
- Server-side rendering with Next.js
- Optimized database queries with Prisma
- Caching strategies for improved performance
- Modular architecture for easy maintenance

## 🔒 Security Features

- Password hashing and secure authentication
- Role-based access control
- Input validation and sanitization
- CSRF protection
- Audit logging for critical operations

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables for Production
Ensure all environment variables are properly set:
- `DATABASE_URL` - Production database connection
- `NEXTAUTH_SECRET` - Strong secret for JWT signing
- `NEXTAUTH_URL` - Production domain URL

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the demo credentials and setup instructions

---

Built with ❤️ using Next.js, TypeScript, and modern web technologies.
