import { jwtVerify } from 'jose';

import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables.');
}

const secretKey = new TextEncoder().encode(JWT_SECRET);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Permettre l'accès public aux profils UGC et entreprise et leurs collaborations
  if (
    (pathname.match(/^\/ugc\/profile\/[^/]+$/) && !pathname.includes('/edit')) ||
    pathname.match(/^\/api\/ugc\/[^/]+\/collaborations$/) ||
    (pathname.match(/^\/entreprise\/profile\/[^/]+$/) && !pathname.includes('/edit'))
  ) {
    return NextResponse.next();
  }

  // Vérifier d'abord le cookie
  const cookieToken = req.cookies.get('token')?.value;
  // Puis vérifier l'en-tête Authorization
  const authHeader = req.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  // Utiliser le premier token valide trouvé
  const token = cookieToken || bearerToken || '';

  if (!token) {
    console.error(`Token manquant pour la route ${pathname}. Redirection.`);
    if (pathname.startsWith('/entreprise')) {
      return NextResponse.redirect(new URL('/entreprise/login', req.url));
    } else if (pathname.startsWith('/ugc')) {
      return NextResponse.redirect(new URL('/ugc/login', req.url));
    }
  }

  try {
    const { payload } = await jwtVerify(token, secretKey);

    if (pathname.startsWith('/entreprise') && payload.type !== 'entreprise') {
      console.error(`Utilisateur non autorisé pour la route ${pathname}`);
      return NextResponse.redirect(new URL('/entreprise/login', req.url));
    } else if (pathname.startsWith('/ugc') && payload.type !== 'ugc') {
      console.error(`Utilisateur non autorisé pour la route ${pathname}`);
      return NextResponse.redirect(new URL('/ugc/login', req.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error(`Erreur JWT pour la route ${pathname} :`, error);
    if (pathname.startsWith('/entreprise')) {
      return NextResponse.redirect(new URL('/entreprise/login', req.url));
    } else if (pathname.startsWith('/ugc')) {
      return NextResponse.redirect(new URL('/ugc/login', req.url));
    }
  }
}

export const config = {
  matcher: [
    '/((?!_next|static|manifest.json|favicon.ico|sw.js|workbox-.*\\.js|img/.*|api/register|api/login|api/verify-siret|entreprise/login|entreprise/register|ugc/login|ugc/register|entreprise/home|ugc/home|mentions-legales|$).*)',
  ],
};
