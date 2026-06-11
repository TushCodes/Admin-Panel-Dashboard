export class Lead {
  static tableName = 'leads';
  static schema = {
    id: { type: 'integer', primaryKey: true, autoIncrement: true },
    name: { type: 'string', maxLength: 255, required: true },
    email: { type: 'string', maxLength: 255, index: true },
    phone: { type: 'string', maxLength: 30, required: true, index: true },
    subject: { type: 'string', maxLength: 255 },
    message: { type: 'text' },
  };

  constructor(attrs = {}) {
    Object.assign(this, attrs);
  }
}
