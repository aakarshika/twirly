import createError from 'http-errors';

/**
 * Factory: builds middleware that loads a resource by req.params.id and
 * asserts it belongs to req.user. `getResource(id)` should return null when missing.
 * The loaded resource is attached as req.resource for the next handler.
 */
export function requireOwner(getResource) {
  return async (req, res, next) => {
    try {
      if (!req.user) return next(createError(401, 'Authentication required'));
      const resource = await getResource(req.params.id);
      if (!resource) return next(createError(404, 'Not found'));
      if (resource.userId !== req.user.id) {
        return next(createError(403, 'Forbidden'));
      }
      req.resource = resource;
      return next();
    } catch (err) {
      return next(err);
    }
  };
}
