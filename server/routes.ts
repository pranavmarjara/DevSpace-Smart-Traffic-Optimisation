import type { Express } from "express";
import { createServer, type Server } from "http";
import { createProxyMiddleware } from "http-proxy-middleware";

export async function registerRoutes(app: Express): Promise<Server> {
  // Proxy API requests to Flask backend running on port 5001
  const apiProxy = createProxyMiddleware({
    target: 'http://localhost:5001',
    changeOrigin: true,
    pathRewrite: {
      '^/api': '/api', // keep /api prefix for Flask routes
    },
  });

  // Proxy authentication routes to Flask
  const authProxy = createProxyMiddleware({
    target: 'http://localhost:5001',
    changeOrigin: true,
  });

  // Add error handling middleware for API proxy
  app.use('/api', (req, res, next) => {
    apiProxy(req, res, (err) => {
      if (err) {
        console.error('API Proxy error:', err);
        res.status(502).json({ 
          error: 'Backend service unavailable',
          message: 'The Flask API server may not be running on port 5001' 
        });
      } else {
        next(err);
      }
    });
  });
  
  // Add error handling middleware for auth proxy
  app.use(['/login', '/register', '/logout'], (req, res, next) => {
    authProxy(req, res, (err) => {
      if (err) {
        console.error('Auth proxy error:', err);
        res.status(502).json({ 
          error: 'Authentication service unavailable',
          message: 'The Flask auth server may not be running on port 5001' 
        });
      } else {
        next(err);
      }
    });
  });

  const httpServer = createServer(app);

  return httpServer;
}
