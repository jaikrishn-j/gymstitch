import { clerkMiddleware } from '@clerk/nextjs/server';

// Clerk Core 3 (`@clerk/nextjs` v7) removed the `publicRoutes` / `ignoredRoutes`
// options from `clerkMiddleware()`. The middleware now only authenticates the
// request; access control belongs as close to the resource as possible, which
// this app already does inside its route layouts via `checkUserType()` and
// `redirectByRole()` from `@/utils/userRole`.
export default clerkMiddleware();

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/__clerk/:path*',
    '/(api|trpc)(.*)',
  ],
};
