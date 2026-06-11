export class AdminUser {
  constructor({ id = null, name, email, role = 'admin' } = {}) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.role = role;
  }
}

export class DashboardMetric {
  constructor({ name, value, period = null, metadata = {} } = {}) {
    this.name = name;
    this.value = value;
    this.period = period;
    this.metadata = { ...metadata };
  }
}
