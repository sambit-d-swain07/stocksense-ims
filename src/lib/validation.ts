import { z } from 'zod';

export const loginSchema = z.object({
  loginId: z
    .string()
    .min(1, 'Login ID is required')
    .min(6, 'Login ID must be at least 6 characters')
    .max(12, 'Login ID must be at most 12 characters')
    .refine((val) => !/\s/.test(val), 'Login ID cannot contain spaces'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    loginId: z
      .string()
      .min(1, 'Login ID is required')
      .min(6, 'Login ID must be between 6 and 12 characters')
      .max(12, 'Login ID must be between 6 and 12 characters')
      .refine((val) => !/\s/.test(val), 'Login ID cannot contain spaces'),
    email: z
      .string()
      .min(1, 'Email ID is required')
      .email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export type SignupFormData = z.infer<typeof signupSchema>;

export const productSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(80, 'Name cannot exceed 80 characters'),
  sku: z
    .string()
    .min(3, 'SKU must be at least 3 characters')
    .max(20, 'SKU cannot exceed 20 characters')
    .regex(/^[a-zA-Z0-9-]+$/, 'SKU must contain only letters, numbers, and hyphens'),
  categoryId: z.string().min(1, 'Category is required'),
  unit: z.enum(['Units', 'kg', 'g', 'Litres', 'Metres', 'Box'], {
    errorMap: () => ({ message: 'Unit of Measure is required' }),
  }),
  initialStock: z
    .preprocess(
      (val) => (val === '' || val === undefined || val === null ? 0 : Number(val)),
      z.number().min(0, 'Initial stock must be greater than or equal to 0')
    )
    .optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;

export const warehouseSchema = z.object({
  name: z.string().min(1, 'Warehouse name is required'),
  shortCode: z
    .string()
    .min(2, 'Short code must be at least 2 characters')
    .max(8, 'Short code cannot exceed 8 characters')
    .regex(/^[a-zA-Z0-9-]+$/, 'Short code must contain only letters, numbers, and hyphens'),
  address: z.string().min(1, 'Address is required'),
});

export type WarehouseFormData = z.infer<typeof warehouseSchema>;

export const locationSchema = z.object({
  name: z.string().min(1, 'Location name is required'),
  shortCode: z
    .string()
    .min(2, 'Short code must be at least 2 characters')
    .max(8, 'Short code cannot exceed 8 characters')
    .regex(/^[a-zA-Z0-9-]+$/, 'Short code must contain only letters, numbers, and hyphens'),
  warehouseId: z.string().min(1, 'Warehouse is required'),
});

export type LocationFormData = z.infer<typeof locationSchema>;

export const stockUpdateSchema = z.object({
  costPrice: z
    .preprocess(
      (val) => (val === '' ? NaN : Number(val)),
      z.number({ invalid_type_error: 'Cost must be a valid number' }).min(0, 'Cost must be at least 0')
    ),
  onHand: z
    .preprocess(
      (val) => (val === '' ? NaN : Number(val)),
      z.number({ invalid_type_error: 'On hand must be a valid number' }).min(0, 'On hand must be at least 0')
    ),
});

export type StockUpdateFormData = z.infer<typeof stockUpdateSchema>;
