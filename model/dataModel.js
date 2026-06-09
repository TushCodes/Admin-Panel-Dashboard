/**
 * Basic data model definitions for the Admin Panel Dashboard.
 *
 * These plain JavaScript classes provide a small, framework-agnostic
 * starting point for representing dashboard users and summary metrics.
 */

class AdminUser {
  constructor({ id, name, email, role = 'admin', isActive = true }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.role = role;
    this.isActive = isActive;
  }
}

class DashboardMetric {
  constructor({ id, label, value, trend = 0, updatedAt = new Date().toISOString() }) {
    this.id = id;
    this.label = label;
    this.value = value;
    this.trend = trend;
    this.updatedAt = updatedAt;
  }
}

module.exports = {
  AdminUser,
  DashboardMetric,
};
