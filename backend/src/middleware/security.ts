import dotenv from 'dotenv';
import helmet from 'helmet';
import { Express } from 'express';

dotenv.config();

export function setupSecurity(app: Express): void {
  const frontendOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';
  // Helmet for security headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'", frontendOrigin, 'ws:', 'wss:'],
        },
      },
      crossOriginEmbedderPolicy: false,
    })
  );

  // Additional security headers
  app.use((req, res, next) => {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // XSS Protection
    res.setHeader('X-XSS-Protection', '1; mode=block');
    // Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });
}

export default setupSecurity;

