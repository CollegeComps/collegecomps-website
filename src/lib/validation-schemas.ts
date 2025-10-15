import { z } from 'zod';

// Authentication schemas
export const signupSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .min(3, 'Email must be at least 3 characters')
    .max(255, 'Email must be less than 255 characters')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .trim()
    .optional(),
});

export const signinSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .toLowerCase()
    .trim(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

// Profile update schemas
export const updateProfileSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .trim()
    .optional(),
  image: z.string()
    .url('Invalid image URL')
    .max(500, 'Image URL must be less than 500 characters')
    .optional(),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

// ROI Calculator schema
export const roiCalculatorSchema = z.object({
  tuition: z.number()
    .min(0, 'Tuition must be a positive number')
    .max(500000, 'Tuition seems unreasonably high'),
  fees: z.number()
    .min(0, 'Fees must be a positive number')
    .max(100000, 'Fees seem unreasonably high'),
  roomAndBoard: z.number()
    .min(0, 'Room and board must be a positive number')
    .max(100000, 'Room and board seems unreasonably high'),
  booksAndSupplies: z.number()
    .min(0, 'Books and supplies must be a positive number')
    .max(50000, 'Books and supplies seems unreasonably high'),
  otherExpenses: z.number()
    .min(0, 'Other expenses must be a positive number')
    .max(100000, 'Other expenses seems unreasonably high'),
  scholarships: z.number()
    .min(0, 'Scholarships must be a positive number')
    .max(500000, 'Scholarships seems unreasonably high'),
  grants: z.number()
    .min(0, 'Grants must be a positive number')
    .max(500000, 'Grants seems unreasonably high'),
  loans: z.number()
    .min(0, 'Loans must be a positive number')
    .max(500000, 'Loans seems unreasonably high'),
  interestRate: z.number()
    .min(0, 'Interest rate must be a positive number')
    .max(25, 'Interest rate seems unreasonably high'),
  loanTerm: z.number()
    .int('Loan term must be a whole number')
    .min(1, 'Loan term must be at least 1 year')
    .max(30, 'Loan term must be 30 years or less'),
  expectedSalary: z.number()
    .min(0, 'Expected salary must be a positive number')
    .max(10000000, 'Expected salary seems unreasonably high'),
  yearsToConsider: z.number()
    .int('Years must be a whole number')
    .min(1, 'Must consider at least 1 year')
    .max(50, 'Cannot consider more than 50 years'),
});

// College comparison schema
export const compareCollegesSchema = z.object({
  collegeIds: z.array(z.number().int().positive())
    .min(2, 'Must select at least 2 colleges to compare')
    .max(4, 'Cannot compare more than 4 colleges at once'),
});

// College search schema
export const collegeSearchSchema = z.object({
  query: z.string()
    .min(1, 'Search query is required')
    .max(200, 'Search query must be less than 200 characters')
    .trim(),
  state: z.string()
    .length(2, 'State must be a 2-letter code')
    .toUpperCase()
    .optional(),
  type: z.enum(['public', 'private', 'all'])
    .optional(),
  limit: z.number()
    .int()
    .min(1)
    .max(100)
    .default(10),
});

// Program search schema
export const programSearchSchema = z.object({
  query: z.string()
    .min(1, 'Search query is required')
    .max(200, 'Search query must be less than 200 characters')
    .trim(),
  limit: z.number()
    .int()
    .min(1)
    .max(100)
    .default(10),
});

// Bookmark schema
export const bookmarkSchema = z.object({
  collegeId: z.number()
    .int()
    .positive('College ID must be a positive number'),
});

// Saved scenario schema
export const saveScenarioSchema = z.object({
  name: z.string()
    .min(1, 'Scenario name is required')
    .max(100, 'Scenario name must be less than 100 characters')
    .trim(),
  data: z.record(z.string(), z.any()), // JSON data
});

// Email preferences schema
export const emailPreferencesSchema = z.object({
  marketing: z.boolean(),
  productUpdates: z.boolean(),
  weeklyDigest: z.boolean(),
});

// Contact/support schema
export const contactSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  email: z.string()
    .email('Invalid email address')
    .toLowerCase()
    .trim(),
  subject: z.string()
    .min(1, 'Subject is required')
    .max(200, 'Subject must be less than 200 characters')
    .trim(),
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(5000, 'Message must be less than 5000 characters')
    .trim(),
});

// Export types for TypeScript
export type SignupInput = z.infer<typeof signupSchema>;
export type SigninInput = z.infer<typeof signinSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type ROICalculatorInput = z.infer<typeof roiCalculatorSchema>;
export type CompareCollegesInput = z.infer<typeof compareCollegesSchema>;
export type CollegeSearchInput = z.infer<typeof collegeSearchSchema>;
export type ProgramSearchInput = z.infer<typeof programSearchSchema>;
export type BookmarkInput = z.infer<typeof bookmarkSchema>;
export type SaveScenarioInput = z.infer<typeof saveScenarioSchema>;
export type EmailPreferencesInput = z.infer<typeof emailPreferencesSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
