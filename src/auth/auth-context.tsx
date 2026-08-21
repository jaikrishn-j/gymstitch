import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

import { auth, db } from '../lib/firebase' 
import type { AppUser, AuthState } from './auth-types'

const AuthContext = createContext<AuthState | null>(null)

const MAX_PROFILE_RETRIES = 5
const PROFILE_RETRY_DELAY = 400

async function fetchUserProfile(
  uid: string,
): Promise<AppUser | null> {
  const firebaseUser = auth.currentUser

  for (let attempt = 0; attempt < MAX_PROFILE_RETRIES; attempt++) {
    const snapshot = await getDoc(doc(db, 'users', uid))

    if (snapshot.exists()) {
      const data = snapshot.data()

      return {
        uid,
        email: firebaseUser?.email ?? '',
        name: firebaseUser?.displayName ?? '',
        role: data.role,
        permission: data.permission ?? undefined,
      }
    }

    if (attempt < MAX_PROFILE_RETRIES - 1) {
      await new Promise((resolve) =>
        setTimeout(resolve, PROFILE_RETRY_DELAY),
      )
    }
  }

  return null
}

export function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        try {
          if (!firebaseUser) {
            setUser(null)
            return
          }

          const profile = await fetchUserProfile(firebaseUser.uid)

          if (!profile) {
            setUser(null)
            return
          }

          setUser(profile)
        } catch (error) {
          console.error('Failed to initialize auth:', error)
          setUser(null)
        } finally {
          setIsLoading(false)
        }
      },
    )

    return unsubscribe
  }, [])

  if(isLoading){
    return(
        <div className='h-screen w-full'>
            <h1>Loading...</h1>
        </div>
    )
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider',
    )
  }

  return context
}