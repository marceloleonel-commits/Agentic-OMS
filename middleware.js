// Password-gates the whole prototype using Vercel Routing Middleware + HTTP
// Basic Auth. Runs on Vercel's free Hobby plan (native Password Protection is
// a paid Pro/Enterprise add-on, so this is the standard free workaround).
//
// The password is read from the SITE_PASSWORD environment variable — set it
// in the Vercel dashboard (Project → Settings → Environment Variables) or via
// `vercel env add SITE_PASSWORD`, then redeploy. Any username is accepted;
// only the password is checked.
import { next } from '@vercel/functions';

export const config = {
  matcher: '/(.*)',
};

// HTTP header values must be ASCII/Latin-1 only — no accents or em-dashes,
// or the browser silently drops the WWW-Authenticate header and never shows
// the native login prompt (you'd just see the plain-text 401 body instead).
const REALM = 'Orders AIW prototype';

export default function middleware(request) {
  const expected = process.env.SITE_PASSWORD;

  // Fail closed: if no password was configured, block everything rather
  // than leaving the prototype open by accident.
  if (!expected) {
    return new Response('SITE_PASSWORD não configurada neste projeto.', { status: 500 });
  }

  const auth = request.headers.get('authorization');
  if (auth && auth.startsWith('Basic ')) {
    const decoded = atob(auth.slice(6));
    const password = decoded.slice(decoded.indexOf(':') + 1);
    if (password === expected) {
      return next();
    }
  }

  return new Response('Autenticação necessária.', {
    status: 401,
    headers: { 'WWW-Authenticate': `Basic realm="${REALM}", charset="UTF-8"` },
  });
}
