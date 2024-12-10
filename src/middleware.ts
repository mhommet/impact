import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables.");
}

const secretKey = new TextEncoder().encode(JWT_SECRET);

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const token = req.cookies.get("token")?.value || ""; // Récupère la valeur brute du cookie


    if (!token) {
        console.error(`Token manquant pour la route ${pathname}. Redirection.`);
        return NextResponse.redirect(new URL("/entreprise/login", req.url));
    }

    try {
        const { payload } = await jwtVerify(token, secretKey);

        if (pathname.startsWith("/entreprise") && payload.type !== "entreprise") {
            console.error(`Utilisateur non autorisé pour la route ${pathname}`);
            return NextResponse.redirect(new URL("/entreprise/login", req.url));
        }

        return NextResponse.next(); // Autorise l'accès
    } catch (error) {
        console.error(`Erreur JWT pour la route ${pathname} :`, error);
        return NextResponse.redirect(new URL("/entreprise/login", req.url));
    }
}

export const config = {
    matcher: [
        '/((?!_next|static|manifest.json|favicon.ico|sw.js|workbox-.*\\.js|img/.*|api/register|api/login|entreprise/login|entreprise/register|ugc/login|ugc/register|ugc/home|entreprise/home).*)',
    ],
};
