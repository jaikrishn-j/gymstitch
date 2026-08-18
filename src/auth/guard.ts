import type { AuthState, PermModule, UserRole } from "./auth-types";
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

export function requirePermission(
  auth: AuthState,
  module: PermModule,
) {
  const user = requireRole(auth, ['admin', 'staff'])

  if (user.role === 'admin') return user

  if (user.permission?.[module] != null) {
    return user
  }

  throw redirect({
    to: '/dashboard',
  })
}