export const authRoutes = [
  {
    name: 'Admin credential login',
    method: 'POST',
    path: '/api/v1/auth/login',
    description: 'Validate a username and password through the server-side Supabase admin login flow without exposing service credentials to the frontend.',
  },
];
