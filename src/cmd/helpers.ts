import { z } from 'zod'

//FIXME the generic type should be inferred from the schema and constrained
export const inputFromJson  = <T>(schema: z.Schema, input: unknown): T => {
  return z
    .string()
    .transform((_, ctx) => {
      try {
        if (typeof input !== 'string') {
          throw new Error('not a string')
        }
        return JSON.parse(input)
      } catch (error) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'invalid json in input',
        })
        return z.never
      }
    })
    .pipe(schema)
    .parse(input)
}