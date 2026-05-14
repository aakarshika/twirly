import createError from 'http-errors';

/**
 * Returns Express middleware that validates req.body against a Zod schema.
 * On success, replaces req.body with the parsed (coerced) value.
 * On failure, calls next(400) with the first Zod issue message.
 */
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.issues[0]?.message ?? 'Validation error';
      return next(createError(400, message, { issues: result.error.issues }));
    }
    req.body = result.data;
    return next();
  };
}
