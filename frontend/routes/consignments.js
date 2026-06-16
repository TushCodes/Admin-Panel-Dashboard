export const consignmentRoutes = [
  {
    name: 'Consignment Test',
    method: 'GET',
    path: '/consignment-test',
    panelPath: '/consignment-test',
    description: 'Frontend test panel that renders a list of consignment items.',
  },
  {
    name: 'Consignments',
    method: 'GET/POST/PATCH',
    path: '/consignments',
    panelPath: '/admin/consignments',
    description: 'List, create, read, and update consignment records.',
  },
];
