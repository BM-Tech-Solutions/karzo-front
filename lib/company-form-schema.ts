import * as z from "zod"

export const companyLoginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

export const companyRegisterSchema = z
  .object({
    name: z.string().min(2, { message: "Company name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string(),
    size: z.string().optional(),
    sector: z.string().optional(),
    about: z.string().optional(),
    website: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export const jobOfferSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  requirements: z.array(z.string()).min(1, { message: "At least one requirement is needed" }),
  questions: z.array(z.string()).optional(),
})

export const candidateInviteSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  jobOfferId: z.number().optional(),
  message: z.string().optional(),
})
