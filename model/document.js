export class Document {
  static tableName = 'documents';
  static schema = {
    documentId: { column: 'document_id', type: 'string', primaryKey: true, required: true, maxLength: 64, references: 'consignments.consignment_num', onDelete: 'CASCADE' },
    pod: { type: 'text' },
    invoice: { type: 'text' },
  };

  constructor(attrs = {}) {
    Object.assign(this, attrs);
    this.documentId = attrs.documentId ?? attrs.document_id;
  }
}
