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

          const userSnapshot = await getDoc(
            doc(db, 'users', firebaseUser.uid),
          )

          if (!userSnapshot.exists()) {
            setUser(null)
            return
          }

          const data = userSnapshot.data()

          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email ?? '',
            name: firebaseUser.displayName ?? '',
            role: data.role,
          })
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