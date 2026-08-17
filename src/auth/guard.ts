import type { AuthState, UserRole } from "./auth-types";
import { redirect } from '@tanstack/react-router'

export function requireAuth(auth: AuthState) {
    if(!auth.isAuthenticated || !auth.user){
        throw redirect({
            to: '/login'
        })
    }

    return auth.user
}

export function requireRole(
  auth: AuthState,
  roles: UserRole[],
) {
  const user = requireAuth(auth)

  if (!roles.includes(user.role)) {
    throw redirect({
      to: '/dashboard',
    })
  }

  return user
}

export function requireGuest(auth: AuthState) {
  if (auth.isAuthenticated) {
    throw redirect({
      to: '/dashboard',
    })
  }
}