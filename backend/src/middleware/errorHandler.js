const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  if (process.env.NODE_ENV === 'development') {
    console.error('Error Stack:', err.stack);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = {
      message,
      status: 404
    };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `Duplicate value for ${field}: ${value}. Please use another value.`;
    error = {
      message,
      status: 400
    };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map(error => error.message)
      .join(', ');
    error = {
      message,
      status: 400
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token. Please log in again.';
    error = {
      message,
      status: 401
    };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired. Please log in again.';
    error = {
      message,
      status: 401
    };
  }

  // Multer errors (file upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File size too large. Maximum size is 5MB.';
    error = {
      message,
      status: 400
    };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Unexpected field in file upload.';
    error = {
      message,
      status: 400
    };
  }

  // Rate limiting error
  if (err.status === 429) {
    const message = 'Too many requests. Please try again later.';
    error = {
      message,
      status: 429
    };
  }

  // Default error response
  const statusCode = error.status || err.statusCode || 500;
  const message = error.message || 'Server Error';

  // Create error response object
  const errorResponse = {
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      error: err
    })
  };

  // Send different responses based on error type
  if (statusCode >= 400 && statusCode < 500) {
    // Client errors (4xx)
    res.status(statusCode).json(errorResponse);
  } else {
    // Server errors (5xx)
    console.error('Server Error:', err);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal Server Error' 
        : message,
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack
      })
    });
  }
};

export default errorHandler;