const emptyToUndefined = (value) => value === '' ? undefined : value;

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

function issue(path, message, code = 'invalid_type') {
  return { path: [path], message, code };
}

function createSchema(fields) {
  return {
    safeParse(input) {
      const source = isPlainObject(input) ? input : {};
      const data = {};
      const issues = [];

      for (const [key, validator] of Object.entries(fields)) {
        const result = validator(source[key], key);
        if (result.success) {
          if (result.value !== undefined) data[key] = result.value;
        } else {
          issues.push(result.issue);
        }
      }

      if (issues.length > 0) return { success: false, error: { issues } };
      return { success: true, data };
    },
  };
}

function stringField({ required = false, max = null, email = false } = {}) {
  return (rawValue, key) => {
    const value = emptyToUndefined(rawValue);
    if (value === undefined || value === null) {
      if (required) return { success: false, issue: issue(key, 'Required', 'too_small') };
      return { success: true, value: undefined };
    }

    if (typeof value !== 'string') {
      return { success: false, issue: issue(key, 'Expected string, received ' + typeof value) };
    }

    const trimmedValue = value.trim();
    if (required && trimmedValue.length < 1) {
      return { success: false, issue: issue(key, 'Required', 'too_small') };
    }

    if (max !== null && trimmedValue.length > max) {
      return { success: false, issue: issue(key, `Must be at most ${max} characters`, 'too_big') };
    }

    if (email && trimmedValue.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)) {
      return { success: false, issue: issue(key, 'Invalid email address', 'invalid_string') };
    }

    return { success: true, value: trimmedValue };
  };
}

function dateField() {
  return (rawValue, key) => {
    const value = emptyToUndefined(rawValue);
    if (value === undefined || value === null) return { success: true, value: undefined };

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return { success: false, issue: issue(key, 'Invalid date', 'invalid_date') };
    }

    return { success: true, value: date };
  };
}

function numberField({ defaultValue, min, max } = {}) {
  return (rawValue, key) => {
    const value = emptyToUndefined(rawValue);
    const numberValue = value === undefined || value === null ? defaultValue : Number(value);

    if (!Number.isInteger(numberValue)) {
      return { success: false, issue: issue(key, 'Expected integer', 'invalid_type') };
    }

    if (numberValue < min) {
      return { success: false, issue: issue(key, `Must be greater than or equal to ${min}`, 'too_small') };
    }

    if (numberValue > max) {
      return { success: false, issue: issue(key, `Must be less than or equal to ${max}`, 'too_big') };
    }

    return { success: true, value: numberValue };
  };
}

const consignmentFields = {
  consignmentNum: stringField({ required: true, max: 16 }),
  status: stringField({ max: 50 }),
  pickupAddress: stringField({ max: 5000 }),
  pickupPincode: stringField({ max: 20 }),
  pickupTag: stringField({ max: 100 }),
  pickupDate: dateField(),
  dropAddress: stringField({ max: 5000 }),
  dropPincode: stringField({ max: 20 }),
  dropTag: stringField({ max: 100 }),
  dropDate: dateField(),
};

const leadFields = {
  name: stringField({ required: true, max: 255 }),
  email: stringField({ max: 255, email: true }),
  phone: stringField({ required: true, max: 30 }),
  subject: stringField({ max: 255 }),
  message: stringField({ max: 5000 }),
};

const documentFields = {
  documentUpload: stringField({ required: true, max: 5000 }),
};

const listQueryFields = {
  limit: numberField({ defaultValue: 25, min: 1, max: 100 }),
  offset: numberField({ defaultValue: 0, min: 0, max: Number.MAX_SAFE_INTEGER }),
  status: stringField({ max: 50 }),
  q: stringField({ max: 255 }),
};

export const consignmentSchema = createSchema(consignmentFields);
export const consignmentUpdateSchema = createSchema(Object.fromEntries(Object.entries(consignmentFields).filter(([key]) => key !== 'consignmentNum')));
export const leadSchema = createSchema(leadFields);
export const leadUpdateSchema = createSchema({
  name: stringField({ max: 255 }),
  email: stringField({ max: 255, email: true }),
  phone: stringField({ max: 30 }),
  subject: stringField({ max: 255 }),
  message: stringField({ max: 5000 }),
});
export const documentSchema = createSchema(documentFields);
export const documentUpdateSchema = createSchema({ documentUpload: stringField({ max: 5000 }) });
export const listQuerySchema = createSchema(listQueryFields);
