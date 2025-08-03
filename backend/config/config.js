const Joi = require('joi');
require('dotenv').config();

// Environment validation schema
const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  
  PORT: Joi.number()
    .default(5000),
  
  // Database
  MONGODB_URI: Joi.string()
    .uri()
    .description('MongoDB connection string'),
  
  // JWT
  JWT_SECRET: Joi.string()
    .min(32)
    .description('JWT secret key'),
  JWT_EXPIRE: Joi.string()
    .default('24h')
    .description('JWT expiration time'),
  
  // Session
  SESSION_SECRET: Joi.string()
    .min(32)
    .description('Session secret key'),
  
  // Client URL
  CLIENT_URL: Joi.string()
    .uri()
    .default('http://localhost:3000')
    .description('Frontend client URL'),
  
  // Email
  EMAIL_USER: Joi.string()
    .email()
    .description('Email service username'),
  EMAIL_PASS: Joi.string()
    .description('Email service password'),
  
  // Google OAuth (optional)
  GOOGLE_CLIENT_ID: Joi.string()
    .optional()
    .description('Google OAuth client ID'),
  GOOGLE_CLIENT_SECRET: Joi.string()
    .optional()
    .description('Google OAuth client secret'),
  
  // File Upload
  MAX_FILE_SIZE: Joi.number()
    .default(5 * 1024 * 1024) // 5MB
    .description('Maximum file upload size'),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: Joi.number()
    .default(15 * 60 * 1000) // 15 minutes
    .description('Rate limiting window'),
  RATE_LIMIT_MAX_REQUESTS: Joi.number()
    .default(100)
    .description('Maximum requests per window'),
  
  // Logging
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'http', 'debug')
    .default('info')
    .description('Logging level'),
  
  // Security
  CORS_ORIGIN: Joi.string()
    .default('http://localhost:3000')
    .description('CORS allowed origin'),
  
  // Database Connection
  DB_CONNECTION_TIMEOUT: Joi.number()
    .default(30000)
    .description('Database connection timeout'),
  
  // Email Settings
  EMAIL_SERVICE: Joi.string()
    .default('gmail')
    .description('Email service provider'),
  
  // File Storage
  UPLOAD_PATH: Joi.string()
    .default('uploads')
    .description('File upload directory'),
  
  // API Settings
  API_VERSION: Joi.string()
    .default('v1')
    .description('API version'),
  
  // Pagination
  DEFAULT_PAGE_SIZE: Joi.number()
    .default(10)
    .description('Default pagination page size'),
  MAX_PAGE_SIZE: Joi.number()
    .default(100)
    .description('Maximum pagination page size'),
  
}).unknown();

// Validate environment variables
const { error, value: envVars } = envVarsSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

// Configuration object
const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  
  // Database
  mongodb: {
    uri: envVars.MONGODB_URI,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: envVars.DB_CONNECTION_TIMEOUT,
      socketTimeoutMS: envVars.DB_CONNECTION_TIMEOUT,
    }
  },
  
  // JWT
  jwt: {
    secret: envVars.JWT_SECRET,
    expiresIn: envVars.JWT_EXPIRE,
  },
  
  // Session
  session: {
    secret: envVars.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: envVars.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    }
  },
  
  // CORS
  cors: {
    origin: envVars.CORS_ORIGIN,
    credentials: true,
  },
  
  // Email
  email: {
    service: envVars.EMAIL_SERVICE,
    user: envVars.EMAIL_USER,
    pass: envVars.EMAIL_PASS,
  },
  
  // Google OAuth
  google: {
    clientId: envVars.GOOGLE_CLIENT_ID,
    clientSecret: envVars.GOOGLE_CLIENT_SECRET,
  },
  
  // File Upload
  upload: {
    maxFileSize: envVars.MAX_FILE_SIZE,
    uploadPath: envVars.UPLOAD_PATH,
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/csv',
    ],
  },
  
  // Rate Limiting
  rateLimit: {
    windowMs: envVars.RATE_LIMIT_WINDOW_MS,
    max: envVars.RATE_LIMIT_MAX_REQUESTS,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  },
  
  // Logging
  logging: {
    level: envVars.LOG_LEVEL,
    filename: 'logs/app.log',
    errorFilename: 'logs/error.log',
    maxSize: '20m',
    maxFiles: '14d',
  },
  
  // API
  api: {
    version: envVars.API_VERSION,
    prefix: `/api/${envVars.API_VERSION}`,
    pagination: {
      defaultPageSize: envVars.DEFAULT_PAGE_SIZE,
      maxPageSize: envVars.MAX_PAGE_SIZE,
    }
  },
  
  // Security
  security: {
    bcryptRounds: 12,
    passwordMinLength: 8,
    sessionMaxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
  
  // Validation
  validation: {
    maxStringLength: 1000,
    maxArrayLength: 100,
    maxObjectDepth: 10,
  }
};

// Helper functions
const isDevelopment = () => config.env === 'development';
const isProduction = () => config.env === 'production';
const isTest = () => config.env === 'test';

// Validate required fields for production
if (isProduction()) {
  const requiredFields = ['MONGODB_URI', 'JWT_SECRET', 'SESSION_SECRET'];
  const missingFields = requiredFields.filter(field => !process.env[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required environment variables for production: ${missingFields.join(', ')}`);
  }
}

module.exports = {
  config,
  isDevelopment,
  isProduction,
  isTest,
}; 