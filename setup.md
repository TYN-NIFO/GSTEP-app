# Setup Instructions for HOD & Staff Management System

## Prerequisites

1. **Node.js** (version 18 or higher)
2. **PostgreSQL** database
3. **Git** for version control

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

#### Option A: Local PostgreSQL
1. Install PostgreSQL on your system
2. Create a new database:
```sql
CREATE DATABASE hod_staff_db;
```

#### Option B: Cloud Database (Recommended)
Use services like:
- **Supabase** (Free tier available)
- **Railway** 
- **PlanetScale**
- **Neon**

### 3. Environment Configuration

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Edit `.env` with your database credentials:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/hod_staff_db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-very-long-random-secret-key-here"
JWT_SECRET="another-very-long-random-secret-key"
```

**Important**: Generate strong secrets for production:
```bash
# Generate random secrets
openssl rand -base64 32
```

### 4. Database Schema & Seeding

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with sample data
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Demo Login Credentials

### HOD Users
- **CSE HOD**: hod.cse@example.com / password123
- **ECE HOD**: hod.ece@example.com / password123

### Staff Users
- **CSE Staff 1**: staff.cse1@example.com / password123
- **CSE Staff 2**: staff.cse2@example.com / password123
- **ECE Staff**: staff.ece1@example.com / password123

### Admin User
- **Admin**: admin@example.com / password123

## Troubleshooting

### Database Connection Issues
1. Verify PostgreSQL is running
2. Check database credentials in `.env`
3. Ensure database exists
4. Test connection: `npm run db:studio`

### Build Issues
1. Clear Next.js cache: `rm -rf .next`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Regenerate Prisma client: `npm run db:generate`

### Authentication Issues
1. Verify `NEXTAUTH_SECRET` is set
2. Check `NEXTAUTH_URL` matches your domain
3. Clear browser cookies and try again

## Production Deployment

### Environment Variables
Set these in your production environment:
```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-production-secret"
JWT_SECRET="your-production-jwt-secret"
NODE_ENV="production"
```

### Build Commands
```bash
npm run build
npm start
```

### Recommended Platforms
- **Vercel** (Recommended for Next.js)
- **Railway**
- **Render**
- **DigitalOcean App Platform**

## Features Overview

### HOD Module
✅ Secure authentication
✅ Department-specific dashboard
✅ Placement statistics view
✅ Test performance reports
✅ Student management
✅ Export capabilities (planned)

### Staff Module
✅ Secure authentication
✅ Test creation and management
✅ Question bank management
✅ Performance analytics
✅ Department-specific access
✅ Test result tracking

### System Features
✅ Role-based access control
✅ Responsive design
✅ Modern UI with Tailwind CSS
✅ Database relationships
✅ Form validation
✅ Error handling
✅ Audit logging (schema ready)

## Next Steps

1. **Test the Application**: Use demo credentials to explore features
2. **Customize**: Modify branding, colors, and content as needed
3. **Add Data**: Create your own departments, users, and tests
4. **Deploy**: Choose a hosting platform and deploy
5. **Monitor**: Set up logging and monitoring for production

## Support

If you encounter issues:
1. Check this setup guide
2. Review the main README.md
3. Check the console for error messages
4. Verify all environment variables are set correctly

## Security Notes

- Change all default passwords before production
- Use strong, unique secrets for JWT and NextAuth
- Enable HTTPS in production
- Regularly update dependencies
- Implement proper backup strategies for your database
