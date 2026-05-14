// Canonical error codes returned by the API under `error.code` in the
// `{ error: { message, code } }` response envelope. Add new codes here so
// both the API (which throws/sets them) and the web client (which may
// branch on them) reference the same identifiers.

export const ERROR_CODES = Object.freeze({
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  REQUEST_ERROR: 'REQUEST_ERROR',
  NOT_FOUND: 'NOT_FOUND',
});
