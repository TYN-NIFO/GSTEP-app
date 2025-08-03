require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const passport = require("./config/passport");
const path = require("path");
const { config, isDevelopment, isProduction } = require("./config/config");
const logger = require("./utils/logger");
const { apiLimiter, sanitizeInput } = require("./middleware/validation");
const helmet = require('helmet');

const app = express();

// Trust proxy for proper IP detection
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors(config.cors));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization
app.use(sanitizeInput);

// Rate limiting
app.use(apiLimiter);

// Request logging
app.use(logger.logRequest);

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use('/uploads/signatures', express.static(path.join(__dirname, 'uploads/signatures')));

// Session middleware
app.use(session(config.session));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Root route - Azure needs this
app.get("/", (req, res) => {
  res.json({
    message: "Placement Management System Backend",
    status: "running",
    version: config.api.version,
    timestamp: new Date().toISOString(),
    environment: config.env,
    endpoints: {
      test: "/api/test",
      auth: "/api/auth",
      users: "/api/users",
      profile: "/api/profile",
      jobDrives: "/api/job-drives",
      placementConsent: "/api/placement-consent"
    }
  });
});

// Test route
app.get("/api/test", (req, res) => {
  res.json({
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: config.env,
    version: config.api.version
  });
});

// Routes loading with enhanced error handling
logger.info('Starting to load routes...');

const loadRoute = (routeName, routePath) => {
  try {
    logger.info(`Loading ${routeName} routes...`);
    const routeModule = require(routePath);
    app.use(`/api/${routeName}`, routeModule);
    logger.info(`✅ ${routeName} routes loaded successfully`);
  } catch (error) {
    logger.error(`❌ Error loading ${routeName} routes:`, {
      error: error.message,
      stack: error.stack
    });
  }
};

// Load all routes
loadRoute('auth', './routes/auth');
loadRoute('job-drives', './routes/jobDrives');
loadRoute('users', './routes/users');
loadRoute('profile', './routes/profile');
loadRoute('placement-consent', './routes/placementConsent');

logger.info('Finished loading routes');

// 404 handler
app.use('*', (req, res) => {
  logger.warn('Route not found', {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  });
  res.status(404).json({ 
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.logError(err, req);
  
  // Don't leak error details in production
  const errorMessage = isProduction() 
    ? 'Something went wrong!' 
    : err.message;
  
  res.status(err.status || 500).json({ 
    message: errorMessage,
    ...(isDevelopment() && { stack: err.stack })
  });
});

// MongoDB connection with enhanced error handling
const connectDB = async () => {
  try {
    if (config.mongodb.uri) {
      logger.info('Connecting to MongoDB...');
      
      await mongoose.connect(config.mongodb.uri, config.mongodb.options);
      
      mongoose.connection.on('connected', () => {
        logger.info('✅ MongoDB connected successfully');
      });
      
      mongoose.connection.on('error', (err) => {
        logger.error('❌ MongoDB connection error:', {
          error: err.message,
          stack: err.stack
        });
      });
      
      mongoose.connection.on('disconnected', () => {
        logger.warn('⚠️ MongoDB disconnected');
      });
      
      // Graceful shutdown
      process.on('SIGINT', async () => {
        logger.info('Received SIGINT, closing MongoDB connection...');
        await mongoose.connection.close();
        process.exit(0);
      });
      
    } else {
      logger.warn('⚠️ MONGODB_URI not set - database features will be limited');
    }
  } catch (err) {
    logger.error('❌ MongoDB connection error:', {
      error: err.message,
      stack: err.stack
    });
    logger.warn('⚠️ Server will start without database connection');
  }
};

// Start server with enhanced error handling
const startServer = async () => {
  try {
    // Connect to database first
    await connectDB();
    
    // Start server
    app.listen(config.port, () => {
      logger.info('✅ Server started successfully', {
        port: config.port,
        environment: config.env,
        version: config.api.version,
        nodeVersion: process.version,
        platform: process.platform
      });
      
      if (isDevelopment()) {
        logger.info('🌐 Development URLs:', {
          api: `http://localhost:${config.port}`,
          root: `http://localhost:${config.port}/`,
          test: `http://localhost:${config.port}/api/test`
        });
      }
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
};

// Start the server
startServer();



