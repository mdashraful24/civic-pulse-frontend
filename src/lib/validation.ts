import { z } from "zod";

const BCRYPT_MAX_BYTES = 72;

const passwordBytes = (value: string) => new TextEncoder().encode(value).length;

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Email is required.")
  .max(254, "Email must not exceed 254 characters.")
  .pipe(z.email({ message: "Please provide a valid email address." }));

export const strongPasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long.")
  .max(128, "Password must not exceed 128 characters.")
  .refine(
    (value) => passwordBytes(value) <= BCRYPT_MAX_BYTES,
    `Password must not exceed ${BCRYPT_MAX_BYTES} bytes.`,
  )
  .regex(/[A-Za-z]/, "Password must contain at least one letter.")
  .regex(/\d/, "Password must contain at least one number.");

export const registerSchema = z.strictObject({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters long.")
    .max(80, "Name must not exceed 80 characters."),
  email: emailSchema,
  password: strongPasswordSchema,
});

export const loginSchema = z.strictObject({
  email: emailSchema,
  password: z
    .string()
    .min(1, "Password is required.")
    .max(128, "Password must not exceed 128 characters."),
});

export const verifyEmailSchema = z.strictObject({
  email: emailSchema,
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "The verification code must be 6 digits."),
});

export const resendOtpSchema = z.strictObject({
  email: emailSchema,
});

export const changePasswordSchema = z.strictObject({
  newPassword: strongPasswordSchema,
});

export const issueCategorySchema = z.enum([
  "ROADS",
  "STREETLIGHTS",
  "WATER",
  "WASTE",
  "OTHER",
]);

export const issuePrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH"]);
export const issueStatusSchema = z.enum(["PENDING", "IN_PROGRESS", "RESOLVED"]);

export const imageUrlSchema = z
  .string()
  .trim()
  .max(2048, "Image URL must not exceed 2048 characters.")
  .pipe(z.url({ message: "Image URL must be a valid URL." }))
  .refine((value) => /^https?:\/\//i.test(value), {
    message: "Image URL must start with http:// or https://.",
  });

export const createIssueSchema = z.strictObject({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters long.")
    .max(150, "Title must not exceed 150 characters."),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters long.")
    .max(5000, "Description must not exceed 5000 characters."),
  category: issueCategorySchema,
  location: z
    .string()
    .trim()
    .min(3, "Location must be at least 3 characters long.")
    .max(200, "Location must not exceed 200 characters."),
  imageUrl: imageUrlSchema.optional(),
  priority: issuePrioritySchema.default("MEDIUM"),
});

export const updateIssueSchema = z
  .strictObject({
    title: z
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters long.")
      .max(150, "Title must not exceed 150 characters.")
      .optional(),
    description: z
      .string()
      .trim()
      .min(10, "Description must be at least 10 characters long.")
      .max(5000, "Description must not exceed 5000 characters.")
      .optional(),
    category: issueCategorySchema.optional(),
    location: z
      .string()
      .trim()
      .min(3, "Location must be at least 3 characters long.")
      .max(200, "Location must not exceed 200 characters.")
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update.",
  });

export const assignIssueSchema = z.strictObject({
  personnelId: z
    .uuid({ message: "A valid personnel id is required." })
    .nullable(),
});

export const updateIssueStatusSchema = z.strictObject({
  status: issueStatusSchema,
  resolutionNote: z
    .string()
    .trim()
    .max(2000, "Resolution note must not exceed 2000 characters.")
    .optional(),
});

export const updateIssuePrioritySchema = z.strictObject({
  priority: issuePrioritySchema,
});

export const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const validateImageFile = (file: File): string | null => {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return "Only JPEG, PNG, WebP or GIF image files are allowed.";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "Image must be 5 MB or smaller.";
  }
  return null;
};

export type RegisterValues = z.infer<typeof registerSchema>;
export type LoginValues = z.infer<typeof loginSchema>;
export type VerifyEmailValues = z.infer<typeof verifyEmailSchema>;
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
export type CreateIssueValues = z.infer<typeof createIssueSchema>;
export type UpdateIssueValues = z.infer<typeof updateIssueSchema>;
export type UpdateIssueStatusValues = z.infer<typeof updateIssueStatusSchema>;
