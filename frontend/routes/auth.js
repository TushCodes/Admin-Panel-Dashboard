export const authRoutes = [
  {
    name: 'Login',
    method: 'POST',
    path: '/login',
    description: 'Validate credentials with zod and return a session token payload.',
  },
  {
    name: 'Logout',
    method: 'POST',
    path: '/logout',
    description: 'Provide an explicit logout endpoint for clients to clear their session.',
  },
];
