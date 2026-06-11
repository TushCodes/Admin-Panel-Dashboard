const CONSIGNMENT_NUM_PATTERN = /^[A-Za-z0-9]{1,16}$/;

export class Consignment {
  static tableName = 'consignments';
  static schema = {
    consignmentNum: { column: 'consignment_num', type: 'string', primaryKey: true, unique: true, required: true, maxLength: 16 },
    status: { type: 'string', maxLength: 50 },
    pickupAddress: { column: 'pickup_address', type: 'text' },
    pickupPincode: { column: 'pickup_pincode', type: 'string', maxLength: 20, index: true },
    pickupTag: { column: 'pickup_tag', type: 'string', maxLength: 100 },
    pickupDate: { column: 'pickup_date', type: 'date' },
    dropAddress: { column: 'drop_address', type: 'text' },
    dropPincode: { column: 'drop_pincode', type: 'string', maxLength: 20, index: true },
    dropTag: { column: 'drop_tag', type: 'string', maxLength: 100 },
    dropDate: { column: 'drop_date', type: 'date' },
  };

  constructor(attrs = {}) {
    Object.assign(this, attrs);
    this.consignmentNum = attrs.consignmentNum ?? attrs.consignment_num;
    if (!CONSIGNMENT_NUM_PATTERN.test(this.consignmentNum ?? '')) {
      throw new Error('consignment_num must be 1 to 16 alphanumeric characters');
    }
  }
}
