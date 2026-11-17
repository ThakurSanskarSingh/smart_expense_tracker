/**
 * @fileoverview Request validation middleware using Zod schemas.
 */

/**
 * Creates an Express middleware to validate request payload against a Zod schema.
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against.
 * @param {'body' | 'query' | 'params'} [source='body'] - Request property to validate.
 * @returns {import('express').RequestHandler}
 */
export function validate(schema, source = 'body') {
  return (req, _res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed;
      next();
    } catch (error) {
      next(error);
    }
  };
}
