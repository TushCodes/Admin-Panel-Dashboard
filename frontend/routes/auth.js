export const adminLoginPageRoute = {
  name: 'Admin login page',
  method: 'GET',
  path: '/auth/login',
  description: 'Render the standalone admin login frontend.',
};

export const adminRoute = {
  name: 'Admin welcome page',
  method: 'GET',
  path: '/admin',
  description: 'Render the standalone admin welcome page.',
};

export const authRoutes = [adminLoginPageRoute, adminRoute];
