import { createAuthClient } from 'better-auth/react';

// Better Auth's React client appends `/api/auth/<endpoint>` itself (see
// better-auth utils/url.mjs#withPath), so it wants the bare server origin —
// passing `/api` would produce `/api/<endpoint>` and miss the `/auth` segment.
// VITE_API_URL is shared with `apiClient` and points at the REST root
// (e.g. `http://localhost:3000/api`), so strip back to origin here.
const apiUrl =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' ? `${window.location.origin}/api` : 'http://localhost:3000/api');

const baseURL = new URL(apiUrl).origin;

export const authClient = createAuthClient({
  baseURL,
});

export const { useSession, signIn, signUp, signOut } = authClient;
