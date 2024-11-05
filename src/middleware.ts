import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Update the route matcher to include the paths you want to make public
const isPublicRoute = createRouteMatcher([
    '/sign-in(.*)',  // Sign-in pages
    '/sign-up(.*)',  // Sign-up pages
    '/',             // Home page (public)
    '/ugc/home',     // UGC home page (public)
    '/entreprise/home' // Entreprise home page (public)
])

export default clerkMiddleware(async (auth, request) => {
    // Only protect routes that are NOT public
    if (!isPublicRoute(request)) {
        await auth.protect()
    }
})

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
}
