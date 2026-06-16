import { z } from 'zod';

const emptyToUndefined = (value) => value === '' ? undefined : value;
const optionalString = (max) => z.preprocess(emptyToUndefined, z.string().trim().max(max).optional());
const optionalDate = z.preprocess(emptyToUndefined, z.coerce.date().optional());

export const consignmentSchema = z.object({
  consignmentNum: z.string().trim().min(1).max(16),
  status: optionalString(50),
  pickupAddress: optionalString(5000),
  pickupPincode: optionalString(20),
  pickupTag: optionalString(100),
  pickupDate: optionalDate,
  dropAddress: optionalString(5000),
  dropPincode: optionalString(20),
  dropTag: optionalString(100),
  dropDate: optionalDate,
});

export const consignmentUpdateSchema = consignmentSchema.partial().omit({ consignmentNum: true });

export const leadSchema = z.object({
  name: z.string().trim().min(1).max(255),
  email: optionalString(255).pipe(z.string().email().optional()),
  phone: z.string().trim().min(1).max(30),
  subject: optionalString(255),
  message: optionalString(5000),
});

export const leadUpdateSchema = leadSchema.partial();

export const documentSchema = z.object({
  documentUpload: z.string().trim().min(1).max(5000),
});

export const documentUpdateSchema = documentSchema.partial();

export const listQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(25),
  offset: z.coerce.number().int().min(0).default(0),
  status: optionalString(50),
  q: optionalString(255),
});
