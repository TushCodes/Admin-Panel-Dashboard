import { Router } from 'express';

import { asyncHandler } from '../utils/index.js';
import { UnauthorizedError } from '../utils/errorHandling.js';
import { loginSchema } from '../validation/schemas.js';
import { validate } from './validation.js';

export function authRoutes({ token = process.env.ADMIN_TOKEN ?? null } = {}) {
  const router = Router();

  router.post('/login', validate(loginSchema), asyncHandler(async (req, res) => {
    const configuredPassword = process.env.ADMIN_PASSWORD;
    if (configuredPassword && req.body.password !== configuredPassword) {
      throw new UnauthorizedError('Invalid login credentials.');
    }

    res.json({
      success: true,
      message: 'Login successful.',
      data: { token: token ?? 'development-token', user: { email: req.body.email } },
    });
  }));

  router.post('/logout', asyncHandler(async (_req, res) => {
    res.json({ success: true, message: 'Logout successful.', data: null });
  }));

  return router;
}
