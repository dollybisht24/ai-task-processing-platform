const { z } = require('zod');

// Normalizer to map user input (e.g. "reverse string", "uppercase", "REVERSE_STRING") to standard enums
const normalizeOperation = (val) => {
  if (typeof val !== 'string') return val;
  const clean = val.trim().toUpperCase().replace(/[\s-]+/g, '_');
  return clean;
};

const validOperations = ['UPPERCASE', 'LOWERCASE', 'REVERSE_STRING', 'WORD_COUNT'];

const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Task title is required')
    .max(200, 'Title cannot exceed 200 characters')
    .trim(),
  inputText: z
    .string()
    .min(1, 'Input text is required')
    .max(50000, 'Input text cannot exceed 50,000 characters'),
  operation: z
    .string()
    .transform(normalizeOperation)
    .refine((val) => validOperations.includes(val), {
      message: 'Operation must be one of: UPPERCASE, LOWERCASE, REVERSE_STRING, WORD_COUNT'
    })
});

const taskQuerySchema = z.object({
  page: z.string().optional().default('1').transform((v) => Math.max(1, parseInt(v, 10) || 1)),
  limit: z.string().optional().default('10').transform((v) => Math.min(100, Math.max(1, parseInt(v, 10) || 10))),
  status: z.enum(['pending', 'running', 'success', 'failed']).optional(),
  search: z.string().optional().default(''),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
});

module.exports = {
  createTaskSchema,
  taskQuerySchema,
  normalizeOperation
};
