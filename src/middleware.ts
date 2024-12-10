import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables.');
}

const secretKey = new TextEncoder().encode(JWT_SECRET);

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const token = req.headers.get('authorization')?.split(' ')[1];

    console.log(`Requête pour : ${pathname}`);
    console.log(`Token reçu : ${token}`);

    if (!token) {
        console.log(`Token manquant pour la route ${pathname}. Redirection.`);
        return redirectToLogin(pathname);
    }

    try {
        const { payload } = await jwtVerify(token, secretKey);
        console.log('Utilisateur authentifié :', payload);

        if (pathname.startsWith('/entreprise') && payload.type !== 'entreprise') {
            console.log(`Utilisateur non autorisé pour la route ${pathname}`);
            return redirectToLogin(pathname);
        }

        return NextResponse.next();
    } catch (error) {
        if (error instanceof Error) {
            console.error(`Erreur JWT pour la route ${pathname} :`, error.message);
        } else {
            console.error(`Erreur JWT pour la route ${pathname} :`, error);
        }
        return redirectToLogin(pathname);
    }
}


function redirectToLogin(pathname: string): NextResponse {
    const redirectUrl = new URL('/entreprise/login', 'http://localhost:3000');

    if (pathname.startsWith('/ugc')) {
        redirectUrl.pathname = '/ugc/login';
    }

    console.log(`Redirection de ${pathname} vers ${redirectUrl.pathname}`);
    return NextResponse.redirect(redirectUrl);
}
export const config = {
    matcher: [
        '/((?!_next|static|manifest.json|favicon.ico|sw.js|workbox-.*\\.js|img/.*|api/register|api/login|entreprise/login|entreprise/register|ugc/login|ugc/register|ugc/home|entreprise/home).*)',
    ],
};
