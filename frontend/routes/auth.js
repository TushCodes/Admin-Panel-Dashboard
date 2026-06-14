export const authRoutes = [
  {
    name: 'Admin credential login',
    method: 'POST',
    path: '/auth/login',
    description: 'Validate an admin ID and password against server-side ADMIN_ID and ADMIN_PASSWORD environment variables without exposing secrets to the frontend.',
  },
];
