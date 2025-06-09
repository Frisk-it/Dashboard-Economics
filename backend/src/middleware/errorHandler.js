const errorHandler = (err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Default error
  let error = {
    success: false,
    message: err.message || 'Internal Server Error',
    statusCode: err.statusCode || 500
  };

  // Validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = {
      success: false,
      message: 'Validation Error: ' + message,
      statusCode: 400
    };
  }

  // Duplicate key error
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = {
      success: false,
      message,
      statusCode: 400
    };
  }

  // Wrong JWT error
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = {
      success: false,
      message,
      statusCode: 401
    };
  }

  // JWT expired error
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = {
      success: false,
      message,
      statusCode: 401
    };
  }

  // Supabase errors
  if (err.code && err.details) {
    error = {
      success: false,
      message: err.message || 'Database error',
      statusCode: 400
    };
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production') {
    delete error.stack;
  } else {
    error.stack = err.stack;
  }

  res.status(error.statusCode).json(error);
};

module.exports = errorHandler;