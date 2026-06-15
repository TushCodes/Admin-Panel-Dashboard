export const adminLoginPageRoute = {
  name: 'Admin login page',
  method: 'GET',
  path: '/auth/login',
  description: 'Render the admin credential login form.',
};

export const adminLoginRoute = {
  name: 'Admin credential login',
  method: 'POST',
  path: '/api/v1/auth/login',
  description: 'Validate a username and password through the server-side Supabase admin login flow without exposing service credentials to the frontend.',
};

export const adminRoute = {
  name: 'Admin welcome page',
  method: 'GET',
  path: '/api/v1/admin',
  description: 'Render the admin welcome page after a successful credential login.',
};

export const authRoutes = [adminLoginPageRoute, adminLoginRoute, adminRoute];
