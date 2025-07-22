import { z } from 'zod'

// Define enum-like constants for validation
const UserRole = z.enum(['HOD', 'STAFF', 'ADMIN'])
const TestType = z.enum(['APTITUDE', 'TECHNICAL', 'CODING', 'INTERVIEW'])
const TestStatus = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED'])

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  role: UserRole,
  departmentId: z.string().min(1, 'Department is required'),
  password: z.string().min(8, 'Password must be at least 8 characters')
})

// Department schemas
export const createDepartmentSchema = z.object({
  name: z.string().min(2, 'Department name must be at least 2 characters'),
  code: z.string().min(2, 'Department code must be at least 2 characters').max(10, 'Department code must be at most 10 characters'),
  description: z.string().optional()
})

// Student schemas
export const createStudentSchema = z.object({
  rollNumber: z.string().min(1, 'Roll number is required'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  year: z.number().min(1).max(4),
  semester: z.number().min(1).max(8),
  cgpa: z.number().min(0).max(10).optional(),
  departmentId: z.string().min(1, 'Department is required')
})

// Test schemas
export const createTestSchema = z.object({
  title: z.string().min(3, 'Test title must be at least 3 characters'),
  description: z.string().optional(),
  type: TestType,
  duration: z.number().min(5, 'Duration must be at least 5 minutes'),
  totalMarks: z.number().min(1, 'Total marks must be at least 1'),
  passingMarks: z.number().min(0, 'Passing marks cannot be negative'),
  instructions: z.string().optional(),
  scheduledAt: z.date().optional(),
  departmentId: z.string().min(1, 'Department is required')
}).refine(data => data.passingMarks <= data.totalMarks, {
  message: 'Passing marks cannot exceed total marks',
  path: ['passingMarks']
})

export const createQuestionSchema = z.object({
  question: z.string().min(10, 'Question must be at least 10 characters'),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().min(1, 'Correct answer is required'),
  marks: z.number().min(1, 'Marks must be at least 1'),
  explanation: z.string().optional(),
  order: z.number().min(1)
})

// Company schemas
export const createCompanySchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters'),
  description: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  industry: z.string().optional(),
  location: z.string().optional()
})

// Placement schemas
export const createPlacementSchema = z.object({
  position: z.string().min(2, 'Position must be at least 2 characters'),
  package: z.number().min(0).optional(),
  studentId: z.string().min(1, 'Student is required'),
  companyId: z.string().min(1, 'Company is required'),
  departmentId: z.string().min(1, 'Department is required'),
  interviewAt: z.date().optional(),
  notes: z.string().optional()
})

export type LoginInput = z.infer<typeof loginSchema>
export type CreateUserInput = z.infer<typeof createUserSchema>
export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>
export type CreateStudentInput = z.infer<typeof createStudentSchema>
export type CreateTestInput = z.infer<typeof createTestSchema>
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>
export type CreateCompanyInput = z.infer<typeof createCompanySchema>
export type CreatePlacementInput = z.infer<typeof createPlacementSchema>
