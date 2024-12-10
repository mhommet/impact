import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const NEXT_PUBLIC_JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET;

// Liste des routes publiques
const publicRoutes = [
    '/',                  // Page d'accueil
    '/ugc/home',          // Page UGC publique
    '/entreprise/home',   // Page entreprise publique
    '/entreprise/login',  // Page login entreprise
    '/entreprise/register', // Page register entreprise
    '/ugc/login',         // Page login UGC
    '/ugc/register',      // Page register UGC
    '/siret',             // Vérification SIRET
    '/api/entreprise/login', // API login entreprise
    '/api/entreprise/register', // API register entreprise
    '/api/ugc/login',     // API login UGC
    '/api/ugc/register',  // API register UGC
    '/api/verify-siret',  // API vérification SIRET (ajoutée)
    '/api/insee',
];

export function middleware(req) {
    const { pathname } = req.nextUrl; // Récupère le chemin de la requête

    // Autorise les routes publiques
    if (publicRoutes.includes(pathname)) {
        return NextResponse.next();
    }

    // Vérifie le token pour les autres routes
    const token = req.headers.get('authorization')?.split(' ')[1];

    if (!token) {
        const redirectUrl = req.nextUrl.clone();

        // Redirige vers les pages de connexion en fonction du préfixe de l'URL
        if (pathname.startsWith('/ugc')) {
            redirectUrl.pathname = '/ugc/login';
        } else if (pathname.startsWith('/entreprise')) {
            redirectUrl.pathname = '/entreprise/login';
        } else {
            redirectUrl.pathname = '/'; // Redirection par défaut
        }

        return NextResponse.redirect(redirectUrl);
    }

    try {
        const decoded = jwt.verify(token, NEXT_PUBLIC_JWT_SECRET);
        req.user = decoded; // Ajoute les informations utilisateur si nécessaire
        return NextResponse.next(); // Permet à la requête de continuer
    } catch (error) {
        const redirectUrl = req.nextUrl.clone();

        // Redirige également en cas de token invalide
        if (pathname.startsWith('/ugc')) {
            redirectUrl.pathname = '/ugc/login';
        } else if (pathname.startsWith('/entreprise')) {
            redirectUrl.pathname = '/entreprise/login';
        } else {
            redirectUrl.pathname = '/'; // Redirection par défaut
        }

        return NextResponse.redirect(redirectUrl);
    }
}

// Configuration des routes où le middleware est appliqué
export const config = {
    matcher: [
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|png|jpe?g|gif|svg|ico|woff2?|ttf)).*)', // Applique le middleware à toutes les routes sauf les fichiers statiques
    ],
};
