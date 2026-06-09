/**
 * Basic data model definitions for the Admin Panel Dashboard.
 *
 * These plain JavaScript classes provide a small, framework-agnostic
 * starting point for representing dashboard users, summary metrics,
 * consignments, consignment documents, and leads.
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

class Consignment {
  static schema = {
    consignmentNum: { required: true, unique: true },
    status: { required: false },
    pickupAddress: { required: false },
    pickupPincode: { required: false },
    pickupTag: { required: false },
    pickupDate: { required: false },
    dropAddress: { required: false },
    dropPincode: { required: false },
    dropTag: { required: false },
    dropDate: { required: false },
  };

  constructor({
    consignmentNum,
    status,
    pickupAddress,
    pickupPincode,
    pickupTag,
    pickupDate,
    dropAddress,
    dropPincode,
    dropTag,
    dropDate,
  }) {
    if (!consignmentNum) {
      throw new Error('Consignment number is required.');
    }

    this.consignmentNum = consignmentNum;
    this.status = status;
    this.pickupAddress = pickupAddress;
    this.pickupPincode = pickupPincode;
    this.pickupTag = pickupTag;
    this.pickupDate = pickupDate;
    this.dropAddress = dropAddress;
    this.dropPincode = dropPincode;
    this.dropTag = dropTag;
    this.dropDate = dropDate;
  }
}

class Document {
  static schema = {
    documentId: {
      required: true,
      references: {
        model: 'Consignment',
        field: 'consignmentNum',
      },
    },
    pod: { required: false },
    invoice: { required: false },
  };

  constructor({ documentId, pod, invoice }) {
    if (!documentId) {
      throw new Error('Document ID is required and must reference a consignment number.');
    }

    this.documentId = documentId;
    this.pod = pod;
    this.invoice = invoice;
  }
}

class Lead {
  static schema = {
    name: { required: true },
    email: { required: false },
    phone: { required: true },
    subject: { required: false },
    message: { required: false },
  };

  constructor({ name, email, phone, subject, message }) {
    if (!name) {
      throw new Error('Lead name is required.');
    }

    if (!phone) {
      throw new Error('Lead phone is required.');
    }

    this.name = name;
    this.email = email;
    this.phone = phone;
    this.subject = subject;
    this.message = message;
  }
}

module.exports = {
  AdminUser,
  DashboardMetric,
  Consignment,
  Document,
  Lead,
};
